import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

async function verifyStripeSignature(body, signature) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(STRIPE_WEBHOOK_SECRET);
    
    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const [timestamp, signatureHash] = signature.split(',')[0].split('=')[1] && signature.split(',').map(part => {
        const [key, value] = part.split('=');
        return value;
    });

    const signedContent = `${timestamp}.${body}`;
    const signedData = encoder.encode(signedContent);

    const sig = new Uint8Array(
        signatureHash.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );

    const isValid = await crypto.subtle.verify('HMAC', key, sig, signedData);
    return isValid;
}

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            return Response.json({ error: 'Missing signature' }, { status: 400 });
        }

        const body = await req.text();
        
        // Verify signature
        const isValid = await verifyStripeSignature(body, signature);
        if (!isValid) {
            return Response.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const base44 = createClientFromRequest(req);
        const event = JSON.parse(body);

        console.log('Stripe webhook event:', event.type);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const paymentId = session.metadata.payment_id;
            const userId = session.metadata.user_id;
            const productType = session.metadata.product_type;
            const productId = session.metadata.product_id;

            // Update payment
            await base44.asServiceRole.entities.Payment.update(paymentId, {
                status: 'completed',
                stripe_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent,
                stripe_customer_id: session.customer,
                transaction_id: session.payment_intent,
                completed_at: new Date().toISOString()
            });

            // Helper to activate landing page
            const activateLandingPage = async (pageId) => {
                try {
                    await base44.asServiceRole.functions.invoke('publishLandingPage', {
                        landingPageId: pageId,
                        action: 'markPaid'
                    });
                    // Also attempt to publish
                    await base44.asServiceRole.functions.invoke('publishLandingPage', {
                        landingPageId: pageId,
                        action: 'publish'
                    });
                } catch (err) {
                    console.error('Failed to activate landing page:', err);
                }
            };

            // Handle fulfillment
            if (productType === 'plan') {
                await base44.asServiceRole.functions.invoke('assignPlanToUser', {
                    user_id: userId,
                    plan_id: productId
                });
            } else if (productType === 'goal') {
                const user = await base44.asServiceRole.entities.User.filter({ id: userId });
                if (user.length > 0) {
                    const override = (user[0].goals_limit_override || user[0].goals_limit || 1) + 1;
                    await base44.asServiceRole.entities.User.update(userId, {
                        goals_limit_override: override
                    });
                }
            } else if (productType === 'landing-page') {
                await activateLandingPage(productId);
            } else if (productType === 'cart') {
                // Fetch payment to get items
                const payment = await base44.asServiceRole.entities.Payment.get(paymentId);
                const items = payment.items || [];
                
                const deliverableLinks = [];
                
                for (const item of items) {
                    if (item.type === 'landing_page' && item.data?.landingPageId) {
                        await activateLandingPage(item.data.landingPageId);
                    }
                    
                    // Collect original image URLs for logos and stickers
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
                }
                
                // Save deliverable links on payment record so CheckoutSuccess can show them
                if (deliverableLinks.length > 0) {
                    await base44.asServiceRole.entities.Payment.update(paymentId, {
                        deliverables: deliverableLinks
                    });
                    
                    // Send email with download links
                    try {
                        const user = await base44.asServiceRole.entities.User.get(userId);
                        if (user?.email) {
                            const linksHtml = deliverableLinks.map(d => 
                                `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>${d.title}</strong></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:left;"><a href="${d.url}" style="color:#2563eb;font-weight:bold;text-decoration:none;">הורד קובץ ⬇️</a></td></tr>`
                            ).join('');
                            
                            await base44.asServiceRole.integrations.Core.SendEmail({
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
                                            <p style="color:#6b7280;font-size:14px;margin-top:20px;">הקבצים שלך באיכות מלאה, ללא סימן מים.</p>
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

            // Log activity
            await base44.asServiceRole.entities.ActivityLog.create({
                user_id: userId,
                activity_type: 'payment_made',
                description: `תשלום בוצע בהצלחה עבור ${productType === 'plan' ? 'מסלול' : 'מטרה'}`,
                details: {
                    payment_id: paymentId,
                    product_type: productType,
                    product_id: productId
                }
            });
        }

        if (event.type === 'charge.failed') {
            const charge = event.data.object;
            const paymentId = charge.metadata?.payment_id;

            if (paymentId) {
                await base44.asServiceRole.entities.Payment.update(paymentId, {
                    status: 'failed',
                    failed_at: new Date().toISOString(),
                    failure_reason: charge.failure_message
                });
            }
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});