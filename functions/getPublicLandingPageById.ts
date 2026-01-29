import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        console.log('[getPublicLandingPageById] Request received');
        const base44 = createClientFromRequest(req);
        
        let pageId;
        try {
            const body = await req.json();
            pageId = body.pageId;
            console.log('[getPublicLandingPageById] Parsed pageId:', pageId);
        } catch (e) {
            console.error('[getPublicLandingPageById] JSON parse error:', e.message);
            return Response.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        if (!pageId) {
            console.error('[getPublicLandingPageById] No pageId provided');
            return Response.json({ error: 'Page ID required' }, { status: 400 });
        }

        console.log('[getPublicLandingPageById] Fetching with service role:', pageId);

        // Use service role to bypass RLS
        const page = await base44.asServiceRole.entities.LandingPage.get(pageId);
        console.log('[getPublicLandingPageById] Got page:', { id: pageId, status: page?.status, business_name: page?.business_name });

        if (!page) {
            console.error('[getPublicLandingPageById] Page not found in database:', pageId);
            return Response.json({ error: 'Page not found' }, { status: 404 });
        }

        if (page.status !== 'published') {
            console.error('[getPublicLandingPageById] Page not published:', { id: pageId, status: page.status });
            return Response.json({ error: `Page not published (status: ${page.status})` }, { status: 403 });
        }

        console.log('[getPublicLandingPageById] ✓ Success! Returning page:', pageId);
        return Response.json(page);
    } catch (error) {
        console.error('[getPublicLandingPageById] Exception:', error.message, error.stack);
        return Response.json({ error: `Server error: ${error.message}` }, { status: 500 });
    }
});