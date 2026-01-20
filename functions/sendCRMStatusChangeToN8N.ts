import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        // Automation payload structure: { event: { type, entity_name, entity_id }, data: { ... }, old_data: { ... } }
        const { data, old_data } = payload;

        if (!data || !old_data) {
            console.log('Missing data or old_data in payload');
            return Response.json({ status: 'ignored', reason: 'missing data' });
        }

        // Check if status has changed
        if (data.status === old_data.status) {
            console.log('Status did not change, ignoring');
            return Response.json({ status: 'ignored', reason: 'status unchanged' });
        }

        console.log(`CRMLead status changed from ${old_data.status} to ${data.status} for ID: ${data.id}`);

        const n8nUrl = 'https://n8n.perfect-1.one/webhook/dc453dae-dcc0-484e-85c8-0d47299fc4c2';
        
        // Prepare payload with all client info and status change details
        const webhookPayload = {
            ...data,
            previous_status: old_data.status,
            new_status: data.status,
            event_type: 'status_change',
            entity: 'CRMLead'
        };

        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
        });

        const responseText = await response.text();
        
        if (!response.ok) {
            console.error(`N8N error ${response.status}:`, responseText);
            throw new Error(`N8N responded with ${response.status}`);
        }

        console.log('N8N response:', response.status, responseText);

        return Response.json({ success: true, n8n_status: response.status });
    } catch (error) {
        console.error('Error sending CRM status change to N8N:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});