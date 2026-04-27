// crmReferLeadToPartner — Operator-triggered referral. Sends a polished
// WhatsApp message to a partner with the lead's full details + service
// the operator wants to up-sell. Logs the referral in lead_events so the
// CRM timeline shows what was sent and to whom.
//
// POST body:
//   { lead_id, partner_phone, partner_name, service_label }
//
// Authenticated — requires a logged-in CRM user.

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage, formatPhone } from '../_shared/whatsappHelper.ts';

function buildReferralMessage(opts: {
  partnerName: string;
  serviceLabel: string;
  leadName: string;
  leadPhone: string;
  leadEmail?: string;
  businessName?: string;
  businessType?: string;
  source?: string;
  pipelineStage?: string;
  notes?: string;
}): string {
  const lines: string[] = [];
  lines.push(`היי ${opts.partnerName} 👋`);
  lines.push('');
  lines.push(`יש לי ליד חדש בשבילך לסגור — *${opts.serviceLabel}*.`);
  lines.push('');
  lines.push(`📋 *פרטי הליד:*`);
  lines.push(`• שם: ${opts.leadName}`);
  lines.push(`• טלפון: ${opts.leadPhone}`);
  if (opts.leadEmail) lines.push(`• מייל: ${opts.leadEmail}`);
  if (opts.businessName) lines.push(`• שם העסק: ${opts.businessName}`);
  if (opts.businessType) lines.push(`• תחום: ${opts.businessType}`);
  if (opts.source) lines.push(`• מקור: ${opts.source}`);
  if (opts.pipelineStage) lines.push(`• סטטוס: ${opts.pipelineStage}`);
  if (opts.notes) {
    lines.push('');
    lines.push(`📝 *הערות:*`);
    lines.push(opts.notes);
  }
  lines.push('');
  lines.push(`קח אותו 🚀`);
  return lines.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { lead_id, partner_phone, partner_name, service_label } = await req.json();
    if (!lead_id || !partner_phone || !partner_name || !service_label) {
      return errorResponse('lead_id, partner_phone, partner_name, service_label required', 400, req);
    }

    // Fetch lead with all relevant fields
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, name, phone, email, business_name, business_type, source_page, pipeline_stage, notes')
      .eq('id', lead_id)
      .single();
    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);

    const message = buildReferralMessage({
      partnerName: partner_name,
      serviceLabel: service_label,
      leadName: lead.name || 'ללא שם',
      leadPhone: lead.phone || 'אין',
      leadEmail: lead.email || undefined,
      businessName: lead.business_name || undefined,
      businessType: lead.business_type || undefined,
      source: lead.source_page || undefined,
      pipelineStage: lead.pipeline_stage || undefined,
      notes: lead.notes || undefined,
    });

    // Send to partner via Green API + log
    const result = await sendAndStoreMessage(supabaseAdmin, {
      phone: partner_phone,
      message,
      lead_id, // Keep linked to original lead so timeline shows it
      sender_type: 'agent',
      message_type: 'text',
      raw_payload: {
        kind: 'partner_referral',
        partner_name,
        partner_phone: formatPhone(partner_phone),
        service_label,
        referred_by_user: user.id,
      },
    });

    if (!result.success) {
      return errorResponse('WhatsApp send to partner failed', 502, req);
    }

    // Log to lead_events for the CRM timeline
    await supabaseAdmin.from('lead_events').insert({
      lead_id,
      event_type: 'referred_to_partner',
      event_data: {
        partner_name,
        partner_phone: formatPhone(partner_phone),
        service: service_label,
        referred_by: user.email || user.id,
        message_preview: message.slice(0, 100),
      },
      source: 'crm',
    });

    // Touch lead
    await supabaseAdmin.from('leads').update({
      updated_at: new Date().toISOString(),
    }).eq('id', lead_id);

    return jsonResponse({
      success: true,
      sent_to: partner_name,
      partner_phone: formatPhone(partner_phone),
      stored_id: result.stored_id,
    }, 200, req);
  } catch (e) {
    console.error('crmReferLeadToPartner error:', (e as Error).message);
    return errorResponse((e as Error).message, 500, req);
  }
});
