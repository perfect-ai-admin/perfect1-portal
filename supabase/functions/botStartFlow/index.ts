// Bot Flow Engine — Start a bot flow for a new lead
// Called by N8N when a new lead comes in, or directly from submitLead
// Classifies intent, creates bot_session, sends opening message via WhatsApp

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import { classifyIntent } from '../_shared/botIntentClassifier.ts';
import { buildOpeningMessage, buildPricingMessage, getFlow, getStep } from '../_shared/botFlowTemplates.ts';

const GREEN_API_TOKEN = Deno.env.get('GREENAPI_API_TOKEN');
const GREEN_API_INSTANCE = Deno.env.get('GREENAPI_INSTANCE_ID');

function formatPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('972')) return clean;
  if (clean.startsWith('0')) return '972' + clean.substring(1);
  return '972' + clean;
}

async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!GREEN_API_TOKEN || !GREEN_API_INSTANCE) {
    console.warn('GreenAPI credentials missing, skipping WhatsApp');
    return false;
  }
  const fullPhone = formatPhone(phone);
  try {
    const res = await fetch(
      `https://api.green-api.com/waInstance${GREEN_API_INSTANCE}/sendMessage/${GREEN_API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: `${fullPhone}@c.us`, message }),
      }
    );
    console.log('WhatsApp send status:', res.status);
    return res.ok;
  } catch (e: any) {
    console.warn('WhatsApp send failed:', e.message);
    return false;
  }
}

async function sendWhatsAppButtons(phone: string, message: string, buttons: { id: string; label: string }[]): Promise<boolean> {
  if (!GREEN_API_TOKEN || !GREEN_API_INSTANCE) {
    console.warn('GreenAPI credentials missing');
    return false;
  }
  const fullPhone = formatPhone(phone);

  // GreenAPI sendButtons (interactive message)
  // Limit: max 3 buttons per message in WhatsApp Business API
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
          message,
          buttons: waButtons,
          footerText: 'Perfect Dashboard'
        }),
      }
    );

    console.log('sendButtons response status:', res.status);

    // If sendButtons fails, fallback to numbered list
    if (!res.ok) {
      console.warn('sendButtons not supported, using numbered fallback');
      const fallback = message + '\n\n' + buttons.map((b, i) => `${i + 1}. ${b.label}`).join('\n');
      await sendWhatsAppMessage(phone, fallback);
    }
    return true;
  } catch (e: any) {
    console.warn('sendButtons failed, using numbered fallback:', e.message);
    // Fallback to plain text with numbers
    const fallback = message + '\n\n' + buttons.map((b, i) => `${i + 1}. ${b.label}`).join('\n');
    await sendWhatsAppMessage(phone, fallback);
    return true;
  }
}

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

    // 2. Close any existing active sessions for this phone (allows fresh session on new lead)
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
      // Close all existing active sessions
      const { error: closeErr } = await supabaseAdmin
        .from('bot_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('phone', cleanPhone)
        .is('completed_at', null);

      if (closeErr) {
        console.warn(`Warning: Could not close existing sessions: ${closeErr.message}`);
      } else {
        console.log(`Successfully closed ${existingSessions.length} session(s)`);
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
        temperature: 'warm', // default, updated from first answer
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
        console.error(`❌ Error updating lead ${lead_id}: ${leadUpdateErr.message}`);
      } else if (!updatedLead || updatedLead.length === 0) {
        console.warn(`⚠️ Lead ${lead_id} not updated — 0 rows affected (check RLS or lead existence)`);
      } else {
        console.log(`✅ Lead ${lead_id} updated successfully — ${updatedLead.length} row(s) updated`);
      }
    } else {
      console.warn('⚠️ No lead_id provided to botStartFlow');
    }

    // 5. Build and send opening message
    const name = lead_name || 'שם';

    // Special handling for osek_patur_universal_flow
    if (intent.flow_type === 'osek_patur_universal_flow') {
      const specialMsg = `שלום ${name} 👋\nראיתי שהשארת פרטים לגבי פתיחת עוסק פטור.\nאני כאן לעזור לך להתחיל בצורה מסודרת מול:\n✔ מע״מ\n✔ מס הכנסה\n✔ ביטוח לאומי\nרק כמה שאלות קצרות כדי להתחיל.\n\nכבר מעל 5,000 עצמאים נעזרו בשירות.`;
      const startBtn = [{ id: 'start_flow', label: '👉 בוא נתחיל' }];
      await sendWhatsAppButtons(phone, specialMsg, startBtn);

      // Update session to waiting_for_start
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

      // For pricing_flow, send price immediately after opening
      if (intent.flow_type === 'pricing_flow' && intent.pricing) {
        await sendWhatsAppMessage(phone, openingMsg);
        const pricingMsg = buildPricingMessage(intent.pricing);
        // Send pricing + first step buttons
        const flow = getFlow(intent.flow_type);
        const step = flow.steps[0];
        if (step) {
          await sendWhatsAppButtons(phone, pricingMsg, step.buttons);
        } else {
          await sendWhatsAppMessage(phone, pricingMsg);
        }
      } else {
        // Send opening + first step question
        const flow = getFlow(intent.flow_type);
        const step = flow.steps[0];
        if (step) {
          const fullMsg = openingMsg + '\n\n' + step.question;
          await sendWhatsAppButtons(phone, fullMsg, step.buttons);
        } else {
          await sendWhatsAppMessage(phone, openingMsg);
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
