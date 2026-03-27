import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Unified payment fulfillment logic.
 * Called by both tranzilaConfirmPayment and stripeWebhook after payment is confirmed.
 * 
 * Expects payload: { payment_id, user_id, trigger_source }
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { payment_id, user_id, trigger_source } = body;

        if (!payment_id || !user_id) {
            return Response.json({ error: 'Missing payment_id or user_id' }, { status: 400 });
        }

        // Get payment record
        const payments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
        if (!payments || payments.length === 0) {
            return Response.json({ error: 'Payment not found' }, { status: 404 });
        }
        const payment = payments[0];
        const productType = payment.product_type;
        const productId = payment.product_id;

        console.log(`[fulfillPayment] Starting fulfillment: payment=${payment_id}, type=${productType}, source=${trigger_source}`);

        // === AUTO INVOICE ===
        try {
            const invoiceResult = await base44.asServiceRole.functions.invoke('issueMorningInvoice', {
                payment_id: payment_id,
                trigger_source: trigger_source || 'fulfillPayment',
            });
            console.log('[fulfillPayment] Invoice result:', JSON.stringify(invoiceResult?.data || invoiceResult).substring(0, 200));
        } catch (invErr) {
            console.error('[fulfillPayment] Invoice issue failed (non-blocking):', invErr.message);
        }

        // Get user info
        const userArr = await base44.asServiceRole.entities.User.filter({ id: user_id });
        const userRecord = userArr.length > 0 ? userArr[0] : null;

        // === FULFILLMENT BY PRODUCT TYPE ===
        if (productType === 'plan' && productId) {
            try {
                await base44.asServiceRole.functions.invoke('assignPlanToUser', {
                    user_id: user_id,
                    plan_id: productId
                });
                console.log('Plan assigned:', productId);
            } catch (e) {
                console.error('Failed to assign plan:', e);
            }
            await createPurchasedProduct(base44, {
                user_id, product_type: 'plan',
                product_name: payment.product_name || 'מנוי',
                payment_id, purchase_price: payment.amount || 0,
                metadata: { plan_id: productId, type: 'subscription' }
            });

        } else if (productType === 'goal') {
            if (userRecord) {
                try {
                    const currentEffective = (userRecord.goals_limit_override !== null && userRecord.goals_limit_override !== undefined)
                        ? userRecord.goals_limit_override
                        : (userRecord.goals_limit || 1);
                    const newOverride = currentEffective + 1;
                    await base44.asServiceRole.entities.User.update(user_id, {
                        goals_limit_override: newOverride
                    });
                    console.log('Goal limit updated:', currentEffective, '->', newOverride);
                } catch (e) {
                    console.error('Failed to update goal limit:', e);
                }
            }
            await createPurchasedProduct(base44, {
                user_id, product_type: 'service',
                product_name: payment.product_name || 'מטרה עסקית',
                payment_id, purchase_price: payment.amount || 0,
                metadata: { goal_id: productId, type: 'goal' }
            });

        } else if (productType === 'landing-page' && productId) {
            const publishedUrl = await activateLandingPage(base44, productId);
            await createPurchasedProduct(base44, {
                user_id, product_type: 'landing_page',
                product_name: payment.product_name || 'דף נחיתה',
                payment_id, purchase_price: payment.amount || 0,
                linked_entity_id: productId,
                published_url: publishedUrl,
                metadata: { type: 'landing_page' }
            });

        } else if (productType === 'one-time' || productType === 'service') {
            await createPurchasedProduct(base44, {
                user_id, product_type: 'service',
                product_name: payment.product_name || 'שירות',
                payment_id, purchase_price: payment.amount || 0,
                metadata: { original_type: productType }
            });

        } else if (productType === 'cart') {
            await handleCartFulfillment(base44, payment, payment_id, user_id, userRecord);
        }

        // Log activity
        try {
            await base44.asServiceRole.entities.ActivityLog.create({
                user_id: user_id,
                activity_type: 'payment_made',
                description: `תשלום בוצע בהצלחה - ${payment.product_name || productType}`,
                details: {
                    payment_id,
                    product_type: productType,
                    product_id: productId,
                    amount: payment.amount,
                    source: trigger_source
                }
            });
        } catch (logErr) {
            console.error('Failed to log activity:', logErr);
        }

        return Response.json({ success: true, payment_id, product_type: productType });

    } catch (error) {
        console.error('fulfillPayment error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function activateLandingPage(base44, pageId) {
    let publishedUrl = '';
    try {
        await base44.asServiceRole.functions.invoke('publishLandingPage', {
            landingPageId: pageId, action: 'markPaid'
        });
        await base44.asServiceRole.functions.invoke('publishLandingPage', {
            landingPageId: pageId, action: 'publish'
        });
        const lpArr = await base44.asServiceRole.entities.LandingPage.filter({ id: pageId });
        if (lpArr?.length > 0) {
            const slug = lpArr[0].slug || pageId;
            publishedUrl = `/LP?slug=${slug}`;
        }
        console.log('Landing page published:', pageId);
    } catch (e) {
        console.error('Failed to publish landing page:', e);
    }
    return publishedUrl;
}

async function createPurchasedProduct(base44, data) {
    try {
        await base44.asServiceRole.entities.PurchasedProduct.create({
            status: 'active',
            ...data
        });
        console.log('PurchasedProduct created:', data.product_type, data.product_name);
    } catch (e) {
        console.error('Failed to create PurchasedProduct:', e);
    }
}

async function handleCartFulfillment(base44, payment, payment_id, user_id, userRecord) {
    const items = payment.items || [];
    const deliverableLinks = [];

    for (const item of items) {
        // Landing page fulfillment
        if (item.type === 'landing_page' && item.data?.landingPageId) {
            await activateLandingPage(base44, item.data.landingPageId);
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
                await base44.asServiceRole.entities.CartItem.update(item.id, { status: 'purchased' });
            } catch (e) {
                console.log('Failed to update cart item status', e);
            }
        }

        // Create PurchasedProduct per item
        const purchasedData = {
            user_id,
            product_type: item.type || 'other',
            product_name: item.title || 'מוצר',
            payment_id,
            purchase_price: item.price || 0,
            preview_image: item.preview_image || item.data?.logoUrl || item.data?.preview_image || '',
            metadata: item.data || {}
        };

        if (item.type === 'landing_page' && item.data?.landingPageId) {
            purchasedData.linked_entity_id = item.data.landingPageId;
            try {
                const pages = await base44.asServiceRole.entities.LandingPage.filter({ id: item.data.landingPageId });
                if (pages.length > 0 && pages[0].slug) {
                    purchasedData.published_url = `https://perfect-one.co.il/LP?slug=${pages[0].slug}`;
                }
            } catch (e) { /* ignore */ }
        }

        if ((item.type === 'logo' || item.type === 'sticker') && deliverableLinks.length > 0) {
            const link = deliverableLinks.find(d => d.type === item.type);
            if (link) purchasedData.download_url = link.url;
        }

        if (item.type === 'presentation' && item.data?.presentationUrl) {
            purchasedData.download_url = item.data.presentationUrl;
        }

        await createPurchasedProduct(base44, purchasedData);
    }

    // Save deliverables and send email
    if (deliverableLinks.length > 0) {
        await base44.asServiceRole.entities.Payment.update(payment_id, {
            deliverables: deliverableLinks
        });

        try {
            if (userRecord?.email) {
                const linksHtml = deliverableLinks.map(d =>
                    `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>${d.title}</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:left;"><a href="${d.url}" style="color:#2563eb;font-weight:bold;text-decoration:none;">הורד קובץ ⬇️</a></td></tr>`
                ).join('');

                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: userRecord.email,
                    subject: '🎉 הקבצים שלך מוכנים להורדה - Perfect One',
                    body: `
                        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                            <div style="background:linear-gradient(135deg,#1E3A5F,#2C5282);padding:30px;border-radius:16px 16px 0 0;text-align:center;">
                                <h1 style="color:white;margin:0;font-size:24px;">🎉 תודה על הרכישה!</h1>
                            </div>
                            <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
                                <p style="color:#374151;font-size:16px;line-height:1.6;">שלום ${userRecord.full_name || ''},</p>
                                <p style="color:#374151;font-size:16px;line-height:1.6;">הרכישה שלך בוצעה בהצלחה! הנה הקבצים שלך להורדה:</p>
                                <table style="width:100%;margin:20px 0;border-collapse:collapse;">
                                    ${linksHtml}
                                </table>
                                <p style="color:#6b7280;font-size:14px;">בהצלחה! 🚀</p>
                            </div>
                        </div>
                    `
                });
            }
        } catch (emailErr) {
            console.error('Failed to send deliverable email:', emailErr);
        }
    }
}