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

        // List all pages and find the published one with matching slug
        const allPages = await base44.asServiceRole.entities.LandingPage.list(undefined, 1000);
        const page = allPages.find(p => p.slug === slug && p.status === 'published');

        if (!page) {
            return Response.json({ error: 'Page not found' }, { status: 404 });
        }

        return Response.json(page);
    } catch (error) {
        console.error('[getPublicLandingPage] Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});