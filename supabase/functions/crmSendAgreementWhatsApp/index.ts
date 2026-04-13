// crmSendAgreementWhatsApp — Send existing agreement link via WhatsApp
// Step 3: takes agreement_id, sends submission_link to lead's phone
// Authenticated: requires logged-in user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage } from '../_shared/whatsappHelper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { agreement_id } = await req.json();
    if (!agreement_id) return errorResponse('agreement_id is required', 400, req);

    // Fetch agreement + lead
    const { data: ag, error: agErr } = await supabaseAdmin
      .from('agreements')
      .select('id, lead_id, submission_link, template_label, status, delivery_status')
      .eq('id', agreement_id)
      .single();

    if (agErr || !ag) return errorResponse('Agreement not found', 404, req);
    if (!ag.submission_link) return errorResponse('Agreement has no signing link — generate one first', 400, req);

    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('id, name, phone')
      .eq('id', ag.lead_id)
      .single();

    if (!lead?.phone) return errorResponse('Lead has no phone number', 400, req);

    console.log('[crmSendAgreementWA] Sending | agreement:', ag.id, '| phone:', lead.phone);

    const templateName = ag.template_label || 'הסכם';
    const waMessage = `שלום ${lead.name || ''} 👋\n\nהכנו עבורך ${templateName} לחתימה דיגיטלית.\nלחצ/י על הקישור הבא כדי לעיין ולחתום:\n\n${ag.submission_link}\n\nהחתימה מאובטחת ותקפה משפטית.\nלשאלות — אנחנו כאן! 🙂`;

    let whatsappSent = false;
    try {
      const waResult = await sendAndStoreMessage(supabaseAdmin, {
        phone: lead.phone,
        message: waMessage,
        lead_id: lead.id,
        sender_type: 'system',
        message_type: 'text',
      });
      whatsappSent = waResult?.success === true;
      console.log('[crmSendAgreementWA] WhatsApp:', whatsappSent ? 'SENT' : 'FAILED');
    } catch (waErr) {
      console.error('[AGREEMENT_ERROR] WhatsApp failed:', waErr);
    }

    const now = new Date().toISOString();
    await supabaseAdmin.from('agreements').update({
      status: whatsappSent ? 'sent' : ag.status,
      delivery_status: whatsappSent ? 'whatsapp_sent' : 'send_failed',
      sent_at: whatsappSent ? now : ag.status === 'sent' ? undefined : null,
      last_error: whatsappSent ? null : 'WhatsApp send failed',
      last_error_at: whatsappSent ? null : now,
      updated_at: now,
    }).eq('id', ag.id);

    if (whatsappSent && ag.lead_id) {
      await supabaseAdmin.from('leads').update({
        agreement_status: 'sent',
        updated_at: now,
      }).eq('id', ag.lead_id);
    }

    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: ag.lead_id,
      new_status: whatsappSent ? 'agreement_sent' : 'agreement_send_failed',
      change_reason: 'whatsapp_send',
      source: 'sales_portal',
      metadata: { agreement_id: ag.id, whatsapp_sent: whatsappSent, sent_by: user.id },
    });

    if (!whatsappSent) {
      return jsonResponse({
        success: false,
        agreement_id: ag.id,
        error: 'WhatsApp send failed — link is still available',
        submission_link: ag.submission_link,
      }, 200, req);
    }

    return jsonResponse({
      success: true,
      agreement_id: ag.id,
      whatsapp_sent: true,
      status: 'sent',
    }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] crmSendAgreementWA:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
