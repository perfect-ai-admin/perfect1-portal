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
        const updates = { phone };
        
        // Check if user has activated any goal
        const activeGoals = await base44.entities.UserGoal.filter({
            user_id: user.id,
            status: 'active'
        });

        // If user has active goals and is paused, activate them
        if (activeGoals.length > 0 && user.status === 'paused') {
            updates.status = 'active';
        }

        await base44.asServiceRole.entities.User.update(user.id, updates);

        return Response.json({ success: true });

    } catch (error) {
        console.error('Error updating phone:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});