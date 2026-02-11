import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        // Clone request before consuming body
        const clonedReq = req.clone();
        const body = await clonedReq.json();
        const { leadId } = body;

        if (!leadId) {
            return Response.json({ error: 'leadId is required' }, { status: 400 });
        }

        // Create client from original request (for auth headers)
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        console.log('Admin', user.email, 'deleting lead:', leadId);
        
        // Use service role to bypass RLS (leads created by service role can only be deleted by service role)
        await base44.asServiceRole.entities.Lead.delete(leadId);
        console.log('Lead deleted successfully');

        return Response.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});