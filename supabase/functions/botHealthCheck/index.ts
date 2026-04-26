// botHealthCheck — single endpoint to see exactly what's wrong with the WhatsApp bot.
// GET /functions/v1/botHealthCheck → JSON with Green API state + recent activity.
// No auth required (read-only diagnostic). Returns 200 always.

import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

const GREEN_API_TOKEN = Deno.env.get('GREENAPI_API_TOKEN');
const GREEN_API_INSTANCE = Deno.env.get('GREENAPI_INSTANCE_ID');

interface Report {
  generated_at: string;
  green_api: {
    credentials_present: boolean;
    instance_state: string | null;
    state_instance_response: unknown;
    settings_check: string | null;
    error: string | null;
  };
  recent_outbound_messages: {
    last_30_min: { sent: number; failed: number; total: number };
    last_24_hours: { sent: number; failed: number; total: number };
    sample: Array<{ phone: string; status: string; greenapi_id: string | null; created_at: string; preview: string }>;
  };
  stuck_leads: {
    count_no_bot_started: number;
    count_with_bot_no_outbound: number;
    sample: Array<{ id: string; name: string | null; phone: string | null; flow_type: string | null; bot_current_step: string | null; source_page: string | null; created_at: string }>;
  };
  cron: {
    catchup_bot_last_5_runs: Array<{ start_time: string; status: string; return_message: string | null }>;
  };
  diagnosis: string[];
}

async function checkGreenApiState(): Promise<{ state: string | null; raw: unknown; error: string | null }> {
  if (!GREEN_API_TOKEN || !GREEN_API_INSTANCE) {
    return { state: null, raw: null, error: 'GREENAPI_API_TOKEN or GREENAPI_INSTANCE_ID missing' };
  }
  try {
    const url = `https://api.green-api.com/waInstance${GREEN_API_INSTANCE}/getStateInstance/${GREEN_API_TOKEN}`;
    const res = await fetch(url, { method: 'GET' });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { state: null, raw: body, error: `HTTP ${res.status}` };
    }
    return { state: body?.stateInstance ?? null, raw: body, error: null };
  } catch (e) {
    return { state: null, raw: null, error: (e as Error).message };
  }
}

