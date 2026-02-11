import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const body = await req.json();
        const { leadId } = body;

        if (!leadId) {
            return Response.json({ error: 'leadId is required' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        console.log('Attempting to delete lead:', leadId);

        // First verify the lead exists
        try {
            const lead = await base44.asServiceRole.entities.Lead.get(leadId);
            console.log('Found lead:', lead?.name || lead?.id);
        } catch (getErr) {
            console.error('Lead not found via get:', getErr.message);
        }

        // Try deleteMany as alternative
        const result = await base44.asServiceRole.entities.Lead.deleteMany({ id: leadId });
        console.log('DeleteMany result:', result);

        return Response.json({ success: true, result });
    } catch (error) {
        console.error('Delete error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});