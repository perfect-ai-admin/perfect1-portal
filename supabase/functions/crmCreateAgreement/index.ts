// crmCreateAgreement — Create agreement via n8n → FillFaster bridge
// Flow: CRM → this function → n8n webhook → FillFaster "Create Submission Link" → response with link
// Authenticated: requires logged-in user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage } from '../_shared/whatsappHelper.ts';

// Bridge webhook — n8n workflow that calls FillFaster "Create Submission Link"
const BRIDGE_WEBHOOK_URL = Deno.env.get('N8N_FILLFASTER_WEBHOOK_URL') || Deno.env.get('MAKE_FILLFASTER_WEBHOOK_URL');
const BRIDGE_TIMEOUT_MS = 30_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { lead_id, template_key, fillfaster_form_id, template_label, extra_fields, send_via_whatsapp } = await req.json();

    // --- Validation ---
    if (!lead_id || !template_key || !fillfaster_form_id) {
      return errorResponse('lead_id, template_key, and fillfaster_form_id are required', 400, req);
    }
    if (!BRIDGE_WEBHOOK_URL) {
      console.error('[AGREEMENT_ERROR] N8N_FILLFASTER_WEBHOOK_URL not set');
      return errorResponse('FillFaster bridge webhook not configured', 500, req);
    }

    // --- Fetch lead ---
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, name, phone, email, id_number, business_name, city, service_type')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);
    if (!lead.phone && send_via_whatsapp !== false) {
      return errorResponse('Lead has no phone number — cannot send WhatsApp', 400, req);
    }

    console.log('[crmCreateAgreement] Start | lead:', lead_id, '| template:', template_key);

    // --- Build prefill_data from frontend fields (Hebrew names matching FillFaster form) ---
    const prefill_data: Record<string, string> = {};
    if (extra_fields && typeof extra_fields === 'object') {
      for (const [k, v] of Object.entries(extra_fields)) {
        if (v !== undefined && v !== null && v !== '') prefill_data[k] = String(v);
      }
    }

    // --- Build user_data (internal — returned in FillFaster webhook) ---
    const user_data = {
      lead_id,
      agent_id: user.id,
      template_key,
      crm_user_id: user.id,
    };

    // --- Call Make.com webhook (bridge to FillFaster) ---
    const makePayload = {
      fid: fillfaster_form_id,
      prefill_data,
      user_data,
      template_key,
      template_label: template_label || template_key,
      lead_name: lead.name || '',
      lead_email: lead.email || '',
    };

    console.log('[crmCreateAgreement] Sending to n8n bridge:', JSON.stringify(makePayload));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BRIDGE_TIMEOUT_MS);

    let bridgeResponse: Response;
    try {
      bridgeResponse = await fetch(BRIDGE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(makePayload),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error('[AGREEMENT_ERROR] n8n bridge failed:', msg);
      return errorResponse(`n8n bridge unreachable: ${msg}`, 502, req);
    }
    clearTimeout(timeout);

    const bridgeText = await bridgeResponse.text();
    console.log('[crmCreateAgreement] n8n response:', bridgeResponse.status, bridgeText);

    if (!bridgeResponse.ok) {
      console.error('[AGREEMENT_ERROR] n8n returned error:', bridgeResponse.status, bridgeText);
      return errorResponse(`n8n bridge error: ${bridgeResponse.status}`, 502, req);
    }

    // --- Parse n8n response ---
    let bridgeResult: Record<string, unknown>;
    try {
      bridgeResult = JSON.parse(bridgeText);
    } catch {
      console.warn('[crmCreateAgreement] n8n returned non-JSON:', bridgeText.slice(0, 200));
      bridgeResult = {};
    }

    // Extract submission_id and submission_link from n8n response
    const submission_id = String(bridgeResult.submission_id || bridgeResult.id || bridgeResult.submissionId || '');
    const submission_link = String(bridgeResult.submission_link || bridgeResult.link || bridgeResult.url || bridgeResult.submissionLink || '');

    console.log('[crmCreateAgreement] Extracted | id:', submission_id, '| link:', submission_link ? 'YES' : 'NONE');

    // --- Save agreement record ---
    const hasLink = !!submission_link;
    const { data: agreement, error: agErr } = await supabaseAdmin
      .from('agreements')
      .insert({
        lead_id,
        template_key,
        template_label: template_label || template_key,
        fillfaster_form_id,
        fillfaster_submission_id: submission_id || null,
        submission_link: submission_link || null,
        status: hasLink ? 'sent' : 'pending',
        sent_at: hasLink ? new Date().toISOString() : null,
        prefilled_data: prefill_data,
        user_data,
        agent_id: user.id,
      })
      .select('id')
      .single();

    if (agErr || !agreement) {
      console.error('[AGREEMENT_ERROR] DB insert failed:', agErr);
      return errorResponse('Failed to save agreement record', 500, req);
    }

    console.log('[crmCreateAgreement] Agreement saved:', agreement.id);

    // --- Send WhatsApp (only if link exists and requested) ---
    let whatsappSent = false;
    if (send_via_whatsapp !== false && hasLink && lead.phone) {
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
        console.log('[crmCreateAgreement] WhatsApp:', whatsappSent ? 'SENT' : 'FAILED');
      } catch (waErr) {
        console.error('[AGREEMENT_ERROR] WhatsApp failed:', waErr);
      }
    }

    // --- Update lead ---
    const now = new Date().toISOString();
    await supabaseAdmin.from('leads').update({
      agreement_status: hasLink ? 'sent' : 'pending',
      agreement_id: agreement.id,
      updated_at: now,
    }).eq('id', lead_id);

    // --- Log to status_history ---
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: lead_id,
      new_status: `agreement_${hasLink ? 'sent' : 'pending'}`,
      change_reason: 'agreement_created',
      source: 'sales_portal',
      metadata: {
        agreement_id: agreement.id,
        template_key,
        submission_id: submission_id || null,
        has_link: hasLink,
        whatsapp_sent: whatsappSent,
        created_by: user.id,
        bridge: 'n8n',
      },
    });

    console.log('[crmCreateAgreement] Done | agreement:', agreement.id, '| link:', hasLink, '| wa:', whatsappSent);

    return jsonResponse({
      success: true,
      agreement_id: agreement.id,
      submission_id: submission_id || null,
      submission_link: submission_link || null,
      whatsapp_sent: whatsappSent,
      status: hasLink ? 'sent' : 'pending',
    }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] crmCreateAgreement unhandled:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
