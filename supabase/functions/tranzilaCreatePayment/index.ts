// tranzilaCreatePayment — Creates payment record, returns params for frontend iframe

import { supabaseAdmin, getCustomer, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const BASE_URL = Deno.env.get('BASE_URL') || Deno.env.get('SUPABASE_URL') || 'https://fnsnnezhikgqajdbtwoa.supabase.co';

const VALID_PRODUCT_TYPES = new Set([
  'plan', 'goal', 'landing-page', 'cart', 'one-time',
  'logo', 'digital-card', 'sticker', 'presentation', 'quote'
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    // Auth + parse body in parallel
    const [customer, payload] = await Promise.all([
      getCustomer(req),
      req.json(),
    ]);
    if (!customer) return errorResponse('Unauthorized', 401, req);

    const { product_type, product_name, product_id, amount, currency, items, metadata } = payload;

    if (!product_type || !VALID_PRODUCT_TYPES.has(product_type)) {
      return errorResponse('Invalid product_type', 400, req);
    }
    if (typeof amount !== 'number' || amount <= 0 || amount > 100000) {
      return errorResponse('Invalid amount', 400, req);
    }

    const terminalName = Deno.env.get('TRANZILA_TERMINAL_NAME');
    const tranzilaPW = Deno.env.get('TRANZILA_TERMINAL_PASSWORD') || '';
    if (!terminalName) return errorResponse('Terminal not configured', 500, req);

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
      .select('id')
      .single();

    if (payErr) {
      console.error('insert error:', payErr.message);
      return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
    }

    const notifyUrl = `${BASE_URL}/functions/v1/tranzilaConfirmPayment`;

    return jsonResponse({
      success: true,
      supplier: terminalName,
      tranzilaPW,
      paymentId: payment.id,
      notifyUrl,
    });
  } catch (error) {
    console.error('tranzilaCreatePayment error:', (error as Error).message);
    return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
  }
});
