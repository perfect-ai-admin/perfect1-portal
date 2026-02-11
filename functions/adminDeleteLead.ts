import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        // Clone the request so we can read body twice
        const clonedReq = req.clone();
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await clonedReq.json();
        const { leadId } = body;

        if (!leadId) {
            return Response.json({ error: 'leadId is required' }, { status: 400 });
        }

        console.log('Deleting lead with ID:', leadId);
        const result = await base44.asServiceRole.entities.Lead.delete(leadId);
        console.log('Delete result:', result);

        return Response.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});