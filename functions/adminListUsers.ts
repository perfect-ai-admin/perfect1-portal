import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Handle CORS preflight if needed, though SDK handles it usually.
        // Get payload
        const payload = await req.json().catch(() => ({}));
        const { bypassCode, phone } = payload;
        
        // Check authentication
        let authorized = false;
        
        // 1. Check bypass
        if (bypassCode === '123456' && phone === '0502277087') {
            authorized = true;
        } else {
            // 2. Check real admin session
            const user = await base44.auth.me().catch(() => null);
            if (user && user.role === 'admin') {
                authorized = true;
            }
        }

        if (!authorized) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all users using service role
        const users = await base44.asServiceRole.entities.User.list();
        
        // Fetch indicators for journey start (goals, business journey)
        // We fetch a larger batch to cover active users. 
        // Note: In a very large system, this should be paginated or indexed differently.
        const goals = await base44.asServiceRole.entities.UserGoal.list('-created_date', 1000);
        const journeys = await base44.asServiceRole.entities.BusinessJourney.list('-created_date', 1000);
        
        // Create sets of user IDs who have started
        const usersWithGoals = new Set(goals.map(g => g.user_id));
        const usersWithJourney = new Set(journeys.map(j => j.user_id));

        // Enrich users
        const enrichedUsers = users.map(user => {
            const hasGoal = usersWithGoals.has(user.id);
            const hasJourney = usersWithJourney.has(user.id);
            
            return {
                ...user,
                has_started_journey: hasGoal || hasJourney,
                journey_details: hasGoal ? 'Has Goals' : (hasJourney ? 'Has Business Journey' : null)
            };
        });
        
        return Response.json({ users: enrichedUsers });

    } catch (error) {
        console.error('Error listing users:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});