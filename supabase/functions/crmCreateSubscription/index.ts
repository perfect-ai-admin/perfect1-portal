// crmCreateSubscription — Create a recurring billing subscription for a CRM lead
// Creates subscription record, Tranzila recurring payment link, sends via WhatsApp
// Authenticated: requires logged-in CRM user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage } from '../_shared/whatsappHelper.ts';

const TRANZILA_TERMINAL = Deno.env.get('TRANZILA_TERMINAL_NAME');
const TRANZILA_PASSWORD = Deno.env.get('TRANZILA_TERMINAL_PASSWORD') || Deno.env.get('TRANZILA_TERMINAL_PASSWORd');

function getRecurStartDate(): string {
  const d = new Date();
  // Always the 15th of next month
  let y = d.getFullYear();
  let m = d.getMonth() + 2; // +2 because getMonth is 0-indexed and we want next month
  if (m > 12) { m = m - 12; y++; }
  return `${y}-${String(m).padStart(2, '0')}-15`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { lead_id, plan_name, monthly_price, product_name, send_via_whatsapp, recur_payments: reqRecurPayments } = await req.json();

    if (!lead_id || !plan_name || !monthly_price) {
      return errorResponse('lead_id, plan_name, and monthly_price are required', 400, req);
    }

    if (monthly_price <= 0 || monthly_price > 100000) {
      return errorResponse('monthly_price must be between 1 and 100,000', 400, req);
    }

    if (!TRANZILA_TERMINAL) {
      return errorResponse('Terminal not configured', 500, req);
    }

    // Fetch lead
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, phone, name')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);

    // Create subscription record
    const recurStartDate = getRecurStartDate();
    const numPayments = reqRecurPayments && Number(reqRecurPayments) > 0 ? Number(reqRecurPayments) : 998;
    const { data: sub, error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        lead_id,
        plan_name,
        monthly_price,
        status: 'pending_first_charge',
        start_date: new Date().toISOString().slice(0, 10),
        next_charge_date: recurStartDate,
        recur_payments: numPayments,
        source: 'crm',
        created_by: user.id,
      })
      .select('id')
      .single();

    if (subErr || !sub) {
      console.error('Failed to create subscription:', subErr);
      return errorResponse('Failed to create subscription', 500, req);
    }

    // Create initial payment record linked to subscription
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .insert({
        lead_id,
        subscription_id: sub.id,
        product_type: 'subscription',
        product_name: product_name || plan_name,
        amount: monthly_price,
        currency: 'ILS',
        payment_method: 'tranzila',
        status: 'pending',
        source: 'sales_portal',
        metadata: { subscription_id: sub.id, plan_name, created_by: user.id },
      })
      .select('id')
      .single();

    if (payErr || !payment) {
      console.error('Failed to create payment:', payErr);
      return errorResponse('Failed to create payment record', 500, req);
    }

    // Tranzila handshake
    const handshakeUrl = `https://api.tranzila.com/v1/handshake/create?supplier=${encodeURIComponent(TRANZILA_TERMINAL)}&sum=${monthly_price}&TranzilaPW=${encodeURIComponent(TRANZILA_PASSWORD || '')}`;
    const handshakeRes = await fetch(handshakeUrl);
    const handshakeText = await handshakeRes.text();
    const thtkMatch = handshakeText.match(/thtk=(.+)/);

    if (!handshakeRes.ok || !thtkMatch?.[1]) {
      console.error('[crmCreateSubscription] Handshake failed:', handshakeRes.status, handshakeText);
      return errorResponse('Payment gateway handshake failed', 502, req);
    }

    const thtk = thtkMatch[1].trim();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const notifyUrl = `${supabaseUrl}/functions/v1/tranzilaConfirmPayment`;

    // Build recurring payment iframe URL
    const linkParams = new URLSearchParams({
      supplier: TRANZILA_TERMINAL,
      sum: String(monthly_price),
      currency: '1',
      cred_type: '1',
      tranmode: 'A',
      new_process: '1',
      thtk,
      o_cred_oid: sub.id,  // subscription_id as order ref
      notify_url_address: notifyUrl,
      // Recurring params
      recur_sum: String(monthly_price),
      recur_payments: String(numPayments),
      recur_transaction: '4_approved',
      recur_start_date: recurStartDate,
      // Display
      lang: 'il',
      nologo: '1',
      trBgColor: 'FFFFFF',
      trTextColor: '1E3A5F',
      trButtonColor: '27AE60',
      buttonLabel: 'לתשלום',
      pdesc: product_name || plan_name,
    });

    const paymentLink = `https://direct.tranzila.com/${TRANZILA_TERMINAL}/newiframe.php?${linkParams.toString()}`;

    // Update lead payment_status
    await supabaseAdmin.from('leads').update({
      payment_status: 'link_sent',
      payment_id: payment.id,
      payment_link_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', lead_id);

    // Send via WhatsApp if requested
    if (send_via_whatsapp !== false && lead.phone) {
      const waMessage = `שלום ${lead.name || ''} 👋\n\nהנה הקישור לתשלום עבור ${product_name || plan_name}:\n💳 סכום חודשי: ₪${monthly_price}\n\n${paymentLink}\n\nלחצ/י על הקישור כדי להשלים את התשלום בצורה מאובטחת.\nהחיוב החוזר יתבצע ב-15 לכל חודש.\nלשאלות — אנחנו כאן! 🙂`;

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
      subscription_id: sub.id,
      payment_id: payment.id,
      payment_link: paymentLink,
    }, 200, req);

  } catch (error) {
    console.error('crmCreateSubscription error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
