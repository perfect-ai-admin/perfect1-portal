import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 1. Get the current user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch all active goals for the user
        // We'll sort them by created_date to ensure consistent ordering
        const goals = await base44.entities.UserGoal.filter({
            user_id: user.id
        });
        
        // Sort in memory just to be safe (oldest first gets #1)
        goals.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

        // 3. Update each goal with a sequence number
        const resultList = [];
        
        for (let i = 0; i < goals.length; i++) {
            const goal = goals[i];
            const newIndex = i + 1;
            
            // Only update if it changed or wasn't set
            if (goal.goal_index !== newIndex) {
                await base44.entities.UserGoal.update(goal.id, {
                    goal_index: newIndex
                });
            }
            
            resultList.push(`מטרה #${newIndex}: ${goal.title} (${goal.status})`);
        }

        return Response.json({ 
            success: true, 
            message: `Re-indexed ${goals.length} goals.`,
            goals: resultList 
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});