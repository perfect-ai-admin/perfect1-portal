import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { landingPageId } = await req.json();
        
        if (!landingPageId) {
            return Response.json({ error: 'Landing page ID required' }, { status: 400 });
        }

        // Get the landing page
        const page = await base44.entities.LandingPage.get(landingPageId);
        
        if (!page || page.created_by !== user.email) {
            return Response.json({ error: 'Unauthorized or page not found' }, { status: 403 });
        }

        // Update status to published + set published_at
        const updatedPage = await base44.entities.LandingPage.update(landingPageId, {
            status: 'published',
            published_at: new Date().toISOString()
        });

        // Generate the public domain URL
        const publicDomain = Deno.env.get('PUBLIC_DOMAIN') || 'perfectone.biz';
        const publicUrl = `https://${publicDomain}/${updatedPage.slug}`;

        return Response.json({
            success: true,
            message: 'הדף פורסם בהצלחה',
            url: publicUrl,
            slug: updatedPage.slug,
            status: 'published'
        });
    } catch (error) {
        console.error('Error publishing landing page:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});