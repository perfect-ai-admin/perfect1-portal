import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { goal_id, activate } = await req.json();

        if (!goal_id) {
            return Response.json({ error: 'Missing goal_id' }, { status: 400 });
        }

        // Check if goal exists
        const goals = await base44.entities.Goal.filter({ id: goal_id });
        if (!goals || goals.length === 0) {
            return Response.json({ error: 'Goal not found' }, { status: 404 });
        }

        const goal = goals[0];

        // Get user's current goals
        const userGoals = await base44.entities.UserGoal.filter({ 
            user_id: user.id,
            status: { $in: ['selected', 'active'] }
        });

        // Check goals limit (considering override > plan limit > default)
        const goalsLimit = user.goals_limit_override !== null && user.goals_limit_override !== undefined
            ? user.goals_limit_override 
            : (user.goals_limit !== null && user.goals_limit !== undefined ? user.goals_limit : 1);
        
        // goalsLimit === 0 means unlimited
        if (goalsLimit !== 0 && goalsLimit !== null && userGoals.length >= goalsLimit) {
            return Response.json({ 
                error: 'goals_limit_reached',
                message: `הגעת למכסת המטרות (${goalsLimit})`,
                current_count: userGoals.length,
                limit: goalsLimit,
                upgrade_required: true
            }, { status: 403 });
        }

        // Check if already selected
        const existing = userGoals.find(ug => ug.goal_id === goal_id);
        if (existing) {
            return Response.json({ 
                error: 'Goal already selected',
                user_goal_id: existing.id 
            }, { status: 400 });
        }

        // Create UserGoal
        const userGoal = await base44.entities.UserGoal.create({
            user_id: user.id,
            goal_id: goal_id,
            status: activate ? 'active' : 'selected',
            selected_at: new Date().toISOString(),
            activated_at: activate ? new Date().toISOString() : null,
            progress: 0
        });

        // If activating, deactivate other active goals if needed
        if (activate) {
            const maxActiveGoals = user.max_active_goals_override ?? user.max_active_goals;
            const activeGoals = userGoals.filter(ug => ug.status === 'active');
            
            if (maxActiveGoals && activeGoals.length >= maxActiveGoals) {
                // Deactivate oldest active goal
                const oldestActive = activeGoals.sort((a, b) => 
                    new Date(a.activated_at) - new Date(b.activated_at)
                )[0];
                
                await base44.entities.UserGoal.update(oldestActive.id, {
                    status: 'selected'
                });
            }
        }

        return Response.json({
            success: true,
            user_goal: userGoal,
            goal: goal,
            message: activate ? 'המטרה הופעלה בהצלחה' : 'המטרה נבחרה בהצלחה'
        });

    } catch (error) {
        console.error('Error selecting goal:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});