// Migrated from Base44: sendEmail
// Send email via Resend — replaces base44.integrations.Core.SendEmail

import { getCustomer, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    // Auth is optional — some callers may not have auth
    await getCustomer(req);

    const { to, subject, html, from } = await req.json();

    if (!to) return errorResponse('to is required', 400, req);
    if (!subject) return errorResponse('subject is required', 400, req);
    if (!html) return errorResponse('html is required', 400, req);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) return errorResponse('RESEND_API_KEY not configured', 500, req);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: from || 'One-Pai <no-reply@one-pai.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return errorResponse(`Resend error: ${body}`, 500, req);
    }

    const data = await res.json();

    return jsonResponse({ success: true, message_id: data.id }, 200, req);
  } catch (error) {
    console.error('sendEmail error:', (error as Error).message);
    return errorResponse((error as Error).message, 500, req);
  }
});
