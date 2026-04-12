// Bot Handle Reply — Webhook endpoint for incoming WhatsApp messages
// Called by GreenAPI webhook or N8N when a lead replies
// Processes button clicks / text, advances flow, sends next step
// Stores all messages (inbound + outbound) in whatsapp_messages table

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, escapeHtml } from '../_shared/supabaseAdmin.ts';
import {
  getFlow, getStep, getNextStepId,
  buildCtaMessage, buildPricingMessage, buttonToOutcome,
  buildAccountantCallbackOpening, buildAccountantQ1Followup, buildAccountantCallbackClosing,
  buildPrePaymentRecoveryClosing, buildPostPaymentOnboardingClosing,
  buildSalesRecoveryMessage, buildGenericAnswer, recoveryButtonToAction,
  SALES_RECOVERY_BUTTONS, BotButton, CTA_BUTTONS,
} from '../_shared/botFlowTemplates.ts';
import { classifyIntent } from '../_shared/botIntentClassifier.ts';
import {
  formatPhone, sendAndStoreMessage, sendAndStoreButtons,
  storeInboundMessage, linkMessageToSession,
} from '../_shared/whatsappHelper.ts';
import { detectIntent, looksLikeIdNumber, getSimpleFAQAnswer } from '../_shared/intentDetection.ts';
import { addLeadScore, logLeadEvent } from '../_shared/leadScoring.ts';

// Extract media URL from Green API webhook payload
// Supports: image, document, video, audio
function extractMediaFromGreenApi(body: any): { url: string | null; type: string | null; caption: string } {
  const md = body.messageData || {};
  const typeMessage = md.typeMessage || body.typeMessage || '';

  if (typeMessage === 'imageMessage' || md.fileMessageData?.mimeType?.startsWith('image/')) {
    return {
      url: md.fileMessageData?.downloadUrl || md.imageMessageData?.downloadUrl || null,
      type: 'image',
      caption: md.fileMessageData?.caption || md.imageMessageData?.caption || '',
    };
  }
  if (typeMessage === 'documentMessage' || (md.fileMessageData && !md.fileMessageData.mimeType?.startsWith('image/'))) {
    return {
      url: md.fileMessageData?.downloadUrl || null,
      type: 'document',
      caption: md.fileMessageData?.caption || '',
    };
  }
  if (typeMessage === 'videoMessage') {
    return { url: md.fileMessageData?.downloadUrl || null, type: 'video', caption: md.fileMessageData?.caption || '' };
  }
  return { url: null, type: null, caption: '' };
}

const OWNER_PHONE = '972502277087';
const OWNER_EMAIL = 'yosi5919@gmail.com';

