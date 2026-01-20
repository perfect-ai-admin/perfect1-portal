import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        // Automation payload structure: { event: { type, entity_name, entity_id }, data: { ... }, old_data: { ... } }
        const { data } = payload;

        if (!data) {
            console.log('No data in payload');
            return Response.json({ status: 'ignored', reason: 'no data' });
        }

        console.log('Sending lead to N8N webhook:', data.id);

        const n8nUrl = 'https://n8n.perfect-1.one/webhook/dc453dae-dcc0-484e-85c8-0d47299fc4c2';
        
        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseText = await response.text();
        
        if (!response.ok) {
            console.error(`N8N error ${response.status}:`, responseText);
            throw new Error(`N8N responded with ${response.status}`);
        }

        console.log('N8N response:', response.status, responseText);

        return Response.json({ success: true, n8n_status: response.status });
    } catch (error) {
        console.error('Error sending lead to N8N:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});