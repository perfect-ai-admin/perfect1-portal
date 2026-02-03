import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const stats = {
            users: { total: 0, new_this_month: 0, active: 0 },
            revenue: { total: 0, this_month: 0 },
            leads: { total: 0, new_this_month: 0 },
            landingPages: { total: 0, published: 0 }
        };

        // Users Stats
        const users = await base44.asServiceRole.entities.User.list({ limit: 1000 }); // Consider pagination for large scale
        stats.users.total = users.length;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        stats.users.new_this_month = users.filter(u => new Date(u.created_date) >= firstDayOfMonth).length;
        // Assuming 'active' means logged in recently (e.g., last 30 days) or status='active'
        stats.users.active = users.filter(u => u.status === 'active').length;

        // Revenue Stats
        const payments = await base44.asServiceRole.entities.Payment.filter({ status: 'completed' }, { limit: 1000 });
        stats.revenue.total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        stats.revenue.this_month = payments
            .filter(p => new Date(p.created_date) >= firstDayOfMonth)
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // Leads Stats
        const leads = await base44.asServiceRole.entities.Lead.list({ limit: 1000 });
        stats.leads.total = leads.length;
        stats.leads.new_this_month = leads.filter(l => new Date(l.created_date) >= firstDayOfMonth).length;

        // Landing Pages Stats
        const landingPages = await base44.asServiceRole.entities.LandingPage.list({ limit: 1000 });
        stats.landingPages.total = landingPages.length;
        stats.landingPages.published = landingPages.filter(lp => lp.status === 'published').length;

        // Recent Activity
        const recentActivity = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 10);

        return Response.json({ stats, recentActivity });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});