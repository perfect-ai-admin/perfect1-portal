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
                אתה **קופירייטר בוגר (Seasoned Copywriter)** וארט-דירקטור עם התמחות בפסיכולוגיה צרכנית, בניית אמון ו-CRO.
                המשימה שלך: לקחת את המידע הבסיסי שהמשתמש סיפד, **ולהמציא מאפס** עולם תוכן עשיר, משכנע, עמוק, אנושי וראציונלי.

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

                **5. Aggressiveness Calibration (חובה)**
                קבע רמה 1-5:
                1 = רך, מחבק, חינוכי
                3 = מאוזן, משכנע, בוגר, אנושי
                5 = דחיפה חזקה, אגרסיבי
                ⚠️ ברירת המחדל = 3. לעולם לא תעלה מעל 3 אלא אם המשתמש ביקש בפירוש
                השתמש בזה לעיצוב כותרות, CTA וניסוח pain points בדרך המשקפת ביטחון שקט + אנושיות

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

                **עקרונות הכתיבה והיצירה (Mandatory):**
                1. **כותרות משכנעות:** ברורות, קשורות למציאות, עם ערך ממשי. לא משפטים יבשים.
                2. **עומק רגשי אנושי:** דבר על הפחדים, התקוות של הלקוח. בדרך בוגרת, לא דרמטית.
                3. **טון: ביטחון שקט, לא אגרסיביות:** אל תכתוב "זה משנה חיים" או "מהפכה". כתוב "יש לנו תהליך ברור שעובד".
                4. **CTA בוגר:** לא "צור קשר" או "בדוק חינם". אלא: "בואו נדבר על איך זה יכול לעבוד בשבילך", "השארת פרטים – ללא התחייבות, שיחה אחת בלבד".
                5. **מילוי פערים בהגיון:** אם חסרות הוכחות – תמציא גנריות אך אמינות ("לקוחות מדווחים"). אם חסרים שלבים – תבנה תהליך הגיוני.
                6. **ויזואליות עשירה:** תאר image_prompt-ים שמשדרים אווירה, רגש, בוגרות.

                **מבנה הדף המנצח (Mandatory Structure):**
                1. **HERO:** כותרת קיימת + hero_expansion = פסקה קצרה שמבהירה (למי זה? איזו בעיה? מה התוצאה?).
                2. **SUITED_FOR (סינון קהל - חובה):** בלוק קצר עם:
                   - "למי זה כן מתאים" (3-5 בולטים)
                   - "למי זה פחות מתאים" (2-3 בולטים)
                   המטרה: להרגיש "זה בדיוק אני"
                3. **PAIN_EXPANSION (הרחבת כאבים - חובה):** פסקה שמחברת רגשית:
                   - איך זה מרגיש ביום-יום
                   - למה זה נשאר תקוע
                   - מה המחיר של לא לטפל (לא להפחיד - לשקף)
                4. **HOW_IT_WORKS (תהליך - חובה):** בלוק 3 שלבים:
                   - שלב 1: מה המשתמש עושה (הפעולה שלו)
                   - שלב 2: מה קורה מאחורי הקלעים (העבודה שלנו)
                   - שלב 3: מה הוא מקבל בפועל (התוצאה המוחשית)
                5. **WHY_US (בידול - חובה):** השוואה עדינה מול:
                   - פתרון לבד / אדם "רגיל" / חד-פעמי
                   בלי לתקוף - רק להבהיר יתרון
                6. **HUMAN_VOICE (קול אנושי - חובה):** אחד מהאלה:
                   - ציטוט לקוח ("מה אמר עלינו")
                   - פסקה בגוף ראשון ("אנחנו מאמינים ש...")
                   - סיפור קצר ואנושי
                7. **FAQ (שאלות ותשובות - חובה):** 5-7 שאלות:
                   - מחיר/התחייבות
                   - למי לא מתאים
                   - זמן
                   - סיכון
                   - מה קורה אחרי השארת פרטים
                   - שאלות נוספות לפי הקשר
                8. **CONTACT (יצירת קשר - חובה):** טופס + מיקרו-טקסט:
                   - "בלי התחייבות"
                   - "שיחה אחת בלבד"
                   - "לא נשלח ספאם"

                DATA FROM USER (השתמש בנתונים אלו כבסיס, אך תרחיב אותם פי 10):
                ${promptContext}

                ⚠️ **שלב 2: כתיבה מודעת לניתוח** ⚠️
                כל מילה בדף תהיה מחוברת לניתוח שעשית בשלב 1.
                כל כותרת תרגיש "עליי" (personal).
                ה-CTA יפגע בדיוק ברגש הנכון.
                הדף ירגיש אנושי, לא תבניתי.

                ⚠️ **שלב 3: QA וביקורת עצמית** ⚠️
                לפני שתגיש את התשובה, בדוק:
                - [ ] כל 8 הסקשנים קיימים בסדר הנכון?
                - [ ] SUITED_FOR יש בהכרח?
                - [ ] PAIN_EXPANSION מוגדר בהכרח?
                - [ ] HOW_IT_WORKS עם 3 שלבים בהכרח?
                - [ ] WHY_US עם השוואה עדינה בהכרח?
                - [ ] HUMAN_VOICE עם ציטוט או פסקה בגוף ראשון בהכרח?
                - [ ] CONTACT עם cta_micro_text בהכרח?
                - [ ] הטון = ביטחון שקט, לא אגרסיביות?
                - [ ] אין "AI-ית" או שיווק פוסע?
                - [ ] כל התשובות בעברית מושלמת?

                TASK:
                Generate the JSON structure for this landing page in PERFECT NATIVE HEBREW.
                Be strategic. Build trust. Use mature, human language. NO aggressive marketing – just clear, helpful communication.

                REQUIRED SECTIONS (All mandatory, in order):
                1. hero (with hero_expansion)
                2. suited_for (with suited array and not_suited array)
                3. pain_expansion (with title, description, items)
                4. how_it_works (with 3 steps: step, title, description)
                5. why_us (with title, description, items)
                6. human_voice (with title, content - quotation or first-person paragraph)
                7. faq (with 5-7 Q&A pairs)
                8. contact (with title, subtitle, cta_micro_text)

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
                            minItems: 8,
                            maxItems: 8,
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string", enum: ["hero", "suited_for", "pain_expansion", "how_it_works", "why_us", "human_voice", "faq", "contact"] },
                                    title: { type: "string" },
                                    subtitle: { type: "string" },
                                    description: { type: "string" },
                                    hero_expansion: { type: "string" },
                                    content: { type: "string" },
                                    cta_micro_text: { type: "string" },
                                    ctaText: { type: "string" },
                                    image_prompt: { type: "string" },
                                    suited: { type: "array", items: { type: "string" }, minItems: 3 },
                                    not_suited: { type: "array", items: { type: "string" }, minItems: 2 },
                                    items: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, role: { type: "string" }, step: { type: "number" } }, additionalProperties: true } },
                                    steps: { type: "array", items: { type: "object", properties: { step: { type: "number" }, title: { type: "string" }, description: { type: "string" } }, required: ["step", "title", "description"] }, minItems: 3, maxItems: 3 },
                                    form_fields: { type: "array", items: { type: "string" } },
                                    phone: { type: "string" },
                                    whatsapp: { type: "string" }
                                },
                                required: ["type"]
                            }
                        }
                    },
                    required: ["headline", "subheadline", "sections_json"]
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