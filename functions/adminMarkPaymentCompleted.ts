import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { payment_id } = await req.json();

        if (!payment_id) {
            return Response.json({ error: 'Missing payment_id' }, { status: 400 });
        }

        const payments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
        if (!payments || payments.length === 0) {
            return Response.json({ error: 'Payment not found' }, { status: 404 });
        }

        const payment = payments[0];

        if (payment.status === 'completed') {
            return Response.json({ success: true, message: 'Already completed' });
        }

        await base44.asServiceRole.entities.Payment.update(payment_id, {
            status: 'completed',
            transaction_id: 'manual_admin_' + Date.now(),
            completed_at: new Date().toISOString()
        });

        console.log('Admin marked payment completed:', payment_id, 'by:', user.email);

        // === Create PurchasedProduct for the manually completed payment ===
        const userId = payment.user_id;
        const productType = payment.product_type;
        const productId = payment.product_id;

        if (productType === 'cart') {
            const items = payment.items || [];
            for (const item of items) {
                try {
                    const purchasedData = {
                        user_id: userId,
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
                    if ((item.type === 'logo' || item.type === 'sticker')) {
                        const downloadUrl = item.data?.logoUrl || item.data?.stickerUrl || item.preview_image || '';
                        if (downloadUrl) purchasedData.download_url = downloadUrl;
                    }
                    if (item.type === 'presentation' && item.data?.presentationUrl) {
                        purchasedData.download_url = item.data.presentationUrl;
                    }
                    await base44.asServiceRole.entities.PurchasedProduct.create(purchasedData);
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
                await base44.asServiceRole.entities.PurchasedProduct.create({
                    user_id: userId,
                    product_type: ppType,
                    product_name: payment.product_name || 'מוצר',
                    status: 'active',
                    payment_id: payment_id,
                    purchase_price: payment.amount || 0,
                    linked_entity_id: productId || '',
                    metadata: { original_type: productType, admin_completed: true }
                });
            } catch (e) {
                console.error('Failed to create PurchasedProduct:', e);
            }
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('adminMarkPaymentCompleted error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});