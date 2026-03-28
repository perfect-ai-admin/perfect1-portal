// Migrated from Base44: fulfillPayment
// Unified payment fulfillment — called after payment confirmed (Stripe/Tranzila)

import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { payment_id, trigger_source } = await req.json();
    if (!payment_id) return errorResponse('Missing payment_id', 400);

    // Get payment record
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (payErr || !payment) return errorResponse('Payment not found', 404);

    const { product_type, product_id, customer_id } = payment;
    console.log(`[fulfillPayment] type=${product_type}, source=${trigger_source}`);

    // Get customer
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customer_id)
      .single();

    // === FULFILLMENT BY PRODUCT TYPE ===
    if (product_type === 'plan' && product_id) {
      // Assign plan to customer
      await supabaseAdmin
        .from('customers')
        .update({ plan_id: product_id })
        .eq('id', customer_id);
      console.log('Plan assigned:', product_id);

    } else if (product_type === 'goal') {
      // Increase goal limit (not directly available, so we skip or handle differently)
      console.log('Goal purchased:', product_id);

    } else if (product_type === 'landing-page' && product_id) {
      // Publish landing page
      try {
        await supabaseAdmin
          .from('landing_pages')
          .update({ is_published: true, published_at: new Date().toISOString() })
          .eq('id', product_id);
        console.log('Landing page published:', product_id);
      } catch (e) {
        console.error('Failed to publish landing page:', e);
      }

    } else if (product_type === 'cart') {
      // Handle cart items
      const items = payment.metadata?.items || [];
      for (const item of items) {
        if (item.type === 'landing_page' && item.data?.landingPageId) {
          await supabaseAdmin
            .from('landing_pages')
            .update({ is_published: true, published_at: new Date().toISOString() })
            .eq('id', item.data.landingPageId);
        }
      }
    }

    // Log activity
    await supabaseAdmin.from('activity_log').insert({
      customer_id,
      action: 'payment_fulfilled',
      entity_type: 'payment',
      entity_id: payment_id,
      metadata: { product_type, product_id, amount: payment.amount, source: trigger_source }
    });

    // Send confirmation email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && customer?.email) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
          body: JSON.stringify({
            from: 'One-Pai <no-reply@one-pai.com>',
            to: [customer.email],
            subject: `תודה על הרכישה! - ${payment.product_name || product_type}`,
            html: `<div dir="rtl" style="font-family:Arial,sans-serif;"><h2>תודה על הרכישה!</h2><p>שלום ${customer.full_name || ''},</p><p>הרכישה שלך בוצעה בהצלחה.</p><p><strong>מוצר:</strong> ${payment.product_name || product_type}</p><p><strong>סכום:</strong> ${payment.amount} ${payment.currency}</p></div>`
          })
        });
      } catch (e) { console.error('Email failed:', e); }
    }

    return jsonResponse({ success: true, payment_id, product_type });
  } catch (error) {
    console.error('fulfillPayment error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
