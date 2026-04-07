// Migrated from Base44: submitLeadToN8N
// Saves a lead from a landing page form and routes it to configured notification channels

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, escapeHtml } from '../_shared/supabaseAdmin.ts';
import { classifyIntent } from '../_shared/botIntentClassifier.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

async function sendWhatsAppAcknowledgment(phone: string, leadName: string): Promise<void> {
  console.log('📱 sendWhatsAppAcknowledgment called with phone:', phone);

  const greenApiToken = Deno.env.get('GREENAPI_API_TOKEN');
  const greenApiInstance = Deno.env.get('GREENAPI_INSTANCE_ID');

  console.log('🔑 greenApiToken exists:', greenApiToken ? 'YES' : 'NO');
  console.log('🔑 greenApiInstance exists:', greenApiInstance ? 'YES' : 'NO');

  if (!greenApiToken || !greenApiInstance) {
    console.warn('❌ GreenAPI credentials missing, skipping WhatsApp acknowledgment');
    return;
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const fullPhone = cleanPhone.startsWith('972') ? cleanPhone :
                    cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : '972' + cleanPhone;

  console.log('📞 Formatted phone:', fullPhone);

  const waMessage = `שלום ${leadName} 👋\n\nקיבלנו את פרטיך! 📝\nנציג שלנו יחזור אליך בהקדם ביותר 📞\n\nתודה שבחרת בנו! 🙏`;

  const url = `https://api.green-api.com/waInstance${greenApiInstance}/sendMessage/${greenApiToken}`;
  console.log('🌐 Sending to GreenAPI URL:', url.substring(0, 50) + '...');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: `${fullPhone}@c.us`, message: waMessage })
    });
    console.log('✅ GreenAPI response status:', res.status);
    const responseText = await res.text();
    console.log('✅ GreenAPI response:', responseText);
    console.log('✅ WhatsApp acknowledgment sent to:', fullPhone);
  } catch (e: any) {
    console.warn('❌ WhatsApp acknowledgment failed:', e.message);
  }
}

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

    // Diagnostic: log environment variables
    const BOT_START_FLOW_URL_CHECK = Deno.env.get('BOT_START_FLOW_URL');
    console.log('🔧 DIAGNOSTIC: BOT_START_FLOW_URL =', BOT_START_FLOW_URL_CHECK ? '✓ SET' : '❌ NOT SET');
    console.log('🔧 DIAGNOSTIC: BOT_START_FLOW_URL value:', BOT_START_FLOW_URL_CHECK || '(empty)');

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
    console.log(`Intent classified: ${intent.page_intent} / ${intent.flow_type} for slug=${pageSlug}`);

    const destPhone = landingPage?.destination_phone || '';
    const destEmail = landingPage?.destination_email || '';

    console.log(`Lead channels: ${JSON.stringify(channels)}, phone: ${destPhone}, email: ${destEmail}`);

    // Build attribution notes (gclid/fbclid/landingUrl stored here until DB columns are added)
    const attrParts: string[] = [];
    if (message) attrParts.push(message);
    if (gclid) attrParts.push(`gclid=${gclid}`);
    if (fbclid) attrParts.push(`fbclid=${fbclid}`);
    if (landingUrl) attrParts.push(`landingUrl=${landingUrl}`);
    const notesField = attrParts.join(' | ');

    // 2. Save to leads table (CRM)
    const leadData: Record<string, any> = {
      name: name || 'אתר',
      phone: phone.trim(),
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

    // 2a. Send WhatsApp acknowledgment to the lead
    await sendWhatsAppAcknowledgment(phone.trim(), name || 'לקוח');

    // 2b. Trigger bot flow via N8N webhook (direct call, no Edge Function dependency)
    // Note: Database trigger (notify_n8n_new_lead) also calls N8N automatically
    if (leadResult) {
      const N8N_WEBHOOK_URL = 'https://n8n.perfect-1.one/webhook/perfect-one-osek-patur';
      const payload = {
        _event_type: 'new_lead',
        lead_id: leadResult.id,
        name: name || 'אתר',
        phone: phone.trim(),
        email: email || '',
        page_slug: pageSlug || 'unknown',
        service_type: intent.service_type,
      };

      console.log('✅ Sending lead to N8N webhook');
      try {
        const botRes = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000)
        });
        console.log('✅ N8N webhook response:', botRes.status);
      } catch (e: any) {
        console.warn('⚠️ N8N webhook call failed (non-blocking):', e.message);
        // Don't throw - webhook call is fire-and-forget
      }
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

    // N8N channel
    if (channels.includes('n8n')) {
      const N8N_URL = Deno.env.get('N8N_WEBHOOK_URL');
      if (N8N_URL) {
        notifications.push(
          fetch(N8N_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name || 'אתר', phone, email: email || '',
              message: message || '', pageSlug, businessName,
              timestamp: new Date().toISOString(), source: 'landing-page', status: 'new'
            })
          }).then(r => console.log('N8N status:', r.status))
            .catch(e => console.warn('N8N failed:', e.message))
        );
      }
    }

    // WhatsApp notification channel via GreenAPI
    if ((channels.includes('whatsapp') || channels.includes('n8n')) && destPhone) {
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
    if ((channels.includes('email') || channels.includes('n8n')) && destEmail) {
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
    console.error('submitLeadToN8N error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
