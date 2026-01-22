import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import slugify from 'npm:slugify@1.6.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { data } = await req.json();

        // Generate Slug
        const baseSlug = slugify(data.business_name || 'site', { lower: true, strict: true }) || 'site';
        const uniqueId = Math.random().toString(36).substring(2, 7);
        const slug = `${baseSlug}-${uniqueId}`;

        // AI Content Generation
        let generatedContent = null;
        try {
            console.log("Generating landing page content with AI...");
            generatedContent = await base44.integrations.Core.InvokeLLM({
                prompt: `
                You are an expert UX copywriter and web designer specializing in high-converting landing pages in Hebrew.
                
                Your task is to take the raw business information provided below and generate professional, engaging, and high-quality content for a landing page.
                Focus on user experience (UX), clarity, and persuasive copywriting. 
                The content MUST be in Hebrew.
                
                Raw Business Info:
                ${JSON.stringify(data, null, 2)}
                
                Generate a JSON object with the following structure for the landing page content. 
                Ensure the tone is appropriate for the business type (e.g., professional for lawyers, energetic for fitness trainers).
                
                Required JSON Structure:
                {
                    "headline": "Main Hero Headline (Short, punchy, benefit-driven)",
                    "subheadline": "Compelling subheadline that elaborates on the value proposition",
                    "sections": [
                        {
                            "type": "hero",
                            "title": "Same as headline",
                            "subtitle": "Same as subheadline",
                            "ctaText": "Strong Call to Action (e.g. Start Now, Talk to Us)",
                            "ctaLink": "#contact"
                        },
                        {
                            "type": "features",
                            "title": "Headline for features section (e.g. Why Choose Us?)",
                            "items": [
                                { "title": "Feature 1 Title", "description": "Benefit driven description" },
                                { "title": "Feature 2 Title", "description": "Benefit driven description" },
                                { "title": "Feature 3 Title", "description": "Benefit driven description" }
                            ]
                        },
                        {
                            "type": "contact",
                            "title": "Contact section headline",
                            "phone": "${data.phone || ''}",
                            "whatsapp": "${data.whatsapp || data.phone || ''}"
                        }
                    ]
                }
                `,
                response_json_schema: {
                    type: "object",
                    properties: {
                        headline: { type: "string" },
                        subheadline: { type: "string" },
                        sections: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    title: { type: "string" },
                                    subtitle: { type: "string" },
                                    ctaText: { type: "string" },
                                    ctaLink: { type: "string" },
                                    phone: { type: "string" },
                                    whatsapp: { type: "string" },
                                    items: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                title: { type: "string" },
                                                description: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    required: ["headline", "sections"]
                }
            });
        } catch (err) {
            console.error("LLM Generation failed:", err);
            // We will fallback to basic content if AI fails
        }

        // Fallback Content
        const fallbackSections = [
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

        const finalSections = generatedContent?.sections || fallbackSections;
        const headline = generatedContent?.headline || data.headline || data.business_name;
        const subheadline = generatedContent?.subheadline || data.subheadline || '';

        // Create Entity
        const landingPage = {
            slug,
            business_name: data.business_name || 'עסק חדש',
            headline: headline,
            subheadline: subheadline,
            phone: data.phone || '',
            whatsapp: data.whatsapp || data.phone || '',
            primary_color: data.primary_color || '#3B82F6',
            logo_url: data.logo_url || '',
            sections_json: finalSections,
            status: 'draft',
            created_by: user.email
        };

        const result = await base44.entities.LandingPage.create(landingPage);

        return Response.json({ slug, id: result.id });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});