import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        // Tranzila sends POST with form data or query params
        const clonedReq = req.clone();
        
        let params;
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('application/x-www-form-urlencoded')) {
            const body = await req.text();
            params = new URLSearchParams(body);
        } else if (contentType.includes('application/json')) {
            const body = await req.json();
            params = new URLSearchParams(Object.entries(body).map(([k, v]) => [k, String(v)]));
        } else {
            // Try URL params
            const url = new URL(req.url);
            params = url.searchParams;
        }

        const responseCode = params.get('Response') || '';
        const confirmationCode = params.get('ConfirmationCode') || '';
        const index = params.get('index') || '';
        
        // Payment ID is now passed via o_cred_oid (since myid is used for TZ/ID number)
        const paymentId = params.get('o_cred_oid') || params.get('myid') || params.get('oid') || '';

        console.log('[TranzilaNotify] Received callback:', {
            Response: responseCode,
            ConfirmationCode: confirmationCode,
            paymentId,
            index
        });

        // Only process successful transactions
        if (responseCode !== '000') {
            console.log('[TranzilaNotify] Non-success response:', responseCode);
            return new Response('OK', { status: 200 });
        }

        if (!paymentId) {
            console.error('[TranzilaNotify] No payment ID found in callback');
            return new Response('OK', { status: 200 });
        }

        // Use createClientFromRequest for service role access (webhook - no user auth)
        const base44 = createClientFromRequest(clonedReq);

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
                    product_type: 'plan',
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
            const ppType = productType === 'landing-page' ? 'landing_page' : 
                           productType === 'one-time' ? 'service' : 
                           productType === 'goal' ? 'service' : productType;

            let publishedUrl = '';
            if (productType === 'landing-page' && productId) {
                try {
                    await base44.asServiceRole.entities.LandingPage.update(productId, {
                        status: 'published',
                        paid_at: new Date().toISOString(),
                        published_at: new Date().toISOString()
                    });
                    const lpArr = await base44.asServiceRole.entities.LandingPage.filter({ id: productId });
                    if (lpArr?.length > 0) {
                        const slug = lpArr[0].slug || productId;
                        publishedUrl = `/LP?slug=${slug}`;
                    }
                    console.log('[TranzilaNotify] Landing page published:', productId);
                } catch (e) {
                    console.error('[TranzilaNotify] Failed to publish landing page:', e);
                }
            }

            try {
                const ppData = {
                    user_id: userId,
                    product_type: ppType,
                    product_name: payment.product_name || 'שירות',
                    status: 'active',
                    payment_id: paymentId,
                    purchase_price: payment.amount || 0,
                    linked_entity_id: productId || '',
                    metadata: { original_type: productType }
                };
                if (publishedUrl) {
                    ppData.published_url = publishedUrl;
                }
                await base44.asServiceRole.entities.PurchasedProduct.create(ppData);
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