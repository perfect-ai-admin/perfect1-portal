import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        let slug;
        try {
            const body = await req.json();
            slug = body.slug;
        } catch (e) {
            return Response.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        if (!slug) {
            return Response.json({ error: 'Slug required' }, { status: 400 });
        }

        // Use service role to list all pages and find published one (most recent first)
        const allPages = await base44.asServiceRole.entities.LandingPage.list('-created_date', 1000);
        const page = allPages.find(p => p.slug === slug && p.status === 'published');

        if (!page) {
            return Response.json({ error: 'Page not found' }, { status: 404 });
        }

        // Return only the page data (not the full entity wrapper)
        return Response.json(page);
    } catch (error) {
        console.error('[getPublicLandingPage] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});