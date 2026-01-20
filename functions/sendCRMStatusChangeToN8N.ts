import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const payload = await req.json();
        const base44 = createClientFromRequest(req);
        
        // Automation payload structure: { event: { type, entity_name, entity_id }, data: { ... }, old_data: { ... } }
        let { data, old_data, event, payload_too_large } = payload;
        
        // Log start
        await base44.asServiceRole.entities.SystemLog.create({
            level: 'info',
            source: 'sendCRMStatusChangeToN8N',
            message: `Started processing status change for ${event?.entity_id}`,
            details: { payload_too_large, event }
        });

        if (payload_too_large) {
             // If payload too large, we might miss old_data to compare. 
             // But we can fetch current data. 
             if (event?.entity_name && event?.entity_id) {
                data = await base44.asServiceRole.entities[event.entity_name].get(event.entity_id);
            }
            // We can't easily get old_data if it's too large and not provided.
            // But we can try to proceed if we assume it's a status change or just send it.
            // For now, let's just log it.
            console.log('Payload too large, fetched current data manually');
        }

        if (!data) {
            await base44.asServiceRole.entities.SystemLog.create({
                level: 'error',
                source: 'sendCRMStatusChangeToN8N',
                message: 'Missing data',
                details: { payload }
            });
            return Response.json({ status: 'ignored', reason: 'missing data' });
        }

        // If we have old_data, check status change. If not (payload too large), we might want to send anyway to be safe?
        // But the function is "Status Change". 
        // If old_data is missing, we can't verify change. 
        // Let's assume if old_data is present, we check. If missing, we warn but maybe proceed?
        // Actually, without old_data we don't know previous status.
        
        if (old_data && data.status === old_data.status) {
            console.log('Status did not change, ignoring');
            return Response.json({ status: 'ignored', reason: 'status unchanged' });
        }

        const oldStatus = old_data ? old_data.status : 'unknown';
        const newStatus = data.status;

        console.log(`CRMLead status changed from ${oldStatus} to ${newStatus} for ID: ${data.id}`);

        const n8nUrl = 'https://n8n.perfect-1.one/webhook/dc453dae-dcc0-484e-85c8-0d47299fc4c2';
        const n8nTestUrl = 'https://n8n.perfect-1.one/webhook-test/dc453dae-dcc0-484e-85c8-0d47299fc4c2';
        
        // Prepare payload
        const webhookPayload = {
            ...data,
            previous_status: oldStatus,
            new_status: newStatus,
            event_type: 'status_change',
            entity: 'CRMLead',
            _timestamp: new Date().toISOString(),
            send_delivery_confirmation: true
        };

        // Send to production URL
        let prodStatus = 'error';
        let prodBody = '';
        let syncSuccess = false;

        try {
            const response = await fetch(n8nUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookPayload)
            });
            prodStatus = response.status;
            prodBody = await response.text();
            
            if (response.ok) {
                syncSuccess = true;
            } else {
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

        // Update Entity with Sync Status
        try {
            const updateData = {
                n8n_synced: syncSuccess,
                n8n_last_sync: new Date().toISOString(),
                n8n_error: syncSuccess ? null : `Status: ${prodStatus}, Body: ${prodBody.substring(0, 200)}`
            };
            
            // Only update if entity name is known (it should be CRMLead based on automation)
            const entityName = event?.entity_name || 'CRMLead';
            if (event?.entity_id) {
                await base44.asServiceRole.entities[entityName].update(event.entity_id, updateData);
                console.log(`Updated ${entityName} sync status:`, updateData);
            }
        } catch (updateError) {
            console.error('Failed to update entity sync status:', updateError);
        }

        // Log completion
        await base44.asServiceRole.entities.SystemLog.create({
            level: syncSuccess ? 'info' : 'error',
            source: 'sendCRMStatusChangeToN8N',
            message: `Processed status change for ${data.id}`,
            details: { 
                old_status: oldStatus,
                new_status: newStatus,
                prod_status: prodStatus, 
                test_status: testResponseStatus,
                prod_body_preview: prodBody.substring(0, 100),
                sync_success: syncSuccess
            }
        });

        return Response.json({ 
            success: true, 
            n8n_production_status: prodStatus,
            n8n_test_status: testResponseStatus
        });
    } catch (error) {
        console.error('Error sending CRM status change to N8N:', error);
        // Try to log error
         try {
            const base44 = createClientFromRequest(req);
            await base44.asServiceRole.entities.SystemLog.create({
                level: 'error',
                source: 'sendCRMStatusChangeToN8N',
                message: 'Unhandled error',
                details: { error: error.message, stack: error.stack }
            });
        } catch (e) { /* ignore log error */ }
        
        return Response.json({ error: error.message }, { status: 500 });
    }
});