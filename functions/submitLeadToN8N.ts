import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { name, phone, email, message, pageSlug, businessName } = await req.json();

        // Validate required fields
        if (!phone) {
            return Response.json({ error: 'Phone is required' }, { status: 400 });
        }

        // Save lead directly to Base44 database
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

        // Create lead in database
        const lead = await base44.asServiceRole.entities.Lead.create(leadData);

        return Response.json({
            success: true,
            message: 'Lead saved successfully',
            leadId: lead.id
        });

    } catch (error) {
        console.error('submitLeadToN8N error:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to save lead'
        }, { status: 500 });
    }
});