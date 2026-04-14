// crmCreateAgreement — Save agreement + send template link via WhatsApp
// Simple flow: save to DB → send WhatsApp with template link → done
// No external API dependency — uses fixed FillFaster template links

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage } from '../_shared/whatsappHelper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { lead_id, template_key, template_label, template_link, whatsapp_message, send_whatsapp, extra_fields } = await req.json();

    if (!lead_id || !template_key || !template_link) {
      return errorResponse('lead_id, template_key, and template_link are required', 400, req);
    }

    // Fetch lead
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, name, phone')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);

    const now = new Date().toISOString();

    // Save agreement
    const { data: agreement, error: agErr } = await supabaseAdmin
      .from('agreements')
      .insert({
        lead_id,
        template_key,
        template_label: template_label || template_key,
        fillfaster_form_id: template_key,
        submission_link: template_link,
        status: 'sent',
        sent_at: now,
        prefilled_data: extra_fields || {},
        user_data: { lead_id, agent_id: user.id, template_key },
        agent_id: user.id,
      })
      .select('id')
      .single();

    if (agErr || !agreement) {
      console.error('[crmCreateAgreement] DB insert failed:', agErr);
      return errorResponse('Failed to save agreement', 500, req);
    }

    // Update lead
    await supabaseAdmin.from('leads').update({
      agreement_status: 'sent',
      agreement_id: agreement.id,
      updated_at: now,
    }).eq('id', lead_id);

    // Send WhatsApp
    let whatsappSent = false;
    if (send_whatsapp !== false && lead.phone) {
      const message = whatsapp_message || `היי ${lead.name || ''} 👋\n\nמצרף/ה לך הסכם לחתימה דיגיטלית:\n${template_link}\n\nאחרי החתימה נמשיך לשלב הבא.\nלשאלות — אנחנו כאן! 🙂`;

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
        console.error('[crmCreateAgreement] WhatsApp error:', waErr);
      }
    }

    // Log
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: lead_id,
      new_status: 'agreement_sent',
      change_reason: 'agreement_created',
      source: 'sales_portal',
      metadata: { agreement_id: agreement.id, template_key, whatsapp_sent: whatsappSent, link_type: 'shared_template' },
    });

    console.log('[crmCreateAgreement] Done | agreement:', agreement.id, '| wa:', whatsappSent);

    return jsonResponse({
      success: true,
      agreement_id: agreement.id,
      submission_link: template_link,
      whatsapp_sent: whatsappSent,
      status: 'sent',
    }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] crmCreateAgreement:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
