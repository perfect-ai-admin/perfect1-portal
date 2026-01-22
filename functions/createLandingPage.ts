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
                אתה מנהל מוצר בכיר (Head of Product) עם התמחות ב:
                UX/UI ברמה עולמית, CRO, SaaS & B2B Landing Pages, Mobile-first Design.
                המטרה שלך: לבנות דף נחיתה שממיר, נראה מקצועי, ברור, אמין — וגורם למשתמש לפעול בלי להתלבט.

                🎯 שלב 1 – הבנת המטרה
                לפני הכל: מה הפעולה המרכזית? מי המשתמש?

                🧱 שלב 2 – מבנה הדף (Hierarchy)
                הדף חייב לזרום כך: Hero -> חידוד הערך -> הבעיה -> הפתרון -> הוכחת אמינות -> פירוט חכם -> CTA -> סגירה.

                🧠 שלב 3 – Hero Section
                האם מבינים תוך 3 שניות: מה זה? למי זה? למה זה טוב?
                כותרת (H1) ברורה, תת-כותרת מסבירה, CTA בולט עם טקסט פעולה תוצאתי (לא "שלח").

                🧭 שלב 4 – חוויית משתמש (UX Flow)
                פעולה אחת מרכזית, בלי עומס, בלי קישורים מיותרים.

                🎨 שלב 5 – עיצוב (UI Principles)
                צבע ראשי אחד, פונטים קריאים, ריווחים גדולים (נשימה = אמינות).

                🖱️ שלב 6 – כפתורים ופעולות
                האם ברור מה יקרה? האם הטקסט תוצאתי? דוגמאות: "התחל עכשיו", "בדוק התאמה".

                📱 שלב 7 – Mobile First (קריטי)
                70% מהמשתמשים במובייל. טקסטים קצרים, גלילה חלקה.

                🧩 שלב 8 – אמינות
                למה שלא יקנו? שאלות נפוצות, הוכחות, שקיפות.

                🧠 משפט זהב: "אם צריך להסביר — זה לא ברור מספיק."

                DATA FROM USER (השתמש בנתונים אלו לבניית הדף):
                ${promptContext}

                TASK:
                Generate the JSON structure for this landing page in PERFECT NATIVE HEBREW based on the methodology above.

                REQUIRED SECTIONS (Map to JSON structure):
                1. HERO: High impact, big promise. MUST include an 'image_prompt' for background generation (English description).
                2. STATS: 3-4 impressive numbers/statistics that build authority (e.g., "500+ Clients", "98% Success").
                3. PAIN_POINTS: Sympathize with struggle.
                4. FEATURES_BENEFITS: Solution + Competitive Advantage.
                5. PROCESS: How it works (3 steps).
                6. TESTIMONIALS: Social Proof.
                7. FAQ: Real objections (4-5 items).
                8. CONTACT: Lead form (fields based on input).

                IMPORTANT: 
                - For the 'hero' section, provide an 'image_prompt' in English describing a high-quality, photorealistic professional background image suitable for this business.
                - For 'features' and 'process', try to suggest a 'lucide_icon' name if possible (e.g., "Shield", "Zap", "Clock").

                OUTPUT FORMAT:
                Return a JSON object with the following structure:
                {
                    "headline": "Main Hero Headline",
                    "subheadline": "Main Hero Subheadline",
                    "sections_json": [
                        { 
                            "type": "hero", 
                            "title": "...", 
                            "subtitle": "...", 
                            "ctaText": "...", 
                            "image_prompt": "modern office with happy people working, cinematic lighting, 4k" 
                        },
                        { 
                            "type": "stats", 
                            "items": [{ "value": "500+", "label": "לקוחות מרוצים" }, { "value": "100%", "label": "אחריות" }, { "value": "24/7", "label": "זמינות" }] 
                        },
                        { "type": "pain_points", "title": "...", "items": [{ "title": "...", "description": "..." }] },
                        { "type": "features", "title": "...", "items": [{ "title": "...", "description": "...", "icon": "Shield" }] },
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
                                    type: { type: "string", enum: ["hero", "stats", "pain_points", "features", "process", "testimonials", "faq", "contact"] },
                                    title: { type: "string" },
                                    subtitle: { type: "string" },
                                    description: { type: "string" },
                                    ctaText: { type: "string" },
                                    image_prompt: { type: "string" },
                                    items: { type: "array", items: { type: "object", additionalProperties: true } },
                                    steps: { type: "array", items: { type: "object", additionalProperties: true } },
                                    form_fields: { type: "array", items: { type: "string" } },
                                    phone: { type: "string" },
                                    whatsapp: { type: "string" }
                                },
                                required: ["type"]
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