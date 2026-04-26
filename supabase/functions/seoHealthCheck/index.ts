// seoHealthCheck — runs daily at 13:00 Israel time (via n8n cron).
// Verifies that SEO automation is healthy.
//
// Checks:
//   1. F33 published an article today (count seo_published_articles where created_at >= today)
//   2. WF3 generated ideas in last 24h (count seo_content_ideas created today)
//   3. WF1 GSC sync ran today (seo_runs run_type='daily_sync' status='success' today)
//   4. seo_content_ideas pending count >= 10 (warning if low)
//   5. F33 last execution status (warn if last was 'error')
//
// Sends alert email via Resend if any critical check fails.
//
// GET /seoHealthCheck — returns JSON report; sends email only if --notify=true OR any failure.

import { supabaseAdmin, jsonResponse } from '../_shared/supabaseAdmin.ts';

const RESEND_KEY = Deno.env.get('RESEND_API_KEY') || '';
const RECIPIENT = 'yosi5919@gmail.com';
const FROM = 'perfect1 SEO Health <no-reply@perfect1.co.il>';
const N8N_API_KEY = Deno.env.get('N8N_API_KEY') || '';
const N8N_BASE = 'https://n8n.perfect-1.one';

const F33_WORKFLOW_ID = 'F33CbVflx4aApT71';
const WF3_WORKFLOW_ID = 'mcuHdVaje5WfjU1C';
const WF1_WORKFLOW_ID = 'dNUIrmd7OfKzU50B';

interface CheckResult {
  name: string;
  status: 'ok' | 'warn' | 'fail';
  detail: string;
  value?: unknown;
}

function israelTodayDate(): string {
  const now = new Date();
  now.setHours(now.getHours() + 3);
  return now.toISOString().split('T')[0];
}

function israelTodayStart(): string {
  const today = israelTodayDate();
  // Israel is UTC+3, so today 00:00 Israel = yesterday 21:00 UTC
  return `${today}T00:00:00+03:00`;
}

async function checkPublishedToday(): Promise<CheckResult> {
  const startISO = israelTodayStart();
  const { data, error, count } = await supabaseAdmin
    .from('seo_published_articles')
    .select('id, slug, category, created_at', { count: 'exact' })
    .gte('created_at', startISO)
    .order('created_at', { ascending: false });
  if (error) return { name: 'F33 published today', status: 'fail', detail: `DB error: ${error.message}` };
  const n = count || 0;
  if (n === 0) {
    return { name: 'F33 published today', status: 'warn', detail: 'No articles published today yet (F33 runs ~13:00–16:00)', value: 0 };
  }
  return {
    name: 'F33 published today',
    status: 'ok',
    detail: `${n} article(s) today: ${(data || []).map((r) => `${r.category}/${r.slug}`).join(', ')}`,
    value: n,
  };
}

async function checkIdeasPending(): Promise<CheckResult> {
  const { count, error } = await supabaseAdmin
    .from('seo_content_ideas')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (error) return { name: 'Ideas pending', status: 'fail', detail: `DB error: ${error.message}` };
  const n = count || 0;
  if (n < 10) return { name: 'Ideas pending', status: 'warn', detail: `Only ${n} ideas pending — F33 may run dry (need >= 10)`, value: n };
  return { name: 'Ideas pending', status: 'ok', detail: `${n} ideas in queue`, value: n };
}

async function checkIdeasGeneratedToday(): Promise<CheckResult> {
  const startISO = israelTodayStart();
  const { count, error } = await supabaseAdmin
    .from('seo_content_ideas')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startISO);
  if (error) return { name: 'WF3 ideas today', status: 'fail', detail: `DB error: ${error.message}` };
  const n = count || 0;
  if (n === 0) return { name: 'WF3 ideas today', status: 'warn', detail: 'No new ideas generated today', value: 0 };
  return { name: 'WF3 ideas today', status: 'ok', detail: `${n} new idea(s) today`, value: n };
}

async function checkGSCSync(): Promise<CheckResult> {
  const startISO = israelTodayStart();
  const { data, error } = await supabaseAdmin
    .from('seo_runs')
    .select('id, status, started_at, finished_at')
    .eq('run_type', 'daily_sync')
    .gte('started_at', startISO)
    .order('started_at', { ascending: false })
    .limit(1);
  if (error) return { name: 'GSC sync today', status: 'fail', detail: `DB error: ${error.message}` };
  if (!data || data.length === 0) return { name: 'GSC sync today', status: 'warn', detail: 'No GSC sync run today yet' };
  const last = data[0];
  if (last.status === 'success') return { name: 'GSC sync today', status: 'ok', detail: `Last run #${last.id} success at ${last.finished_at}` };
  return { name: 'GSC sync today', status: 'fail', detail: `Last GSC run status='${last.status}'`, value: last };
}

