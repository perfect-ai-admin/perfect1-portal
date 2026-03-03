import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        // Tranzila sends POST with form data or query params
        let params;
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('application/x-www-form-urlencoded')) {
            const body = await req.text();
            params = new URLSearchParams(body);
        } else if (contentType.includes('application/json')) {
            const json = await req.json();
            params = new URLSearchParams(Object.entries(json).map(([k,v]) => [k, String(v)]));
        } else {
            // Try query string
            const url = new URL(req.url);
            params = url.searchParams;
            
            // Also try body as form data
            if (!params.has('Response')) {
                const body = await req.text();
                if (body) {
                    params = new URLSearchParams(body);
                }
            }
        }

        const response = params.get('Response') || params.get('response');
        const confirmationCode = params.get('ConfirmationCode') || params.get('confirmationcode') || '';
        const paymentId = params.get('myid') || params.get('o_myid') || '';

        console.log('[TranzilaNotify] Response:', response, 'ConfirmationCode:', confirmationCode, 'paymentId:', paymentId);
        console.log('[TranzilaNotify] All params:', Object.fromEntries(params.entries()));

        // Only process successful transactions
        if (response !== '000') {
            console.log('[TranzilaNotify] Non-success response:', response);
            return new Response('OK', { status: 200 });
        }

        if (!paymentId) {
            console.error('[TranzilaNotify] No payment ID in notify');
            return new Response('OK', { status: 200 });
        }

        // Use service role directly (no user auth for server-to-server callback)
        const base44 = createClientFromRequest(req);

        const payments = await base44.asServiceRole.entities.Payment.filter({ id: paymentId });
        if (!payments || payments.length === 0) {
            console.error('[TranzilaNotify] Payment not found:', paymentId);
            return new Response('OK', { status: 200 });
        }

        const payment = payments[0];

        if (payment.status === 'completed') {
            console.log('[TranzilaNotify] Payment already completed:', paymentId);
            return new Response('OK', { status: 200 });
        }

        // Update payment to completed
        await base44.asServiceRole.entities.Payment.update(paymentId, {
            status: 'completed',
            transaction_id: confirmationCode,
            completed_at: new Date().toISOString()
        });

        console.log('[TranzilaNotify] Payment marked completed:', paymentId);

        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('[TranzilaNotify] Error:', error.message);
        return new Response('OK', { status: 200 });
    }
});