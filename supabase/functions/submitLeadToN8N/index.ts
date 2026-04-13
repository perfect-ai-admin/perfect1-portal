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
      name, phone, email, message, pageSlug, businessName, businessType,
      id_number, income, is_employee, salary, file_url,
      gclid, fbclid, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      referrer, landingUrl,
    } = await req.json();

    if (!phone && !email && !name) {
      return errorResponse('At least one of phone, email or name is required', 400, req);
    }

    // Rate limiting: max 5 submissions per IP per minute
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(`lead:${clientIp}`, 5, 60_000)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip: clientIp, endpoint: 'submitLeadToN8N' });
      return errorResponse('Too many requests. Please wait a moment.', 429, req);
    }

    // Input validation — phone is optional (payment-first flows may not have it)
    const cleanPhone = phone ? validatePhone(phone) : null;
    if (phone && !cleanPhone) {
      return errorResponse('Invalid phone number format', 400, req);
    }

    if (email && !validateEmail(email)) {
      return errorResponse('Invalid email format', 400, req);
    }

    // Sanitize text inputs
    const safeName = sanitizeString(name, 100);
    const safeMessage = sanitizeString(message, 1000);
    const safeBusinessName = sanitizeString(businessName, 200);

    // WhatsApp greeting is sent by botStartFlow (called fire-and-forget below)

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

    // Sanitize questionnaire fields
    const safeBusinessType = sanitizeString(businessType, 200);
    const safeIdNumber = id_number ? id_number.replace(/[^0-9]/g, '').slice(0, 9) : '';
    const safeIncome = sanitizeString(income, 50);
    const safeIsEmployee = sanitizeString(is_employee, 10);
    const safeSalary = sanitizeString(salary, 50);
    const safeFileUrl = sanitizeString(file_url, 1000);
    const safeLandingUrl = sanitizeString(landingUrl, 500);

    // 2. Save to leads table (CRM) — including all questionnaire data
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
      // Questionnaire data
      ...(safeIdNumber && { id_number: safeIdNumber }),
      ...(safeBusinessName && { business_name: safeBusinessName }),
      ...(safeBusinessType && { business_type: safeBusinessType }),
      ...(safeIncome && { income: safeIncome }),
      ...(safeIsEmployee && { is_employee: safeIsEmployee }),
      ...(safeSalary && { salary: safeSalary }),
      ...(safeFileUrl && { file_url: safeFileUrl }),
      ...(safeLandingUrl && { landing_url: safeLandingUrl }),
      // Store full questionnaire as JSONB for future reference
      questionnaire_data: {
        id_number: safeIdNumber || null,
        business_name: safeBusinessName || null,
        business_type: safeBusinessType || null,
        income: safeIncome || null,
        is_employee: safeIsEmployee || null,
        salary: safeSalary || null,
        file_url: safeFileUrl || null,
        submitted_at: new Date().toISOString(),
      },
      // Attribution data
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

    // Trigger botStartFlow — FIRE AND FORGET (no await)
    // The WhatsApp greeting is sent async so the lead form gets an instant response.
    if (cleanPhone) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      fetch(`${supabaseUrl}/functions/v1/botStartFlow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
        },
        body: JSON.stringify({
          lead_id: leadResult.id,
          lead_name: safeName || 'אתר',
          phone: cleanPhone,
          email: email || '',
          page_slug: pageSlug || 'open-osek-patur',
          page_title: safeBusinessName || '',
        }),
      }).then(r => console.log('botStartFlow triggered:', leadResult.id, r.status))
        .catch(e => console.warn('botStartFlow fire-and-forget failed:', e.message));
    }

    // Also notify n8n — fire and forget (no await)
    {
      const n8nPayload = {
        _event_type: 'new_lead',
        lead_id: leadResult.id,
        name: safeName || 'אתר',
        phone: cleanPhone || '',
        email: email || '',
        page_slug: pageSlug || 'open-osek-patur',
        service_type: intent.service_type || 'osek_patur',
      };
      fetch('https://n8n.perfect-1.one/webhook/perfect-one-osek-patur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload),
      }).then(() => console.log('N8N webhook sent for lead:', leadResult.id))
        .catch((e: any) => console.warn('N8N webhook failed:', e.message));
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

    // Send detailed email for paid open-osek-patur-online leads
    if (pageSlug === 'open-osek-patur-online' && message && message.includes('תשלום')) {
      const safeFields = {
        name: escapeHtml(name || ''),
        phone: escapeHtml(phone || ''),
        email: escapeHtml(email || ''),
        idNumber: escapeHtml(id_number || ''),
        businessName: escapeHtml(businessName || ''),
        businessType: escapeHtml(businessType || ''),
        income: escapeHtml(income || ''),
        isEmployee: is_employee === 'yes' ? 'כן' : 'לא',
        salary: escapeHtml(salary || ''),
        fileUrl: escapeHtml(file_url || ''),
        message: escapeHtml(message || ''),
      };
      const paidEmailHtml = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">💰 ליד חדש ששילם — פתיחת עוסק פטור</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">${safeFields.message}</p>
          </div>
          <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h3 style="color: #1E3A5F; margin: 0 0 12px 0;">פרטים אישיים</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F; width: 130px;">שם מלא:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${safeFields.name}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">ת.ז.:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${safeFields.idNumber}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">טלפון:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;"><a href="tel:${safeFields.phone}" style="color: #27AE60; font-weight: bold;">${safeFields.phone}</a></td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">אימייל:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${safeFields.email}">${safeFields.email}</a></td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">עובד שכיר במקביל:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${safeFields.isEmployee}</td></tr>
              ${is_employee === 'yes' ? `<tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">גובה שכר:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${safeFields.salary}</td></tr>` : ''}
            </table>
            <h3 style="color: #1E3A5F; margin: 16px 0 12px 0;">פרטי העסק</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F; width: 130px;">שם העסק:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${safeFields.businessName}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">סוג העסק:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${safeFields.businessType}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">צפי הכנסה חודשי:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${safeFields.income}</td></tr>
            </table>
            ${safeFields.fileUrl ? `<div style="margin-top: 16px;"><a href="${safeFields.fileUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">📎 צפה בצילום ת.ז.</a></div>` : ''}
            <div style="margin-top: 20px; text-align: center;">
              <a href="tel:${safeFields.phone}" style="display: inline-block; background: #27AE60; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">📞 התקשר ללקוח</a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 16px;">${new Date().toLocaleString('he-IL')}</p>
          </div>
        </div>
      `;
      notifications.push(
        sendEmailViaResend(
          'Yosi5919@gmail.com',
          `💰 ליד ששילם — ${name || 'ללא שם'} — פתיחת עוסק פטור`,
          paidEmailHtml,
          'פרפקט וואן'
        ).then(() => console.log('Paid lead email sent to Yosi5919@gmail.com'))
          .catch(e => console.warn('Paid lead email failed:', e.message))
      );
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
