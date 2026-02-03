import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id, data } = await req.json();

        const updatedLead = await base44.asServiceRole.entities.Lead.update(id, data);
        
        return Response.json(updatedLead);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});