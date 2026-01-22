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
                You are a Senior Head of Product specializing in World-Class UX/UI, CRO, SaaS & B2B Landing Pages, and Mobile-first Design.
                Your goal: Build a landing page that converts, looks professional, clear, credible — and makes the user act without hesitation.

                METHODOLOGY (Strictly follow these 9 steps):
                1. GOAL: Define the main action (Lead/Sale) based on input.
                2. HIERARCHY: Flow must be: Hero -> Value -> Pain -> Solution -> Proof -> Details -> CTA -> Close.
                3. HERO: 3-second rule. Clear "What, For Whom, Why Good".
                4. UX FLOW: One main action. No clutter.
                5. UI PRINCIPLES: Readable fonts, whitespace = credibility.
                6. BUTTONS: Result-oriented text (e.g., "Get Proposal" not "Send").
                7. MOBILE FIRST: Short texts, scrollable flow.
                8. TRUST: Address "Why not buy?" with FAQs and Social Proof.
                9. FINAL CHECK: No wall of text. Clear next steps.

                GOLDEN RULE: "If you have to explain it, it's not clear enough."

                INPUT DATA:
                ${promptContext}

                TASK:
                Generate the JSON structure for this landing page in PERFECT NATIVE HEBREW.
                
                REQUIRED SECTIONS (Map to JSON structure):
                1. HERO: High impact, big promise.
                2. PAIN_POINTS: Sympathize with struggle.
                3. FEATURES_BENEFITS: Solution + Competitive Advantage.
                4. PROCESS: How it works (3 steps).
                5. TESTIMONIALS: Social Proof.
                6. FAQ: Real objections (4-5 items).
                7. CONTACT: Lead form (fields based on input).

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
                            "form_fields": ["name", "phone", ...], 
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