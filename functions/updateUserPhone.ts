import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { phone } = await req.json();

        if (!phone) {
            return Response.json({ error: 'Phone is required' }, { status: 400 });
        }

        // Update user using service role to ensure it persists
        // Note: We use asServiceRole.entities.User.update because we are updating a specific user record
        // ID is user.id
        await base44.asServiceRole.entities.User.update(user.id, { phone });

        return Response.json({ success: true });

    } catch (error) {
        console.error('Error updating phone:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});