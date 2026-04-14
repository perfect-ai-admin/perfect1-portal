// crmCreateAgreement — Create FillFaster submission + save agreement + send WhatsApp
// API: POST https://api.fillfaster.com/v1/createSubmission
// One-click flow: fill fields → create submission → save → send WhatsApp

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage } from '../_shared/whatsappHelper.ts';

const FILLFASTER_TOKEN = Deno.env.get('FILLFASTER_API_TOKEN');
const FILLFASTER_API = 'https://api.fillfaster.com/v1/createSubmission';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { lead_id, template_key, template_label, template_link, whatsapp_message, send_whatsapp, extra_fields } = await req.json();

    if (!lead_id || !template_key) {
      return errorResponse('lead_id and template_key are required', 400, req);
    }
    if (!FILLFASTER_TOKEN) {
      return errorResponse('FillFaster API token not configured', 500, req);
    }

    // Fetch lead
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, name, phone')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);

    console.log('[crmCreateAgreement] Start | lead:', lead_id, '| template:', template_key);

    // --- Step 1: Create FillFaster submission ---
    const fillfaster_form_id = extra_fields?._fillfaster_form_id || template_key;
    const prefill_data = { ...(extra_fields || {}) };
    delete prefill_data._fillfaster_form_id;

    // Find the correct form_id from template config
    const formIdMap: Record<string, string> = {
      close_file: 'TZy1cCklEd',
      accounting_murshe: 'GfctNMEZS0',
      employment: 'ActW7DVPne',
    };
    const fid = formIdMap[template_key] || template_key;

    const user_data = { lead_id, agent_id: user.id, template_key, crm_user_id: user.id };

    const ffPayload = { fid, prefill_data, user_data };
    console.log('[crmCreateAgreement] FillFaster payload:', JSON.stringify(ffPayload));

    const ffResponse = await fetch(FILLFASTER_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FILLFASTER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ffPayload),
      signal: AbortSignal.timeout(15000),
    });

    const ffText = await ffResponse.text();
    console.log('[crmCreateAgreement] FillFaster response:', ffResponse.status, ffText);

    if (!ffResponse.ok) {
      console.error('[AGREEMENT_ERROR] FillFaster API failed:', ffResponse.status, ffText);
      return errorResponse(`FillFaster API error: ${ffResponse.status}`, 502, req);
    }

    let ffResult: Record<string, unknown>;
    try { ffResult = JSON.parse(ffText); } catch {
      return errorResponse('FillFaster returned non-JSON response', 502, req);
    }

    const submission_id = String(ffResult.submission_id || '');
    const submission_link = String(ffResult.submission_link || '');

    if (!submission_id || !submission_link) {
      return errorResponse('FillFaster returned no submission link', 502, req);
    }

    console.log('[crmCreateAgreement] Submission created:', submission_id, submission_link);

    // --- Step 2: Save agreement to DB ---
    const now = new Date().toISOString();
    const { data: agreement, error: agErr } = await supabaseAdmin
      .from('agreements')
      .insert({
        lead_id,
        template_key,
        template_label: template_label || template_key,
        fillfaster_form_id: fid,
        fillfaster_submission_id: submission_id,
        submission_link,
        status: 'sent',
        sent_at: now,
        prefilled_data: prefill_data,
        user_data,
        agent_id: user.id,
      })
      .select('id')
      .single();

    if (agErr || !agreement) {
      console.error('[AGREEMENT_ERROR] DB insert failed:', agErr);
      return errorResponse('Failed to save agreement', 500, req);
    }

    // Update lead
    await supabaseAdmin.from('leads').update({
      agreement_status: 'sent',
      agreement_id: agreement.id,
      updated_at: now,
    }).eq('id', lead_id);

    console.log('[crmCreateAgreement] Agreement saved:', agreement.id);

    // --- Step 3: Send WhatsApp ---
    let whatsappSent = false;
    if (send_whatsapp !== false && lead.phone) {
      const message = whatsapp_message ||
        `היי ${lead.name || ''} 👋\n\nמצרף/ה לך הסכם לחתימה דיגיטלית:\n${submission_link}\n\nאחרי החתימה נמשיך לשלב הבא.\nלשאלות — אנחנו כאן! 🙂`;

      try {
        const waResult = await sendAndStoreMessage(supabaseAdmin, {
          phone: lead.phone,
          message,
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

    // Log
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: lead_id,
      new_status: 'agreement_sent',
      change_reason: 'agreement_created',
      source: 'sales_portal',
      metadata: { agreement_id: agreement.id, template_key, submission_id, whatsapp_sent: whatsappSent },
    });

    console.log('[crmCreateAgreement] Done | agreement:', agreement.id, '| wa:', whatsappSent);

    return jsonResponse({
      success: true,
      agreement_id: agreement.id,
      submission_id,
      submission_link,
      whatsapp_sent: whatsappSent,
      status: 'sent',
    }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] crmCreateAgreement:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
