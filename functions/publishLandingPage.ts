import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { slug } = await req.json();

        // Verify ownership via list filter (RLS handles the "created_by" check)
        const pages = await base44.entities.LandingPage.filter({ slug });
        if (!pages || pages.length === 0) {
            return Response.json({ error: 'Page not found or access denied' }, { status: 404 });
        }

        const page = pages[0];

        // Update status
        const updatedPage = await base44.entities.LandingPage.update(page.id, {
            status: 'published',
            paid_at: new Date().toISOString()
        });

        return Response.json({ success: true, slug: updatedPage.slug });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});