async function checkN8NWorkflow(workflowId: string, label: string): Promise<CheckResult> {
  if (!N8N_API_KEY) return { name: `${label} executions`, status: 'warn', detail: 'N8N_API_KEY not set, skipping' };
  try {
    const res = await fetch(`${N8N_BASE}/api/v1/executions?workflowId=${workflowId}&limit=1`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY },
    });
    if (!res.ok) return { name: `${label} executions`, status: 'fail', detail: `n8n API ${res.status}` };
    const body = await res.json();
    const last = body.data?.[0];
    if (!last) return { name: `${label} executions`, status: 'warn', detail: 'No executions found' };
    if (last.status === 'success') return { name: `${label} executions`, status: 'ok', detail: `Last #${last.id} success @ ${last.startedAt}` };
    return { name: `${label} executions`, status: 'fail', detail: `Last #${last.id} status='${last.status}' @ ${last.startedAt}` };
  } catch (e) {
    return { name: `${label} executions`, status: 'fail', detail: `n8n fetch error: ${(e as Error).message}` };
  }
}

function buildHtml(checks: CheckResult[]): string {
  const rows = checks
    .map((c) => {
      const color = c.status === 'ok' ? '#16a34a' : c.status === 'warn' ? '#d97706' : '#dc2626';
      const icon = c.status === 'ok' ? 'OK' : c.status === 'warn' ? 'WARN' : 'FAIL';
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:${color};white-space:nowrap;">[${icon}]</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${c.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">${c.detail}</td>
      </tr>`;
    })
    .join('');
  const overall = checks.some((c) => c.status === 'fail') ? 'FAIL' : checks.some((c) => c.status === 'warn') ? 'WARN' : 'OK';
  const overallColor = overall === 'FAIL' ? '#dc2626' : overall === 'WARN' ? '#d97706' : '#16a34a';
  return `<!DOCTYPE html><html dir="rtl" lang="he"><body style="font-family:-apple-system,sans-serif;background:#f9fafb;padding:24px;">
  <div style="max-width:680px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:${overallColor};color:white;padding:20px;">
      <h1 style="margin:0;font-size:20px;">SEO Health Check — ${overall}</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">${new Date().toISOString()}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
    <div style="padding:14px 20px;background:#f3f4f6;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">
      Daily SEO automation health. Sent at 13:00 Israel time.
    </div>
  </div></body></html>`;
}

async function sendEmail(html: string, subject: string) {
  if (!RESEND_KEY) return { sent: false, reason: 'no_resend_key' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [RECIPIENT], subject, html }),
  });
  if (!res.ok) return { sent: false, reason: `resend_${res.status}`, body: await res.text() };
  const body = await res.json();
  return { sent: true, id: body.id };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });

  const url = new URL(req.url);
  const forceNotify = url.searchParams.get('notify') === 'true';

  const checks: CheckResult[] = [];
  checks.push(await checkPublishedToday());
  checks.push(await checkIdeasPending());
  checks.push(await checkIdeasGeneratedToday());
  checks.push(await checkGSCSync());
  checks.push(await checkN8NWorkflow(F33_WORKFLOW_ID, 'F33'));
  checks.push(await checkN8NWorkflow(WF3_WORKFLOW_ID, 'WF3'));
  checks.push(await checkN8NWorkflow(WF1_WORKFLOW_ID, 'WF1 GSC'));

  const hasFail = checks.some((c) => c.status === 'fail');
  const hasWarn = checks.some((c) => c.status === 'warn');
  const overall = hasFail ? 'FAIL' : hasWarn ? 'WARN' : 'OK';

  let emailResult: unknown = { sent: false, reason: 'no_alerts' };
  if (forceNotify || hasFail) {
    const html = buildHtml(checks);
    const subject = `[SEO ${overall}] Daily Health Check — ${israelTodayDate()}`;
    emailResult = await sendEmail(html, subject);
  }

  return jsonResponse({
    ok: !hasFail,
    overall,
    timestamp: new Date().toISOString(),
    checks,
    email: emailResult,
  }, hasFail ? 500 : 200);
});
