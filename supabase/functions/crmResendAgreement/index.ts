// crmResendAgreement — Resend agreement signing link via WhatsApp (reminder)
// Authenticated: requires logged-in user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage } from '../_shared/whatsappHelper.ts';

// Rate limit: max 1 reminder per agreement per 30 minutes
const REMINDER_COOLDOWN_MS = 30 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { agreement_id } = await req.json();

    if (!agreement_id) {
      return errorResponse('agreement_id is required', 400, req);
    }

    // Fetch agreement
    const { data: agreement, error: agErr } = await supabaseAdmin
      .from('agreements')
      .select('id, lead_id, submission_link, status, template_label, sent_at, updated_at')
      .eq('id', agreement_id)
      .single();

    if (agErr || !agreement) return errorResponse('Agreement not found', 404, req);

    if (agreement.status === 'signed') {
      return errorResponse('Agreement already signed', 400, req);
    }
    if (!agreement.submission_link) {
      return errorResponse('No submission link available', 400, req);
    }

    // Rate limit check — look at last reminder in status_history
    const { data: lastReminder } = await supabaseAdmin
      .from('status_history')
      .select('created_at')
      .eq('entity_id', agreement.lead_id)
      .eq('new_status', 'agreement_reminder_sent')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastReminder) {
      const elapsed = Date.now() - new Date(lastReminder.created_at).getTime();
      if (elapsed < REMINDER_COOLDOWN_MS) {
        const minutesLeft = Math.ceil((REMINDER_COOLDOWN_MS - elapsed) / 60000);
        return errorResponse(`ניתן לשלוח תזכורת שוב בעוד ${minutesLeft} דקות`, 429, req);
      }
    }

    // Fetch lead
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('id, name, phone')
      .eq('id', agreement.lead_id)
      .single();

    if (!lead?.phone) {
      return errorResponse('Lead has no phone number', 400, req);
    }

    console.log('[crmResendAgreement] Sending reminder | agreement:', agreement.id, '| lead:', lead.id);

    const templateName = agreement.template_label || 'ההסכם';
    const waMessage = `שלום ${lead.name || ''},\n\nרצינו להזכיר ש${templateName} עדיין ממתין לחתימתך:\n${agreement.submission_link}\n\nנשמח אם תוכל/י להשלים את החתימה בהקדם 🙏`;

    const waResult = await sendAndStoreMessage(supabaseAdmin, {
      phone: lead.phone,
      message: waMessage,
      lead_id: lead.id,
      sender_type: 'system',
      message_type: 'text',
    });

    console.log('[crmResendAgreement] WhatsApp result:', JSON.stringify(waResult));

    // Log reminder
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: lead.id,
      new_status: 'agreement_reminder_sent',
      change_reason: 'manual_reminder',
      source: 'sales_portal',
      metadata: {
        agreement_id: agreement.id,
        sent_by: user.id,
        whatsapp_sent: waResult?.success === true,
      },
    });

    return jsonResponse({
      success: true,
      reminded: true,
      whatsapp_sent: waResult?.success === true,
    }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] crmResendAgreement:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
