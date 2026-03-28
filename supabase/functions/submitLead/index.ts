// Migrated from Base44: submitLead
// Creates a new lead and sends email notification

import { supabaseAdmin, getUser, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', 405);
    }

    const payload = await req.json();

    // Validate required fields
    if (!payload.name || !payload.phone) {
      return errorResponse('Name and phone are required', 400);
    }

    // Create lead using service role (public endpoint, no auth required)
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
        name: payload.name,
        phone: payload.phone,
        email: payload.email || null,
        profession: payload.profession || null,
        source_page: payload.source_page || 'דף נחיתה - פתיחת עוסק פטור',
        status: 'new',
        interaction_type: payload.interaction_type || 'form',
        priority: 'medium',
        utm_source: payload.utm_source || '',
        utm_medium: payload.utm_medium || '',
        utm_campaign: payload.utm_campaign || '',
        utm_term: payload.utm_term || '',
        utm_content: payload.utm_content || '',
        referrer: payload.referrer || ''
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
      return errorResponse(leadError.message, 500);
    }

    // Handle Email Notification
    try {
      let destinationEmail: string | null = null;

      if (payload.landing_page_id) {
        const { data: lp } = await supabaseAdmin
          .from('landing_pages')
          .select('destination_email')
          .eq('id', payload.landing_page_id)
          .single();
        if (lp?.destination_email) {
          destinationEmail = lp.destination_email;
        }
      } else if (payload.source_page) {
        const { data: lps } = await supabaseAdmin
          .from('landing_pages')
          .select('destination_email')
          .eq('title', payload.source_page)
          .limit(1);
        if (lps?.[0]?.destination_email) {
          destinationEmail = lps[0].destination_email;
        }
      }

      // Send via Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      const emailTo = destinationEmail || 'yosi5919@gmail.com';

      if (resendApiKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'One-Pai Notification <no-reply@one-pai.com>',
            to: [emailTo],
            subject: `ליד חדש התקבל! - ${payload.name}`,
            html: `
              <div style="direction: rtl; font-family: Arial, sans-serif;">
                <h2>ליד חדש התקבל!</h2>
                <p><strong>שם:</strong> ${payload.name}</p>
                <p><strong>טלפון:</strong> ${payload.phone}</p>
                <p><strong>אימייל:</strong> ${payload.email || 'לא צוין'}</p>
                <p><strong>מקצוע:</strong> ${payload.profession || 'לא צוין'}</p>
                <p><strong>מקור:</strong> ${payload.source_page || 'דף נחיתה'}</p>
              </div>
            `
          })
        });
      }
    } catch (emailError) {
      console.error('Error sending lead email:', emailError);
      // Don't fail the request if email fails
    }

    return jsonResponse({ success: true, lead });
  } catch (error) {
    console.error('Error submitting lead:', error);
    return errorResponse(error.message, 500);
  }
});
