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

        console.log('Deleting lead:', leadId);
        await base44.asServiceRole.entities.Lead.delete(leadId);
        console.log('Lead deleted successfully');

        return Response.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error.message, JSON.stringify(error));
        return Response.json({ error: error.message }, { status: 500 });
    }
});