// crmCreatePaymentLink — Generate Tranzila payment link for a CRM lead
// Creates payment record, sends link via WhatsApp, updates lead payment_status
// Authenticated: requires logged-in user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage, formatPhone } from '../_shared/whatsappHelper.ts';

const TRANZILA_TERMINAL = Deno.env.get('TRANZILA_TERMINAL_NAME');
const TRANZILA_PASSWORD = Deno.env.get('TRANZILA_TERMINAL_PASSWORd') || Deno.env.get('TRANZILA_TERMINAL_PASSWORD');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { lead_id, amount, product_type, product_name, send_via_whatsapp } = await req.json();

    if (!lead_id || !amount || !product_type) {
      return errorResponse('lead_id, amount, and product_type are required', 400, req);
    }

    if (amount <= 0 || amount > 100000) {
      return errorResponse('Amount must be between 1 and 100,000', 400, req);
    }

    // Fetch lead
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, phone, name, payment_status, payment_id')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);

    // Idempotency: if already paid, reject
    if (lead.payment_status === 'paid') {
      return errorResponse('Lead already has a completed payment', 400, req);
    }

    // If link already sent and payment pending, optionally resend
    let paymentId = lead.payment_id;
    let paymentLink: string;

    if (lead.payment_status === 'link_sent' && paymentId) {
      // Resend existing link
      console.log('Resending existing payment link for lead:', lead_id);
    } else {
      // Create new payment record
      const { data: payment, error: payErr } = await supabaseAdmin
        .from('payments')
        .insert({
          lead_id,
          product_type,
          product_name: product_name || product_type,
          amount,
          currency: 'ILS',
          payment_method: 'tranzila',
          status: 'pending',
          source: 'sales_portal',
          metadata: { created_from: 'crm', created_by: user.id },
        })
        .select('id')
        .single();

      if (payErr || !payment) {
        return errorResponse('Failed to create payment record', 500, req);
      }
      paymentId = payment.id;
    }

    // Build payment link
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const notifyUrl = `${supabaseUrl}/functions/v1/tranzilaConfirmPayment`;

    paymentLink = `https://direct.tranzila.com/${TRANZILA_TERMINAL}/iframeapitokeep.php?sum=${amount}&currency=1&cred_type=1&tranmode=A&TranzilaPW=${TRANZILA_PASSWORD}&o_cred_oid=${paymentId}&notify_url_address=${encodeURIComponent(notifyUrl)}&lang=il`;

    // Update lead payment_status
    await supabaseAdmin.from('leads').update({
      payment_status: 'link_sent',
      payment_id: paymentId,
      payment_link_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', lead_id);

    // Log status history
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: lead_id,
      new_status: 'payment_link_sent',
      change_reason: 'payment_link_created',
      source: 'sales_portal',
      metadata: { payment_id: paymentId, amount, product_type },
    });

    // Send via WhatsApp if requested
    if (send_via_whatsapp !== false && lead.phone) {
      const waMessage = `שלום ${lead.name || ''} 👋\n\nהנה הקישור לתשלום עבור ${product_name || product_type}:\n💳 סכום: ₪${amount}\n\n${paymentLink}\n\nלחצ/י על הקישור כדי להשלים את התשלום בצורה מאובטחת.\nלשאלות — אנחנו כאן! 🙂`;

      await sendAndStoreMessage(supabaseAdmin, {
        phone: lead.phone,
        message: waMessage,
        lead_id,
        sender_type: 'system',
        message_type: 'payment_link',
      });
    }

    return jsonResponse({
      success: true,
      payment_id: paymentId,
      payment_link: paymentLink,
    }, 200, req);

  } catch (error) {
    console.error('crmCreatePaymentLink error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
