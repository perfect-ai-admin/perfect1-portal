// Shared WhatsApp helper — send + store messages in whatsapp_messages table
// Used by botStartFlow, botHandleReply, crmSendWhatsApp, and post-purchase flows

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const GREEN_API_TOKEN = Deno.env.get('GREENAPI_API_TOKEN');
const GREEN_API_INSTANCE = Deno.env.get('GREENAPI_INSTANCE_ID');

export function formatPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('972')) return clean;
  if (clean.startsWith('0')) return '972' + clean.substring(1);
  return '972' + clean;
}

export interface SendMessageOptions {
  phone: string;
  message: string;
  lead_id?: string | null;
  session_id?: string | null;
  agent_id?: string | null;
  message_type?: 'text' | 'button' | 'media' | 'payment_link' | 'template';
  sender_type: 'bot' | 'agent' | 'system';
  button_id?: string | null;
  raw_payload?: Record<string, unknown>;
}

export interface SendResult {
  success: boolean;
  greenapi_message_id: string | null;
  stored_id: string | null;
}

// Send a text message via Green API and store in whatsapp_messages
export async function sendAndStoreMessage(
  db: SupabaseClient,
  opts: SendMessageOptions,
): Promise<SendResult> {
  const fullPhone = formatPhone(opts.phone);
  let greenApiMsgId: string | null = null;
  let success = false;

  if (GREEN_API_TOKEN && GREEN_API_INSTANCE) {
    try {
      const res = await fetch(
        `https://api.green-api.com/waInstance${GREEN_API_INSTANCE}/sendMessage/${GREEN_API_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: `${fullPhone}@c.us`, message: opts.message }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        greenApiMsgId = data.idMessage || null;
        success = true;
      }
      console.log('WhatsApp send status:', res.status);
    } catch (e: any) {
      console.warn('WhatsApp send failed:', e.message);
    }
  } else {
    console.warn('GreenAPI credentials missing, skipping WhatsApp');
  }

  // Store in DB regardless (even if send failed — for audit)
  const { data: stored } = await db.from('whatsapp_messages').insert({
    phone: fullPhone,
    direction: 'outbound',
    message_text: opts.message,
    message_type: opts.message_type || 'text',
    button_id: opts.button_id || null,
    greenapi_message_id: greenApiMsgId,
    delivery_status: success ? 'sent' : 'failed',
    sender_type: opts.sender_type,
    lead_id: opts.lead_id || null,
    session_id: opts.session_id || null,
    agent_id: opts.agent_id || null,
    source: 'sales_portal',
    raw_payload: opts.raw_payload || {},
  }).select('id').single();

  return {
    success,
    greenapi_message_id: greenApiMsgId,
    stored_id: stored?.id || null,
  };
}

// Send Interactive Reply Buttons via Green API (sendInteractiveButtonsReply)
// These are clickable buttons that return the buttonId when pressed.
// Max 3 buttons, max 25 chars per button text.
export async function sendAndStoreButtons(
  db: SupabaseClient,
  opts: SendMessageOptions & { buttons: { id: string; label: string }[] },
): Promise<SendResult> {
  const fullPhone = formatPhone(opts.phone);
  let greenApiMsgId: string | null = null;
  let success = false;
  let sentText = opts.message;

  if (GREEN_API_TOKEN && GREEN_API_INSTANCE) {
    const waButtons = opts.buttons.slice(0, 3).map(b => ({
      buttonId: b.id,
      buttonText: b.label.substring(0, 25),
    }));

    try {
      const res = await fetch(
        `https://api.green-api.com/waInstance${GREEN_API_INSTANCE}/sendInteractiveButtonsReply/${GREEN_API_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: `${fullPhone}@c.us`,
            body: opts.message,
            buttons: waButtons,
            footer: 'פרפקט וואן',
          }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        greenApiMsgId = data.idMessage || null;
        success = true;
      } else {
        // Fallback to numbered list
        console.warn('sendInteractiveButtonsReply failed, using text fallback');
        sentText = opts.message + '\n\n' + opts.buttons.map((b, i) => `${i + 1}. ${b.label}`).join('\n');
        const fallbackResult = await sendAndStoreMessage(db, {
          ...opts,
          message: sentText,
          message_type: 'text',
        });
        return fallbackResult;
      }
    } catch (e: any) {
      console.warn('sendInteractiveButtonsReply exception:', e.message);
      sentText = opts.message + '\n\n' + opts.buttons.map((b, i) => `${i + 1}. ${b.label}`).join('\n');
      const fallbackResult = await sendAndStoreMessage(db, {
        ...opts,
        message: sentText,
        message_type: 'text',
      });
      return fallbackResult;
    }
  } else {
    console.warn('GreenAPI credentials missing');
    sentText = opts.message + '\n\n' + opts.buttons.map((b, i) => `${i + 1}. ${b.label}`).join('\n');
  }

  // Store in DB
  const { data: stored } = await db.from('whatsapp_messages').insert({
    phone: fullPhone,
    direction: 'outbound',
    message_text: sentText,
    message_type: 'button',
    greenapi_message_id: greenApiMsgId,
    delivery_status: success ? 'sent' : 'failed',
    sender_type: opts.sender_type,
    lead_id: opts.lead_id || null,
    session_id: opts.session_id || null,
    agent_id: opts.agent_id || null,
    source: 'sales_portal',
    raw_payload: opts.raw_payload || {},
  }).select('id').single();

  return {
    success,
    greenapi_message_id: greenApiMsgId,
    stored_id: stored?.id || null,
  };
}

