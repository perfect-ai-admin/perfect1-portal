import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { product_type, product_name, amount, product_id, items, metadata } = body;

        if (!amount || amount <= 0) {
            return Response.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (!product_type) {
            return Response.json({ error: 'Missing product_type' }, { status: 400 });
        }

        const supplier = Deno.env.get('supplier');
        const TranzilaPW = Deno.env.get('TranzilaPW');

        if (!supplier || !TranzilaPW) {
            return Response.json({ error: 'Missing Tranzila credentials' }, { status: 500 });
        }

        // Step 1: Create Payment record
        // IMPORTANT: Always preserve user_email and user_name in metadata for invoice generation
        const mergedMetadata = {
            user_email: user.email || '',
            user_name: user.full_name || '',
            full_name: user.full_name || '',
            ...(metadata || {}),
        };

        const paymentData = {
            user_id: user.id,
            product_type,
            product_id: product_id || '',
            product_name: product_name || 'מוצר',
            amount,
            currency: 'ILS',
            payment_method: 'tranzila',
            status: 'pending',
            metadata: mergedMetadata,
        };

        if (items) {
            paymentData.items = items;
        }

        const payment = await base44.asServiceRole.entities.Payment.create(paymentData);
        console.log('Payment created:', payment.id, 'amount:', amount);

        // Step 2: Create Tranzila handshake
        // For recurring (subscription) payments, include recur params in handshake
        const isRecurring = product_type === 'plan';
        let handshakeUrl = `https://api.tranzila.com/v1/handshake/create?supplier=${encodeURIComponent(supplier)}&sum=${encodeURIComponent(amount)}&TranzilaPW=${encodeURIComponent(TranzilaPW)}`;
        if (isRecurring) {
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            const recurStartDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;
            handshakeUrl += `&recur_payments=998&recur_sum=${encodeURIComponent(amount)}&recur_transaction=4_approved&recur_start_date=${recurStartDate}`;
        }

        const response = await fetch(handshakeUrl);
        const data = await response.text();

        console.log('Tranzila handshake response:', data);

        if (data.includes('error') || data.includes('Error')) {
            // Mark payment as failed
            await base44.asServiceRole.entities.Payment.update(payment.id, { 
                status: 'failed', 
                failure_reason: 'Handshake failed: ' + data 
            });
            return Response.json({ error: 'Tranzila handshake error', details: data }, { status: 500 });
        }

        const thtkPrefix = "thtk=";
        let thtk = data.trim();
        if (thtk.startsWith(thtkPrefix)) {
            thtk = thtk.substring(thtkPrefix.length);
        }

        if (!thtk || thtk.length < 10) {
            await base44.asServiceRole.entities.Payment.update(payment.id, { 
                status: 'failed', 
                failure_reason: 'Invalid handshake token' 
            });
            return Response.json({ error: 'Failed to get handshake token' }, { status: 500 });
        }

        console.log('Handshake success - thtk:', thtk.substring(0, 8) + '...');

        // Build notify_url for Tranzila server-to-server callback
        const baseUrl = Deno.env.get('BASE_URL') || '';
        const notifyUrl = baseUrl ? `${baseUrl}/functions/tranzilaNotify` : '';

        return Response.json({ 
            success: true,
            paymentId: payment.id,
            thtk, 
            supplier, 
            sum: amount,
            notifyUrl 
        });
    } catch (error) {
        console.error('tranzilaCreatePayment error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});