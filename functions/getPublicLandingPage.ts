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
        
        // Use both regular and service role to debug
        try {
            const userPages = await base44.entities.LandingPage.filter({ slug });
            console.log('[getPublicLandingPage] User-scoped pages found:', userPages.length);
        } catch (e) {
            console.log('[getPublicLandingPage] User-scoped filter failed:', e.message);
        }
        
        const servicePages = await base44.asServiceRole.entities.LandingPage.filter({ slug });
        console.log('[getPublicLandingPage] Service-role pages found:', servicePages.length);
        
        if (servicePages.length === 0) {
            console.error('[getPublicLandingPage] No pages found for slug:', slug);
            return Response.json({ error: 'Page not found' }, { status: 404 });
        }
        
        const page = servicePages.find(p => p.status === 'published');

        if (!page) {
            console.error('[getPublicLandingPage] Published page not found for slug:', slug);
            console.log('[getPublicLandingPage] Found statuses:', servicePages.map(p => p.status));
            return Response.json({ error: 'Page is not published' }, { status: 403 });
        }

        return Response.json(page);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});