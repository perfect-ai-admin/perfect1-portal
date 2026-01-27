import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import slugify from 'npm:slugify@1.6.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
        console.log('publishLandingPage function invoked by user:', user.email);

        const { landingPageId, action = 'publish' } = await req.json();
        console.log(`Action: ${action}, LandingPageId: ${landingPageId}`);
        
        if (!landingPageId) {
            return Response.json({ error: 'Landing page ID required' }, { status: 400 });
        }

        // Get the landing page
        const page = await base44.entities.LandingPage.get(landingPageId);
        
        if (!page || page.created_by !== user.email) {
            return Response.json({ error: 'Unauthorized or page not found' }, { status: 403 });
        }

        // Action: mark as paid (after payment)
        if (action === 'markPaid') {
            const updatedPage = await base44.entities.LandingPage.update(landingPageId, {
                status: 'paid',
                paid_at: new Date().toISOString()
            });
            return Response.json({
                success: true,
                message: 'תשלום אושר',
                status: 'paid'
            });
        }

        // Action: publish to air (requires paid status or already published)
        if (action === 'publish' || !action) {
            // Idempotency: if already published, return existing URL
            if (page.status === 'published' && page.slug) {
                const publicDomain = Deno.env.get('LANDING_PAGE_PUBLIC_DOMAIN') || 'perfect1.co.il';
                const publicUrl = `https://${publicDomain}/${page.slug}`;
                console.log(`[IDEMPOTENT] Page already published, returning URL: ${publicUrl}`);
                return Response.json({
                    success: true,
                    message: 'הדף כבר פורסם',
                    url: publicUrl,
                    slug: page.slug,
                    status: 'published',
                    isIdempotent: true
                });
            }

            if (page.status !== 'paid') {
                console.error(`Attempted to publish unpaid page: ${landingPageId} (status: ${page.status})`);
                return Response.json({ error: 'Only paid pages can be published' }, { status: 400 });
            }

            // Generate unique slug if not exists
            let finalSlug = page.slug;
            if (!finalSlug) {
                const baseSlug = slugify(page.business_name || 'landing', { lower: true, strict: true, locale: 'he' }) || 'landing';
                finalSlug = baseSlug;
                
                // Retry logic for uniqueness
                let counter = 2;
                let retries = 0;
                while (retries < 5) {
                    try {
                        const existing = await base44.asServiceRole.entities.LandingPage.filter({ slug: finalSlug });
                        if (!existing || existing.length === 0) {
                            break;
                        } else {
                            finalSlug = `${baseSlug}-${counter}`;
                            counter++;
                        }
                    } catch (e) {
                        console.error('Slug check error:', e);
                        break;
                    }
                    retries++;
                }
            }

            // Update status to published + set published_at + ensure slug
            const updatedPage = await base44.entities.LandingPage.update(landingPageId, {
                slug: finalSlug,
                status: 'published',
                published_at: new Date().toISOString()
            });

            // Generate the public domain URL
            const publicDomain = Deno.env.get('LANDING_PAGE_PUBLIC_DOMAIN') || 'perfect1.co.il';
            const publicUrl = `https://${publicDomain}/${finalSlug}`;
            console.log(`[SUCCESS] Final published URL: ${publicUrl} (slug: ${finalSlug})`);

            return Response.json({
                success: true,
                message: 'הדף שלך באוויר 🎉',
                url: publicUrl,
                slug: finalSlug,
                status: 'published',
                isIdempotent: false
            });
        }
    } catch (error) {
        console.error('Error in landing page workflow:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});