Deno.serve(async (_req: Request) => {
  const report: Report = {
    generated_at: new Date().toISOString(),
    green_api: { credentials_present: false, instance_state: null, state_instance_response: null, settings_check: null, error: null },
    recent_outbound_messages: {
      last_30_min: { sent: 0, failed: 0, total: 0 },
      last_24_hours: { sent: 0, failed: 0, total: 0 },
      sample: [],
    },
    stuck_leads: { count_no_bot_started: 0, count_with_bot_no_outbound: 0, sample: [] },
    cron: { catchup_bot_last_5_runs: [] },
    diagnosis: [],
  };

  // 1. Green API state
  report.green_api.credentials_present = Boolean(GREEN_API_TOKEN && GREEN_API_INSTANCE);
  const greenState = await checkGreenApiState();
  report.green_api.instance_state = greenState.state;
  report.green_api.state_instance_response = greenState.raw;
  report.green_api.error = greenState.error;

  // 2. Outbound message stats
  const since30m = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: msgs30m } = await supabaseAdmin
    .from('whatsapp_messages')
    .select('delivery_status')
    .eq('direction', 'outbound')
    .gte('created_at', since30m);
  if (msgs30m) {
    report.recent_outbound_messages.last_30_min.total = msgs30m.length;
    report.recent_outbound_messages.last_30_min.sent = msgs30m.filter(m => m.delivery_status === 'sent').length;
    report.recent_outbound_messages.last_30_min.failed = msgs30m.filter(m => m.delivery_status === 'failed').length;
  }

  const { data: msgs24h } = await supabaseAdmin
    .from('whatsapp_messages')
    .select('delivery_status')
    .eq('direction', 'outbound')
    .gte('created_at', since24h);
  if (msgs24h) {
    report.recent_outbound_messages.last_24_hours.total = msgs24h.length;
    report.recent_outbound_messages.last_24_hours.sent = msgs24h.filter(m => m.delivery_status === 'sent').length;
    report.recent_outbound_messages.last_24_hours.failed = msgs24h.filter(m => m.delivery_status === 'failed').length;
  }

  const { data: sampleMsgs } = await supabaseAdmin
    .from('whatsapp_messages')
    .select('phone, delivery_status, greenapi_message_id, created_at, message_text')
    .eq('direction', 'outbound')
    .gte('created_at', since24h)
    .order('created_at', { ascending: false })
    .limit(8);
  if (sampleMsgs) {
    report.recent_outbound_messages.sample = sampleMsgs.map(m => ({
      phone: m.phone,
      status: m.delivery_status,
      greenapi_id: m.greenapi_message_id,
      created_at: m.created_at,
      preview: (m.message_text || '').slice(0, 60),
    }));
  }

  // 3. Stuck leads
  const since2h = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { count: noBotCount } = await supabaseAdmin
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .is('flow_type', null)
    .is('bot_current_step', null)
    .not('phone', 'is', null)
    .neq('phone', '')
    .gte('created_at', since2h)
    .lte('created_at', new Date(Date.now() - 30 * 1000).toISOString())
    .eq('source', 'sales_portal');
  report.stuck_leads.count_no_bot_started = noBotCount ?? 0;

  const { data: stuckSample } = await supabaseAdmin
    .from('leads')
    .select('id, name, phone, flow_type, bot_current_step, source_page, created_at')
    .not('phone', 'is', null)
    .neq('phone', '')
    .gte('created_at', since24h)
    .order('created_at', { ascending: false })
    .limit(8);
  if (stuckSample) {
    report.stuck_leads.sample = stuckSample;
  }

  // 4. For each stuck-sample lead — was a bot_session created? (proves botStartFlow ran)
  const leadIds = (stuckSample || []).map(l => l.id);
  if (leadIds.length > 0) {
    const { data: sessions } = await supabaseAdmin
      .from('bot_sessions')
      .select('lead_id, phone, current_step, completed_at, created_at')
      .in('lead_id', leadIds);
    const sessByLead = new Map((sessions || []).map(s => [s.lead_id, s]));
    report.stuck_leads.sample = (stuckSample || []).map((l: any) => ({
      ...l,
      _session: sessByLead.get(l.id) ? {
        step: sessByLead.get(l.id)!.current_step,
        completed: sessByLead.get(l.id)!.completed_at !== null,
        created_at: sessByLead.get(l.id)!.created_at,
      } : null,
    })) as any;
  }

  // 5. Direct Green API check — for the 3 problem phones, are they WhatsApp-registered?
  const testPhones = ['972509428927', '972504504591'];
  if (GREEN_API_TOKEN && GREEN_API_INSTANCE) {
    const checks = [];
    for (const ph of testPhones) {
      try {
        const r = await fetch(
          `https://api.green-api.com/waInstance${GREEN_API_INSTANCE}/checkWhatsapp/${GREEN_API_TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: ph }),
          },
        );
        const body = await r.json().catch(() => null);
        checks.push({ phone: ph, http: r.status, response: body });
      } catch (e) {
        checks.push({ phone: ph, http: 0, error: (e as Error).message });
      }
    }
    (report as any).green_api_phone_checks = checks;
  }
  report.cron.catchup_bot_last_5_runs = [];

  // 5b. Inspect the service role key format (safely — only first/last chars and shape)
  const sk = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  (report as any).service_key_check = {
    present: sk.length > 0,
    length: sk.length,
    looks_like_jwt: sk.startsWith('eyJ') && sk.split('.').length === 3,
    starts_with: sk.slice(0, 6),
    ends_with: sk.slice(-6),
    dots_count: (sk.match(/\./g) || []).length,
  };

  // 6. Test-invoke botStartFlow on the FIRST stuck lead (when ?test_invoke=1)
  const url = new URL(_req.url);
  if (url.searchParams.get('test_invoke') === '1' && stuckSample && stuckSample.length > 0) {
    const target = (stuckSample as any[]).find(l => l.bot_current_step === null && l.phone);
    if (target) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      try {
        const r = await fetch(`${supabaseUrl}/functions/v1/botStartFlow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
          },
          body: JSON.stringify({
            lead_id: target.id,
            lead_name: target.name || 'Test',
            phone: target.phone,
            page_slug: target.source_page || 'open-osek-patur',
          }),
        });
        const respText = await r.text();
        (report as any).test_invoke = {
          target_lead: target.id,
          target_phone: target.phone,
          http_status: r.status,
          response: respText.slice(0, 1000),
        };
      } catch (e) {
        (report as any).test_invoke = { error: (e as Error).message };
      }
    }
  }

  // 5. Diagnosis
  const d = report.diagnosis;
  if (!report.green_api.credentials_present) {
    d.push('🔴 חסרים secrets של Green API ב-Supabase. תוסיף GREENAPI_API_TOKEN ו-GREENAPI_INSTANCE_ID.');
  } else if (report.green_api.error) {
    d.push(`🔴 Green API לא נגיש: ${report.green_api.error}`);
  } else if (report.green_api.instance_state !== 'authorized') {
    d.push(`🔴 Green API instance במצב "${report.green_api.instance_state}" — לא "authorized". צריך לסרוק שוב QR code ב-Green API console.`);
  } else {
    d.push('✅ Green API instance מאושר ופעיל.');
  }

  if (report.recent_outbound_messages.last_30_min.failed > 0 && report.recent_outbound_messages.last_30_min.sent === 0) {
    d.push(`🔴 ב-30 דקות אחרונות: ${report.recent_outbound_messages.last_30_min.failed} ניסיונות נכשלו, 0 הצליחו. Green API דוחה הודעות.`);
  }
  if (report.recent_outbound_messages.last_24_hours.total === 0) {
    d.push('⚠️ אף הודעת WhatsApp יוצאת לא נשלחה ב-24 שעות אחרונות.');
  }
  if (report.stuck_leads.count_no_bot_started > 0) {
    d.push(`⚠️ ${report.stuck_leads.count_no_bot_started} לידים תקועים (flow_type ו-bot_current_step ריקים) — ה-catchup לא מצליח לשלוח להם.`);
  }
  if (d.length === 0) {
    d.push('✅ לא נמצאו בעיות.');
  }

  return new Response(JSON.stringify(report, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
});
