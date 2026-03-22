import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const leads = await base44.asServiceRole.entities.Lead.list('-created_date', 1000);
        
        return Response.json(leads);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});