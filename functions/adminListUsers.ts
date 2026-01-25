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

        // Enrich users - journey started if phone is saved
        const enrichedUsers = users.map(user => {
            const hasStartedJourney = !!(user.phone && user.phone.trim() !== '');
            
            return {
                ...user,
                has_started_journey: hasStartedJourney,
                journey_details: hasStartedJourney ? 'Phone registered - Journey started' : null
            };
        });
        
        return Response.json({ users: enrichedUsers });

    } catch (error) {
        console.error('Error listing users:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});