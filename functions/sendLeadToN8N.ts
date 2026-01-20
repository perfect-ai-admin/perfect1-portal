import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        // Automation payload structure: { event: { type, entity_name, entity_id }, data: { ... }, old_data: { ... } }
        const { data, event } = payload;

        if (!data) {
            console.log('No data in payload');
            return Response.json({ status: 'ignored', reason: 'no data' });
        }

        const entityType = event?.entity_name || 'Lead';
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

        // Send to Test URL (fail silently if not active)
        try {
            console.log('Sending to N8N Test URL...');
            await fetch(n8nTestUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookPayload)
            });
            console.log('Sent to N8N Test URL successfully');
        } catch (e) {
            console.warn('Failed to send to N8N Test URL (expected if editor is closed):', e);
        }

        const responseText = await response.text();
        
        if (!response.ok) {
            // If production failed, we still want to know, but we proceeded with test url
            console.error(`N8N Production error ${response.status}:`, responseText);
            // We don't throw here to allow test flow to complete if needed, or we can throw. 
            // The user is debugging, let's return the status.
        }

        console.log('N8N Production response:', response.status, responseText);

        return Response.json({ success: true, n8n_status: response.status });
    } catch (error) {
        console.error('Error sending lead to N8N:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});