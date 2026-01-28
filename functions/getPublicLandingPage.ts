import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // This function is public, so no auth check required for the caller.
        // We use asServiceRole to fetch the page ONLY if it is published.

        let slug;
        try {
            const body = await req.json();
            slug = body.slug;
        } catch (e) {
            console.error('[getPublicLandingPage] JSON parse error:', e.message);
            return Response.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        if (!slug) {
            return Response.json({ error: 'Slug required' }, { status: 400 });
        }

        console.log('[getPublicLandingPage] Searching for slug:', slug);
        
        // With RLS updated to allow published pages, we can filter normally
        const pages = await base44.entities.LandingPage.filter({ slug });
        console.log('[getPublicLandingPage] Found pages with slug:', pages.length);
        const page = pages.find(p => p.status === 'published');

        if (!page) {
            console.error('[getPublicLandingPage] Published page not found for slug:', slug);
            return Response.json({ error: 'Page not found' }, { status: 404 });
        }

        return Response.json(page);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});