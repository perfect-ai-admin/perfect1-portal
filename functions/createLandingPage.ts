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
            
            DESIGN & TONE:
            - Style Preference: ${data.pageStyle} (Adjust the copy tone to match this style - e.g., 'luxury' needs elegant language, 'energetic' needs punchy language)
            `;

            generatedContent = await base44.integrations.Core.InvokeLLM({
                prompt: `
                ROLE:
                You are Israel's top Conversion Rate Optimization (CRO) expert and Senior UX Copywriter. 
                You specialize in building "High-Converting Landing Pages" that turn visitors into leads using psychological triggers.
                
                TASK:
                Create the full content structure for a landing page based on the detailed business profile below.
                The content must be in PERFECT, NATIVE HEBREW. 
                Do not translate literally - write as a local marketing expert.
                
                ${promptContext}

                GUIDELINES FOR SECTIONS:
                1. HERO SECTION:
                   - Headline: Must be a "Hook". Address the main benefit or the solution to the pain point immediately.
                   - Subheadline: Explain *how* we solve it and remove anxiety.
                   - CTA: Use the user's preferred text but make it compelling.

                2. FEATURES / BENEFITS (The "Why Us"):
                   - Don't just list features. Translate them into BENEFITS. 
                   - Use the "Why Choose Us" data to highlight competitive advantages.
                   - Keep descriptions punchy (2-3 lines max).

                3. SOCIAL PROOF (Trust):
                   - If a testimonial exists, format it beautifully.
                   - If experience years are mentioned, highlight them as an authority indicator.
                   - Use a "Trust Badge" style for credibility (e.g., "Over X years of experience").

                4. CONTACT / CONVERSION:
                   - Clear, friction-free call to action.
                   - Reiterate the value one last time (e.g., "Ready to stop [Pain Point]?").

                OUTPUT FORMAT:
                Return a JSON object matching the schema below.
                Ensure the 'sections' array contains objects with 'type': 'hero' | 'features' | 'contact'.
                You can add a 'text' type section for the "Process" or "About" if the input data supports it.
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