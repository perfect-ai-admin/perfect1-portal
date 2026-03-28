// Migrated from Base44: sendLeadEmail
// Sends a notification email about a new lead via Resend API

import { corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'yosi5919@gmail.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { lead_id, lead_name, lead_phone, lead_email, lead_profession, lead_notes, source_page } = await req.json();

    if (!RESEND_API_KEY) {
      return errorResponse('RESEND_API_KEY not configured', 500);
    }

    const html = `
      <div style="direction: rtl; font-family: Arial, sans-serif;">
        <h2 style="color: #1E3A5F;">ליד חדש התקבל!</h2>
        <p><strong>שם:</strong> ${lead_name || 'לא צוין'}</p>
        <p><strong>טלפון:</strong> ${lead_phone || 'לא צוין'}</p>
        ${lead_email ? `<p><strong>אימייל:</strong> ${lead_email}</p>` : ''}
        ${lead_profession ? `<p><strong>מקצוע:</strong> ${lead_profession}</p>` : ''}
        ${lead_notes ? `<p><strong>הערות:</strong> ${lead_notes}</p>` : ''}
        <p><strong>מקור:</strong> ${source_page || 'לא ידוע'}</p>
        <p><strong>תאריך:</strong> ${new Date().toLocaleString('he-IL')}</p>
        <p><strong>ID ליד:</strong> ${lead_id || 'לא ידוע'}</p>
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
      return jsonResponse({ success: false, error: errText });
    }

    return jsonResponse({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Failed to send lead email:', error);
    return errorResponse((error as Error).message);
  }
});
