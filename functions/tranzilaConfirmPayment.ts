import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { payment_id, transaction_id } = body;

        if (!payment_id) {
            return Response.json({ error: 'Missing payment_id' }, { status: 400 });
        }

        // Get payment record using service role (RLS may block user from reading)
        const payments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
        if (!payments || payments.length === 0) {
            return Response.json({ error: 'Payment not found' }, { status: 404 });
        }

        const payment = payments[0];

        // Verify the payment belongs to this user
        if (payment.user_id !== user.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Already completed
        if (payment.status === 'completed') {
            return Response.json({ success: true, already_completed: true });
        }

        // Update payment to completed
        await base44.asServiceRole.entities.Payment.update(payment_id, {
            status: 'completed',
            transaction_id: transaction_id || '',
            completed_at: new Date().toISOString()
        });

        console.log('Payment confirmed:', payment_id, 'product_type:', payment.product_type);

        // Handle fulfillment based on product type
        const productType = payment.product_type;
        const productId = payment.product_id;

        // === Create PurchasedProduct for ALL payment types ===
        if (productType === 'plan' && productId) {
            try {
                await base44.functions.invoke('assignPlanToUser', {
                    user_id: user.id,
                    plan_id: productId
                });
                console.log('Plan assigned:', productId);
            } catch (e) {
                console.error('Failed to assign plan:', e);
            }
            // Create PurchasedProduct for plan/subscription
            try {
                await base44.asServiceRole.entities.PurchasedProduct.create({
                    user_id: user.id,
                    product_type: 'service',
                    product_name: payment.product_name || 'מנוי',
                    status: 'active',
                    payment_id: payment_id,
                    purchase_price: payment.amount || 0,
                    metadata: { plan_id: productId, type: 'subscription' }
                });
            } catch (e) {
                console.error('Failed to create PurchasedProduct for plan:', e);
            }
        } else if (productType === 'goal') {
            // Increase goal limit
            try {
                const userArr = await base44.entities.User.filter({ id: user.id });
                if (userArr.length > 0) {
                    const u = userArr[0];
                    const currentEffective = (u.goals_limit_override !== null && u.goals_limit_override !== undefined)
                        ? u.goals_limit_override
                        : (u.goals_limit || 1);
                    const newOverride = currentEffective + 1;
                    await base44.entities.User.update(user.id, {
                        goals_limit_override: newOverride
                    });
                    console.log('Goal limit updated:', currentEffective, '->', newOverride);
                }
            } catch (e) {
                console.error('Failed to update goal limit:', e);
            }
            // Create PurchasedProduct for goal
            try {
                await base44.asServiceRole.entities.PurchasedProduct.create({
                    user_id: user.id,
                    product_type: 'service',
                    product_name: payment.product_name || 'מטרה עסקית',
                    status: 'active',
                    payment_id: payment_id,
                    purchase_price: payment.amount || 0,
                    metadata: { goal_id: productId, type: 'goal' }
                });
            } catch (e) {
                console.error('Failed to create PurchasedProduct for goal:', e);
            }
        } else if (productType === 'landing-page' && productId) {
            try {
                await base44.functions.invoke('publishLandingPage', {
                    landingPageId: productId,
                    action: 'markPaid'
                });
                await base44.functions.invoke('publishLandingPage', {
                    landingPageId: productId,
                    action: 'publish'
                });
                console.log('Landing page published:', productId);
            } catch (e) {
                console.error('Failed to publish landing page:', e);
            }
            // Create PurchasedProduct for landing page
            try {
                await base44.asServiceRole.entities.PurchasedProduct.create({
                    user_id: user.id,
                    product_type: 'landing_page',
                    product_name: payment.product_name || 'דף נחיתה',
                    status: 'active',
                    payment_id: payment_id,
                    purchase_price: payment.amount || 0,
                    linked_entity_id: productId,
                    metadata: { type: 'landing_page' }
                });
            } catch (e) {
                console.error('Failed to create PurchasedProduct for landing page:', e);
            }
        } else if (productType === 'one-time' || productType === 'service') {
            // Create PurchasedProduct for one-time/service purchases
            try {
                await base44.asServiceRole.entities.PurchasedProduct.create({
                    user_id: user.id,
                    product_type: 'service',
                    product_name: payment.product_name || 'שירות',
                    status: 'active',
                    payment_id: payment_id,
                    purchase_price: payment.amount || 0,
                    metadata: { original_type: productType }
                });
            } catch (e) {
                console.error('Failed to create PurchasedProduct for service:', e);
            }
        }
        
        if (productType === 'cart') {
            // Handle cart items
            const items = payment.items || [];
            const deliverableLinks = [];

            for (const item of items) {
                // Landing page fulfillment
                if (item.type === 'landing_page' && item.data?.landingPageId) {
                    try {
                        await base44.functions.invoke('publishLandingPage', {
                            landingPageId: item.data.landingPageId,
                            action: 'markPaid'
                        });
                        await base44.functions.invoke('publishLandingPage', {
                            landingPageId: item.data.landingPageId,
                            action: 'publish'
                        });
                    } catch (e) {
                        console.error('Failed to publish LP:', e);
                    }
                }

                // Collect deliverables for logos/stickers
                if (item.type === 'logo' || item.type === 'sticker') {
                    const originalUrl = item.data?.logoUrl || item.data?.stickerUrl || item.preview_image || item.data?.preview_image;
                    if (originalUrl) {
                        deliverableLinks.push({
                            title: item.title || (item.type === 'logo' ? 'לוגו' : 'סטיקר'),
                            url: originalUrl,
                            type: item.type
                        });
                    }
                }

                // Mark cart item as purchased
                if (item.id) {
                    try {
                        await base44.entities.CartItem.update(item.id, { status: 'purchased' });
                    } catch (e) {
                        console.log('Failed to update cart item status', e);
                    }
                }

                // Create PurchasedProduct
                try {
                    const purchasedData = {
                        user_id: user.id,
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
                    if ((item.type === 'logo' || item.type === 'sticker') && deliverableLinks.length > 0) {
                        const link = deliverableLinks.find(d => d.type === item.type);
                        if (link) purchasedData.download_url = link.url;
                    }
                    if (item.type === 'presentation' && item.data?.presentationUrl) {
                        purchasedData.download_url = item.data.presentationUrl;
                    }

                    await base44.asServiceRole.entities.PurchasedProduct.create(purchasedData);
                    console.log('PurchasedProduct created for cart item:', item.title);
                } catch (ppErr) {
                    console.error('Failed to create PurchasedProduct:', ppErr);
                }
            }

            // Save deliverables on payment
            if (deliverableLinks.length > 0) {
                await base44.asServiceRole.entities.Payment.update(payment_id, {
                    deliverables: deliverableLinks
                });

                // Send email with download links
                try {
                    const linksHtml = deliverableLinks.map(d =>
                        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>${d.title}</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:left;"><a href="${d.url}" style="color:#2563eb;font-weight:bold;text-decoration:none;">הורד קובץ ⬇️</a></td></tr>`
                    ).join('');

                    await base44.integrations.Core.SendEmail({
                        to: user.email,
                        subject: '🎉 הקבצים שלך מוכנים להורדה - Perfect One',
                        body: `
                            <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                                <div style="background:linear-gradient(135deg,#1E3A5F,#2C5282);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
                                    <h1 style="color:white;margin:0;font-size:24px;">🎉 תודה על הרכישה!</h1>
                                </div>
                                <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
                                    <p style="color:#374151;font-size:16px;line-height:1.6;">שלום ${user.full_name || ''},</p>
                                    <p style="color:#374151;font-size:16px;line-height:1.6;">הרכישה שלך בוצעה בהצלחה! הנה הקבצים שלך להורדה:</p>
                                    <table style="width:100%;margin:20px 0;border-collapse:collapse;">
                                        ${linksHtml}
                                    </table>
                                    <p style="color:#6b7280;font-size:14px;">בהצלחה! 🚀</p>
                                </div>
                            </div>
                        `
                    });
                } catch (emailErr) {
                    console.error('Failed to send email:', emailErr);
                }
            }
        }

        // Log activity
        try {
            await base44.entities.ActivityLog.create({
                user_id: user.id,
                activity_type: 'payment_made',
                description: `תשלום בוצע בהצלחה - ${payment.product_name || productType}`,
                details: {
                    payment_id,
                    product_type: productType,
                    product_id: productId,
                    amount: payment.amount
                }
            });
        } catch (logErr) {
            console.error('Failed to log activity:', logErr);
        }

        return Response.json({ 
            success: true, 
            payment_id,
            product_type: productType
        });
    } catch (error) {
        console.error('tranzilaConfirmPayment error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});