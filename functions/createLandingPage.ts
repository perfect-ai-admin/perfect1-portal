import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import slugify from 'npm:slugify@1.6.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { data } = await req.json();

        // Generate Slug
        // Fallback to 'site' if name is empty or non-latin chars result in empty slug
        const baseSlug = slugify(data.business_name || 'site', { lower: true, strict: true }) || 'site';
        const uniqueId = Math.random().toString(36).substring(2, 7);
        const slug = `${baseSlug}-${uniqueId}`;

        // Default Sections Structure if not provided
        const defaultSections = data.sections_json || [
            {
                type: 'hero',
                title: data.headline || data.business_name,
                subtitle: data.subheadline || 'הפתרון המושלם עבורך',
                ctaText: 'צור קשר',
                ctaLink: '#contact'
            },
            {
                type: 'features',
                title: 'למה לבחור בנו?',
                items: [
                    { title: 'שירות מקצועי', description: 'אנו מתמחים במתן שירות ברמה הגבוהה ביותר' },
                    { title: 'זמינות גבוהה', description: 'אנחנו כאן בשבילך כמעט בכל שעה' },
                    { title: 'מחירים הוגנים', description: 'תמורה מעולה למחיר ללא הפתעות' }
                ]
            },
            {
                type: 'contact',
                title: 'דברו איתנו',
                phone: data.phone,
                whatsapp: data.whatsapp || data.phone
            }
        ];

        // Map Data
        const landingPage = {
            slug,
            business_name: data.business_name || 'עסק חדש',
            headline: data.headline || data.business_name,
            subheadline: data.subheadline || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || data.phone || '',
            primary_color: data.primary_color || '#3B82F6',
            logo_url: data.logo_url || '',
            sections_json: defaultSections,
            status: 'draft',
            created_by: user.email
        };

        const result = await base44.entities.LandingPage.create(landingPage);

        return Response.json({ slug, id: result.id });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});