import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_API_KEY');
const BASE_URL = Deno.env.get('BASE_URL');

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { product_type, product_id } = await req.json();

        if (!product_type || !product_id) {
            return Response.json({ error: 'Missing product_type or product_id' }, { status: 400 });
        }

        let product, amount, description;

        if (product_type === 'plan') {
            const plans = await base44.asServiceRole.entities.Plan.filter({ id: product_id });
            if (!plans || plans.length === 0) {
                return Response.json({ error: 'Plan not found' }, { status: 404 });
            }
            product = plans[0];
            amount = Math.round(product.price * 100); // Convert to cents
            description = `מסלול ${product.name}`;
        } else if (product_type === 'goal') {
            const goals = await base44.asServiceRole.entities.Goal.filter({ id: product_id });
            if (!goals || goals.length === 0) {
                return Response.json({ error: 'Goal not found' }, { status: 404 });
            }
            product = goals[0];
            amount = 9900; // Default 99 ILS for additional goals
            description = `מטרה נוספת - ${product.name}`;
        }

        // Create Payment record
        const payment = await base44.entities.Payment.create({
            user_id: user.id,
            product_type: product_type,
            product_id: product_id,
            product_name: product.name,
            amount: product_type === 'plan' ? product.price : 99,
            currency: 'ILS',
            payment_method: 'stripe',
            status: 'pending'
        });

        // Create Stripe Checkout Session
        const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'payment_method_types[]': 'card',
                'line_items[0][price_data][currency]': 'ils',
                'line_items[0][price_data][unit_amount]': amount.toString(),
                'line_items[0][price_data][product_data][name]': description,
                'line_items[0][quantity]': '1',
                'mode': 'payment',
                'success_url': `${BASE_URL}/CheckoutSuccess?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
                'cancel_url': `${BASE_URL}/Checkout?cancelled=true`,
                'customer_email': user.email,
                'metadata[user_id]': user.id,
                'metadata[product_type]': product_type,
                'metadata[product_id]': product_id,
                'metadata[payment_id]': payment.id
            })
        });

        const session = await stripeResponse.json();

        if (!session.id) {
            return Response.json({ error: 'Failed to create Stripe session' }, { status: 500 });
        }

        // Update payment with session ID
        await base44.entities.Payment.update(payment.id, {
            stripe_session_id: session.id
        });

        return Response.json({
            success: true,
            sessionId: session.id,
            url: session.url,
            paymentId: payment.id
        });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});