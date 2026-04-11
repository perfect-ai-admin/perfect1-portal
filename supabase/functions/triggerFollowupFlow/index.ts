// triggerFollowupFlow — internal endpoint called by n8n (or scheduled jobs)
// to start a follow-up questionnaire flow for a lead.
//
// Use cases:
// 1. Abandoned checkout (7 min after payment link click, no payment) → pre_payment_recovery_flow
// 2. Post-payment onboarding (7 min after successful payment) → post_payment_onboarding_flow
//
// Auth: requires SUPABASE_SERVICE_ROLE_KEY in Authorization header.

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import {
  getStep,
  buildPrePaymentRecoveryOpening,
  buildPostPaymentOnboardingOpening,
} from '../_shared/botFlowTemplates.ts';
import { sendAndStoreMessage, formatPhone } from '../_shared/whatsappHelper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  // Internal-only protection: decode the JWT and verify role=service_role
  const authHeader = req.headers.get('Authorization') || '';
  const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();

  let isServiceRole = false;
  try {
    const parts = bearerToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.role === 'service_role') {
        isServiceRole = true;
      }
    }
  } catch (_) { /* invalid token */ }

  if (!isServiceRole) {
    console.warn('[triggerFollowupFlow] Auth failed. Not a service_role JWT');
    return errorResponse('Forbidden: internal only', 403, req);
  }

  try {
    const { lead_id, flow_type } = await req.json();
    if (!lead_id || !flow_type) {
      return errorResponse('lead_id and flow_type required', 400, req);
    }

    const VALID_FLOWS = ['pre_payment_recovery_flow', 'post_payment_onboarding_flow'];
    if (!VALID_FLOWS.includes(flow_type)) {
      return errorResponse(`Invalid flow_type. Must be one of: ${VALID_FLOWS.join(', ')}`, 400, req);
    }

    // Fetch lead
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, name, phone, payment_status, abandoned_followup_sent_at, post_payment_onboarding_sent_at, paid_at, payment_link_clicked_at')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);
    if (!lead.phone) return errorResponse('Lead has no phone', 400, req);

    const cleanPhone = formatPhone(lead.phone);
    const leadName = lead.name || 'לקוח';

    // === GUARDS — only fire if conditions still hold ===

    if (flow_type === 'pre_payment_recovery_flow') {
      // Only fire if payment is NOT completed AND we haven't already sent the followup
      if (lead.payment_status === 'paid') {
        return jsonResponse({ skipped: true, reason: 'already_paid' }, 200, req);
      }
      if (lead.abandoned_followup_sent_at) {
        return jsonResponse({ skipped: true, reason: 'already_sent' }, 200, req);
      }
    }

    if (flow_type === 'post_payment_onboarding_flow') {
      // Only fire if paid AND onboarding hasn't been sent
      if (lead.payment_status !== 'paid') {
        return jsonResponse({ skipped: true, reason: 'not_paid' }, 200, req);
      }
      if (lead.post_payment_onboarding_sent_at) {
        return jsonResponse({ skipped: true, reason: 'already_sent' }, 200, req);
      }
    }

    // Close any active sessions for this phone (don't interfere)
    await supabaseAdmin
      .from('bot_sessions')
      .update({ completed_at: new Date().toISOString(), outcome_state: 'superseded' })
      .eq('phone', cleanPhone)
      .is('completed_at', null);

    // Determine first step ID + opening message
    const firstStepId = flow_type === 'pre_payment_recovery_flow' ? 'pp_q1' : 'po_q1';
    const openingMessage = flow_type === 'pre_payment_recovery_flow'
      ? buildPrePaymentRecoveryOpening(leadName)
      : buildPostPaymentOnboardingOpening(leadName);

    // Create new session
    const { data: newSession, error: sessErr } = await supabaseAdmin
      .from('bot_sessions')
      .insert({
        lead_id,
        phone: cleanPhone,
        flow_type,
        page_intent: flow_type === 'pre_payment_recovery_flow' ? 'recovery' : 'onboarding',
        current_step: firstStepId,
        temperature: 'warm',
        messages_count: 0,
      })
      .select('id')
      .single();

    if (sessErr) {
      console.error('Session create failed:', sessErr.message);
      return errorResponse('Session create failed', 500, req);
    }

    const sendOpts = {
      phone: cleanPhone,
      lead_id,
      session_id: newSession.id,
      sender_type: 'bot' as const,
    };

    // Send opening
    await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: openingMessage });

    // Send first question
    const q1 = getStep(flow_type, firstStepId);
    if (q1) {
      await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: q1.question });
    }

    // Update session messages count
    await supabaseAdmin.from('bot_sessions').update({
      messages_count: 2,
      last_message_at: new Date().toISOString(),
    }).eq('id', newSession.id);

    // Mark timestamp on lead so we don't send again
    const leadUpdate: Record<string, unknown> = {
      bot_state: flow_type === 'pre_payment_recovery_flow' ? 'payment_abandoned_followup' : 'post_payment_questionnaire',
      flow_type,
      bot_current_step: firstStepId,
      bot_last_message_at: new Date().toISOString(),
    };
    if (flow_type === 'pre_payment_recovery_flow') {
      leadUpdate.abandoned_followup_sent_at = new Date().toISOString();
    } else {
      leadUpdate.post_payment_onboarding_sent_at = new Date().toISOString();
    }

    await supabaseAdmin.from('leads').update(leadUpdate).eq('id', lead_id);

    // Log event
    await supabaseAdmin.from('lead_events').insert({
      lead_id,
      event_type: `followup_flow_started_${flow_type}`,
      event_data: { session_id: newSession.id, flow_type },
      source: 'sales_portal',
    });

    return jsonResponse({
      success: true,
      session_id: newSession.id,
      flow_type,
    }, 200, req);
  } catch (error) {
    console.error('triggerFollowupFlow error:', (error as Error).message);
    return errorResponse((error as Error).message, 500, req);
  }
});
