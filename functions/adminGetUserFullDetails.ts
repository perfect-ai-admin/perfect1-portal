import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const admin = await base44.auth.me();
        
        if (admin?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const payload = await req.json();
        const { user_id } = payload;

        if (!user_id) {
            return Response.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Fetch User
        const user = await base44.asServiceRole.entities.User.get(user_id);
        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch Related Data in Parallel
        const [payments, landingPages, leads, activityLog, userGoals] = await Promise.all([
            base44.asServiceRole.entities.Payment.filter({ user_id }, '-created_date', 50),
            base44.asServiceRole.entities.LandingPage.filter({ created_by: user.email }, '-created_date', 50),
            base44.asServiceRole.entities.Lead.filter({ created_by: user.email }, '-created_date', 50), // Leads owned by user (from their LPs)
            base44.asServiceRole.entities.ActivityLog.filter({ user_id }, '-created_date', 20),
            base44.asServiceRole.entities.UserGoal.filter({ user_id }, '-created_date', 20)
        ]);

        // Calculate LTV
        const ltv = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        return Response.json({
            user,
            payments,
            landingPages,
            leads,
            activityLog,
            userGoals,
            ltv
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});