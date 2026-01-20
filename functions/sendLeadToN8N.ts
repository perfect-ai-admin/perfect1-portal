import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        const base44 = createClientFromRequest(req); // Init client early for logging
        
        console.log('Webhook payload keys:', Object.keys(payload));
        let { data, event, payload_too_large } = payload;
        
        const entityType = event?.entity_name || 'Lead';
        const eventType = event?.type || 'create';

        // Log start of execution
        await base44.asServiceRole.entities.SystemLog.create({
            level: 'info',
            source: 'sendLeadToN8N',
            message: `Started processing ${entityType} ${eventType}`,
            details: { 
                entity_id: event?.entity_id, 
                payload_too_large 
            }
        });

        // Handle large payload (fetch data manually if missing)
        if (payload_too_large || !data) {
            console.log('Payload too large or data missing, fetching entity...');
            if (event?.entity_name && event?.entity_id) {
                data = await base44.asServiceRole.entities[event.entity_name].get(event.entity_id);
                console.log('Fetched data manually:', data?.id);
            }
        }

        if (!data) {
            console.log('No data available even after fetch attempt');
             await base44.asServiceRole.entities.SystemLog.create({
                level: 'error',
                source: 'sendLeadToN8N',
                message: 'No data available',
                details: { event }
            });
            return Response.json({ status: 'ignored', reason: 'no data' });
        }

        console.log(`Processing ${entityType} event: ${eventType}`);
        console.log(`Sending ${entityType} to N8N webhook:`, data.id);

        const n8nUrl = 'https://n8n.perfect-1.one/webhook/dc453dae-dcc0-484e-85c8-0d47299fc4c2';
        const n8nTestUrl = 'https://n8n.perfect-1.one/webhook-test/dc453dae-dcc0-484e-85c8-0d47299fc4c2';
        
        // Enhance payload with source info
        const webhookPayload = {
            ...data,
            _entity_type: entityType,
            _event_type: eventType,
            _timestamp: new Date().toISOString()
        };

        // Send to production URL
        let prodStatus = 'error';
        let prodBody = '';
        try {
            const response = await fetch(n8nUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookPayload)
            });
            prodStatus = response.status;
            prodBody = await response.text();
            
            if (!response.ok) {
                console.error(`N8N Production error ${response.status}:`, prodBody);
            }
            console.log('N8N Production response:', response.status, prodBody);
        } catch (e) {
            console.error('N8N Production fetch failed:', e);
            prodBody = e.message;
        }

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

        // Log completion
        await base44.asServiceRole.entities.SystemLog.create({
            level: prodStatus === 200 || testResponseStatus === 200 ? 'info' : 'warn',
            source: 'sendLeadToN8N',
            message: `Finished processing ${entityType}`,
            details: { 
                entity_id: data.id, 
                prod_status: prodStatus, 
                test_status: testResponseStatus,
                prod_body_preview: prodBody.substring(0, 100)
            }
        });

        return Response.json({ 
            success: true, 
            n8n_production_status: prodStatus,
            n8n_test_status: testResponseStatus
        });
    } catch (error) {
        console.error('Error sending lead to N8N:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});