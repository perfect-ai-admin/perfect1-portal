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
        
        // Get the current app ID from environment or request context
        const appId = Deno.env.get('BASE44_APP_ID');
        console.log('[getPublicLandingPage] App ID:', appId);
        
        if (!appId) {
            return Response.json({ error: 'App ID not configured' }, { status: 500 });
        }

        try {
            // Use rawQuery to bypass RLS restrictions for public landing pages
            const response = await fetch(`https://api.base44.com/v1/entities/LandingPage/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_ROLE_KEY') || ''}`,
                    'X-App-Id': appId
                },
                body: JSON.stringify({
                    filter: { slug: slug, status: 'published' }
                })
            });

            if (!response.ok) {
                // Fallback: try simple list and find
                const allPages = await base44.asServiceRole.entities.LandingPage.list();
                const page = allPages.find(p => p.slug === slug && p.status === 'published');
                
                if (!page) {
                    console.error('[getPublicLandingPage] Page not found for slug:', slug);
                    return Response.json({ error: 'Page not found' }, { status: 404 });
                }
                
                return Response.json(page);
            }

            const data = await response.json();
            const page = data.data ? data.data[0] : null;

            if (!page) {
                console.error('[getPublicLandingPage] Page not found for slug:', slug);
                return Response.json({ error: 'Page not found' }, { status: 404 });
            }

            return Response.json(page);
        } catch (fetchError) {
            console.error('[getPublicLandingPage] Fetch error:', fetchError.message);
            // Fallback: try to get all pages
            const allPages = await base44.asServiceRole.entities.LandingPage.list();
            const page = allPages.find(p => p.slug === slug && p.status === 'published');
            
            if (!page) {
                return Response.json({ error: 'Page not found' }, { status: 404 });
            }
            
            return Response.json(page);
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});