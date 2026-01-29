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
🎯 MISSION CRITICAL: Your response must have EXACTLY 8 sections in EXACT order or the system FAILS.

ROLE: אתה מומחה עולמי בדפי נחיתה - קופירייטר בוגר, ארט-דירקטור, UX/UI specialist.

MANDATORY STRUCTURE: 8 סקשנים בדיוק בסדר זה:
1. HERO
2. SUITED_FOR  
3. PAIN_EXPANSION
4. HOW_IT_WORKS
5. WHY_US
6. HUMAN_VOICE
7. FAQ
8. CONTACT

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

                **עיצוב ממוקד UX/UI (Mandatory - סטנדרט עולמי):**
                1. **סימטריה וחיזוקיות מלא:** זהו חוק בראש. בכל סעיף (SUITED_FOR, WHY_US, PAIN_EXPANSION, HOW_IT_WORKS), הפריטים יהיו בדיוק סימטריים בגודל וצורה ויזואלית.
                   - בSUITED_FOR: 3 בולטים ל"כן" + בדיוק 3 בולטים ל"לא" (אותו כמות, אותו אורך טקסט)
                   - בWHY_US: מינימום 4 יתרונות, כל אחד בדיוק באותו אורך טקסט ומבנה
                   - בPAIN_EXPANSION: בדיוק 4 כאבים (pain items), כל אחד מעוצב בדומה
                   - בHOW_IT_WORKS: בדיוק 3 שלבים, תמיד בסדר זה - משתמש → אנחנו → תוצאה
                2. **תוכן עשיר וגדול יותר:** כל סעיף צריך להיות ממלא-מסך בחיות. לא משפטים קצרים - תיאורים עמוקים.
                   - SUITED_FOR description: 2-3 משפטים מפורטים לכל בולט
                   - PAIN_EXPANSION items: כל כאב צריך תיאור רגשי עמוק של 2-3 משפטים
                   - WHY_US items: כל יתרון צריך הסבר קונקרטי של 2-3 משפטים
                   - HOW_IT_WORKS: כל שלב צריך תיאור מפורט של מה בדיוק קורה
                3. **קריאות וסריקה אופטימלית:** כל טקסט צריך להיות קל לקריאה עם:
                   - משפטים קצרים (עד 15 מילים)
                   - פסקאות עם רווח אוויר ברור
                   - בולטים עם תמונה ויזואלית קלה
                   - שימוש במספרים וסימנים לעומקיות
                4. **הבחנה גרפית בין סקשנים:** כל סקשן צריך צבע רקע שונה או מבנה ויזואלי ברור.
                5. **image_prompt עשיר וגבוה:** תיאורים מלאים של 1-2 משפטים לכל ויזואל, עם פרטים על אווירה, סגנון, ורגש.

                **📋 EXACT STRUCTURE - NO FLEXIBILITY:**

SECTION 1 - HERO:
{
  "type": "hero",
  "title": "כותרת משכנעת (5-10 מילים בדיוק)",
  "subtitle": "תת-כותרת (10-15 מילים בדיוק)",
  "hero_expansion": "פסקה 2-3 משפטים בדיוק: למי זה, איזו בעיה, מה התוצאה",
  "ctaText": "כתוב כפתור (4-6 מילים בדיוק)",
  "image_prompt": "תיאור ויזואלי עשיר 30-50 מילים בדיוק"
}

SECTION 2 - SUITED_FOR:
{
  "type": "suited_for",
  "title": "למי זה מתאים / לא מתאים",
  "suited": ["משפט 1", "משפט 2", "משפט 3"],
  "not_suited": ["משפט 1", "משפט 2", "משפט 3"]
}
⚠️ MUST: בדיוק 3 suited AND בדיוק 3 not_suited - לא יותר, לא פחות

SECTION 3 - PAIN_EXPANSION:
{
  "type": "pain_expansion",
  "title": "מה הבעיה שלך?",
  "description": "3-4 משפטים בדיוק",
  "items": [
    {"title": "כותרת קצרה", "description": "2-3 משפטים"},
    {"title": "כותרת קצרה", "description": "2-3 משפטים"},
    {"title": "כותרת קצרה", "description": "2-3 משפטים"},
    {"title": "כותרת קצרה", "description": "2-3 משפטים"}
  ]
}
⚠️ MUST: בדיוק 4 items בarray

SECTION 4 - HOW_IT_WORKS:
{
  "type": "how_it_works",
  "title": "איך זה עובד",
  "steps": [
    {"step": 1, "title": "אתה עושה...", "description": "2-3 משפטים"},
    {"step": 2, "title": "אנחנו עושים...", "description": "2-3 משפטים"},
    {"step": 3, "title": "אתה מקבל...", "description": "2-3 משפטים"}
  ]
}
⚠️ MUST: בדיוק 3 steps בסדר הזה: משתמש → אנחנו → תוצאה

