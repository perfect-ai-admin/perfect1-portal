// Bot Handle Reply — Webhook endpoint for incoming WhatsApp messages
// Called by GreenAPI webhook or N8N when a lead replies
// Processes button clicks / text, advances flow, sends next step

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import {
  getFlow, getStep, getNextStepId,
  buildCtaMessage, buildPricingMessage, buttonToOutcome,
  BotButton,
} from '../_shared/botFlowTemplates.ts';
import { classifyIntent } from '../_shared/botIntentClassifier.ts';

const GREEN_API_TOKEN = Deno.env.get('GREENAPI_API_TOKEN');
const GREEN_API_INSTANCE = Deno.env.get('GREENAPI_INSTANCE_ID');

function formatPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('972')) return clean;
  if (clean.startsWith('0')) return '972' + clean.substring(1);
  return '972' + clean;
}

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!GREEN_API_TOKEN || !GREEN_API_INSTANCE) return;
  const fullPhone = formatPhone(phone);
  try {
    await fetch(
      `https://api.green-api.com/waInstance${GREEN_API_INSTANCE}/sendMessage/${GREEN_API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: `${fullPhone}@c.us`, message }),
      }
    );
  } catch (e: any) {
    console.warn('WhatsApp failed:', e.message);
  }
}

async function sendWithButtons(phone: string, text: string, buttons: BotButton[]): Promise<void> {
  if (!GREEN_API_TOKEN || !GREEN_API_INSTANCE) {
    // Fallback: send as numbered list
    const msg = text + '\n\n' + buttons.map((b, i) => `${i + 1}. ${b.label}`).join('\n');
    await sendWhatsApp(phone, msg);
    return;
  }

  const fullPhone = formatPhone(phone);
  const waButtons = buttons.slice(0, 3).map(b => ({
    buttonId: b.id,
    buttonText: b.label.replace(/[^\w\s\u0590-\u05FF\u200F\u200E.,!?₪+\-/'"()]/g, '').trim().substring(0, 20),
  }));

  try {
    // Try sendButtons endpoint first (interactive buttons)
    const res = await fetch(
      `https://api.green-api.com/waInstance${GREEN_API_INSTANCE}/sendButtons/${GREEN_API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: `${fullPhone}@c.us`,
          message: text,
          buttons: waButtons,
          footerText: 'Perfect Dashboard'
        }),
      }
    );

    if (!res.ok) {
      // Fallback to numbered list
      const msg = text + '\n\n' + buttons.map((b, i) => `${i + 1}. ${b.label}`).join('\n');
      await sendWhatsApp(phone, msg);
    }
  } catch (e: any) {
    // Fallback to plain text with numbers
    const msg = text + '\n\n' + buttons.map((b, i) => `${i + 1}. ${b.label}`).join('\n');
    await sendWhatsApp(phone, msg);
  }
}

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
    // Return the "hottest" button
    const hotBtn = buttons.find(b => b.temperature_signal === 'hot');
    if (hotBtn) return hotBtn;
  }

  return null;
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

    // Clean phone from @c.us format
    phone = phone.replace('@c.us', '').replace(/[^0-9]/g, '');
    if (!phone) {
      return errorResponse('phone is required', 400, req);
    }

    const cleanPhone = formatPhone(phone);

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
      return jsonResponse({ success: true, message: 'No active session' }, 200, req);
    }

    const session = sessions[0];
    const flow = getFlow(session.flow_type);

    // Special handling for osek_patur_universal_flow "waiting_for_start"
    if (session.current_step === 'waiting_for_start' && flow.flow_type === 'osek_patur_universal_flow') {
      // Move to step_1
      const step1 = getStep(session.flow_type, 'step_1');
      if (step1) {
        await sendWithButtons(cleanPhone, step1.question, step1.buttons);
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

        // Log event
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
      // Session is at CTA stage or completed
      console.log('Session at end stage, forwarding to agent');
      return jsonResponse({ success: true, message: 'Session completed or at CTA' }, 200, req);
    }

    // Match the reply to a button
    const effectiveText = buttonId || messageText;
    const matchedButton = matchButton(effectiveText, currentStep.buttons);

    if (!matchedButton) {
      // Unrecognized input — resend current step
      await sendWithButtons(cleanPhone, 'לא הבנתי 🙂 בבקשה בחר אחת מהאפשרויות:', currentStep.buttons);
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

    // Check for special actions
    const outcome = buttonToOutcome(matchedButton.id);
    if (outcome) {
      // This is a terminal action
      sessionUpdate.outcome_state = outcome;
      sessionUpdate.completed_at = new Date().toISOString();
      sessionUpdate.current_step = 'completed';
      leadUpdate.bot_outcome_state = outcome;
      leadUpdate.bot_completed_at = new Date().toISOString();
      leadUpdate.bot_current_step = 'completed';

      // Send appropriate message
      if (outcome === 'handoff_to_agent' || outcome === 'asked_question') {
        await sendWhatsApp(cleanPhone, 'מעביר אותך לנציג שלנו שיחזור אליך בהקדם 🙂');
        leadUpdate.bot_handoff_reason = matchedButton.label;
      } else if (outcome === 'booked_call') {
        await sendWhatsApp(cleanPhone, 'מעולה! נציג שלנו יחזור אליך לשיחה קצרה בהקדם 📞');
      } else if (outcome === 'sent_documents') {
        await sendWhatsApp(cleanPhone, 'מצוין! אפשר לשלוח תמונת ת"ז כאן ונתחיל בתהליך 📄');
      } else if (outcome === 'requested_quote') {
        await sendWhatsApp(cleanPhone, 'נשלח לך הצעת מחיר מותאמת בקרוב! 📝');
      } else if (outcome === 'started_checkout') {
        await sendWhatsApp(cleanPhone, 'מעולה! נציג שלנו ייצור איתך קשר להתחלת התהליך 🚀');
      }

      // Update session + lead
      await supabaseAdmin.from('bot_sessions').update(sessionUpdate).eq('id', session.id);
      if (session.lead_id) {
        await supabaseAdmin.from('leads').update(leadUpdate).eq('id', session.lead_id);
      }

      // Log event
      await supabaseAdmin.from('bot_events').insert({
        session_id: session.id,
        lead_id: session.lead_id,
        event_type: `bot_${outcome}`,
        event_data: { button: matchedButton.id, temperature: newTemp },
      });

      // Log CTA click event
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
      // After pricing, show CTA
      const cta = buildCtaMessage(newTemp);
      await sendWhatsApp(cleanPhone, pricingMsg);
      await sendWithButtons(cleanPhone, cta.text, cta.buttons);
      sessionUpdate.current_step = 'cta';
      leadUpdate.bot_current_step = 'cta';
    } else {
      // Move to next step
      const nextStepId = getNextStepId(session.flow_type, session.current_step);

      if (nextStepId === 'cta') {
        // Show CTA
        const cta = buildCtaMessage(newTemp);
        await sendWithButtons(cleanPhone, cta.text, cta.buttons);
        sessionUpdate.current_step = 'cta';
        leadUpdate.bot_current_step = 'cta';
      } else {
        // Send next step
        const nextStep = getStep(session.flow_type, nextStepId);
        if (nextStep) {
          await sendWithButtons(cleanPhone, nextStep.question, nextStep.buttons);
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
