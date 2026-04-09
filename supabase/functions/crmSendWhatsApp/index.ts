// crmSendWhatsApp — Send WhatsApp message from CRM agent context
// Authenticated: requires logged-in user
// Stores message in whatsapp_messages + communications tables

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage, formatPhone } from '../_shared/whatsappHelper.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { lead_id, message, message_type } = await req.json();
    if (!lead_id || !message?.trim()) {
      return errorResponse('lead_id and message are required', 400, req);
    }

    // Fetch lead to get phone
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, phone, name, agent_id')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);
    if (!lead.phone) return errorResponse('Lead has no phone number', 400, req);

    // Send via Green API + store in whatsapp_messages
    const result = await sendAndStoreMessage(supabaseAdmin, {
      phone: lead.phone,
      message: message.trim(),
      lead_id,
      sender_type: 'agent',
      message_type: message_type || 'text',
    });

    // Also store in communications for existing timeline
    await supabaseAdmin.from('communications').insert({
      lead_id,
      channel: 'whatsapp',
      direction: 'outbound',
      content: message.trim(),
      source: 'sales_portal',
    });

    // Touch lead updated_at
    await supabaseAdmin.from('leads').update({
      updated_at: new Date().toISOString(),
    }).eq('id', lead_id);

    return jsonResponse({
      success: true,
      sent: result.success,
      message_id: result.stored_id,
    }, 200, req);

  } catch (error) {
    console.error('crmSendWhatsApp error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
