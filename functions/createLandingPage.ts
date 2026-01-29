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
                אתה **קופירייטר בוגר (World-Class Copywriter)** וארט-דירקטור עם התמחות בפסיכולוגיה צרכנית, אמון ובהמרות.
                המשימה שלך: לקחת את המידע הבסיסי שהמשתמש סיפד, **ולהמציא מאפס** עולם תוכן עשיר, משכנע, עמוק וראציונלי.

                ⚠️ **שלב 1: DEEP ANALYSIS (לפני כתיבה כלשהי)** ⚠️

                **1. Business Context Understanding**
                - קבע את סוג העסק (שירות / מוצר / דיגיטלי / פיזי)
                - הערך רמת תחרות בתחום
                - הסק את מחזור ההחלטה של הלקוח (מהיר / בינוני / ארוך)
                - קבע כמה אמון נדרש לפני קנייה

                **2. Audience & Persona Analysis**
                - מה רמת הידע של קהל היעד?
                - כמה ספקנים הם טבעית?
                - מה הם כבר ניסו שהכזיב אותם?
                - מה הם הכי מפחדים שיקרה אם יבחרו לא נכון?

                **3. Emotional State Inference**
                הסק את המצב הרגשי הדומיננטי של הלקוח כרגע:
                - לחץ / תסכול / חוסר ביטחון / שאפתנות / עייפות מהבטחות / חיפוש הקלה מהירה
                - בחר מצב אחד מרכזי + אחד משני

                **4. Purchase Readiness**
                קבע אם הקהל הוא: קר (צריך חינוך) / פושר (צריך אמון) / חם (צריך דחיפה)
                - זה קובע כמה מהר להציג CTA וכמה חזרות

                **5. Confidence & Trust Level**
                קבע רמה 1-5:
                1 = רך, מחבק, חינוכי
                3 = מאוזן, משכנע, בוגר
                5 = מוחלט, בטוח, סמכותי (בלא אגרסיביות)
                השתמש בזה לעיצוב כותרות, CTA וניסוח pain points בדרך המשקפת ביטחון שקט

                **6. Trust & Credibility Rules**
                - אם חסרות הוכחות: תמציא הוכחות גנריות אך אמינות
                - הימנע ממספרים קיצוניים
                - אל תמציא שמות מותגים או אנשים אמיתיים
                - השתמש בניסוחים כמו "לקוחות מדווחים", "בעלי עסקים מספרים"

                **7. Visual & Tone Direction**
                - בחר סגנון ויזואלי בהתאם לתחום + מצב רגשי
                - בחר טון כתיבה: סמכותי / חברי / חד / מרגיע

                ⚠️ **חוק ברזל: תחשוב מחוץ לקופסה!** ⚠️
                אם המשתמש כתב "אני יועץ משכנתאות", אתה לא כותב "ייעוץ משכנתא".
                אתה כותב: "חוסכים לך מאות אלפי שקלים במשכנתא – כדי שתוכל לישון בשקט בלילה."

                **עקרונות הכתיבה והיצירה (Deep Work):**
                1. **כותרות חזקות (Strong Headlines):** כל כותרת חייבת להיות ברורה, משכנעת וענינית. לא "בעיטה בבטן" אלא "משהו שדורש תשומת לב".
                2. **עומק רגשי אנושי:** דבר על הפחדים, התקוות והחלומות של הלקוח, לא רק על "פיצ'רים". אבל בדרך בוגרת, לא בעליצה.
                3. **הנעה לפעולה בוגרת:** לא "צור קשר". ולא "בדוק את הזכאות שלך חינם". אלא: "בואו נדבר על איך זה יכול לעבוד עבורך", "השארת פרטים – ללא התחייבות".
                4. **מילוי פערים יצירתי:** אם חסר מידע (למשל, אין המלצות), **תמציא** המלצות גנריות אך אמינות שנשמעות אמיתיות. אם חסרים שלבים בתהליך – תבנה תהליך הגיוני ומקצועי.
                5. **ויזואליות עשירה:** תאר תמונות רקע (image_prompt) שמשדרות אווירה, רגש ובגרות.

                **מבנה הדף המנצח (The Winning Flow):**
                1. **HERO:** כותרת ברורה + תת-כותרת שמבהירה את השאלות: למי זה? איזו בעיה? מה התוצאה?
                2. **SUITED_FOR (סינון קהל):** בלוק קצר שמסנן בהדגד: "למי זה כן מתאים" ו"למי זה פחות מתאים".
                3. **PAIN_EXPANSION (הרחבת הכאבים):** הרחבה של הכאבים – איך זה מרגיש ביום-יום, למה זה נשאר תקוע, מה המחיר של לא לטפל.
                4. **HOW_IT_WORKS (איך זה עובד):** שלב 1 = מה המשתמש עושה, שלב 2 = מה קורה מאחורי הקלעים, שלב 3 = מה הוא מקבל בפועל.
                5. **WHY_US (בידול):** למה זה שונה ממה שאני כבר מכיר? השוואה עדינה מול פתרונות קיימים.
                6. **HUMAN_VOICE (קול אנושי):** ציטוט לקוח או פסקה בגוף ראשון ("אנחנו מאמינים ש…") או סיפור קצר וספציפי.
                7. **FAQ (שאלות ותשובות):** מחיר/התחייבות, למי לא מתאים, זמן, סיכון, מה קורה אחרי השארת פרטים.
                8. **CONTACT (יצירת קשר):** בלוק ברור עם מיקרו-טקסט שמוריד חשש ("בלי התחייבות", "שיחה אחת בלבד", וכו').

                DATA FROM USER (השתמש בנתונים אלו כבסיס, אך תרחיב אותם פי 10):
                ${promptContext}

                ⚠️ **שלב 2: כתיבה מודעת לניתוח** ⚠️
                כל מילה בדף תהיה מחוברת לניתוח שעשית בשלב 1.
                כל כותרת תרגיש "עליי" (personal).
                ה-CTA יפגע בדיוק ברגש הנכון.
                הדף ירגיש אנושי, לא תבניתי.

                TASK:
                Generate the JSON structure for this landing page in PERFECT NATIVE HEBREW.
                Be creative. Be confident. Build trust, not just close sales. Use adult, mature language. Not aggressive marketing – strategic communication.

                REQUIRED SECTIONS (Map to JSON structure):
                Include ALL 8 sections defined above, in order.

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
                            "hero_expansion": "פסקה קצרה שמבהירה: למי זה מיועד, איזו בעיה נפתרת, מה התוצאה המקובלת.",
                            "ctaText": "...", 
                            "image_prompt": "..." 
                        },
                        {
                            "type": "suited_for",
                            "title": "למי זה מתאים / לא מתאים",
                            "suited": ["...", "...", "..."],
                            "not_suited": ["...", "..."]
                        },
                        { 
                            "type": "pain_points", 
                            "title": "...", 
                            "items": [{ "title": "...", "description": "..." }],
                            "pain_expansion": "פסקה שמחברת רגשית: איך זה מרגיש ביום-יום, למה זה נשאר תקוע, מה המחיר של לא לטפל."
                        },
                        { 
                            "type": "how_it_works", 
                            "title": "...", 
                            "steps": [
                                { "step": 1, "title": "מה אתה עושה", "description": "..." },
                                { "step": 2, "title": "מה קורה מאחורי הקלעים", "description": "..." },
                                { "step": 3, "title": "מה אתה מקבל", "description": "..." }
                            ]
                        },
                        { 
                            "type": "why_us", 
                            "title": "...",
                            "description": "השוואה עדינה מול פתרונות קיימים (לבד / איש מקצוע רגיל / פתרון חד-פעמי)",
                            "items": [{ "title": "...", "description": "..." }]
                        },
                        { 
                            "type": "human_voice", 
                            "title": "...",
                            "content": "ציטוט לקוח או פסקה בגוף ראשון או סיפור קצר וספציפי"
                        },
                        { 
                            "type": "faq", 
                            "title": "...", 
                            "items": [
                                { "question": "...(מחיר/התחייבות)", "answer": "..." }, 
                                { "question": "...(למי לא מתאים)", "answer": "..." }, 
                                { "question": "...(זמן)", "answer": "..." }, 
                                { "question": "...(סיכון)", "answer": "..." }, 
                                { "question": "...(מה קורה אחרי)", "answer": "..." }
                            ] 
                        },
                        { 
                            "type": "contact", 
                            "title": "...", 
                            "subtitle": "...",
                            "cta_micro_text": "בלי התחייבות / שיחה אחת בלבד / אנחנו כאן לשמוע",
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
                                    type: { type: "string", enum: ["hero", "suited_for", "pain_points", "how_it_works", "why_us", "human_voice", "faq", "contact"] },
                                    title: { type: "string" },
                                    subtitle: { type: "string" },
                                    description: { type: "string" },
                                    hero_expansion: { type: "string" },
                                    pain_expansion: { type: "string" },
                                    content: { type: "string" },
                                    cta_micro_text: { type: "string" },
                                    ctaText: { type: "string" },
                                    image_prompt: { type: "string" },
                                    suited: { type: "array", items: { type: "string" } },
                                    not_suited: { type: "array", items: { type: "string" } },
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
            slug: slug
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