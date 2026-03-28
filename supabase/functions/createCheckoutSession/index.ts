// Migrated from Base44: createCheckoutSession

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_API_KEY');
const BASE_URL = Deno.env.get('BASE_URL') || 'https://fnsnnezhikgqajdbtwoa.supabase.co';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const payload = await req.json();
    const { product_type, product_id, items } = payload;

    if (!product_type) return errorResponse('Missing product_type', 400);

    let product: any, amount: number, description: string, paymentAmount: number;
    let lineItems: [string, string][] = [];

    if (product_type === 'cart') {
      if (!items || items.length === 0) return errorResponse('Cart is empty', 400);

      items.forEach((item: any, index: number) => {
        lineItems.push([`line_items[${index}][price_data][currency]`, 'ils']);
        lineItems.push([`line_items[${index}][price_data][unit_amount]`, Math.round((item.price || 39) * 100).toString()]);
        lineItems.push([`line_items[${index}][price_data][product_data][name]`, item.title || 'מוצר']);
        lineItems.push([`line_items[${index}][quantity]`, '1']);
      });

      paymentAmount = items.reduce((sum: number, item: any) => sum + (item.price || 39), 0);
      product = { name: 'עגלת קניות' };
    } else {
      if (product_type === 'plan') {
        const { data: plans } = await supabaseAdmin.from('plans').select('*').eq('id', product_id);
        if (!plans?.length) return errorResponse('Plan not found', 404);
        product = plans[0];
        amount = Math.round(product.price * 100);
        description = `מסלול ${product.name}`;
      } else if (product_type === 'goal') {
        const { data: goals } = await supabaseAdmin.from('goals').select('*').eq('id', product_id);
        if (!goals?.length) return errorResponse('Goal not found', 404);
        product = goals[0];
        amount = 9900;
        description = `מטרה נוספת - ${product.name_he || product.name}`;
      } else if (product_type === 'landing-page') {
        const { data: pages } = await supabaseAdmin.from('landing_pages').select('*').eq('id', product_id);
        if (!pages?.length) return errorResponse('Landing page not found', 404);
        product = pages[0];
        amount = 29900;
        description = `דף נחיתה - ${product.title}`;
      } else {
        return errorResponse('Invalid product_type', 400);
      }

      lineItems.push(['line_items[0][price_data][currency]', 'ils']);
      lineItems.push(['line_items[0][price_data][unit_amount]', amount!.toString()]);
      lineItems.push(['line_items[0][price_data][product_data][name]', description!]);
      lineItems.push(['line_items[0][quantity]', '1']);
      paymentAmount = amount! / 100;
    }

    // Create Payment record
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .insert({
        customer_id: customer.id,
        product_type,
        product_id: product_id || 'cart_checkout',
        product_name: product.name || product.title,
        amount: paymentAmount!,
        currency: 'ILS',
        payment_method: 'stripe',
        status: 'pending',
        metadata: product_type === 'cart' ? { items } : {}
      })
      .select()
      .single();

    if (payErr) return errorResponse(payErr.message);

    // Create Stripe Checkout Session
    const stripeBody = new URLSearchParams({
      'mode': 'payment',
      'success_url': `${BASE_URL}/CheckoutSuccess?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
      'cancel_url': `${BASE_URL}/Checkout?cancelled=true`,
      'customer_email': customer.email!,
      'metadata[customer_id]': customer.id,
      'metadata[product_type]': product_type,
      'metadata[product_id]': product_id || '',
      'metadata[payment_id]': payment.id
    });

    lineItems.forEach(([key, value]) => stripeBody.append(key, value));

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: stripeBody
    });

    const session = await stripeResponse.json();
    if (!session.id) return errorResponse('Failed to create Stripe session');

    // Update payment with Stripe session ID
    await supabaseAdmin
      .from('payments')
      .update({ metadata: { ...payment.metadata, stripe_session_id: session.id } })
      .eq('id', payment.id);

    return jsonResponse({ success: true, sessionId: session.id, url: session.url, paymentId: payment.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return errorResponse((error as Error).message);
  }
});
