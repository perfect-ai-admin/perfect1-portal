// Bot Flow Engine — Start a bot flow for a new lead
// Called by N8N when a new lead comes in, or directly from submitLead
// Classifies intent, creates bot_session, sends opening message via WhatsApp
// Stores all outbound messages in whatsapp_messages table

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import { classifyIntent } from '../_shared/botIntentClassifier.ts';
import { buildOpeningMessage, buildPricingMessage, getFlow, getStep } from '../_shared/botFlowTemplates.ts';
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

    // 5. Build and send opening message
    const name = lead_name || 'שם';

    if (intent.flow_type === 'osek_patur_universal_flow') {
      const specialMsg = `שלום ${name} 👋\nראיתי שהשארת פרטים לגבי פתיחת עוסק פטור.\nאני כאן לעזור לך להתחיל בצורה מסודרת מול:\n✔ מע״מ\n✔ מס הכנסה\n✔ ביטוח לאומי\nרק כמה שאלות קצרות כדי להתחיל.\n\nכבר מעל 5,000 עצמאים נעזרו בשירות.`;
      const startBtn = [{ id: 'start_flow', label: '👉 בוא נתחיל' }];
      await sendAndStoreButtons(supabaseAdmin, { ...sendOpts, message: specialMsg, buttons: startBtn });

      await supabaseAdmin.from('bot_sessions').update({
        current_step: 'waiting_for_start',
        messages_count: 1,
        last_message_at: new Date().toISOString(),
      }).eq('id', session.id);

      if (lead_id) {
        await supabaseAdmin.from('leads').update({
          bot_current_step: 'waiting_for_start',
          bot_messages_count: 1,
          bot_last_message_at: new Date().toISOString(),
        }).eq('id', lead_id);
      }
    } else {
      const openingMsg = buildOpeningMessage(name, intent.page_intent, page_title || page_slug || '');

      if (intent.flow_type === 'pricing_flow' && intent.pricing) {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: openingMsg });
        const pricingMsg = buildPricingMessage(intent.pricing);
        const flow = getFlow(intent.flow_type);
        const step = flow.steps[0];
        if (step) {
          await sendAndStoreButtons(supabaseAdmin, { ...sendOpts, message: pricingMsg, buttons: step.buttons });
        } else {
          await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: pricingMsg });
        }
      } else {
        const flow = getFlow(intent.flow_type);
        const step = flow.steps[0];
        if (step) {
          const fullMsg = openingMsg + '\n\n' + step.question;
          await sendAndStoreButtons(supabaseAdmin, { ...sendOpts, message: fullMsg, buttons: step.buttons });
        } else {
          await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: openingMsg });
        }
      }

      // 6. Update session — opening sent
      await supabaseAdmin.from('bot_sessions').update({
        current_step: 'step_1',
        messages_count: 1,
        last_message_at: new Date().toISOString(),
      }).eq('id', session.id);

      // 7. Update lead
      if (lead_id) {
        await supabaseAdmin.from('leads').update({
          bot_current_step: 'step_1',
          bot_messages_count: 1,
          bot_last_message_at: new Date().toISOString(),
        }).eq('id', lead_id);
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
