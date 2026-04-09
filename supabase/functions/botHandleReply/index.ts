// Bot Handle Reply — Webhook endpoint for incoming WhatsApp messages
// Called by GreenAPI webhook or N8N when a lead replies
// Processes button clicks / text, advances flow, sends next step
// Stores all messages (inbound + outbound) in whatsapp_messages table

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import {
  getFlow, getStep, getNextStepId,
  buildCtaMessage, buildPricingMessage, buttonToOutcome,
  BotButton,
} from '../_shared/botFlowTemplates.ts';
import { classifyIntent } from '../_shared/botIntentClassifier.ts';
import {
  formatPhone, sendAndStoreMessage, sendAndStoreButtons,
  storeInboundMessage, linkMessageToSession,
} from '../_shared/whatsappHelper.ts';

// Try to match user text to a button (by number or label keywords)
function matchButton(text: string, buttons: BotButton[]): BotButton | null {
  const trimmed = text.trim();

  // Match by number (1, 2, 3...)
  const num = parseInt(trimmed);
  if (num >= 1 && num <= buttons.length) {
    return buttons[num - 1];
  }

  // Match by button ID
  const byId = buttons.find(b => b.id === trimmed);
  if (byId) return byId;

  // Match by partial label content
  const lower = trimmed.toLowerCase();
  for (const b of buttons) {
    const labelClean = b.label.replace(/[^\w\s\u0590-\u05FF]/g, '').trim();
    if (labelClean.includes(trimmed) || trimmed.includes(labelClean)) {
      return b;
    }
  }

  // Hot keyword detection
  const hotKeywords = ['רוצה להתחיל', 'תן מחיר', 'איפה שולחים', 'לשלוח ת"ז', 'מתחיל'];
  if (hotKeywords.some(kw => trimmed.includes(kw))) {
    const hotBtn = buttons.find(b => b.temperature_signal === 'hot');
    if (hotBtn) return hotBtn;
  }

  return null;
}

