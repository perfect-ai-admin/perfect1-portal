import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user_goal_id } = await req.json();

        if (!user_goal_id) {
            return Response.json({ error: 'Missing user_goal_id' }, { status: 400 });
        }

        // Get user goal
        const userGoals = await base44.entities.UserGoal.filter({ 
            id: user_goal_id,
            user_id: user.id 
        });

        if (!userGoals || userGoals.length === 0) {
            return Response.json({ error: 'UserGoal not found' }, { status: 404 });
        }

        const userGoal = userGoals[0];

        // Check max active goals
        const maxActiveGoals = user.max_active_goals_override ?? user.max_active_goals;
        const activeGoals = await base44.entities.UserGoal.filter({
            user_id: user.id,
            status: 'active'
        });

        if (maxActiveGoals && activeGoals.length >= maxActiveGoals) {
            // Deactivate oldest active goal
            const oldestActive = activeGoals.sort((a, b) => 
                new Date(a.activated_at) - new Date(b.activated_at)
            )[0];
            
            await base44.entities.UserGoal.update(oldestActive.id, {
                status: 'selected'
            });
        }

        // Activate goal
        await base44.entities.UserGoal.update(user_goal_id, {
            status: 'active',
            activated_at: new Date().toISOString()
        });

        // Activate user if they have a phone number (and are currently paused)
        if (user.status === 'paused' && user.phone) {
             await base44.asServiceRole.entities.User.update(user.id, { status: 'active' });
        }

        return Response.json({
            success: true,
            message: 'המטרה הופעלה בהצלחה'
        });

    } catch (error) {
        console.error('Error activating goal:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});