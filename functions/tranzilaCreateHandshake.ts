import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sum } = await req.json();

        if (!sum || sum <= 0) {
            return Response.json({ error: 'Invalid sum' }, { status: 400 });
        }

        const supplier = Deno.env.get('supplier');
        const TranzilaPW = Deno.env.get('TranzilaPW');

        if (!supplier || !TranzilaPW) {
            console.error("Missing Tranzila credentials in environment variables.");
            return Response.json({ error: 'Server configuration error: Missing Tranzila credentials' }, { status: 500 });
        }

        const handshakeUrl = `https://api.tranzila.com/v1/handshake/create?supplier=${supplier}&sum=${sum}&TranzilaPW=${TranzilaPW}`;

        const response = await fetch(handshakeUrl);
        const data = await response.text();

        console.log('Tranzila handshake raw response:', data);

        const thtkPrefix = "thtk=";
        let thtk = data.trim();
        if (thtk.startsWith(thtkPrefix)) {
            thtk = thtk.substring(thtkPrefix.length);
        }

        if (!thtk || thtk.length < 10) {
            console.error('Invalid thtk received:', thtk);
            return Response.json({ error: 'Failed to get handshake token from Tranzila', raw: data }, { status: 500 });
        }

        return Response.json({ thtk, supplier, sum });
    } catch (error) {
        console.error('Tranzila handshake error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});