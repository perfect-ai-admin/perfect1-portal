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
            landingPages: { total: 0, published: 0 },
            products: { logos: 0, presentations: 0, stickers: 0 }
        };

        // Users Stats
        // Using -created_date for sort to ensure we get data.
        const users = await base44.asServiceRole.entities.User.list('-created_date', 1000); 
        stats.users.total = users.length;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        stats.users.new_this_month = users.filter(u => new Date(u.created_date) >= firstDayOfMonth).length;
        stats.users.active = users.filter(u => u.status === 'active').length;

        // Revenue & Product Stats
        const payments = await base44.asServiceRole.entities.Payment.filter({ status: 'completed' }, null, 1000);
        
        stats.revenue.total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        stats.revenue.this_month = payments
            .filter(p => new Date(p.created_date) >= firstDayOfMonth)
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // Calculate product counts from payments
        payments.forEach(p => {
            // Check direct product type
            if (p.product_type === 'logo') stats.products.logos++;
            if (p.product_type === 'presentation') stats.products.presentations++;
            if (p.product_type === 'sticker') stats.products.stickers++;

            // Check cart items
            if (p.product_type === 'cart' && Array.isArray(p.items)) {
                p.items.forEach(item => {
                    if (item.type === 'logo') stats.products.logos++;
                    if (item.type === 'presentation') stats.products.presentations++;
                    if (item.type === 'sticker') stats.products.stickers++;
                });
            }
        });

        // Landing Pages Stats
        const landingPages = await base44.asServiceRole.entities.LandingPage.list(null, 1000);
        stats.landingPages.total = landingPages.length;
        // Count published OR paid landing pages
        stats.landingPages.published = landingPages.filter(lp => lp.status === 'published' || lp.status === 'paid').length;

        // Recent Activity
        const recentActivity = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 10);

        // Recent Users with acquisition source info (last 20)
        const recentUsers = users
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
            .slice(0, 20)
            .map(u => ({
                id: u.id,
                full_name: u.full_name,
                email: u.email,
                created_date: u.created_date,
                status: u.status,
                acquisition_source: u.acquisition_source || null,
                last_visit_source: u.last_visit_source || null
            }));

        return Response.json({ stats, recentActivity, recentUsers });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});