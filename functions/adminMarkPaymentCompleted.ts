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

        return Response.json({ success: true });
    } catch (error) {
        console.error('adminMarkPaymentCompleted error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});