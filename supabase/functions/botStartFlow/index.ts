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

    // 4. Update lead with bot fields
    if (lead_id) {
      console.log(`Updating lead ${lead_id} with bot fields`);
      const { data: updatedLead, error: leadUpdateErr } = await supabaseAdmin.from('leads').update({
        page_intent: intent.page_intent,
        flow_type: intent.flow_type,
        bot_current_step: 'opening',
        bot_started_at: new Date().toISOString(),
        bot_messages_count: 0,
        interaction_type: 'bot',
        service_type: intent.service_type,
      }).eq('id', lead_id).select();

      if (leadUpdateErr) {
        console.error(`Error updating lead ${lead_id}: ${leadUpdateErr.message}`);
      } else if (!updatedLead || updatedLead.length === 0) {
        console.warn(`Lead ${lead_id} not updated — 0 rows affected`);
      } else {
        console.log(`Lead ${lead_id} updated successfully`);
      }
    }

    // Common send options for this session
    const sendOpts = {
      phone: cleanPhone,
      lead_id: lead_id || null,
      session_id: session.id,
      sender_type: 'bot' as const,
    };

    // 5. Send the ONE AND ONLY greeting message — always the same, 3 options
    // This is the entry point of the entire bot flow.
    // The user replies with 1, 2, or 3 and botHandleReply routes accordingly.
    const greetingMsg = `שלום! 👋\n\nהגעת ל*פרפקט וואן* — מומחים בפתיחה וניהול עסקים בישראל.\n\nאיך נוכל לעזור לך היום?\n\n1️⃣ *פתיחת עוסק פטור אונליין*\nנפתח לך את התיק במס הכנסה, מע"מ וביטוח לאומי.\n\n2️⃣ *שיחה עם רואה חשבון*\nנחזור אליך בהקדם\n\n3️⃣ *יש לי שאלה*\nשאל ונענה מיד\n\nשלח מספר (1, 2 או 3)`;

    // Send as plain text only — no buttons (buttons cause duplicate numbered list in WhatsApp)
    await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: greetingMsg });

    // 6. Update session — greeting sent, waiting for user choice (1/2/3)
    await supabaseAdmin.from('bot_sessions').update({
      current_step: 'entry_menu',
      messages_count: 1,
      last_message_at: new Date().toISOString(),
    }).eq('id', session.id);

    // 7. Update lead
    if (lead_id) {
      await supabaseAdmin.from('leads').update({
        bot_current_step: 'entry_menu',
        bot_messages_count: 1,
        bot_last_message_at: new Date().toISOString(),
      }).eq('id', lead_id);
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
