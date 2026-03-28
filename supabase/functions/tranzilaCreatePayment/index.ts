// Migrated from Base44: tranzilaCreatePayment
// Creates a Tranzila payment iframe URL

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const BASE_URL = Deno.env.get('BASE_URL') || 'https://fnsnnezhikgqajdbtwoa.supabase.co';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const payload = await req.json();
    const { product_type, product_id, amount, currency, items } = payload;

    if (!product_type) return errorResponse('Missing product_type', 400);
    if (!amount || amount <= 0) return errorResponse('Invalid amount', 400);

    const terminalName = Deno.env.get('TRANZILA_TERMINAL_NAME');
    if (!terminalName) return errorResponse('TRANZILA_TERMINAL_NAME is not configured', 500);

    // Create payments record with status=pending
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .insert({
        customer_id: customer.id,
        product_type,
        product_id: product_id || (product_type === 'cart' ? 'cart_checkout' : null),
        amount,
        currency: currency || 'ILS',
        payment_method: 'tranzila',
        status: 'pending',
        metadata: product_type === 'cart' ? { items } : {}
      })
      .select()
      .single();

    if (payErr) return errorResponse(payErr.message);

    // Build Tranzila iframe URL
    // currency=1 means ILS in Tranzila
    const webhookUrl = `${BASE_URL}/functions/v1/tranzilaConfirmPayment`;
    const purchaseData = JSON.stringify({ payment_id: payment.id, customer_id: customer.id });

    const tranzilaUrl =
      `https://direct.tranzila.com/${terminalName}/iframe.php` +
      `?sum=${amount}` +
      `&currency=1` +
      `&cred_type=1` +
      `&tranmode=A` +
      `&nologo=1` +
      `&trButtonColor=3B82F6` +
      `&lang=il` +
      `&notify_url_address=${encodeURIComponent(webhookUrl)}` +
      `&json_purchase_data=${encodeURIComponent(purchaseData)}`;

    return jsonResponse({ success: true, iframeUrl: tranzilaUrl, paymentId: payment.id });
  } catch (error) {
    console.error('tranzilaCreatePayment error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
