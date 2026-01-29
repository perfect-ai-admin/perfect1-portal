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

                **עיצוב ממוקד UX/UI (Mandatory):**
                1. **מבנה ויזואלי סימטרי ומאוזן:** בעת יצירת התוכן, חשוב על האופן שבו הוא יוצג ויזואלית. ודא שהתוכן תומך בפריסה מאוזנת וסימטרית. בסעיפים דוגמת 'למי זה כן/לא מתאים' ו'למה זה שונה', ודא שפריטי הרשימה או ההשוואה הם בעלי משקל ויזואלי דומה (אורך טקסט, מספר בולטים) כדי למנוע חוסר סימטריה.
                2. **קריאות וסריקה:** השתמש בשפה ברורה, קצרה וקולעת שניתנת לסריקה מהירה. הקפד על שימוש בבולטים, רשימות ממוספרות ופסקאות קצרות כדי לשפר את קריאות התוכן ואת יכולת הסריקה הוויזואלית שלו. כל כותרת ותת-כותרת צריכה להכווין את העין ולהעביר מסר מיידי וברור.
                3. **הבחנה בין סקשנים:** כל סקשן צריך להרגיש כמו יחידה נפרדת וברורה, עם כותרת ייחודית ותוכן התומך במסר שלה, ובו בזמן להשתלב בהרמוניה עם שאר הדף.
                4. **image_prompt מדויקים:** צור תיאורים עשירים ומדויקים שישקפו את הטון והאווירה הבוגרת והאנושית, ויתאימו לעיצוב נקי ומודרני.

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
                6. **HUMAN_VOICE (קול אנושי - חובה):** עד 3 פריטים מגוונים:
                   - **ציטוט לקוח:** עדות אותנטית ומפורטת, כולל שם הלקוח ותיאור קצר (למשל, 'בעל עסק בתחום ה-X')
                   - **מסר ממייסד/ת:** פסקה אישית המביעה את הערכים, החזון והמחויבות של העסק ללקוחותיו, עם דגש על אותנטיות ורגש
                   - **סיפור אנושי:** חוויה עמוקה וקונקרטית של משהו שקרה ללקוח או לעסק
                   זרז מגוון בקולות האנושיים המתקבלים כדי להעביר בטחון ואמינות רחבה
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
                - [ ] SUITED_FOR יש בהכרח עם למי זה כן ולמי זה לא?
                - [ ] PAIN_EXPANSION מוגדר בהכרח?
                - [ ] HOW_IT_WORKS עם 3 שלבים בהכרח?
                - [ ] WHY_US עם השוואה עדינה בהכרח?
                - [ ] HUMAN_VOICE עם עד 3 פריטים מגוונים (ציטוט, מסר ממייסד, סיפור)?
                - [ ] CONTACT עם cta_micro_text בהכרח?
                - [ ] הטון = ביטחון שקט, לא אגרסיביות?
                - [ ] אין "AI-ית" או שיווק פוסע?
                - [ ] כל התשובות בעברית מושלמת?
                - [ ] סימטריה ויזואלית בסעיפים דוגמת SUITED_FOR ו-WHY_US?
                - [ ] קריאות גבוהה וקל לסריקה בכל סעיף?

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
                Return a JSON object with ALL 8 sections in EXACT order:
                {
                    "headline": "Main Hero Headline",
                    "subheadline": "Main Hero Subheadline",
                    "sections_json": [
                        { 
                            "type": "hero", 
                            "title": "כותרת ראשית",
                            "subtitle": "תת-כותרת",
                            "hero_expansion": "פסקה קצרה: למי זה? איזו בעיה? מה התוצאה?",
                            "ctaText": "טקסט כפתור", 
                            "image_prompt": "תיאור ויזואלי" 
                        },
                        {
                            "type": "suited_for",
                            "title": "למי זה מתאים / לא מתאים",
                            "suited": ["בולט 1", "בולט 2", "בולט 3"],
                            "not_suited": ["לא מתאים אם 1", "לא מתאים אם 2"]
                        },
                        { 
                            "type": "pain_expansion", 
                            "title": "מה הבעיה שלך?",
                            "description": "פסקה שמחברת רגשית: איך זה מרגיש, למה נשאר תקוע, המחיר של כושל",
                            "items": [{ "title": "כאב 1", "description": "..." }]
                        },
                        { 
                            "type": "how_it_works", 
                            "title": "איך זה עובד",
                            "steps": [
                                { "step": 1, "title": "מה אתה עושה", "description": "הפעולה שלך" },
                                { "step": 2, "title": "מה קורה בשלנו", "description": "העבודה מאחוריי הקלעים" },
                                { "step": 3, "title": "מה אתה מקבל", "description": "התוצאה המוחשית" }
                            ]
                        },
                        { 
                            "type": "why_us", 
                            "title": "למה זה שונה",
                            "description": "השוואה עדינה מול לבד / אדם רגיל / חד-פעמי",
                            "items": [{ "title": "יתרון 1", "description": "..." }]
                        },
                        { 
                            "type": "human_voice", 
                            "title": "מה אומרים עלינו",
                            "items": [
                                {
                                    "type": "testimonial",
                                    "content": "ציטוט לקוח משכנע...",
                                    "author": "שם הלקוח",
                                    "role": "תפקיד / סוג עסק"
                                },
                                {
                                    "type": "founder_message",
                                    "content": "מסר אישי מהמייסד על הערכים...",
                                    "author": "שם המייסד",
                                    "role": "מייסד/ת"
                                },
                                {
                                    "type": "customer_story",
                                    "content": "סיפור אנושי עמוק על חוויה משמעותית...",
                                    "author": "שם הלקוח",
                                    "role": "לקוח"
                                }
                            ]
                        },
                        { 
                            "type": "faq", 
                            "title": "שאלות נפוצות",
                            "items": [
                                { "question": "כמה זה עולה? יש התחייבות?", "answer": "..." }, 
                                { "question": "למי זה לא מתאים?", "answer": "..." }, 
                                { "question": "כמה זמן זה לוקח?", "answer": "..." }, 
                                { "question": "מה אם לא אהבתי?", "answer": "..." }, 
                                { "question": "מה קורה אחרי שאני משאיר פרטים?", "answer": "..." }
                            ] 
                        },
                        { 
                            "type": "contact", 
                            "title": "בואו נדבר",
                            "subtitle": "אנחנו כאן לעזור",
                            "cta_micro_text": "בלי התחייבות • שיחה אחת בלבד • לא נשלח ספאם",
                            "form_fields": ["name", "phone", "email"], 
                            "phone": "מספר טלפון",
                            "whatsapp": "מספר וואטסאפ"
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
                                    items: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, role: { type: "string" }, step: { type: "number" }, type: { type: "string" }, content: { type: "string" }, author: { type: "string" } }, additionalProperties: true } },
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

        // ⚠️ STRICT FALLBACK - אם LLM נכשלה, יש לנו סקסטון חלקי ולא שלם
        // זה לעולם לא אמור להיקרא אם הפרומפט עובד כמו שצריך
        const fallbackSections = [
            {
                type: 'hero',
                title: data.headline || data.businessName || 'עסק חדש',
                subtitle: data.subheadline || 'הפתרון המושלם עבורך',
                hero_expansion: 'שדה זה צריך להיות מוגדר בפרומפט. אם אתה קורא זאת, הפרומפט נכשל.',
                ctaText: 'בואו נדבר',
                image_prompt: 'professional business image'
            }
            // ⚠️ אם זה נתקע כאן, LLM לא יצרה את כל 8 הסקשנים כמו שדרוש
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