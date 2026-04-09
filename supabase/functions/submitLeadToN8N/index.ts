// Migrated from Base44: submitLeadToN8N
// Saves a lead from a landing page form and routes it to configured notification channels

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, escapeHtml, checkRateLimit, validatePhone, validateEmail, sanitizeString, logSecurityEvent } from '../_shared/supabaseAdmin.ts';
import { classifyIntent } from '../_shared/botIntentClassifier.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

async function sendEmailViaResend(to: string, subject: string, html: string, fromName: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${fromName} <noreply@one-pai.com>`,
      to: [to],
      subject,
      html
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    console.warn('Resend email failed:', errText);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const {
      name, phone, email, message, pageSlug, businessName,
      gclid, fbclid, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      referrer, landingUrl,
    } = await req.json();

    if (!phone) {
      return errorResponse('Phone is required', 400, req);
    }

    // Rate limiting: max 5 submissions per IP per minute
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(`lead:${clientIp}`, 5, 60_000)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip: clientIp, endpoint: 'submitLeadToN8N' });
      return errorResponse('Too many requests. Please wait a moment.', 429, req);
    }

    // Input validation
    const cleanPhone = validatePhone(phone);
    if (!cleanPhone) {
      return errorResponse('Invalid phone number format', 400, req);
    }

    if (email && !validateEmail(email)) {
      return errorResponse('Invalid email format', 400, req);
    }

    // Sanitize text inputs
    const safeName = sanitizeString(name, 100);
    const safeMessage = sanitizeString(message, 1000);
    const safeBusinessName = sanitizeString(businessName, 200);

    // 1. Find the landing page by slug to get lead destination settings
    let landingPage: any = null;
    if (pageSlug) {
      try {
        const { data: pages } = await supabaseAdmin
          .from('landing_pages')
          .select('*')
          .eq('slug', pageSlug)
          .limit(1);
        if (pages && pages.length > 0) {
          landingPage = pages[0];
        }
      } catch (e: any) {
        console.warn('Could not find landing page by slug:', e.message);
      }
    }

    // Resolve notification channels
    let channels: string[] = landingPage?.lead_channels || [];
    if (channels.length === 0 && landingPage?.lead_destination) {
      channels = [landingPage.lead_destination];
    }
    if (channels.length === 0) {
      channels = ['n8n'];
    }

    // Classify intent from page slug
    const intent = classifyIntent(pageSlug);

    const destPhone = landingPage?.destination_phone || '';
    const destEmail = landingPage?.destination_email || '';

    // Build attribution notes (gclid/fbclid/landingUrl stored here until DB columns are added)
    const attrParts: string[] = [];
    if (safeMessage) attrParts.push(safeMessage);
    if (gclid) attrParts.push(`gclid=${sanitizeString(gclid, 100)}`);
    if (fbclid) attrParts.push(`fbclid=${sanitizeString(fbclid, 100)}`);
    if (landingUrl) attrParts.push(`landingUrl=${sanitizeString(landingUrl, 500)}`);
    const notesField = attrParts.join(' | ');

    // 2. Save to leads table (CRM)
    const leadData: Record<string, any> = {
      name: safeName || 'אתר',
      phone: cleanPhone,
      email: email || '',
      notes: notesField,
      source_page: pageSlug || businessName || 'landing-page',
      page_intent: intent.page_intent,
      flow_type: intent.flow_type,
      service_type: intent.service_type,
      source: 'sales_portal',
      interaction_type: 'form',
      status: 'new',
      pipeline_stage: 'new_lead',
      temperature: 'warm',
      contact_attempts: 0,
      sla_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      // Attribution data — saved to existing DB columns
      ...(utm_source && { utm_source }),
      ...(utm_medium && { utm_medium }),
      ...(utm_campaign && { utm_campaign }),
      ...(utm_term && { utm_term }),
      ...(utm_content && { utm_content }),
      ...(referrer && { referrer }),
    };

    const { data: leadResult, error: leadErr } = await supabaseAdmin
      .from('leads')
      .insert(leadData)
      .select()
      .single();
    if (leadErr) throw new Error(leadErr.message);
    console.log('Lead saved to CRM:', leadResult.id);

    // Send lead to n8n webhook (DB trigger was disabled, so we send directly)
    try {
      const n8nPayload = {
        _event_type: 'new_lead',
        lead_id: leadResult.id,
        name: safeName || 'אתר',
        phone: cleanPhone,
        email: email || '',
        page_slug: pageSlug || 'open-osek-patur',
        service_type: intent.service_type || 'osek_patur',
      };
      await fetch('https://n8n.perfect-1.one/webhook/perfect-one-osek-patur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload),
        signal: AbortSignal.timeout(5000),
      });
      console.log('N8N webhook sent for lead:', leadResult.id);
    } catch (e: any) {
      console.warn('N8N webhook failed (non-blocking):', e.message);
    }

    // 3. Also save crm_lead (per-user CRM view)
    try {
      const crmLeadData: Record<string, any> = {
        full_name: name || 'אתר',
        phone: phone.trim(),
        email: email || '',
        source: businessName || 'Landing Page',
        page_url: landingPage?.subdomain ? `https://${landingPage.subdomain}.one-pai.com` : (pageSlug ? `https://one-pai.com/LP?s=${pageSlug}` : ''),
        status: 'new',
        journey_stage: 'lead_new'
      };
      if (landingPage?.created_by) {
        const { data: users } = await supabaseAdmin
          .from('customers')
          .select('id')
          .eq('email', landingPage.created_by)
          .limit(1);
        if (users && users.length > 0) {
          crmLeadData.customer_id = users[0].id;
        }
      }
      const { error: crmErr } = await supabaseAdmin.from('crm_leads').insert(crmLeadData);
      if (crmErr) console.warn('CRMLead creation failed (non-critical):', crmErr.message);
      else console.log('CRMLead created');
    } catch (crmErr: any) {
      console.warn('CRMLead creation failed (non-critical):', crmErr.message);
    }

    // 4. Process notification channels
    const notifications: Promise<void>[] = [];

    // Webhook channel
    if (channels.includes('webhook')) {
      const webhookUrl = landingPage?.webhook_url;
      const webhookHeaders = landingPage?.webhook_headers || {};
      if (webhookUrl) {
        const webhookPayload = {
          name: name || '',
          phone: phone.trim(),
          email: email || '',
          message: message || '',
          source: businessName || pageSlug || 'landing-page',
          page_url: landingPage?.subdomain ? `https://${landingPage.subdomain}.one-pai.com` : (pageSlug ? `https://one-pai.com/LP?s=${pageSlug}` : ''),
          timestamp: new Date().toISOString(),
          lead_id: leadResult.id
        };
        notifications.push(
          fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...webhookHeaders },
            body: JSON.stringify(webhookPayload)
          }).then(r => console.log('External webhook status:', r.status))
            .catch(e => console.warn('External webhook failed:', e.message))
        );
      } else {
        console.warn('Webhook channel selected but no URL configured');
      }
    }

    // N8N channel — handled by DB trigger (trg_notify_n8n_new_lead), no direct call needed

    // WhatsApp notification to business owner (not to lead — bot handles that via n8n)
    if (channels.includes('whatsapp') && destPhone) {
      const greenApiToken = Deno.env.get('GREENAPI_API_TOKEN');
      const greenApiInstance = Deno.env.get('GREENAPI_INSTANCE_ID');
      if (greenApiToken && greenApiInstance) {
        const cleanPhone = destPhone.replace(/[^0-9]/g, '');
        const fullPhone = cleanPhone.startsWith('972') ? cleanPhone :
                          cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : '972' + cleanPhone;
        const waMessage = `*ליד חדש מדף הנחיתה!*\n\n שם: ${name || 'לא צוין'}\n טלפון: ${phone}\n מייל: ${email || 'לא צוין'}\n הודעה: ${message || 'אין'}\n מקור: ${businessName || pageSlug || 'דף נחיתה'}\n ${new Date().toLocaleString('he-IL')}`;

        notifications.push(
          fetch(`https://api.green-api.com/waInstance${greenApiInstance}/sendMessage/${greenApiToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId: `${fullPhone}@c.us`, message: waMessage })
          }).then(r => console.log('WhatsApp status:', r.status))
            .catch(e => console.warn('WhatsApp failed:', e.message))
        );
      } else {
        console.warn('WhatsApp configured but GREEN API credentials missing');
      }
    }

    // Email notification channel via Resend
    if (channels.includes('email') && destEmail) {
      const safeName = escapeHtml(name);
      const safePhone = escapeHtml(phone);
      const safeEmail = escapeHtml(email);
      const safeMessage = escapeHtml(message);
      const safeBusinessName = escapeHtml(businessName);
      const emailHtml = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">ליד חדש התקבל!</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">${safeBusinessName || 'דף הנחיתה שלך'}</p>
          </div>
          <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F; width: 100px;">שם:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${safeName || 'לא צוין'}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">טלפון:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;"><a href="tel:${safePhone}" style="color: #27AE60; font-weight: bold;">${safePhone}</a></td></tr>
              ${safeEmail ? `<tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">מייל:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>` : ''}
              ${safeMessage ? `<tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">הודעה:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${safeMessage}</td></tr>` : ''}
            </table>
            <div style="margin-top: 20px; text-align: center;">
              <a href="tel:${safePhone}" style="display: inline-block; background: #27AE60; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">התקשר עכשיו</a>
            </div>
          </div>
        </div>
      `;
      notifications.push(
        sendEmailViaResend(
          destEmail,
          `ליד חדש מדף הנחיתה - ${name || 'ללא שם'}`,
          emailHtml,
          businessName || 'Lead.im'
        ).then(() => console.log('Email sent to:', destEmail))
          .catch(e => console.warn('Email failed:', e.message))
      );
    }

    // Phone/SMS channel (short WhatsApp message)
    if (channels.includes('phone') && destPhone) {
      const greenApiToken = Deno.env.get('GREENAPI_API_TOKEN');
      const greenApiInstance = Deno.env.get('GREENAPI_INSTANCE_ID');
      if (greenApiToken && greenApiInstance) {
        const cleanPhone = destPhone.replace(/[^0-9]/g, '');
        const fullPhone = cleanPhone.startsWith('972') ? cleanPhone :
                          cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : '972' + cleanPhone;
        const smsMessage = `ליד חדש! ${name || ''} - ${phone} - מ${businessName || 'דף נחיתה'}`;
        notifications.push(
          fetch(`https://api.green-api.com/waInstance${greenApiInstance}/sendMessage/${greenApiToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId: `${fullPhone}@c.us`, message: smsMessage })
          }).then(r => console.log('SMS/WA status:', r.status))
            .catch(e => console.warn('SMS/WA failed:', e.message))
        );
      }
    }

    if (notifications.length > 0) {
      await Promise.allSettled(notifications);
    }

    return jsonResponse({
      success: true,
      message: 'Lead saved and notifications sent',
      leadId: leadResult.id,
      channels
    }, 200, req);

  } catch (error) {
    console.error('submitLeadToN8N error:', (error as Error).message);
    return errorResponse('An error occurred while processing your request', 500, req);
  }
});
