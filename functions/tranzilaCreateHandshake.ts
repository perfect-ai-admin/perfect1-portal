import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const sum = body.sum;

        if (!sum || sum <= 0) {
            return Response.json({ error: 'Invalid sum' }, { status: 400 });
        }

        const supplier = Deno.env.get('supplier');
        const TranzilaPW = Deno.env.get('TranzilaPW');

        if (!supplier || !TranzilaPW) {
            console.error("Missing Tranzila credentials in environment variables.");
            return Response.json({ error: 'Server configuration error: Missing Tranzila credentials' }, { status: 500 });
        }

        // Log the full request for debugging
        console.log('Handshake request - supplier:', supplier, 'sum:', sum, 'sum type:', typeof sum);

        const handshakeUrl = `https://api.tranzila.com/v1/handshake/create?supplier=${encodeURIComponent(supplier)}&sum=${encodeURIComponent(sum)}&TranzilaPW=${encodeURIComponent(TranzilaPW)}`;

        console.log('Handshake URL (without PW):', `https://api.tranzila.com/v1/handshake/create?supplier=${encodeURIComponent(supplier)}&sum=${encodeURIComponent(sum)}&TranzilaPW=***`);

        const response = await fetch(handshakeUrl);
        const data = await response.text();

        console.log('Tranzila handshake raw response:', data);
        console.log('Tranzila handshake status:', response.status);

        // Check for error responses
        if (data.includes('error') || data.includes('Error')) {
            console.error('Tranzila returned error:', data);
            return Response.json({ error: 'Tranzila handshake error', details: data }, { status: 500 });
        }

        const thtkPrefix = "thtk=";
        let thtk = data.trim();
        if (thtk.startsWith(thtkPrefix)) {
            thtk = thtk.substring(thtkPrefix.length);
        }

        if (!thtk || thtk.length < 10) {
            console.error('Invalid thtk received:', thtk);
            return Response.json({ error: 'Failed to get handshake token from Tranzila', raw: data }, { status: 500 });
        }

        console.log('Handshake success - thtk:', thtk.substring(0, 8) + '...', 'sum:', sum);

        return Response.json({ thtk, supplier, sum });
    } catch (error) {
        console.error('Tranzila handshake error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});