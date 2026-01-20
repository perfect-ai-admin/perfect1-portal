import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        console.log('Webhook payload keys:', Object.keys(payload));
        
        let { data, event, payload_too_large } = payload;

        // Handle large payload (fetch data manually if missing)
        if (payload_too_large || !data) {
            console.log('Payload too large or data missing, fetching entity...');
            if (event?.entity_name && event?.entity_id) {
                const base44 = createClientFromRequest(req);
                data = await base44.asServiceRole.entities[event.entity_name].get(event.entity_id);
                console.log('Fetched data manually:', data?.id);
            }
        }

        if (!data) {
            console.log('No data available even after fetch attempt');
            return Response.json({ status: 'ignored', reason: 'no data' });
        }

        const entityType = event?.entity_name || 'Lead';
        console.log(`Processing ${entityType} event: ${event?.type || 'unknown'}`);
        console.log(`Sending ${entityType} to N8N webhook:`, data.id);

        const n8nUrl = 'https://n8n.perfect-1.one/webhook/dc453dae-dcc0-484e-85c8-0d47299fc4c2';
        const n8nTestUrl = 'https://n8n.perfect-1.one/webhook-test/dc453dae-dcc0-484e-85c8-0d47299fc4c2';
        
        // Enhance payload with source info
        const webhookPayload = {
            ...data,
            _entity_type: entityType,
            _event_type: event?.type || 'create',
            _timestamp: new Date().toISOString()
        };

        // Send to production URL
        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
        });

        // Send to Test URL
        let testResponseStatus = 'not_sent';
        try {
            console.log('Sending to N8N Test URL...');
            const testRes = await fetch(n8nTestUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookPayload)
            });
            testResponseStatus = testRes.status;
            console.log('N8N Test URL response:', testRes.status);
        } catch (e) {
            console.warn('Failed to send to N8N Test URL:', e);
            testResponseStatus = 'error';
        }

        const responseText = await response.text();
        
        if (!response.ok) {
            console.error(`N8N Production error ${response.status}:`, responseText);
        }

        console.log('N8N Production response:', response.status, responseText);

        return Response.json({ 
            success: true, 
            n8n_production_status: response.status,
            n8n_test_status: testResponseStatus
        });
    } catch (error) {
        console.error('Error sending lead to N8N:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});