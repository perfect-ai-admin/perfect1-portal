// crmCreateAgreement — Create FillFaster submission and send signing link via WhatsApp
// Authenticated: requires logged-in user
// FillFaster API: POST /v1/submission with { fid, prefill_data, user_data }

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage, formatPhone } from '../_shared/whatsappHelper.ts';

const FILLFASTER_TOKEN = Deno.env.get('FILLFASTER_API_TOKEN');
const FILLFASTER_BASE = Deno.env.get('FILLFASTER_BASE_URL') || 'https://api.fillfaster.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    // --- Feature flag ---
    const { data: flagRow } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'agreements_enabled')
      .single();
    const flagEnabled = flagRow?.value === true || flagRow?.value === 'true';
    if (!flagEnabled) {
      return errorResponse('Agreement feature is currently disabled', 403, req);
    }

    const { lead_id, template_key, fillfaster_form_id, template_label, extra_fields, send_via_whatsapp } = await req.json();

    // --- Validation ---
    if (!lead_id || !template_key || !fillfaster_form_id) {
      return errorResponse('lead_id, template_key, and fillfaster_form_id are required', 400, req);
    }
    if (!FILLFASTER_TOKEN) {
      console.error('[AGREEMENT_ERROR] FILLFASTER_API_TOKEN not set');
      return errorResponse('FillFaster API token not configured', 500, req);
    }

    // --- Fetch lead ---
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, name, phone, email, id_number, business_name, city, service_type, agreement_status')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);
    if (!lead.phone && send_via_whatsapp !== false) {
      return errorResponse('Lead has no phone number — cannot send WhatsApp', 400, req);
    }

    console.log('[crmCreateAgreement] Start | lead:', lead_id, '| template:', template_key, '| form:', fillfaster_form_id);

    // --- Build prefill_data (FillFaster field name: prefill_data, NOT prefilled_data) ---
    const prefill_data: Record<string, string> = {};
    if (lead.name) prefill_data.full_name = lead.name;
    if (lead.id_number) prefill_data.id_number = lead.id_number;
    if (lead.phone) prefill_data.phone = lead.phone;
    if (lead.email) prefill_data.email = lead.email;
    if (lead.business_name) prefill_data.business_name = lead.business_name;
    if (lead.city) prefill_data.city = lead.city;
    if (lead.service_type) prefill_data.service_name = lead.service_type;

    // Merge extra fields from frontend (amount, start_date, etc.)
    if (extra_fields && typeof extra_fields === 'object') {
      for (const [k, v] of Object.entries(extra_fields)) {
        if (v !== undefined && v !== null && v !== '') prefill_data[k] = String(v);
      }
    }

    // --- Build user_data (internal — returned in webhook for CRM matching) ---
    const user_data = {
      lead_id,
      agent_id: user.id,
      template_key,
      crm_user_id: user.id,
    };

    // --- Call FillFaster API ---
    // Docs: POST with { fid, prefill_data, user_data } + Bearer token
    const ffPayload = {
      fid: fillfaster_form_id,
      prefill_data,
      user_data,
    };

    console.log('[crmCreateAgreement] FillFaster request payload:', JSON.stringify(ffPayload));

    const ffResponse = await fetch(`${FILLFASTER_BASE}/v1/submission`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FILLFASTER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ffPayload),
    });

    const ffText = await ffResponse.text();
    console.log('[crmCreateAgreement] FillFaster response:', ffResponse.status, ffText);

    if (!ffResponse.ok) {
      console.error('[AGREEMENT_ERROR] FillFaster API failed:', ffResponse.status, ffText);
      return errorResponse(`FillFaster API error: ${ffResponse.status} — ${ffText}`, 502, req);
    }

    let ffResult: Record<string, unknown>;
    try {
      ffResult = JSON.parse(ffText);
    } catch {
      return errorResponse(`FillFaster returned non-JSON response: ${ffText.slice(0, 200)}`, 502, req);
    }

    // Extract submission_id and submission_link — try multiple possible field names
    const submission_id = (ffResult.submission_id || ffResult.id || ffResult.submissionId) as string;
    const submission_link = (ffResult.submission_link || ffResult.link || ffResult.url || ffResult.submissionLink) as string;

    if (!submission_id || !submission_link) {
      console.error('[crmCreateAgreement] Unexpected response shape:', JSON.stringify(ffResult));
      return errorResponse('FillFaster returned unexpected response — missing submission_id or link', 502, req);
    }

    // --- Save agreement record (status='pending' until WhatsApp confirmed) ---
    const { data: agreement, error: agErr } = await supabaseAdmin
      .from('agreements')
      .insert({
        lead_id,
        template_key,
        template_label: template_label || template_key,
        fillfaster_form_id,
        fillfaster_submission_id: submission_id,
        submission_link,
        status: 'pending',
        prefilled_data: prefill_data,
        user_data,
        agent_id: user.id,
      })
      .select('id')
      .single();

    if (agErr || !agreement) {
      console.error('[crmCreateAgreement] DB insert failed:', agErr);
      return errorResponse('Failed to save agreement record', 500, req);
    }

    console.log('[crmCreateAgreement] Agreement saved:', agreement.id);

    // --- Send WhatsApp ---
    let whatsappSent = false;
    if (send_via_whatsapp !== false) {
      const templateName = template_label || 'הסכם שירות';
      const waMessage = `שלום ${lead.name || ''} 👋\n\nהכנו עבורך ${templateName} לחתימה דיגיטלית.\nלחצ/י על הקישור הבא כדי לעיין ולחתום:\n\n${submission_link}\n\nהחתימה מאובטחת ותקפה משפטית.\nלשאלות — אנחנו כאן! 🙂`;

      try {
        const waResult = await sendAndStoreMessage(supabaseAdmin, {
          phone: lead.phone,
          message: waMessage,
          lead_id,
          sender_type: 'system',
          message_type: 'text',
        });
        whatsappSent = waResult?.success === true;
        console.log('[crmCreateAgreement] WhatsApp result:', JSON.stringify(waResult));
      } catch (waErr) {
        console.error('[crmCreateAgreement] WhatsApp send failed:', waErr);
      }
    }

    // --- Update agreement status based on WhatsApp result ---
    const finalStatus = whatsappSent || send_via_whatsapp === false ? 'sent' : 'pending';
    const now = new Date().toISOString();

    await supabaseAdmin.from('agreements').update({
      status: finalStatus,
      sent_at: finalStatus === 'sent' ? now : null,
      updated_at: now,
    }).eq('id', agreement.id);

    // --- Update lead ---
    await supabaseAdmin.from('leads').update({
      agreement_status: finalStatus,
      agreement_id: agreement.id,
      updated_at: now,
    }).eq('id', lead_id);

    // --- Log to status_history ---
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: lead_id,
      new_status: `agreement_${finalStatus}`,
      change_reason: 'agreement_created',
      source: 'sales_portal',
      metadata: {
        agreement_id: agreement.id,
        template_key,
        submission_id,
        whatsapp_sent: whatsappSent,
        created_by: user.id,
      },
    });

    console.log('[crmCreateAgreement] Done | agreement:', agreement.id, '| status:', finalStatus, '| wa:', whatsappSent);

    return jsonResponse({
      success: true,
      agreement_id: agreement.id,
      submission_id,
      submission_link,
      whatsapp_sent: whatsappSent,
      status: finalStatus,
    }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] crmCreateAgreement unhandled:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