// Helper: common send options for bot outbound messages
function botSendOpts(phone: string, leadId: string | null, sessionId: string | null) {
  return { phone, lead_id: leadId, session_id: sessionId, sender_type: 'bot' as const };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const body = await req.json();

    // Support both direct call and GreenAPI webhook format
    let phone = body.phone || body.senderData?.sender || '';
    let messageText = body.message || body.messageData?.textMessageData?.textMessage || body.messageData?.extendedTextMessageData?.text || '';
    const buttonId = body.button_id || body.messageData?.buttonsResponseMessage?.selectedButtonId || '';
    const greenApiMsgId = body.idMessage || body.messageData?.idMessage || null;

    // Clean phone from @c.us format
    phone = phone.replace('@c.us', '').replace(/[^0-9]/g, '');
    if (!phone) {
      return errorResponse('phone is required', 400, req);
    }

    const cleanPhone = formatPhone(phone);

    // === Store inbound message (dedup by greenapi_message_id) ===
    const storedInbound = await storeInboundMessage(supabaseAdmin, {
      phone: cleanPhone,
      message_text: messageText || buttonId,
      message_type: buttonId ? 'button' : 'text',
      button_id: buttonId || null,
      greenapi_message_id: greenApiMsgId,
      raw_payload: body,
    });

    // If duplicate message, skip processing
    if (greenApiMsgId && !storedInbound) {
      return jsonResponse({ success: true, deduplicated: true }, 200, req);
    }

    // Find active session
    const { data: sessions } = await supabaseAdmin
      .from('bot_sessions')
      .select('*')
      .eq('phone', cleanPhone)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!sessions || sessions.length === 0) {
      console.log('No active session for phone:', cleanPhone);

      // Try to find lead by phone and link inbound message
      if (storedInbound) {
        const { data: leadByPhone } = await supabaseAdmin
          .from('leads')
          .select('id')
          .eq('phone', cleanPhone)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (leadByPhone) {
          await linkMessageToSession(supabaseAdmin, storedInbound.id, leadByPhone.id, null);
        }
      }

      return jsonResponse({ success: true, message: 'No active session' }, 200, req);
    }

    const session = sessions[0];

    // Link stored inbound message to session/lead
    if (storedInbound) {
      await linkMessageToSession(supabaseAdmin, storedInbound.id, session.lead_id, session.id);
    }

    // === Check handoff mode — if agent mode, skip bot processing ===
    if (session.lead_id) {
      const { data: lead } = await supabaseAdmin
        .from('leads')
        .select('handoff_mode')
        .eq('id', session.lead_id)
        .single();

      if (lead?.handoff_mode === 'agent') {
        console.log('Lead in agent handoff mode, skipping bot. Lead:', session.lead_id);
        // Create notification for assigned agent
        await supabaseAdmin.from('notifications').insert({
          type: 'whatsapp_reply',
          title: 'הודעת WhatsApp חדשה',
          body: `${messageText || buttonId}`.substring(0, 200),
          entity_type: 'lead',
          entity_id: session.lead_id,
          source: 'sales_portal',
        });
        return jsonResponse({ success: true, message: 'Forwarded to agent (handoff mode)' }, 200, req);
      }
    }

    const flow = getFlow(session.flow_type);
    const sendOpts = botSendOpts(cleanPhone, session.lead_id, session.id);

    // Special handling for osek_patur_universal_flow "waiting_for_start"
    if (session.current_step === 'waiting_for_start' && flow.flow_type === 'osek_patur_universal_flow') {
      const step1 = getStep(session.flow_type, 'step_1');
      if (step1) {
        await sendAndStoreButtons(supabaseAdmin, {
          ...sendOpts,
          message: step1.question,
          buttons: step1.buttons,
        });
        await supabaseAdmin.from('bot_sessions').update({
          current_step: 'step_1',
          messages_count: (session.messages_count || 0) + 1,
          last_message_at: new Date().toISOString(),
        }).eq('id', session.id);

        if (session.lead_id) {
          await supabaseAdmin.from('leads').update({
            bot_current_step: 'step_1',
            bot_messages_count: (session.messages_count || 0) + 1,
            bot_last_message_at: new Date().toISOString(),
          }).eq('id', session.lead_id);
        }

        await supabaseAdmin.from('bot_events').insert({
          session_id: session.id,
          lead_id: session.lead_id,
          event_type: 'bot_flow_started_confirmed',
          event_data: { action: 'started_flow' },
        });
      }
      return jsonResponse({ success: true, session_id: session.id, next_step: 'step_1' }, 200, req);
    }

    const currentStep = getStep(session.flow_type, session.current_step);

    if (!currentStep) {
      console.log('Session at end stage, forwarding to agent');
      return jsonResponse({ success: true, message: 'Session completed or at CTA' }, 200, req);
    }

    // Match the reply to a button
    const effectiveText = buttonId || messageText;
    const matchedButton = matchButton(effectiveText, currentStep.buttons);

    if (!matchedButton) {
      await sendAndStoreButtons(supabaseAdmin, {
        ...sendOpts,
        message: 'לא הבנתי 🙂 בבקשה בחר אחת מהאפשרויות:',
        buttons: currentStep.buttons,
      });
      return jsonResponse({ success: true, message: 'Resent current step' }, 200, req);
    }

    // Determine temperature from button
    const newTemp = matchedButton.temperature_signal || session.temperature;

    // Save answer to session
    const answers = session.answers || {};
    answers[currentStep.crm_field] = matchedButton.label;

    // Update session
    const sessionUpdate: Record<string, unknown> = {
      answers,
      temperature: newTemp,
      messages_count: (session.messages_count || 0) + 1,
      last_message_at: new Date().toISOString(),
    };

    // Update lead CRM fields
    const leadUpdate: Record<string, unknown> = {
      [currentStep.crm_field]: matchedButton.label,
      temperature: newTemp,
      bot_messages_count: (session.messages_count || 0) + 1,
      bot_last_message_at: new Date().toISOString(),
    };

    // Check for special actions (terminal outcomes)
    const outcome = buttonToOutcome(matchedButton.id);
    if (outcome) {
      sessionUpdate.outcome_state = outcome;
      sessionUpdate.completed_at = new Date().toISOString();
      sessionUpdate.current_step = 'completed';
      leadUpdate.bot_outcome_state = outcome;
      leadUpdate.bot_completed_at = new Date().toISOString();
      leadUpdate.bot_current_step = 'completed';

      // Send appropriate message + set handoff if needed
      if (outcome === 'handoff_to_agent' || outcome === 'asked_question') {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'מעביר אותך לנציג שלנו שיחזור אליך בהקדם 🙂' });
        leadUpdate.bot_handoff_reason = matchedButton.label;
        leadUpdate.handoff_mode = 'agent';
      } else if (outcome === 'booked_call') {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'מעולה! נציג שלנו יחזור אליך לשיחה קצרה בהקדם 📞' });
      } else if (outcome === 'sent_documents') {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'מצוין! אפשר לשלוח תמונת ת"ז כאן ונתחיל בתהליך 📄' });
      } else if (outcome === 'requested_quote') {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'נשלח לך הצעת מחיר מותאמת בקרוב! 📝' });
      } else if (outcome === 'started_checkout') {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'מעולה! נציג שלנו ייצור איתך קשר להתחלת התהליך 🚀' });
      }

      await supabaseAdmin.from('bot_sessions').update(sessionUpdate).eq('id', session.id);
      if (session.lead_id) {
        await supabaseAdmin.from('leads').update(leadUpdate).eq('id', session.lead_id);
      }

      await supabaseAdmin.from('bot_events').insert({
        session_id: session.id,
        lead_id: session.lead_id,
        event_type: `bot_${outcome}`,
        event_data: { button: matchedButton.id, temperature: newTemp },
      });

      await supabaseAdmin.from('bot_events').insert({
        session_id: session.id,
        lead_id: session.lead_id,
        event_type: 'bot_cta_clicked',
        event_data: { outcome, button: matchedButton.id },
      });

      return jsonResponse({ success: true, outcome, session_id: session.id }, 200, req);
    }

    // Check if button action is 'pricing'
    if (matchedButton.action === 'pricing') {
      const intentResult = classifyIntent(session.page_slug);
      const pricingMsg = buildPricingMessage(intentResult.pricing);
      const cta = buildCtaMessage(newTemp);
      await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: pricingMsg });
      await sendAndStoreButtons(supabaseAdmin, { ...sendOpts, message: cta.text, buttons: cta.buttons });
      sessionUpdate.current_step = 'cta';
      leadUpdate.bot_current_step = 'cta';
    } else {
      // Move to next step
      const nextStepId = getNextStepId(session.flow_type, session.current_step);

      if (nextStepId === 'cta') {
        const cta = buildCtaMessage(newTemp);
        await sendAndStoreButtons(supabaseAdmin, { ...sendOpts, message: cta.text, buttons: cta.buttons });
        sessionUpdate.current_step = 'cta';
        leadUpdate.bot_current_step = 'cta';
      } else {
        const nextStep = getStep(session.flow_type, nextStepId);
        if (nextStep) {
          await sendAndStoreButtons(supabaseAdmin, { ...sendOpts, message: nextStep.question, buttons: nextStep.buttons });
          sessionUpdate.current_step = nextStepId;
          leadUpdate.bot_current_step = nextStepId;
        }
      }
    }

    // Log step completed event
    await supabaseAdmin.from('bot_events').insert({
      session_id: session.id,
      lead_id: session.lead_id,
      event_type: 'bot_step_completed',
      event_data: {
        step: session.current_step,
        button: matchedButton.id,
        temperature: newTemp,
      },
    });

    // Log first response if this is first interaction
    if (session.messages_count === 1) {
      await supabaseAdmin.from('bot_events').insert({
        session_id: session.id,
        lead_id: session.lead_id,
        event_type: 'bot_first_response',
        event_data: { button: matchedButton.id },
      });
    }

    // Update session + lead
    await supabaseAdmin.from('bot_sessions').update(sessionUpdate).eq('id', session.id);
    if (session.lead_id) {
      await supabaseAdmin.from('leads').update(leadUpdate).eq('id', session.lead_id);
    }

    return jsonResponse({ success: true, session_id: session.id, next_step: sessionUpdate.current_step }, 200, req);

  } catch (error) {
    console.error('botHandleReply error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
