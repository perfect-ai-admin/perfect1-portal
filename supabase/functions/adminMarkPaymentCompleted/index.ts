// Migrated from Base44: adminMarkPaymentCompleted
// Marks a payment as completed and creates PurchasedProduct records — admin only

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const customer = await getCustomer(req);
    if (!customer || customer.role !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    const { payment_id } = await req.json();
    if (!payment_id) {
      return errorResponse('Missing payment_id', 400);
    }

    // Fetch the payment
    const { data: payment, error: paymentErr } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();
    if (paymentErr || !payment) {
      return errorResponse('Payment not found', 404);
    }

    if (payment.status === 'completed') {
      return jsonResponse({ success: true, message: 'Already completed' });
    }

    // Mark as completed
    const { error: updateErr } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'completed',
        transaction_id: 'manual_admin_' + Date.now(),
        completed_at: new Date().toISOString()
      })
      .eq('id', payment_id);
    if (updateErr) throw new Error(updateErr.message);

    console.log('Admin marked payment completed:', payment_id, 'by:', customer.email);

    // Create PurchasedProduct records for the completed payment
    const customerId = payment.customer_id;
    const productType = payment.product_type;
    const productId = payment.product_id;

    if (productType === 'cart') {
      const items = payment.items || [];
      for (const item of items) {
        try {
          const purchasedData: Record<string, any> = {
            customer_id: customerId,
            product_type: item.type || 'other',
            product_name: item.title || 'מוצר',
            status: 'active',
            payment_id: payment_id,
            purchase_price: item.price || 0,
            preview_image: item.preview_image || item.data?.logoUrl || item.data?.preview_image || '',
            metadata: item.data || {}
          };
          if (item.type === 'landing_page' && item.data?.landingPageId) {
            purchasedData.linked_entity_id = item.data.landingPageId;
          }
          if (item.type === 'logo' || item.type === 'sticker') {
            const downloadUrl = item.data?.logoUrl || item.data?.stickerUrl || item.preview_image || '';
            if (downloadUrl) purchasedData.download_url = downloadUrl;
          }
          if (item.type === 'presentation' && item.data?.presentationUrl) {
            purchasedData.download_url = item.data.presentationUrl;
          }
          const { error: ppErr } = await supabaseAdmin.from('purchased_products').insert(purchasedData);
          if (ppErr) console.error('Failed to create PurchasedProduct:', ppErr.message);
        } catch (e) {
          console.error('Failed to create PurchasedProduct:', e);
        }
      }
    } else {
      try {
        const ppType = productType === 'landing-page' ? 'landing_page' :
                       productType === 'one-time' ? 'service' :
                       productType === 'plan' ? 'plan' :
                       productType === 'goal' ? 'goal' :
                       productType || 'service';

        const { error: ppErr } = await supabaseAdmin.from('purchased_products').insert({
          customer_id: customerId,
          product_type: ppType,
          product_name: payment.product_name || 'מוצר',
          status: 'active',
          payment_id: payment_id,
          purchase_price: payment.amount || 0,
          linked_entity_id: productId || '',
          metadata: { original_type: productType, admin_completed: true }
        });
        if (ppErr) console.error('Failed to create PurchasedProduct:', ppErr.message);
      } catch (e) {
        console.error('Failed to create PurchasedProduct:', e);
      }
    }

    return jsonResponse({ success: true });

  } catch (error) {
    console.error('adminMarkPaymentCompleted error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