// Send an Interactive URL Button (sendInteractiveButtons with type=url)
// Renders as a single button with a clickable link.
export async function sendAndStoreUrlButton(
  db: SupabaseClient,
  opts: SendMessageOptions & { buttonText: string; url: string },
): Promise<SendResult> {
  const fullPhone = formatPhone(opts.phone);
  let greenApiMsgId: string | null = null;
  let success = false;

  if (GREEN_API_TOKEN && GREEN_API_INSTANCE) {
    try {
      const res = await fetch(
        `https://api.green-api.com/waInstance${GREEN_API_INSTANCE}/sendInteractiveButtons/${GREEN_API_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: `${fullPhone}@c.us`,
            body: opts.message,
            footer: 'פרפקט וואן',
            buttons: [
              {
                type: 'url',
                buttonId: 'payment_url',
                buttonText: opts.buttonText.substring(0, 25),
                url: opts.url,
              },
            ],
          }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        greenApiMsgId = data.idMessage || null;
        success = true;
      } else {
        // Fallback: send as text with link
        console.warn('sendInteractiveButtons URL failed, sending as text');
        const fallback = `${opts.message}\n\n👉 ${opts.url}`;
        return sendAndStoreMessage(db, { ...opts, message: fallback, message_type: 'payment_link' });
      }
    } catch (e: any) {
      console.warn('sendInteractiveButtons URL exception:', e.message);
      const fallback = `${opts.message}\n\n👉 ${opts.url}`;
      return sendAndStoreMessage(db, { ...opts, message: fallback, message_type: 'payment_link' });
    }
  } else {
    console.warn('GreenAPI credentials missing');
  }

  // Store in DB
  const { data: stored } = await db.from('whatsapp_messages').insert({
    phone: fullPhone,
    direction: 'outbound',
    message_text: `${opts.message}\n\n👉 ${opts.url}`,
    message_type: 'payment_link',
    greenapi_message_id: greenApiMsgId,
    delivery_status: success ? 'sent' : 'failed',
    sender_type: opts.sender_type,
    lead_id: opts.lead_id || null,
    session_id: opts.session_id || null,
    source: 'sales_portal',
  }).select('id').single();

  return { success, greenapi_message_id: greenApiMsgId, stored_id: stored?.id || null };
}

// Store an inbound message (no sending). Returns null if duplicate.
export async function storeInboundMessage(
  db: SupabaseClient,
  opts: {
    phone: string;
    message_text: string;
    message_type?: string;
    button_id?: string | null;
    greenapi_message_id?: string | null;
    lead_id?: string | null;
    session_id?: string | null;
    raw_payload?: Record<string, unknown>;
  },
): Promise<{ id: string } | null> {
  const fullPhone = formatPhone(opts.phone);

  // Dedup by greenapi_message_id
  if (opts.greenapi_message_id) {
    const { data: existing } = await db
      .from('whatsapp_messages')
      .select('id')
      .eq('greenapi_message_id', opts.greenapi_message_id)
      .maybeSingle();
    if (existing) {
      console.log('Duplicate message skipped:', opts.greenapi_message_id);
      return null;
    }
  }

  const { data, error } = await db.from('whatsapp_messages').insert({
    phone: fullPhone,
    direction: 'inbound',
    message_text: opts.message_text || '',
    message_type: opts.message_type || (opts.button_id ? 'button' : 'text'),
    button_id: opts.button_id || null,
    greenapi_message_id: opts.greenapi_message_id || null,
    delivery_status: 'delivered',
    sender_type: 'user',
    lead_id: opts.lead_id || null,
    session_id: opts.session_id || null,
    source: 'sales_portal',
    raw_payload: opts.raw_payload || {},
  }).select('id').single();

  if (error) {
    // Likely unique constraint violation (duplicate greenapi_message_id)
    console.warn('Store inbound failed (likely duplicate):', error.message);
    return null;
  }

  return data;
}

// Update a stored message with lead_id and session_id after session lookup
export async function linkMessageToSession(
  db: SupabaseClient,
  messageId: string,
  leadId: string | null,
  sessionId: string | null,
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (leadId) update.lead_id = leadId;
  if (sessionId) update.session_id = sessionId;
  if (Object.keys(update).length > 0) {
    await db.from('whatsapp_messages').update(update).eq('id', messageId);
  }
}
