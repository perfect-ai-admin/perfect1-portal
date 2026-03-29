// Migrated from Base44: sendPartnershipLead
// Public endpoint — submit a partnership lead/inquiry and send notification email

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, escapeHtml } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const { name, email, phone, company, message } = await req.json();

    if (!name || !email) {
      return errorResponse('name and email are required', 400, req);
    }

    // Insert to leads table
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .insert({
        name,
        email,
        phone: phone || null,
        source_page: company ? `שותפות — ${company}` : 'שותפות',
        source: 'partnership',
        status: 'new',
        interaction_type: 'form',
        priority: 'high',
        notes: message || null
      })
      .select()
      .single();

    if (leadErr) {
      console.error('sendPartnershipLead: insert failed:', leadErr.message);
      return errorResponse(leadErr.message, 500, req);
    }

    // Send notification email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'One-Pai Partnerships <no-reply@one-pai.com>',
            to: ['partnerships@one-pai.com', 'yosi5919@gmail.com'],
            subject: `פנייה לשותפות חדשה — ${escapeHtml(name)}${company ? ` (${escapeHtml(company)})` : ''}`,
            html: `
              <div style="direction: rtl; font-family: Arial, sans-serif;">
                <h2>פנייה לשותפות חדשה!</h2>
                <p><strong>שם:</strong> ${escapeHtml(name)}</p>
                <p><strong>אימייל:</strong> ${escapeHtml(email)}</p>
                <p><strong>טלפון:</strong> ${escapeHtml(phone) || 'לא צוין'}</p>
                <p><strong>חברה:</strong> ${escapeHtml(company) || 'לא צוין'}</p>
                ${message ? `<p><strong>הודעה:</strong></p><p>${escapeHtml(message)}</p>` : ''}
              </div>
            `
          })
        });
      } catch (emailErr) {
        console.warn('sendPartnershipLead: email notification failed (non-fatal):', (emailErr as Error).message);
      }
    }

    return jsonResponse({ success: true, lead_id: lead.id }, 200, req);
  } catch (error) {
    console.error('sendPartnershipLead error:', (error as Error).message);
    return errorResponse((error as Error).message, 500, req);
  }
});
