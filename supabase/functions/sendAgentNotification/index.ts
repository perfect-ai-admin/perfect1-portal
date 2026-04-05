// Migrated from Base44: sendAgentNotification
// Send a notification to an agent via email or WhatsApp

import { supabaseAdmin, getCustomer, requireAdmin, getCorsHeaders, jsonResponse, errorResponse, escapeHtml } from '../_shared/supabaseAdmin.ts';

async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) throw new Error('RESEND_API_KEY not configured');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`
    },
    body: JSON.stringify({
      from: 'One-Pai Notifications <no-reply@one-pai.com>',
      to: [to],
      subject,
      html
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error: ${res.status} — ${body}`);
  }
}

async function sendViaWhatsApp(phone: string, message: string): Promise<void> {
  const instanceId = Deno.env.get('GREENAPI_INSTANCE_ID');
  const token = Deno.env.get('GREENAPI_API_TOKEN');
  if (!instanceId || !token) throw new Error('GreenAPI credentials not configured');

  const chatId = phone.replace('+', '') + '@c.us';
  const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GreenAPI error: ${res.status} — ${body}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    // Allow both admin and regular customer to call this endpoint
    let caller = null;
    try {
      caller = await requireAdmin(req);
    } catch {
      caller = await getCustomer(req);
    }
    if (!caller) return errorResponse('Unauthorized', 401, req);

    const { lead_id, agent_id, message, channel } = await req.json();
    if (!agent_id || !message || !channel) {
      return errorResponse('agent_id, message, and channel are required', 400, req);
    }

    // Get lead data if provided
    let leadData = null;
    if (lead_id) {
      const { data: lead } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('id', lead_id)
        .single();
      leadData = lead;
    }

    // Get agent data
    const { data: agent, error: agentErr } = await supabaseAdmin
      .from('customers')
      .select('id, name, full_name, email, phone_e164, role')
      .eq('id', agent_id)
      .single();

    if (agentErr || !agent) {
      return errorResponse('Agent not found', 404, req);
    }

    // Send notification based on channel
    if (channel === 'email') {
      if (!agent.email) return errorResponse('Agent has no email address', 400, req);

      const subject = lead_id
        ? `הודעה חדשה לגבי ליד ${escapeHtml(leadData?.name) || lead_id}`
        : 'הודעה חדשה מהמערכת';

      const html = `
        <div style="direction: rtl; font-family: Arial, sans-serif;">
          <h2>הודעה מ-One-Pai</h2>
          <p>${escapeHtml(message)}</p>
          ${leadData ? `<hr/><h3>פרטי ליד:</h3><p>שם: ${escapeHtml(leadData.name)}<br/>טלפון: ${escapeHtml(leadData.phone) || ''}<br/>אימייל: ${escapeHtml(leadData.email) || ''}</p>` : ''}
        </div>
      `;

      await sendViaResend(agent.email, subject, html);
    } else if (channel === 'whatsapp') {
      if (!agent.phone_e164) return errorResponse('Agent has no phone_e164 for WhatsApp', 400, req);
      await sendViaWhatsApp(agent.phone_e164, message);
    } else {
      return errorResponse(`Unsupported channel: ${channel}. Use 'email' or 'whatsapp'`, 400, req);
    }

    // Log to activity_log
    await supabaseAdmin.from('activity_log').insert({
      customer_id: agent_id,
      event_type: 'agent_notification_sent',
      data: { lead_id, channel, sent_by: caller.id, message }
    }).catch((e: Error) => console.warn('activity_log insert failed:', e.message));

    return jsonResponse({ success: true, channel }, 200, req);
  } catch (error) {
    console.error('sendAgentNotification error:', (error as Error).message);
    return errorResponse((error as Error).message, 500, req);
  }
});
