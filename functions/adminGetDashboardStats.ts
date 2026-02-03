import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Handle CORS/Bypass
        const payload = await req.json().catch(() => ({}));
        const { bypassCode, phone } = payload;
        
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
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const stats = {
            users: { total: 0, new_this_month: 0, active: 0 },
            revenue: { total: 0, this_month: 0 },
            landingPages: { total: 0, published: 0 }
        };

        // Users Stats
        // Use list(sort, limit) signature correctly. Passing null for sort to use default.
        const users = await base44.asServiceRole.entities.User.list(undefined, 1000); 
        stats.users.total = users.length;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        stats.users.new_this_month = users.filter(u => new Date(u.created_date) >= firstDayOfMonth).length;
        stats.users.active = users.filter(u => u.status === 'active').length;

        // Revenue Stats
        // Use filter(query, sort, limit) signature correctly.
        const payments = await base44.asServiceRole.entities.Payment.filter({ status: 'completed' }, undefined, 1000);
        stats.revenue.total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        stats.revenue.this_month = payments
            .filter(p => new Date(p.created_date) >= firstDayOfMonth)
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // Landing Pages Stats
        const landingPages = await base44.asServiceRole.entities.LandingPage.list(undefined, 1000);
        stats.landingPages.total = landingPages.length;
        stats.landingPages.published = landingPages.filter(lp => lp.status === 'published').length;

        // Recent Activity
        const recentActivity = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 10);

        return Response.json({ stats, recentActivity });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});