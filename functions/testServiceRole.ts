import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Test if service role works with different entities
        const users = await base44.asServiceRole.entities.User.list();
        const goals = await base44.asServiceRole.entities.Goal.list();
        const lps = await base44.asServiceRole.entities.LandingPage.list();
        
        return Response.json({
            usersCount: users.length,
            goalsCount: goals.length,
            landingPagesCount: lps.length,
            lpData: lps.slice(0, 2).map(p => ({ id: p.id, slug: p.slug, status: p.status, business: p.business_name }))
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});