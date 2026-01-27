import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import slugify from 'npm:slugify@1.6.6';

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

        // Generate unique slug if not exists
        let finalSlug = page.slug;
        if (!finalSlug) {
            const baseSlug = slugify(page.business_name || 'landing', { lower: true, strict: true, locale: 'he' }) || 'landing';
            finalSlug = baseSlug;
            
            // Check for uniqueness
            let counter = 2;
            let slugExists = true;
            while (slugExists) {
                try {
                    const existing = await base44.entities.LandingPage.filter({ slug: finalSlug });
                    if (!existing || existing.length === 0) {
                        slugExists = false;
                    } else {
                        finalSlug = `${baseSlug}-${counter}`;
                        counter++;
                    }
                } catch (e) {
                    slugExists = false;
                }
            }
        }

        // Update status to published + set published_at + ensure slug
        const updatedPage = await base44.entities.LandingPage.update(landingPageId, {
            slug: finalSlug,
            status: 'published',
            published_at: new Date().toISOString()
        });

        // Generate the public domain URL
        const publicDomain = 'perfect1.co.il';
        const publicUrl = `https://${publicDomain}/${finalSlug}`;

        return Response.json({
            success: true,
            message: 'הדף פורסם בהצלחה',
            url: publicUrl,
            slug: finalSlug,
            status: 'published'
        });
    } catch (error) {
        console.error('Error publishing landing page:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});