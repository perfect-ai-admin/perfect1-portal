import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

async function verifyStripeSignature(body, signature) {
    if (!STRIPE_WEBHOOK_SECRET) return false;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(STRIPE_WEBHOOK_SECRET);
    
    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const parts = signature.split(',').reduce((acc, part) => {
        const [k, v] = part.split('=');
        acc[k] = v;
        return acc;
    }, {});
    
    const timestamp = parts['t'];
    const signatureHash = parts['v1'];
    
    if (!timestamp || !signatureHash) return false;

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

            // Update payment status
            await base44.asServiceRole.entities.Payment.update(paymentId, {
                status: 'completed',
                stripe_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent,
                stripe_customer_id: session.customer,
                transaction_id: session.payment_intent,
                completed_at: new Date().toISOString()
            });

            // Call unified fulfillment logic
            try {
                const fulfillResult = await base44.asServiceRole.functions.invoke('fulfillPayment', {
                    payment_id: paymentId,
                    user_id: userId,
                    trigger_source: 'stripe_webhook'
                });
                console.log('[stripeWebhook] Fulfillment result:', fulfillResult?.data?.success);
            } catch (fulfillErr) {
                console.error('[stripeWebhook] Fulfillment error:', fulfillErr.message);
            }
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