SECTION 5 - WHY_US:
{
  "type": "why_us",
  "title": "למה זה שונה",
  "description": "2-3 משפטים בדיוק",
  "items": [
    {"title": "יתרון 1", "description": "2-3 משפטים"},
    {"title": "יתרון 2", "description": "2-3 משפטים"},
    {"title": "יתרון 3", "description": "2-3 משפטים"},
    {"title": "יתרון 4", "description": "2-3 משפטים"}
  ]
}
⚠️ MUST: בדיוק 4 items בarrayI כל אחד שונה משמעותית

SECTION 6 - HUMAN_VOICE:
{
  "type": "human_voice",
  "title": "מה אומרים עלינו",
  "items": [
    {"type": "testimonial", "content": "ציטוט לקוח, 2-3 משפטים", "author": "שם", "role": "בעל עסק בתחום ה-X"},
    {"type": "founder_message", "content": "מסר מייסד, 2-3 משפטים", "author": "שם", "role": "מייסד/ת"},
    {"type": "customer_story", "content": "סיפור אנושי, 2-3 משפטים", "author": "שם", "role": "לקוח"}
  ]
}
⚠️ MUST: בדיוק 3 items בדיוק בסדר הזה: testimonial → founder_message → customer_story

SECTION 7 - FAQ:
{
  "type": "faq",
  "title": "שאלות נפוצות",
  "items": [
    {"question": "כמה זה עולה?", "answer": "2-4 משפטים"},
    {"question": "למי זה לא מתאים?", "answer": "2-4 משפטים"},
    {"question": "כמה זמן לוקח?", "answer": "2-4 משפטים"},
    {"question": "מה אם לא אהבתי?", "answer": "2-4 משפטים"},
    {"question": "מה קורה אחרי?", "answer": "2-4 משפטים"},
    {"question": "[שאלה 6 לפי הקשר]", "answer": "2-4 משפטים"},
    {"question": "[שאלה 7 לפי הקשר]", "answer": "2-4 משפטים"}
  ]
}
⚠️ MUST: בדיוק 7 items בarrayI כל תשובה קונקרטית וברורה

SECTION 8 - CONTACT:
{
  "type": "contact",
  "title": "בואו נדבר",
  "subtitle": "תיאור קצר 1 משפט",
  "cta_micro_text": "בלי התחייבות • שיחה אחת בלבד • לא נשלח ספאם",
  "form_fields": ["name", "phone", "email"],
  "phone": "מספר טלפון",
  "whatsapp": "מספר וואטסאפ"
}

                DATA FROM USER (השתמש בנתונים אלו כבסיס, אך תרחיב אותם פי 10):
                ${promptContext}

                ⚠️ **שלב 2: כתיבה מודעת לניתוח** ⚠️
                כל מילה בדף תהיה מחוברת לניתוח שעשית בשלב 1.
                כל כותרת תרגיש "עליי" (personal).
                ה-CTA יפגע בדיוק ברגש הנכון.
                הדף ירגיש אנושי, לא תבניתי.

                🔴 **VALIDATION - BEFORE RETURNING CHECK THESE EXACTLY:**

                ❌ אם לא מדויק - אל תחזור תשובה. חזור שגיאה.

                if (sections_json.length !== 8) → ERROR
                if (sections_json[0].type !== "hero" || !sections_json[0].hero_expansion) → ERROR
                if (sections_json[1].type !== "suited_for" || sections_json[1].suited.length !== 3 || sections_json[1].not_suited.length !== 3) → ERROR
                if (sections_json[2].type !== "pain_expansion" || sections_json[2].items.length !== 4) → ERROR
                if (sections_json[3].type !== "how_it_works" || sections_json[3].steps.length !== 3 || sections_json[3].steps[0].step !== 1 || sections_json[3].steps[1].step !== 2 || sections_json[3].steps[2].step !== 3) → ERROR
                if (sections_json[4].type !== "why_us" || sections_json[4].items.length !== 4) → ERROR
                if (sections_json[5].type !== "human_voice" || sections_json[5].items.length !== 3 || sections_json[5].items[0].type !== "testimonial" || sections_json[5].items[1].type !== "founder_message" || sections_json[5].items[2].type !== "customer_story") → ERROR
                if (sections_json[6].type !== "faq" || sections_json[6].items.length !== 7) → ERROR
                if (sections_json[7].type !== "contact" || !sections_json[7].cta_micro_text) → ERROR

                ⚠️ כל שגיאה = אל תחזור תוצאה חלקית. זה ייכשל את הדף.

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

        // 🔴 NO FALLBACK - אם LLM כשלה זה שגיאה שצריך להיחשף
        if (!generatedContent?.sections_json || generatedContent.sections_json.length !== 8) {
            throw new Error('LLM failed to generate exactly 8 sections with required structure. Check prompt compliance.');
        }

        const finalSections = generatedContent.sections_json;
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