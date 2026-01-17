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

            // Handle plan assignment
            if (productType === 'plan') {
                await base44.asServiceRole.functions.invoke('assignPlanToUser', {
                    user_id: userId,
                    plan_id: productId
                });
            } else if (productType === 'goal') {
                // Handle goal purchase (if applicable)
                const user = await base44.asServiceRole.entities.User.filter({ id: userId });
                if (user.length > 0) {
                    // Increase goals_limit_override
                    const override = (user[0].goals_limit_override || user[0].goals_limit || 1) + 1;
                    await base44.asServiceRole.entities.User.update(userId, {
                        goals_limit_override: override
                    });
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