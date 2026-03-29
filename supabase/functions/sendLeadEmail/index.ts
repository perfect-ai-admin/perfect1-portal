// Migrated from Base44: sendLeadEmail
// Sends a notification email about a new lead via Resend API

import { getCorsHeaders, jsonResponse, errorResponse, escapeHtml } from '../_shared/supabaseAdmin.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'yosi5919@gmail.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const { lead_id, lead_name, lead_phone, lead_email, lead_profession, lead_notes, source_page } = await req.json();

    if (!RESEND_API_KEY) {
      return errorResponse('RESEND_API_KEY not configured', 500, req);
    }

    const html = `
      <div style="direction: rtl; font-family: Arial, sans-serif;">
        <h2 style="color: #1E3A5F;">ליד חדש התקבל!</h2>
        <p><strong>שם:</strong> ${escapeHtml(lead_name) || 'לא צוין'}</p>
        <p><strong>טלפון:</strong> ${escapeHtml(lead_phone) || 'לא צוין'}</p>
        ${lead_email ? `<p><strong>אימייל:</strong> ${escapeHtml(lead_email)}</p>` : ''}
        ${lead_profession ? `<p><strong>מקצוע:</strong> ${escapeHtml(lead_profession)}</p>` : ''}
        ${lead_notes ? `<p><strong>הערות:</strong> ${escapeHtml(lead_notes)}</p>` : ''}
        <p><strong>מקור:</strong> ${escapeHtml(source_page) || 'לא ידוע'}</p>
        <p><strong>תאריך:</strong> ${new Date().toLocaleString('he-IL')}</p>
        <p><strong>ID ליד:</strong> ${escapeHtml(lead_id) || 'לא ידוע'}</p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Lead.im <noreply@one-pai.com>',
        to: [ADMIN_EMAIL],
        subject: `ליד חדש מ${source_page || 'האתר'}`,
        html
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to send lead email:', errText);
      return jsonResponse({ success: false, error: errText }, 200, req);
    }

    return jsonResponse({ success: true, message: 'Email sent successfully' }, 200, req);

  } catch (error) {
    console.error('Failed to send lead email:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
