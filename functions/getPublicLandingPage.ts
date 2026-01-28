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
        
        // List all pages (asServiceRole bypasses RLS) and find the matching published page
        const allPages = await base44.asServiceRole.entities.LandingPage.list(undefined, 100);
        console.log('[getPublicLandingPage] Total pages available:', allPages.length);
        
        const page = allPages.find(p => p.slug === slug && p.status === 'published');
        console.log('[getPublicLandingPage] Found matching published page:', !!page);

        if (!page) {
            console.error('[getPublicLandingPage] Page not found for slug:', slug, 'status needed: published');
            // Debug: log what pages exist with this slug
            const allWithSlug = allPages.filter(p => p.slug === slug);
            console.log('[getPublicLandingPage] Pages with slug "' + slug + '":', allWithSlug.map(p => ({ status: p.status, id: p.id })));
            return Response.json({ error: 'Page not found' }, { status: 404 });
        }

        return Response.json(page);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});