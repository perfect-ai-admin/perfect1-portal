import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        // Tranzila sends POST with form data or query params
        // Clone the request so we can read the body AND pass it to createClientFromRequest
        const clonedReq = req.clone();
        
        let params;
...
        // Use createClientFromRequest for service role access (webhook - no user auth)
        const base44 = createClientFromRequest(clonedReq);
        // Note: all entity ops below use asServiceRole since this is a server-to-server callback

        const payments = await base44.asServiceRole.entities.Payment.filter({ id: paymentId });
        if (!payments || payments.length === 0) {
            console.error('[TranzilaNotify] Payment not found:', paymentId);
            return new Response('OK', { status: 200 });
        }

        const payment = payments[0];

        if (payment.status === 'completed') {
            console.log('[TranzilaNotify] Payment already completed:', paymentId);
            return new Response('OK', { status: 200 });
        }

        // Update payment to completed
        await base44.asServiceRole.entities.Payment.update(paymentId, {
            status: 'completed',
            transaction_id: confirmationCode || index || '',
            completed_at: new Date().toISOString()
        });

        console.log('[TranzilaNotify] Payment marked completed:', paymentId);

        // === FULFILLMENT: Create PurchasedProduct records ===
        const userId = payment.user_id;
        const productType = payment.product_type;
        const productId = payment.product_id;

        // Handle plan assignment
        if (productType === 'plan' && productId) {
            try {
                await base44.asServiceRole.entities.PurchasedProduct.create({
                    user_id: userId,
                    product_type: 'service',
                    product_name: payment.product_name || 'מנוי',
                    status: 'active',
                    payment_id: paymentId,
                    purchase_price: payment.amount || 0,
                    metadata: { plan_id: productId, type: 'subscription' }
                });
                console.log('[TranzilaNotify] PurchasedProduct created for plan:', productId);
            } catch (e) {
                console.error('[TranzilaNotify] Failed to create PurchasedProduct for plan:', e);
            }
        }

        // Handle single product purchase (goal, landing-page, service, one-time)
        if (productType === 'goal' || productType === 'landing-page' || productType === 'service' || productType === 'one-time') {
            try {
                const ppType = productType === 'landing-page' ? 'landing_page' : 
                               productType === 'one-time' ? 'service' : 
                               productType === 'goal' ? 'service' : productType;
                await base44.asServiceRole.entities.PurchasedProduct.create({
                    user_id: userId,
                    product_type: ppType,
                    product_name: payment.product_name || 'שירות',
                    status: 'active',
                    payment_id: paymentId,
                    purchase_price: payment.amount || 0,
                    linked_entity_id: productId || '',
                    metadata: { original_type: productType }
                });
                console.log('[TranzilaNotify] PurchasedProduct created for:', productType);
            } catch (e) {
                console.error('[TranzilaNotify] Failed to create PurchasedProduct:', e);
            }
        }

        // Handle cart items
        if (productType === 'cart') {
            const items = payment.items || [];
            for (const item of items) {
                try {
                    const purchasedData = {
                        user_id: userId,
                        product_type: item.type || 'other',
                        product_name: item.title || 'מוצר',
                        status: 'active',
                        payment_id: paymentId,
                        purchase_price: item.price || 0,
                        preview_image: item.preview_image || item.data?.logoUrl || item.data?.preview_image || '',
                        metadata: item.data || {}
                    };

                    if (item.type === 'landing_page' && item.data?.landingPageId) {
                        purchasedData.linked_entity_id = item.data.landingPageId;
                    }
                    if ((item.type === 'logo' || item.type === 'sticker')) {
                        const downloadUrl = item.data?.logoUrl || item.data?.stickerUrl || item.preview_image || item.data?.preview_image;
                        if (downloadUrl) purchasedData.download_url = downloadUrl;
                    }
                    if (item.type === 'presentation' && item.data?.presentationUrl) {
                        purchasedData.download_url = item.data.presentationUrl;
                    }

                    await base44.asServiceRole.entities.PurchasedProduct.create(purchasedData);
                    console.log('[TranzilaNotify] PurchasedProduct created for cart item:', item.title);
                } catch (ppErr) {
                    console.error('[TranzilaNotify] Failed to create PurchasedProduct:', ppErr);
                }
            }
        }

        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('[TranzilaNotify] Error:', error.message);
        return new Response('OK', { status: 200 });
    }
});