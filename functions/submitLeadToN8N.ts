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

        // Prepare lead data for Base44
        const leadData = {
            name: name || 'אתר',
            phone: phone.trim(),
            email: email || '',
            notes: message || '',
            source_page: pageSlug || 'landing-page',
            interaction_type: 'form',
            status: 'new',
            priority: 'medium'
        };

        // Prepare data for N8N
        const n8nData = {
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

        // Send to both destinations in parallel
        const [leadResult, n8nResult] = await Promise.all([
            base44.asServiceRole.entities.Lead.create(leadData),
            fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(n8nData)
            })
        ]);

        // Check N8N response
        if (!n8nResult.ok) {
            console.warn('N8N webhook warning:', n8nResult.status);
        }

        return Response.json({
            success: true,
            message: 'Lead saved to LeadsAdmin and sent to N8N',
            leadId: leadResult.id,
            n8nStatus: n8nResult.status
        });

    } catch (error) {
        console.error('submitLeadToN8N error:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to process lead'
        }, { status: 500 });
    }
});