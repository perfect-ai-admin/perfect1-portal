import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        let pageId;
        try {
            const body = await req.json();
            pageId = body.pageId;
        } catch (e) {
            return Response.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        if (!pageId) {
            return Response.json({ error: 'Page ID required' }, { status: 400 });
        }

        console.log('[getPublicLandingPageById] Fetching page ID:', pageId);

        // Use service role to bypass RLS for published pages
        const page = await base44.asServiceRole.entities.LandingPage.get(pageId);

        if (!page) {
            console.log('[getPublicLandingPageById] Page not found:', pageId);
            return Response.json({ error: 'Page not found' }, { status: 404 });
        }

        if (page.status !== 'published') {
            console.log('[getPublicLandingPageById] Page not published:', pageId, 'status:', page.status);
            return Response.json({ error: 'Page not published' }, { status: 404 });
        }

        console.log('[getPublicLandingPageById] ✓ Returning page:', pageId);
        return Response.json(page);
    } catch (error) {
        console.error('[getPublicLandingPageById] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});