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

        // If page exists but not published, attempt to publish it automatically
        if (page.status !== 'published') {
            console.log('[getPublicLandingPageById] Page not published, attempting auto-publish:', pageId);
            try {
                // Auto-publish if in paid or draft status
                if (page.status === 'paid' || page.status === 'draft') {
                    page = await base44.asServiceRole.entities.LandingPage.update(pageId, { status: 'published', published_at: new Date().toISOString() });
                    console.log('[getPublicLandingPageById] ✓ Auto-published page:', pageId);
                }
            } catch (updateErr) {
                console.warn('[getPublicLandingPageById] Auto-publish failed:', updateErr.message);
                // Continue anyway
            }
        }

        // Ensure sections_json is not empty
        if (!page.sections_json || !Array.isArray(page.sections_json) || page.sections_json.length === 0) {
            console.warn('[getPublicLandingPageById] Page has no sections, generating defaults');
            page.sections_json = [
                {
                    type: 'hero',
                    title: page.business_name || 'ברוך הבא',
                    subtitle: page.headline || 'אנחנו כאן לשרת אותך',
                    ctaText: 'צור קשר',
                    badge: 'פתרון מעולה'
                },
                {
                    type: 'contact',
                    title: 'בואו נדבר',
                    subtitle: 'אנחנו זמינים לכל שאלה',
                    form_fields: ['name', 'phone', 'email', 'message'],
                    phone: page.phone,
                    whatsapp: page.whatsapp
                }
            ];
        }

        console.log('[getPublicLandingPageById] ✓ Success! Returning page:', pageId);
        return Response.json(page);
    } catch (error) {
        console.error('[getPublicLandingPageById] Exception:', error.message, error.stack);
        return Response.json({ error: `Server error: ${error.message}` }, { status: 500 });
    }
});