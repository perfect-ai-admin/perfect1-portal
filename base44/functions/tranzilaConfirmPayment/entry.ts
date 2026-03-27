import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

        // Call unified fulfillment logic
        try {
            const fulfillResult = await base44.asServiceRole.functions.invoke('fulfillPayment', {
                payment_id: payment_id,
                user_id: user.id,
                trigger_source: 'tranzila_confirm'
            });
            console.log('[tranzilaConfirmPayment] Fulfillment result:', fulfillResult?.data?.success);
        } catch (fulfillErr) {
            console.error('[tranzilaConfirmPayment] Fulfillment error:', fulfillErr.message);
        }

        return Response.json({ 
            success: true, 
            payment_id,
            product_type: payment.product_type
        });
    } catch (error) {
        console.error('tranzilaConfirmPayment error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});