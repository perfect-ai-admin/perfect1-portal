// tranzilaCreatePayment — Creates payment record + Tranzila handshake (thtk token)

import { supabaseAdmin, getCustomer, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const BASE_URL = Deno.env.get('BASE_URL') || Deno.env.get('SUPABASE_URL') || 'https://fnsnnezhikgqajdbtwoa.supabase.co';

// סוגי מוצרים תקינים בלבד
const VALID_PRODUCT_TYPES = [
  'plan',
  'goal',
  'landing-page',
  'cart',
  'one-time',
  'logo',
  'digital-card',
  'sticker',
  'presentation',
  'quote'
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401, req);

    const payload = await req.json();
    const { product_type, product_name, product_id, amount, currency, items, metadata } = payload;

    if (!product_type) return errorResponse('Missing product_type', 400, req);

    // תיקון 4: validation על product_type ו-amount
    if (!VALID_PRODUCT_TYPES.includes(product_type)) {
      return errorResponse('Invalid product_type', 400, req);
    }

    if (typeof amount !== 'number' || amount <= 0 || amount > 100000) {
      return errorResponse('Invalid amount', 400, req);
    }

    const terminalName = Deno.env.get('TRANZILA_TERMINAL_NAME');
    if (!terminalName) return errorResponse('TRANZILA_TERMINAL_NAME is not configured', 500, req);

    // Create payments record with status=pending
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .insert({
        customer_id: customer.id,
        product_type,
        product_name: product_name || product_type,
        product_id: product_id || (product_type === 'cart' ? 'cart_checkout' : null),
        amount,
        currency: currency || 'ILS',
        payment_method: 'tranzila',
        status: 'pending',
        metadata: product_type === 'cart' ? { items } : (metadata || {})
      })
      .select()
      .single();

    if (payErr) {
      console.error('tranzilaCreatePayment insert error:', payErr.message);
      return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
    }

    // Build notify URL for server-to-server callback
    const notifyUrl = `${BASE_URL}/functions/v1/tranzilaConfirmPayment`;

    // === Tranzila Handshake: get thtk token ===
    const handshakeParams = new URLSearchParams({
      supplier: terminalName,
      sum: String(amount),
      currency: '1', // ILS
      cred_type: '1',
      tranmode: 'A',
      // Pass payment_id in the handshake so Tranzila returns it in notify
      o_cred_oid: payment.id,
      notify_url_address: notifyUrl,
    });

    const handshakeResponse = await fetch(
      `https://direct.tranzila.com/${terminalName}/newiframe.php`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: handshakeParams.toString(),
      }
    );

    const handshakeText = await handshakeResponse.text();

    // Parse thtk from response — Tranzila returns key=value pairs or JSON
    let thtk = '';

    // Try JSON first
    try {
      const handshakeJson = JSON.parse(handshakeText);
      thtk = handshakeJson.thtk || handshakeJson.TranzilaTK || '';
    } catch (_) {
      // Try URL-encoded / key=value format
      if (handshakeText.includes('thtk=')) {
        const params = new URLSearchParams(handshakeText);
        thtk = params.get('thtk') || '';
      } else if (handshakeText.includes('TranzilaTK=')) {
        const params = new URLSearchParams(handshakeText);
        thtk = params.get('TranzilaTK') || '';
      } else {
        // Some Tranzila terminals return just the token
        const trimmed = handshakeText.trim();
        if (trimmed.length > 10 && trimmed.length < 200 && !trimmed.includes('<') && !trimmed.includes('error')) {
          thtk = trimmed;
        }
      }
    }

    if (!thtk) {
      console.error('Tranzila handshake failed. Response:', handshakeText);
      // Clean up the pending payment
      await supabaseAdmin.from('payments').update({ status: 'failed', failure_reason: 'Handshake failed' }).eq('id', payment.id);
      return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
    }

    console.log(`Payment ${payment.id} created, thtk obtained for terminal ${terminalName}`);

    return jsonResponse({
      success: true,
      thtk,
      supplier: terminalName,
      paymentId: payment.id,
      notifyUrl,
    });
  } catch (error) {
    console.error('tranzilaCreatePayment error:', (error as Error).message);
    return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
  }
});
