import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const N8N_WEBHOOK_URL = 'https://n8n.perfect-1.one/webhook-test/ddaa0a65-743e-4679-8b5a-89be8520f763/webhook';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { name, phone, email, message, pageSlug, businessName } = await req.json();

        // Validate required fields
        if (!phone) {
            return Response.json({ error: 'Phone is required' }, { status: 400 });
        }

        // Prepare lead data
        const leadData = {
            name: name || 'אתר',
            phone,
            email: email || '',
            message: message || '',
            pageSlug,
            businessName,
            timestamp: new Date().toISOString(),
            source: 'landing-page',
            status: 'new'
        };

        // Send to N8N webhook
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leadData)
        });

        if (!n8nResponse.ok) {
            console.error('N8N webhook error:', n8nResponse.status, await n8nResponse.text());
            return Response.json({
                success: false,
                error: `N8N error: ${n8nResponse.status}`,
                n8nStatus: n8nResponse.status
            }, { status: n8nResponse.status });
        }

        const n8nResult = await n8nResponse.json();

        return Response.json({
            success: true,
            message: 'Lead submitted successfully',
            n8nResponse: n8nResult
        });

    } catch (error) {
        console.error('submitLeadToN8N error:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to submit lead to N8N'
        }, { status: 500 });
    }
});