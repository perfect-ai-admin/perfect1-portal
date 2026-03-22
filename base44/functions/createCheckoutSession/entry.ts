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

        const payload = await req.json();
        const { product_type, product_id, items } = payload;

        if (!product_type) {
            return Response.json({ error: 'Missing product_type' }, { status: 400 });
        }

        let product, amount, description, paymentAmount;
        let lineItems = [];

        if (product_type === 'cart') {
            if (!items || items.length === 0) {
                return Response.json({ error: 'Cart is empty' }, { status: 400 });
            }
            
            // Build line items for cart
            items.forEach((item, index) => {
                lineItems.push([`line_items[${index}][price_data][currency]`, 'ils']);
                lineItems.push([`line_items[${index}][price_data][unit_amount]`, Math.round((item.price || 39) * 100).toString()]);
                lineItems.push([`line_items[${index}][price_data][product_data][name]`, item.title || 'מוצר']);
                lineItems.push([`line_items[${index}][quantity]`, '1']);
            });

            paymentAmount = items.reduce((sum, item) => sum + (item.price || 39), 0);
            product = { name: 'עגלת קניות' }; // Generic name for payment record
            
        } else {
            // Single product logic
            if (product_type === 'plan') {
                const plans = await base44.asServiceRole.entities.Plan.filter({ id: product_id });
                if (!plans || plans.length === 0) return Response.json({ error: 'Plan not found' }, { status: 404 });
                product = plans[0];
                amount = Math.round(product.price * 100);
                description = `מסלול ${product.name}`;
            } else if (product_type === 'goal') {
                const goals = await base44.asServiceRole.entities.Goal.filter({ id: product_id });
                if (!goals || goals.length === 0) return Response.json({ error: 'Goal not found' }, { status: 404 });
                product = goals[0];
                amount = 9900;
                description = `מטרה נוספת - ${product.name}`;
            } else if (product_type === 'landing-page') {
                const pages = await base44.asServiceRole.entities.LandingPage.filter({ id: product_id });
                if (!pages || pages.length === 0) return Response.json({ error: 'Landing page not found' }, { status: 404 });
                product = pages[0];
                amount = 29900;
                description = `דף נחיתה - ${product.business_name}`;
            }

            lineItems.push(['line_items[0][price_data][currency]', 'ils']);
            lineItems.push(['line_items[0][price_data][unit_amount]', amount.toString()]);
            lineItems.push(['line_items[0][price_data][product_data][name]', description]);
            lineItems.push(['line_items[0][quantity]', '1']);
            
            paymentAmount = amount / 100;
        }

        // Create Payment record
        const paymentData = {
            user_id: user.id,
            product_type: product_type,
            product_id: product_id || 'cart_checkout',
            product_name: product.name,
            amount: paymentAmount,
            currency: 'ILS',
            payment_method: 'stripe',
            status: 'pending'
        };

        if (product_type === 'cart') {
            paymentData.items = items;
        }

        const payment = await base44.entities.Payment.create(paymentData);

        // Prepare Stripe Body
        const stripeBody = new URLSearchParams({
            'mode': 'payment',
            'success_url': `${BASE_URL}/CheckoutSuccess?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
            'cancel_url': `${BASE_URL}/Checkout?cancelled=true`,
            'customer_email': user.email,
            'metadata[user_id]': user.id,
            'metadata[product_type]': product_type,
            'metadata[product_id]': product_id || '',
            'metadata[payment_id]': payment.id
        });

        // Append line items
        lineItems.forEach(([key, value]) => stripeBody.append(key, value));

        // Create Stripe Checkout Session
        const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeBody
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