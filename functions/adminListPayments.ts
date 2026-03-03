import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Use filter with empty query to get all payments via service role
        const payments = await base44.asServiceRole.entities.Payment.filter({}, '-created_date', 500);
        
        // Enrich with user names
        const userIds = [...new Set(payments.map(p => p.user_id).filter(Boolean))];
        let usersMap = {};
        
        if (userIds.length > 0) {
            const allUsers = await base44.asServiceRole.entities.User.filter({}, null, 1000);
            allUsers.forEach(u => { usersMap[u.id] = u.full_name || u.email || u.id; });
        }

        const enriched = payments.map(p => ({
            ...p,
            user_name: usersMap[p.user_id] || p.user_id || 'לא ידוע'
        }));

        return Response.json({ payments: enriched });
    } catch (error) {
        console.error('adminListPayments error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});