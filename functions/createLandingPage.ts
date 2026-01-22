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
            // Construct a rich, detailed prompt based on questionnaire inputs
            const promptContext = `
            BUSINESS PROFILE:
            - Name: ${data.businessName}
            - Field: ${data.mainField}
            - Target Audience: ${data.targetAudience?.join(', ') || data.targetAudienceOther}
            
            PSYCHOLOGY & STRATEGY:
            - Customer Pain Points: ${data.painPoints}
            - Consequences of Inaction: ${data.consequences}
            - Unique Value Proposition: ${data.serviceOffered}
            - Why Choose Us: ${data.whyChooseYou?.join(', ')} ${data.whyChooseYouOther ? `(${data.whyChooseYouOther})` : ''}
            - Process: ${data.processSteps}
            
            TRUST & PROOF:
            - Experience: ${data.experienceYears} years
            - Proof Elements: ${data.proofs?.join(', ')}
            - Testimonial: "${data.testimonialText}"
            
            CONVERSION GOALS:
            - Desired Action: ${data.ctaTypes?.join(', ')}
            - CTA Button Text: ${data.ctaText}
            - Form Fields Needed: ${data.formFields?.join(', ')}
            
            DESIGN & TONE:
            - Style Preference: ${data.pageStyle}
            `;

            generatedContent = await base44.integrations.Core.InvokeLLM({
                prompt: `
                ROLE:
                You are Israel's top Conversion Rate Optimization (CRO) expert and Senior UX Copywriter.
                You build "High-Converting" landing pages that are visually rich, psychologically persuasive, and fully comprehensive.
                
                TASK:
                Generate a COMPLETE, LONG-FORM landing page JSON structure based on the business profile below.
                The content must be in native, persuasive Hebrew.
                
                THE PAGE MUST HAVE EXACTLY THESE 6 SECTIONS (in this order):
                1. HERO: High impact, big promise, immediate CTA.
                2. PAIN_POINTS: Sympathize with the customer's struggle (using the provided pain points).
                3. FEATURES_BENEFITS: How we solve it + The "Why Us" (competitive advantage).
                4. PROCESS / ABOUT: How it works (3 simple steps) OR About the business.
                5. SOCIAL_PROOF: Testimonials (use provided one, or generate 2 generic but realistic placeholders if missing) + Stats.
                6. FAQ: 4-5 relevant questions and answers that address objections.
                7. CONTACT: A lead form section + direct contact options.

                ${promptContext}

                CRITICAL GUIDELINES:
                - Tone: Match the '${data.pageStyle}' style requested.
                - Hero: Must be "Wow".
                - FAQ: Must be real objections customers in this field have (e.g., price, time, guarantee).
                - Contact Form: The JSON must specify which fields to show based on 'Form Fields Needed'.

                OUTPUT FORMAT:
                Return a JSON object with the following structure:
                {
                    "headline": "Main Hero Headline",
                    "subheadline": "Main Hero Subheadline",
                    "sections_json": [
                        { "type": "hero", "title": "...", "subtitle": "...", "ctaText": "..." },
                        { "type": "pain_points", "title": "...", "items": [{ "title": "...", "description": "..." }] },
                        { "type": "features", "title": "...", "items": [{ "title": "...", "description": "...", "icon": "check" }] },
                        { "type": "process", "title": "...", "steps": [{ "number": 1, "title": "...", "description": "..." }] },
                        { "type": "testimonials", "title": "...", "items": [{ "name": "...", "text": "...", "role": "..." }] },
                        { "type": "faq", "title": "...", "items": [{ "question": "...", "answer": "..." }] },
                        { 
                            "type": "contact", 
                            "title": "...", 
                            "subtitle": "...", 
                            "form_fields": ["name", "phone", ...], // based on input
                            "phone": "...", 
                            "whatsapp": "..." 
                        }
                    ]
                }
                `,
                response_json_schema: {
                    type: "object",
                    properties: {
                        headline: { type: "string" },
                        subheadline: { type: "string" },
                        sections_json: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string", enum: ["hero", "pain_points", "features", "process", "testimonials", "faq", "contact"] },
                                    title: { type: "string" },
                                    subtitle: { type: "string" },
                                    description: { type: "string" },
                                    ctaText: { type: "string" },
                                    items: { type: "array", items: { type: "object", additionalProperties: true } },
                                    steps: { type: "array", items: { type: "object", additionalProperties: true } },
                                    form_fields: { type: "array", items: { type: "string" } },
                                    phone: { type: "string" },
                                    whatsapp: { type: "string" }
                                },
                                required: ["type", "title"]
                            }
                        }
                    },
                    required: ["headline", "sections_json"]
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

        const finalSections = generatedContent?.sections_json || fallbackSections;
        const headline = generatedContent?.headline || data.headline || data.business_name;
        const subheadline = generatedContent?.subheadline || data.subheadline || '';

        // Create Entity
        // Note: created_by is automatically set by the backend based on the authenticated user token
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
            status: 'draft'
        };

        const result = await base44.entities.LandingPage.create(landingPage);

        return Response.json({ slug, id: result.id });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});