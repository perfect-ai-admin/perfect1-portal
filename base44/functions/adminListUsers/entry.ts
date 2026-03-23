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

        // Fetch all users, payments and plans using service role
        const [users, payments, plans] = await Promise.all([
            base44.asServiceRole.entities.User.list(),
            base44.asServiceRole.entities.Payment.list(),
            base44.asServiceRole.entities.Plan.list()
        ]);

        // Build plan lookup
        const planMap = {};
        for (const plan of plans) {
            planMap[plan.id] = plan;
        }

        // Build payment stats per user
        const paymentsByUser = {};
        for (const payment of payments) {
            const uid = payment.user_id;
            if (!uid) continue;
            if (!paymentsByUser[uid]) {
                paymentsByUser[uid] = { count: 0, total: 0, lastDate: null, completedCount: 0 };
            }
            const stats = paymentsByUser[uid];
            stats.count += 1;
            if (payment.status === 'completed') {
                stats.completedCount += 1;
                stats.total += (payment.amount || 0);
                const pDate = payment.completed_at || payment.created_date;
                if (pDate && (!stats.lastDate || new Date(pDate) > new Date(stats.lastDate))) {
                    stats.lastDate = pDate;
                }
            }
        }

        // Enrich users
        const enrichedUsers = users.map(user => {
            const hasStartedJourney = !!user.business_journey_completed;
            const pStats = paymentsByUser[user.id] || { count: 0, total: 0, lastDate: null, completedCount: 0 };
            const userPlan = user.current_plan_id ? planMap[user.current_plan_id] : null;
            
            return {
                ...user,
                has_started_journey: hasStartedJourney,
                journey_details: hasStartedJourney ? 'השלים שאלון מסע עסק' : null,
                plan_name: userPlan?.name || null,
                plan_price: userPlan?.price ?? null,
                payments_count: pStats.completedCount,
                payments_total: pStats.total,
                last_payment_date: pStats.lastDate
            };
        });
        
        return Response.json({ users: enrichedUsers });

    } catch (error) {
        console.error('Error listing users:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});