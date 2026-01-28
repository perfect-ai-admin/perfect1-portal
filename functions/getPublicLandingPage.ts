import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // This function is public, so no auth check required for the caller.
        // We use asServiceRole to fetch the page ONLY if it is published.

        const { slug } = await req.json();

        if (!slug) {
            return Response.json({ error: 'Slug required' }, { status: 400 });
        }

        console.log('[getPublicLandingPage] Searching for slug:', slug);
        const pages = await base44.asServiceRole.entities.LandingPage.filter({ slug });
        console.log('[getPublicLandingPage] Found pages:', pages.length, pages.map(p => ({ slug: p.slug, status: p.status })));
        const page = pages[0];

        if (!page) {
            console.error('[getPublicLandingPage] Page not found for slug:', slug);
            return Response.json({ error: 'Page not found' }, { status: 404 });
        }

        if (page.status !== 'published') {
            return Response.json({ error: 'Page is not published yet' }, { status: 403 });
        }

        return Response.json(page);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});