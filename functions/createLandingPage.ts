import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import slugify from 'npm:slugify@1.6.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { data } = await req.json();

        // Generate Slug - Clean English slug from Hebrew business name
        const baseSlug = slugify(data.businessName || 'site', { lower: true, strict: true, locale: 'he' }) || 'site';
        const slug = baseSlug;

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
                אתה **קופירייטר על (World-Class Copywriter)** וארט-דירקטור עם התמחות בפסיכולוגיה צרכנית והמרה (CRO).
                המשימה שלך: לקחת את המידע הבסיסי שהמשתמש סיפק, **ולהמציא מאפס** עולם תוכן עשיר, משכנע, עמוק וסקסי.

                ⚠️ **חוק ברזל: תחשוב מחוץ לקופסה!** ⚠️
                אם המשתמש כתב "אני יועץ משכנתאות", אתה לא כותב "ייעוץ משכנתא".
                אתה כותב: "חוסכים לך מאות אלפי שקלים במשכנתא – כדי שתוכל לישון בשקט בלילה."

                **עקרונות הכתיבה והיצירה (Deep Work):**
                1. **משפטי מחץ (Punch Lines):** כל כותרת חייבת להיות "בעיטה בבטן" או "חיבוק חם". בלי משפטים יבשים.
                2. **עומק רגשי:** דבר על הפחדים, התקוות והחלומות של הלקוח, לא רק על "פיצ'רים".
                3. **הנעה לפעולה (Call to Action) אגרסיבית אך אלגנטית:** לא "צור קשר". אלא: "אני רוצה לחסוך כסף עכשיו", "בדוק את הזכאות שלך חינם".
                4. **מילוי פערים יצירתי:** אם חסר מידע (למשל, אין המלצות), **תמציא** המלצות גנריות אך אמינות שנשמעות אמיתיות (כמו "שירות מעולה ששינה לי את העסק"). אם חסרים שלבים בתהליך – תבנה תהליך הגיוני ומקצועי.
                5. **ויזואליות עשירה:** תאר תמונות רקע (image_prompt) שמשדרות אווירה, רגש ויוקרה.

                **מבנה הדף המנצח (The Winning Flow):**
                1. **HERO:** הבטחה ענקית + תמונה עוצרת נשימה.
                2. **STATS (הוכחה חברתית):** מספרים שמשדרים גודל והצלחה (גם אם צריך "להעריך" מספרים הגיוניים לתחום).
                3. **PAIN POINTS (הזדהות):** "למה קשה לך היום?" – כרטיסיות שמראות שאנחנו מבינים את הכאב.
                4. **THE SOLUTION (הפתרון):** איך אנחנו פותרים את זה? (עם אייקונים יפים).
                5. **PROCESS (הדרך להצלחה):** 3 שלבים פשוטים מ"כאב" ל"פתרון".
                6. **TESTIMONIALS (מה אומרים עלינו):** הוכחה חברתית חזקה.
                7. **FAQ (טיפול בהתנגדויות):** שאלות קשות ותשובות מרגיעות.
                8. **FINAL CTA:** סגירה חזקה ודחופה.

                DATA FROM USER (השתמש בנתונים אלו כבסיס, אך תרחיב אותם פי 10):
                ${promptContext}

                TASK:
                Generate the JSON structure for this landing page in PERFECT NATIVE HEBREW.
                Be creative. Be bold. Sell the dream, not just the product.

                REQUIRED SECTIONS (Map to JSON structure):
                Include all 8 sections defined above.

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
            business_name: data.businessName || 'עסק חדש',
            headline: headline,
            subheadline: subheadline,
            phone: data.phone || '',
            whatsapp: data.whatsapp || data.phone || '',
            primary_color: data.primary_color || '#3B82F6',
            logo_url: data.logo_url || '',
            sections_json: finalSections,
            status: 'draft',
            slug: ''
        };

        const result = await base44.entities.LandingPage.create(landingPage);

        // Generate the full URL for the landing page
        const domain = req.headers.get('host') || Deno.env.get('BASE_URL') || 'localhost:3000';
        const pageUrl = `https://${domain}/LP/${slug}`;

        return Response.json({ slug, id: result.id, pageUrl });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});