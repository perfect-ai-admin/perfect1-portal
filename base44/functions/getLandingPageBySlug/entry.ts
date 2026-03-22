import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Public endpoint - returns published landing pages by slug
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { slug } = await req.json();

        if (!slug) {
            return Response.json({ error: 'Slug required' }, { status: 400 });
        }

        // Get landing page by slug (published only)
        const pages = await base44.asServiceRole.entities.LandingPage.filter({ 
            slug: slug,
            status: 'published'
        });

        if (!pages || pages.length === 0) {
            return Response.json({ error: 'Page not found' }, { status: 404 });
        }

        const page = pages[0];

        return Response.json({
            success: true,
            data: {
                id: page.id,
                slug: page.slug,
                business_name: page.business_name,
                headline: page.headline,
                subheadline: page.subheadline,
                phone: page.phone,
                whatsapp: page.whatsapp,
                primary_color: page.primary_color,
                logo_url: page.logo_url,
                sections_json: page.sections_json,
                published_at: page.published_at
            }
        });
    } catch (error) {
        console.error('Error fetching landing page:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});