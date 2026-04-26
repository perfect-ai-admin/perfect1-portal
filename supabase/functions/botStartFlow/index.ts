// Bot Flow Engine — Start a bot flow for a new lead
// Called by N8N when a new lead comes in, or directly from submitLead
// Classifies intent, creates bot_session, sends opening message via WhatsApp
// Stores all outbound messages in whatsapp_messages table

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import { classifyIntent } from '../_shared/botIntentClassifier.ts';
import { buildOpeningMessage, buildPricingMessage, getFlow, getStep, buildServiceOpening, getServiceCopy } from '../_shared/botFlowTemplates.ts';
import { formatPhone, sendAndStoreMessage, sendAndStoreButtons } from '../_shared/whatsappHelper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const {
      lead_id, lead_name, phone, email,
      page_slug, page_url, page_title, page_category,
      utm_source, utm_medium, utm_campaign,
    } = await req.json();

    if (!phone) {
      return errorResponse('phone is required', 400, req);
    }

    // 1. Classify intent
    const intent = classifyIntent(page_slug, page_url, page_title);
    console.log(`Intent classified: ${intent.page_intent} / ${intent.flow_type} for slug=${page_slug}`);

    // 2. Close any existing active sessions for this phone
    const cleanPhone = formatPhone(phone);
    const { data: existingSessions, error: sessionQueryErr } = await supabaseAdmin
      .from('bot_sessions')
      .select('id')
      .eq('phone', cleanPhone)
      .is('completed_at', null);

    if (sessionQueryErr) {
      console.warn(`Warning: Could not query existing sessions: ${sessionQueryErr.message}`);
    }

    if (existingSessions && existingSessions.length > 0) {
      console.log(`Closing ${existingSessions.length} existing session(s) for phone ${cleanPhone}`);
      const { error: closeErr } = await supabaseAdmin
        .from('bot_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('phone', cleanPhone)
        .is('completed_at', null);

      if (closeErr) {
        console.warn(`Warning: Could not close existing sessions: ${closeErr.message}`);
      }
    }

    // 3. Create bot_session
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from('bot_sessions')
      .insert({
        lead_id: lead_id || null,
        phone: cleanPhone,
        flow_type: intent.flow_type,
        page_intent: intent.page_intent,
        page_slug: page_slug || null,
        current_step: 'opening',
        temperature: 'warm',
        messages_count: 0,
      })
      .select()
      .single();

    if (sessionErr) throw new Error(`Session create failed: ${sessionErr.message}`);

    // Common send options for this session
    const sendOpts = {
      phone: cleanPhone,
      lead_id: lead_id || null,
      session_id: session.id,
      sender_type: 'bot' as const,
    };

    // 4. Send greeting via Green API + store in DB
    // IMPORTANT: We send BEFORE marking the lead with flow_type / bot_current_step.
    // Reason: scan_and_trigger_catchup_bot retries leads where flow_type IS NULL AND
    // bot_current_step IS NULL. If we marked the lead before sending and the WhatsApp
    // send failed (e.g. Green API disconnected), the lead would be permanently stuck
    // because catchup would skip it.
    const greetingMsg = `שלום! 👋\n\nהגעת ל*פרפקט וואן* — מומחים בפתיחה וניהול עסקים בישראל.\n\nאיך נוכל לעזור לך היום?`;
    const greetingButtons = [
      { id: 'start_now', label: 'פתיחת עוסק פטור אונליין' },
      { id: 'cta_call', label: 'שיחה עם רואה חשבון' },
      { id: 'cta_question', label: 'יש לי שאלה' },
    ];
    const sendResult = await sendAndStoreButtons(supabaseAdmin, { ...sendOpts, message: greetingMsg, buttons: greetingButtons });

    // 5. If send failed — close the orphan session, leave lead untouched, return 502.
    // Catchup scanner will retry on the next minute tick.
    if (!sendResult.success) {
      console.warn(`botStartFlow: greeting send failed for lead=${lead_id || 'n/a'} phone=${cleanPhone}. Closing orphan session ${session.id} so catchup can retry.`);
      await supabaseAdmin.from('bot_sessions').update({
        completed_at: new Date().toISOString(),
      }).eq('id', session.id);
      return errorResponse('WhatsApp send failed (Green API)', 502, req);
    }

    // 6. Send succeeded — update session
    await supabaseAdmin.from('bot_sessions').update({
      current_step: 'entry_menu',
      messages_count: 1,
      last_message_at: new Date().toISOString(),
    }).eq('id', session.id);

    // 7. Send succeeded — mark lead with flow_type so catchup skips it
    if (lead_id) {
      console.log(`Updating lead ${lead_id} with bot fields after successful send`);
      const { error: leadUpdateErr } = await supabaseAdmin.from('leads').update({
        page_intent: intent.page_intent,
        flow_type: intent.flow_type,
        bot_current_step: 'entry_menu',
        bot_started_at: new Date().toISOString(),
        bot_messages_count: 1,
        bot_last_message_at: new Date().toISOString(),
        interaction_type: 'bot',
        service_type: intent.service_type,
      }).eq('id', lead_id);

      if (leadUpdateErr) {
        console.error(`Error updating lead ${lead_id}: ${leadUpdateErr.message}`);
      }
    }

    // 8. Log event
    await supabaseAdmin.from('bot_events').insert({
      session_id: session.id,
      lead_id: lead_id || null,
      event_type: 'bot_flow_started',
      event_data: {
        flow_type: intent.flow_type,
        page_intent: intent.page_intent,
        page_slug,
        utm_source,
        utm_medium,
        utm_campaign,
      },
    });

    return jsonResponse({
      success: true,
      session_id: session.id,
      flow_type: intent.flow_type,
      page_intent: intent.page_intent,
    }, 200, req);

  } catch (error) {
    console.error('botStartFlow error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
