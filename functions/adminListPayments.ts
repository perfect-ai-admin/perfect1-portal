import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const payments = await base44.asServiceRole.entities.Payment.list('-created_date', 100);
        
        // Enrich with user details if possible (optional optimization)
        // For now returning raw payments
        
        return Response.json({ payments });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});