// Send WhatsApp + Email notification to owner when accountant-callback questionnaire completes
async function notifyOwnerOnAccountantFlowComplete(
  leadId: string | null,
  phone: string,
  leadName: string,
  answers: Record<string, unknown>,
) {
  const businessField = String(answers.business_field || '—');
  const leadGenPlan = String(answers.lead_gen_plan || '—');
  const yearlyGoal = String(answers.yearly_goal || '—');
  const goalPlan = String(answers.goal_plan || '—');

  // 1) WhatsApp notification to owner
  try {
    const waMsg = `📞 ליד חדש מבקש שיחה עם רו״ח\n\n👤 ${leadName}\n📱 ${phone}\n\n💼 תחום: ${businessField}\n🚀 איך מביא לקוחות: ${leadGenPlan}\n🎯 מטרה שנתית: ${yearlyGoal}\n🛤️ איך יגיע אליה: ${goalPlan}\n\n🔗 CRM: https://perfect1.co.il/CRM/${leadId || ''}`;
    await sendAndStoreMessage(supabaseAdmin, {
      phone: OWNER_PHONE,
      message: waMsg,
      sender_type: 'system',
      message_type: 'text',
    });
  } catch (e: any) {
    console.warn('Owner WA notify failed:', e.message);
  }

  // 2) Email notification via Resend
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) return;

    const html = `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;">
      <h2 style="color:#3B82F6;">📞 ליד חדש מבקש שיחה עם רו״ח</h2>
      <p>ליד השלים שאלון לפני שיחת חזרה עם רואה חשבון.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">שם</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(leadName)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">טלפון</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(phone)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">תחום העסק</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(businessField)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">איך מביא לקוחות</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(leadGenPlan)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">מטרה שנתית</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(yearlyGoal)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">איך יגיע אליה</td><td style="padding:8px;border:1px solid #ddd;">${escapeHtml(goalPlan)}</td></tr>
      </table>
      <p style="color:#666;font-size:12px;">Lead ID: ${leadId || 'N/A'}</p>
      <p style="color:#666;font-size:12px;">נשלח אוטומטית מ-Perfect One CRM</p>
    </div>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: 'Perfect One <onboarding@resend.dev>',
        to: [OWNER_EMAIL],
        subject: `📞 ליד מבקש שיחה עם רו״ח — ${leadName}`,
        html,
      }),
    });
    console.log('Accountant-callback email sent for lead:', leadId);
  } catch (e: any) {
    console.warn('Owner email notify failed:', e.message);
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

    // === SYSTEM MESSAGES (from pg_cron scanners — not real user input) ===
    if (messageText === '_system_reminder' || messageText === '_system_recovery') {
      // Find active session
      const { data: sysSessions } = await supabaseAdmin
        .from('bot_sessions')
        .select('id, lead_id, flow_type, current_step, phone')
        .eq('phone', cleanPhone)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      const sysSession = sysSessions?.[0];
      if (!sysSession) {
        return jsonResponse({ success: true, skipped: true, reason: 'no_active_session' }, 200, req);
      }

      const sysSendOpts = botSendOpts(cleanPhone, sysSession.lead_id, sysSession.id);

      if (messageText === '_system_reminder') {
        // Gentle reminder for incomplete questionnaire
        const reminderMsg = `היי 👋\nאני רואה שהתחלנו שיחה אבל עוד לא סיימנו.\nאשמח להמשיך — אפשר לענות כאן בכל זמן שנוח 😊`;
        await sendAndStoreMessage(supabaseAdmin, { ...sysSendOpts, message: reminderMsg, sender_type: 'system' });

        await supabaseAdmin.from('bot_sessions').update({
          last_message_at: new Date().toISOString(),
        }).eq('id', sysSession.id);

        await logLeadEvent(supabaseAdmin, sysSession.lead_id, 'system_reminder_sent', {
          flow_type: sysSession.flow_type,
          current_step: sysSession.current_step,
        });

        return jsonResponse({ success: true, action: 'reminder_sent', session_id: sysSession.id }, 200, req);
      }

      if (messageText === '_system_recovery') {
        // Recovery for free_question_flow — offer next action
        const recoveryMsg = `היי 👋\nאני כאן אם יש לך שאלות נוספות.\n\nבינתיים, אשמח לדעת — מה הכי רלוונטי לך כרגע? 👇`;
        await sendAndStoreMessage(supabaseAdmin, { ...sysSendOpts, message: recoveryMsg, sender_type: 'system' });
        await sendAndStoreButtons(supabaseAdmin, {
          ...sysSendOpts,
          sender_type: 'system',
          message: '',
          buttons: SALES_RECOVERY_BUTTONS,
        });

        await supabaseAdmin.from('bot_sessions').update({
          last_message_at: new Date().toISOString(),
        }).eq('id', sysSession.id);

        await logLeadEvent(supabaseAdmin, sysSession.lead_id, 'system_recovery_sent', {
          flow_type: sysSession.flow_type,
        });

        return jsonResponse({ success: true, action: 'recovery_sent', session_id: sysSession.id }, 200, req);
      }
    }

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

    // === MEDIA DETECTION ===
    // If lead sent an image/document/video, treat it as identity document upload
    const media = extractMediaFromGreenApi(body);
    if (media.url && session.lead_id) {
      console.log('[MEDIA] Received', media.type, 'from', cleanPhone);

      // Check if the lead is in a state where we expect identity
      const { data: leadForMedia } = await supabaseAdmin
        .from('leads')
        .select('name, email, payment_status, bot_state, identity_file_url')
        .eq('id', session.lead_id)
        .single();

      // If already has identity — just log and thank
      if (leadForMedia?.identity_file_url) {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'תודה, קיבלנו את הקובץ. אם זה מסמך נוסף אשמור אותו בכרטיס שלך 📎' });
        await supabaseAdmin.from('lead_events').insert({
          lead_id: session.lead_id,
          event_type: 'media_received_extra',
          event_data: { media_url: media.url, type: media.type, caption: media.caption },
          source: 'sales_portal',
        });
        return jsonResponse({ success: true, message: 'Extra media received' }, 200, req);
      }

      // Save as identity document
      const docType = media.type === 'image' ? 'image_document' : (media.type || 'unknown');
      await supabaseAdmin.from('leads').update({
        identity_file_url: media.url,
        identity_document_type: docType,
        identity_uploaded_at: new Date().toISOString(),
      }).eq('id', session.lead_id);

      await addLeadScore(supabaseAdmin, session.lead_id, 'identity_sent', {
        media_type: media.type,
        caption: media.caption,
      });

      // Thank the user
      await sendAndStoreMessage(supabaseAdmin, {
        ...sendOpts,
        message: 'תודה רבה! 🙏\nקיבלנו את המסמך המזהה שלך. אנחנו מתחילים לטפל בפתיחת התיק שלך.\n\nתוך 72 שעות התיק שלך יהיה פתוח ומוכן לעבודה 🚀',
      });

      // Email notification to owner
      try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (resendApiKey && leadForMedia) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
            body: JSON.stringify({
              from: 'Perfect One <onboarding@resend.dev>',
              to: ['yosi5919@gmail.com'],
              subject: `📄 מסמך מזהה התקבל — ${leadForMedia.name || cleanPhone}`,
              html: `<div dir="rtl" style="font-family:Arial,sans-serif;">
                <h2>📄 מסמך מזהה התקבל מ-${escapeHtml(leadForMedia.name || cleanPhone)}</h2>
                <p><strong>טלפון:</strong> ${escapeHtml(cleanPhone)}</p>
                <p><strong>סוג מסמך:</strong> ${escapeHtml(docType)}</p>
                ${media.caption ? `<p><strong>כיתוב:</strong> ${escapeHtml(media.caption)}</p>` : ''}
                <p><a href="${media.url}">👆 לחץ לצפייה בקובץ</a></p>
                <p style="color:#666;font-size:12px;">Lead ID: ${session.lead_id}</p>
              </div>`,
            }),
          });
        }
      } catch (e: any) { console.warn('Media email failed:', e.message); }

      return jsonResponse({ success: true, message: 'Identity document saved' }, 200, req);
    }

    // === ID NUMBER AS TEXT ===
    // If user sends just an ID number as text and we don't have identity yet
    const possibleId = looksLikeIdNumber(messageText);
    if (possibleId && session.lead_id && !media.url) {
      const { data: leadForId } = await supabaseAdmin
        .from('leads')
        .select('identity_id_number, payment_status')
        .eq('id', session.lead_id)
        .single();

      // Only accept ID number if paid + no identity yet
      if (leadForId?.payment_status === 'paid' && !leadForId?.identity_id_number) {
        await supabaseAdmin.from('leads').update({
          identity_id_number: possibleId,
          identity_document_type: 'national_id_text',
          identity_uploaded_at: new Date().toISOString(),
        }).eq('id', session.lead_id);

        await addLeadScore(supabaseAdmin, session.lead_id, 'identity_sent', { id_number: 'masked' });
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'תודה! קיבלנו את מספר הזהות. אנחנו ממשיכים בתהליך ✅' });
        return jsonResponse({ success: true, message: 'ID number saved' }, 200, req);
      }
    }

    // === ENTRY MENU — user picks 1, 2, or 3 from the greeting ===
    if (session.current_step === 'entry_menu') {
      const choice = (buttonId || messageText || '').trim();

      // Match: "1" or "start_now" → payment path
      if (choice === '1' || choice === 'start_now' || choice.includes('פתיחת עוסק')) {
        const payLink = `https://perfect1.co.il/open-osek-patur-online?phone=${cleanPhone.replace('972', '0')}`;
        await sendAndStoreMessage(supabaseAdmin, {
          ...sendOpts,
          message: `מעולה! 🚀\nהנה הקישור לפתיחת תיק אונליין:\n👉 ${payLink}\n\nממלאים טופס קצר → משלמים → אנחנו פותחים לך את התיק ברשויות תוך 72 שעות.`,
          message_type: 'payment_link',
        });

        await supabaseAdmin.from('bot_sessions').update({
          current_step: 'completed',
          completed_at: new Date().toISOString(),
          outcome_state: 'started_checkout',
          messages_count: (session.messages_count || 0) + 1,
          last_message_at: new Date().toISOString(),
        }).eq('id', session.id);

        if (session.lead_id) {
          await supabaseAdmin.from('leads').update({
            bot_state: 'payment_started',
            selected_path: 'online_opening_payment',
            bot_current_step: 'payment_link_sent',
            bot_outcome_state: 'started_checkout',
            payment_link_clicked_at: new Date().toISOString(),
            bot_last_message_at: new Date().toISOString(),
          }).eq('id', session.lead_id);
          await addLeadScore(supabaseAdmin, session.lead_id, 'payment_link_clicked', { source: 'entry_menu' });
        }

        return jsonResponse({ success: true, path: 'payment', session_id: session.id }, 200, req);
      }

      // Match: "2" or "cta_call" → accountant callback
      if (choice === '2' || choice === 'cta_call' || choice.includes('רואה חשבון') || choice.includes('שיחה')) {
        // Close current session
        await supabaseAdmin.from('bot_sessions').update({
          completed_at: new Date().toISOString(),
          outcome_state: 'pivot_to_accountant_flow',
          current_step: 'completed',
        }).eq('id', session.id);

        let leadName = 'לקוח';
        if (session.lead_id) {
          const { data: lr } = await supabaseAdmin.from('leads').select('name').eq('id', session.lead_id).single();
          if (lr?.name) leadName = lr.name;
        }

        // Create accountant callback session
        const { data: acSession } = await supabaseAdmin.from('bot_sessions').insert({
          lead_id: session.lead_id,
          phone: cleanPhone,
          flow_type: 'accountant_callback_flow',
          page_intent: 'accountant_callback',
          page_slug: session.page_slug,
          current_step: 'ac_q1',
          temperature: 'warm',
          messages_count: 0,
        }).select().single();

        const acOpts = { phone: cleanPhone, lead_id: session.lead_id, session_id: acSession?.id || null, sender_type: 'bot' as const };

        // 1) Immediate opening message
        await sendAndStoreMessage(supabaseAdmin, { ...acOpts, message: buildAccountantCallbackOpening(leadName) });

        // 2) Wait 30 seconds, then send first question as a SINGLE combined message
        await new Promise(r => setTimeout(r, 30000));

        const q1 = getStep('accountant_callback_flow', 'ac_q1');
        const combinedQ1 = `כדי שרואה החשבון יוכל לעזור לך בצורה הכי טובה, אשמח לשמוע ממך כמה דברים קצרים 😊\n\nזה ייקח פחות מדקה — ויחסוך לך זמן בשיחה.\n\n${q1?.question || 'ספר לי קצת — באיזה תחום אתה רוצה לפתוח את העסק?'}`;
        await sendAndStoreMessage(supabaseAdmin, { ...acOpts, message: combinedQ1 });

        if (acSession) {
          await supabaseAdmin.from('bot_sessions').update({ messages_count: 2, last_message_at: new Date().toISOString() }).eq('id', acSession.id);
        }
        if (session.lead_id) {
          await supabaseAdmin.from('leads').update({
            bot_state: 'awaiting_accountant_callback',
            selected_path: 'accountant_callback',
            flow_type: 'accountant_callback_flow',
            bot_current_step: 'ac_q1',
            bot_last_message_at: new Date().toISOString(),
          }).eq('id', session.lead_id);
          await addLeadScore(supabaseAdmin, session.lead_id, 'accountant_callback_requested', { source: 'entry_menu' });
        }

        return jsonResponse({ success: true, path: 'accountant', session_id: acSession?.id }, 200, req);
      }

      // Match: "3" or "cta_question" → free question flow
      if (choice === '3' || choice === 'cta_question' || choice.includes('שאלה')) {
        // Close current session
        await supabaseAdmin.from('bot_sessions').update({
          completed_at: new Date().toISOString(),
          outcome_state: 'pivot_to_free_question_flow',
          current_step: 'completed',
        }).eq('id', session.id);

        const { data: fqSession } = await supabaseAdmin.from('bot_sessions').insert({
          lead_id: session.lead_id,
          phone: cleanPhone,
          flow_type: 'free_question_flow',
          page_intent: 'free_question',
          page_slug: session.page_slug,
          current_step: 'free_question_mode',
          temperature: 'warm',
          messages_count: 0,
          answers: { history: [] },
        }).select().single();

        const fqOpts = { phone: cleanPhone, lead_id: session.lead_id, session_id: fqSession?.id || null, sender_type: 'bot' as const };
        await sendAndStoreMessage(supabaseAdmin, {
          ...fqOpts,
          message: 'שאל אותי כל שאלה על פתיחת עוסק פטור, מיסוי, הנהלת חשבונות או כל דבר אחר 💬\nאני כאן לענות ולעזור לך להחליט מה הכי נכון לך.',
        });

        if (session.lead_id) {
          await supabaseAdmin.from('leads').update({
            bot_state: 'free_question_mode',
            selected_path: 'free_question',
            flow_type: 'free_question_flow',
            bot_current_step: 'free_question_mode',
            bot_last_message_at: new Date().toISOString(),
          }).eq('id', session.lead_id);
          await addLeadScore(supabaseAdmin, session.lead_id, 'asked_meaningful_question', { source: 'entry_menu' });
        }

        return jsonResponse({ success: true, path: 'free_question', session_id: fqSession?.id }, 200, req);
      }

      // Unrecognized — resend the menu
      await sendAndStoreMessage(supabaseAdmin, {
        ...sendOpts,
        message: 'לא הבנתי 🙂\nבבקשה שלח 1, 2 או 3:\n\n1️⃣ פתיחת עוסק פטור אונליין\n2️⃣ שיחה עם רואה חשבון\n3️⃣ יש לי שאלה',
      });
      return jsonResponse({ success: true, message: 'Resent entry menu' }, 200, req);
    }

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

    // === FREE-TEXT QUESTIONNAIRE FLOWS ===
    // These flows collect free-text answers: accountant_callback, pre_payment_recovery, post_payment_onboarding
    const FREE_TEXT_FLOWS = ['accountant_callback_flow', 'pre_payment_recovery_flow', 'post_payment_onboarding_flow'];
    if (FREE_TEXT_FLOWS.includes(session.flow_type)) {
      const currentStepDef = getStep(session.flow_type, session.current_step);

      if (!currentStepDef) {
        // Session already completed — just acknowledge
        return jsonResponse({ success: true, message: 'Accountant flow already completed' }, 200, req);
      }

      // Save the free-text answer
      const textAnswer = (messageText || '').trim();
      if (!textAnswer) {
        // Empty reply — resend current question
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: currentStepDef.question });
        return jsonResponse({ success: true, message: 'Resent accountant question' }, 200, req);
      }

      const acAnswers = session.answers || {};
      acAnswers[currentStepDef.crm_field] = textAnswer;

      // Determine next step
      const nextAcStepId = getNextStepId(session.flow_type, session.current_step);
      const isLastQuestion = nextAcStepId === 'cta';

      const acSessionUpdate: Record<string, unknown> = {
        answers: acAnswers,
        messages_count: (session.messages_count || 0) + 1,
        last_message_at: new Date().toISOString(),
      };

      const acLeadUpdate: Record<string, unknown> = {
        bot_messages_count: (session.messages_count || 0) + 1,
        bot_last_message_at: new Date().toISOString(),
      };

      if (isLastQuestion) {
        // Pick the right closing + storage key based on flow type
        let closingMsg = buildAccountantCallbackClosing();
        let storageKey = 'accountant_callback';
        let outcomeLabel = 'accountant_questionnaire_completed';
        let eventType = 'bot_accountant_questionnaire_completed';

        if (session.flow_type === 'pre_payment_recovery_flow') {
          closingMsg = buildPrePaymentRecoveryClosing();
          storageKey = 'pre_payment_recovery';
          outcomeLabel = 'pre_payment_questionnaire_completed';
          eventType = 'bot_pre_payment_questionnaire_completed';
        } else if (session.flow_type === 'post_payment_onboarding_flow') {
          closingMsg = buildPostPaymentOnboardingClosing();
          storageKey = 'post_payment_onboarding';
          outcomeLabel = 'post_payment_questionnaire_completed';
          eventType = 'bot_post_payment_questionnaire_completed';
        }

        console.log(`[FREE_TEXT_FLOW] Last question answered. flow=${session.flow_type}. Session: ${session.id}`);
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: closingMsg });

        acSessionUpdate.current_step = 'completed';
        acSessionUpdate.completed_at = new Date().toISOString();
        acSessionUpdate.outcome_state = outcomeLabel;
        acLeadUpdate.bot_current_step = outcomeLabel;
        acLeadUpdate.bot_completed_at = new Date().toISOString();
        acLeadUpdate.bot_outcome_state = outcomeLabel;

        // Persist all answers to leads.questionnaire_data.<storageKey>
        if (session.lead_id) {
          try {
            const { data: leadRow, error: fetchErr } = await supabaseAdmin
              .from('leads')
              .select('name, questionnaire_data')
              .eq('id', session.lead_id)
              .single();

            if (fetchErr) {
              console.error('[FREE_TEXT_FLOW] Failed to fetch lead:', fetchErr.message);
            }

            const existingQd = leadRow?.questionnaire_data || {};
            existingQd[storageKey] = {
              ...acAnswers,
              completed_at: new Date().toISOString(),
            };
            acLeadUpdate.questionnaire_data = existingQd;

            // Fire owner notification ONLY for accountant_callback flow
            if (session.flow_type === 'accountant_callback_flow') {
              notifyOwnerOnAccountantFlowComplete(
                session.lead_id,
                cleanPhone,
                leadRow?.name || 'לקוח',
                acAnswers,
              ).catch(e => console.warn('[FREE_TEXT_FLOW] notifyOwner failed:', e));
            }
          } catch (e: any) {
            console.error('[FREE_TEXT_FLOW] Exception in lead fetch/prep:', e.message);
          }
        }

        await supabaseAdmin.from('bot_events').insert({
          session_id: session.id,
          lead_id: session.lead_id,
          event_type: eventType,
          event_data: { answers: acAnswers },
        });
      } else {
        // Send next question
        const nextStep = getStep(session.flow_type, nextAcStepId);
        if (nextStep) {
          // After Q1 (business_field) send a social-proof follow-up before Q2
          if (currentStepDef.step_id === 'ac_q1') {
            await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: buildAccountantQ1Followup() });
          }
          await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: nextStep.question });
          acSessionUpdate.current_step = nextAcStepId;
          acLeadUpdate.bot_current_step = nextAcStepId;
        }
      }

      const { error: sessUpdateErr } = await supabaseAdmin.from('bot_sessions').update(acSessionUpdate).eq('id', session.id);
      if (sessUpdateErr) console.error('[AC_FLOW] Session update error:', sessUpdateErr.message);

      if (session.lead_id) {
        const { error: leadUpdateErr } = await supabaseAdmin.from('leads').update(acLeadUpdate).eq('id', session.lead_id);
        if (leadUpdateErr) console.error('[AC_FLOW] Lead update error:', leadUpdateErr.message);

        // Bump lead score for answering a questionnaire question
        if (!isLastQuestion) {
          await addLeadScore(supabaseAdmin, session.lead_id, 'questionnaire_answered', { flow: 'accountant_callback', step: currentStepDef.step_id });
        }
      }

      return jsonResponse({ success: true, session_id: session.id, next_step: acSessionUpdate.current_step }, 200, req);
    }

    // === FREE QUESTION FLOW — bot answers + sales recovery ===
    if (session.flow_type === 'free_question_flow') {
      // Check if user clicked a recovery button
      const recoveryAction = recoveryButtonToAction(buttonId);
      if (recoveryAction) {
        if (recoveryAction === 'pay') {
          // Send payment link
          const payMsg = `מעולה! 🚀\nהנה הקישור לפתיחת תיק אונליין:\n👉 https://perfect1.co.il/open-osek-patur-online?phone=${cleanPhone.replace('972', '0')}\n\nתוך כמה דקות אתה מסיים את התהליך.`;
          await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: payMsg, message_type: 'payment_link' });
          await addLeadScore(supabaseAdmin, session.lead_id, 'payment_link_clicked', { source: 'free_question_recovery' });

          await supabaseAdmin.from('bot_sessions').update({
            current_step: 'recovered_to_payment',
            completed_at: new Date().toISOString(),
            outcome_state: 'recovered_to_payment',
          }).eq('id', session.id);

          if (session.lead_id) {
            await supabaseAdmin.from('leads').update({
              bot_state: 'payment_started',
              selected_path: 'online_opening_payment',
              next_recommended_action: 'waiting_for_payment',
            }).eq('id', session.lead_id);
          }
          return jsonResponse({ success: true, recovery: 'pay' }, 200, req);
        }

        if (recoveryAction === 'accountant') {
          // Pivot to accountant_callback_flow
          let leadName = 'לקוח';
          if (session.lead_id) {
            const { data: lr } = await supabaseAdmin.from('leads').select('name').eq('id', session.lead_id).single();
            if (lr?.name) leadName = lr.name;
          }
          await supabaseAdmin.from('bot_sessions').update({
            completed_at: new Date().toISOString(),
            outcome_state: 'recovered_to_accountant',
          }).eq('id', session.id);

          const { data: acSession } = await supabaseAdmin.from('bot_sessions').insert({
            lead_id: session.lead_id,
            phone: cleanPhone,
            flow_type: 'accountant_callback_flow',
            page_intent: 'accountant_callback',
            current_step: 'ac_q1',
            temperature: 'warm',
            messages_count: 0,
          }).select().single();

          const newOpts = { phone: cleanPhone, lead_id: session.lead_id, session_id: acSession?.id || null, sender_type: 'bot' as const };
          await sendAndStoreMessage(supabaseAdmin, { ...newOpts, message: buildAccountantCallbackOpening(leadName) });
          // Wait 30 seconds before sending combined question
          await new Promise(r => setTimeout(r, 30000));
          const q1 = getStep('accountant_callback_flow', 'ac_q1');
          const combinedQ1 = `כדי שרואה החשבון יוכל לעזור לך בצורה הכי טובה, אשמח לשמוע ממך כמה דברים קצרים 😊\n\nזה ייקח פחות מדקה — ויחסוך לך זמן בשיחה.\n\n${q1?.question || 'ספר לי קצת — באיזה תחום אתה רוצה לפתוח את העסק?'}`;
          await sendAndStoreMessage(supabaseAdmin, { ...newOpts, message: combinedQ1 });

          if (acSession) {
            await supabaseAdmin.from('bot_sessions').update({ messages_count: 2, last_message_at: new Date().toISOString() }).eq('id', acSession.id);
          }
          if (session.lead_id) {
            await supabaseAdmin.from('leads').update({
              bot_state: 'awaiting_accountant_callback',
              selected_path: 'accountant_callback',
              flow_type: 'accountant_callback_flow',
              bot_current_step: 'ac_q1',
            }).eq('id', session.lead_id);
            await addLeadScore(supabaseAdmin, session.lead_id, 'accountant_callback_requested', { source: 'free_question_recovery' });
          }
          return jsonResponse({ success: true, recovery: 'accountant' }, 200, req);
        }

        // keep_asking — stay in free question mode
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'מעולה, אני כאן 😊 שאל אותי כל שאלה.' });
        return jsonResponse({ success: true, recovery: 'keep_asking' }, 200, req);
      }

      // Regular free-text question — answer + store + recovery every 2 answers
      const userText = (messageText || '').trim();
      if (!userText) {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'אשמח לענות לך 😊 אפשר לשאול אותי כל דבר.' });
        return jsonResponse({ success: true }, 200, req);
      }

      // Try FAQ answer, fallback to generic
      const faqAnswer = getSimpleFAQAnswer(userText);
      const answer = faqAnswer || buildGenericAnswer();

      await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: answer });

      // Update session answers history
      const fqAnswers = session.answers || {};
      const history = Array.isArray(fqAnswers.history) ? fqAnswers.history : [];
      history.push({ q: userText, a: answer, at: new Date().toISOString() });
      fqAnswers.history = history;

      const questionCount = history.length;
      const newMessagesCount = (session.messages_count || 0) + 1;

      // Every 2 questions (or first one if no FAQ match) — offer sales recovery
      const shouldOfferRecovery = questionCount % 2 === 0 || !faqAnswer;

      if (shouldOfferRecovery) {
        await sendAndStoreButtons(supabaseAdmin, {
          ...sendOpts,
          message: buildSalesRecoveryMessage(),
          buttons: SALES_RECOVERY_BUTTONS,
        });
      }

      await supabaseAdmin.from('bot_sessions').update({
        answers: fqAnswers,
        messages_count: newMessagesCount,
        last_message_at: new Date().toISOString(),
      }).eq('id', session.id);

      if (session.lead_id) {
        // Persist to questionnaire_data.free_question_history
        const { data: leadRow } = await supabaseAdmin
          .from('leads').select('questionnaire_data').eq('id', session.lead_id).single();
        const qd = leadRow?.questionnaire_data || {};
        qd.free_question_history = fqAnswers.history;

        await supabaseAdmin.from('leads').update({
          questionnaire_data: qd,
          bot_state: 'free_question_mode',
          bot_last_message_at: new Date().toISOString(),
          bot_messages_count: newMessagesCount,
        }).eq('id', session.lead_id);

        await addLeadScore(supabaseAdmin, session.lead_id, 'asked_meaningful_question', {
          question_count: questionCount,
          question_preview: userText.substring(0, 100),
        });
      }

      return jsonResponse({ success: true, free_question: true, questions_asked: questionCount }, 200, req);
    }

    // === CTA STATE — user is choosing from final CTA buttons ===
    // When session.current_step === 'cta', match against CTA_BUTTONS (not flow steps)
    let currentStep = getStep(session.flow_type, session.current_step);
    let isCtaState = false;

    if (!currentStep && session.current_step === 'cta') {
      isCtaState = true;
      // Use CTA buttons as the "step" buttons for matching
      currentStep = {
        step_id: 'cta',
        question: 'מה היית רוצה לעשות?',
        buttons: CTA_BUTTONS,
        crm_field: 'bot_cta_choice',
      };
    }

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

    // Update lead CRM fields (skip crm_field write in CTA state since bot_cta_choice isn't a real column)
    const leadUpdate: Record<string, unknown> = {
      temperature: newTemp,
      bot_messages_count: (session.messages_count || 0) + 1,
      bot_last_message_at: new Date().toISOString(),
    };
    if (!isCtaState) {
      leadUpdate[currentStep.crm_field] = matchedButton.label;
    }

    // Check for special actions (terminal outcomes)
    const outcome = buttonToOutcome(matchedButton.id);
    if (outcome) {
      // === SPECIAL CASE: booked_call → start accountant_callback_flow ===
      // Instead of closing the session, pivot to the questionnaire flow
      if (outcome === 'booked_call') {
        // Close current session
        await supabaseAdmin.from('bot_sessions').update({
          completed_at: new Date().toISOString(),
          outcome_state: 'pivot_to_accountant_flow',
          current_step: 'completed',
        }).eq('id', session.id);

        // Fetch lead name for personalized opening
        let leadName = 'לקוח';
        if (session.lead_id) {
          const { data: leadRow } = await supabaseAdmin
            .from('leads')
            .select('name')
            .eq('id', session.lead_id)
            .single();
          if (leadRow?.name) leadName = leadRow.name;
        }

        // Create NEW session for accountant_callback_flow
        const { data: newSession } = await supabaseAdmin
          .from('bot_sessions')
          .insert({
            lead_id: session.lead_id || null,
            phone: cleanPhone,
            flow_type: 'accountant_callback_flow',
            page_intent: 'accountant_callback',
            page_slug: session.page_slug,
            current_step: 'ac_q1',
            temperature: 'warm',
            messages_count: 0,
          })
          .select()
          .single();

        const newSessionOpts = {
          phone: cleanPhone,
          lead_id: session.lead_id,
          session_id: newSession?.id || null,
          sender_type: 'bot' as const,
        };

        // 1) Opening (includes services PDF link)
        await sendAndStoreMessage(supabaseAdmin, { ...newSessionOpts, message: buildAccountantCallbackOpening(leadName) });

        // 2) Wait 30 seconds, then send combined question
        await new Promise(r => setTimeout(r, 30000));
        const q1 = getStep('accountant_callback_flow', 'ac_q1');
        const combinedQ1 = `כדי שרואה החשבון יוכל לעזור לך בצורה הכי טובה, אשמח לשמוע ממך כמה דברים קצרים 😊\n\nזה ייקח פחות מדקה — ויחסוך לך זמן בשיחה.\n\n${q1?.question || 'ספר לי קצת — באיזה תחום אתה רוצה לפתוח את העסק?'}`;
        await sendAndStoreMessage(supabaseAdmin, { ...newSessionOpts, message: combinedQ1 });

        if (newSession) {
          await supabaseAdmin.from('bot_sessions').update({
            current_step: 'ac_q1',
            messages_count: 2,
            last_message_at: new Date().toISOString(),
          }).eq('id', newSession.id);
        }

        if (session.lead_id) {
          await supabaseAdmin.from('leads').update({
            flow_type: 'accountant_callback_flow',
            bot_current_step: 'ac_q1',
            bot_outcome_state: 'pivot_to_accountant_flow',
            bot_last_message_at: new Date().toISOString(),
          }).eq('id', session.lead_id);
        }

        await supabaseAdmin.from('bot_events').insert({
          session_id: session.id,
          lead_id: session.lead_id,
          event_type: 'bot_accountant_flow_started',
          event_data: { button: matchedButton.id, previous_flow: session.flow_type },
        });

        return jsonResponse({ success: true, outcome: 'pivot_to_accountant_flow', new_session_id: newSession?.id }, 200, req);
      }

      // === SPECIAL CASE: asked_question → pivot to free_question_flow ===
      // Never send to handoff — the bot stays active and answers questions
      if (outcome === 'asked_question') {
        await supabaseAdmin.from('bot_sessions').update({
          completed_at: new Date().toISOString(),
          outcome_state: 'pivot_to_free_question_flow',
          current_step: 'completed',
        }).eq('id', session.id);

        // Create new free_question session
        const { data: fqSession } = await supabaseAdmin
          .from('bot_sessions')
          .insert({
            lead_id: session.lead_id || null,
            phone: cleanPhone,
            flow_type: 'free_question_flow',
            page_intent: 'free_question',
            page_slug: session.page_slug,
            current_step: 'free_question_mode',
            temperature: session.temperature || 'warm',
            messages_count: 0,
            answers: { history: [] },
          })
          .select()
          .single();

        const fqOpts = { phone: cleanPhone, lead_id: session.lead_id, session_id: fqSession?.id || null, sender_type: 'bot' as const };

        // Friendly invitation
        await sendAndStoreMessage(supabaseAdmin, {
          ...fqOpts,
          message: 'שאל אותי כל שאלה על פתיחת עוסק פטור, מיסוי, הנהלת חשבונות או כל דבר אחר 💬\nאני כאן לענות ולעזור לך להחליט מה הכי נכון לך.',
        });

        if (session.lead_id) {
          await supabaseAdmin.from('leads').update({
            bot_state: 'free_question_mode',
            selected_path: 'free_question',
            flow_type: 'free_question_flow',
            bot_current_step: 'free_question_mode',
            bot_outcome_state: 'pivot_to_free_question_flow',
            bot_last_message_at: new Date().toISOString(),
          }).eq('id', session.lead_id);

          await logLeadEvent(supabaseAdmin, session.lead_id, 'path_selected', {
            path: 'free_question',
            source: 'cta_question',
          }, { from: session.flow_type, to: 'free_question_flow' });
        }

        return jsonResponse({ success: true, outcome: 'pivot_to_free_question_flow', new_session_id: fqSession?.id }, 200, req);
      }

      sessionUpdate.outcome_state = outcome;
      sessionUpdate.completed_at = new Date().toISOString();
      sessionUpdate.current_step = 'completed';
      leadUpdate.bot_outcome_state = outcome;
      leadUpdate.bot_completed_at = new Date().toISOString();
      leadUpdate.bot_current_step = 'completed';

      // Send appropriate message + set handoff if needed
      if (outcome === 'handoff_to_agent') {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'מעביר אותך לנציג שלנו שיחזור אליך בהקדם 🙂' });
        leadUpdate.bot_handoff_reason = matchedButton.label;
        leadUpdate.handoff_mode = 'agent';
      } else if (outcome === 'sent_documents') {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'מצוין! אפשר לשלוח תמונת ת"ז כאן ונתחיל בתהליך 📄' });
      } else if (outcome === 'requested_quote') {
        await sendAndStoreMessage(supabaseAdmin, { ...sendOpts, message: 'נשלח לך הצעת מחיר מותאמת בקרוב! 📝' });
      } else if (outcome === 'started_checkout') {
        // Send actual payment link instead of "agent will contact you"
        const payLink = `https://perfect1.co.il/open-osek-patur-online?phone=${cleanPhone.replace('972', '0')}`;
        await sendAndStoreMessage(supabaseAdmin, {
          ...sendOpts,
          message: `מעולה! 🚀\nהנה הקישור לפתיחת תיק אונליין:\n👉 ${payLink}\n\nממלאים טופס קצר → משלמים → אנחנו פותחים לך את התיק ברשויות תוך 72 שעות.`,
          message_type: 'payment_link',
        });
        leadUpdate.bot_state = 'payment_started';
        leadUpdate.selected_path = 'online_opening_payment';
        leadUpdate.payment_link_clicked_at = new Date().toISOString();

        // Score + trigger abandoned checkout watcher via n8n
        if (session.lead_id) {
          await addLeadScore(supabaseAdmin, session.lead_id, 'payment_link_clicked', { source: 'bot_cta' });
          // Fire n8n abandoned checkout timer (7 minutes)
          try {
            await fetch('https://n8n.perfect-1.one/webhook/abandoned-checkout-timer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lead_id: session.lead_id,
                phone: cleanPhone,
                triggered_at: new Date().toISOString(),
              }),
              signal: AbortSignal.timeout(5000),
            });
          } catch (e: any) { console.warn('abandoned-checkout-timer webhook failed:', e.message); }
        }
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
