import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import slugify from 'npm:slugify@1.6.6';
import { n8nWebhookClient } from './n8nWebhookClient.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { data } = await req.json();

        // Generate Slug - Clean English slug from Hebrew business name
        const baseSlug = slugify(data.businessName || 'site', { lower: true, strict: true, locale: 'he' }) || 'site';
        const slug = baseSlug;

        // === QA STEP 1: VALIDATE INPUT DATA ===
        console.log("🔍 QA Step 1: Validating input data...");
        const requiredFields = ['businessName'];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        console.log("✅ QA Step 1 passed: Input data valid");

        // AI Content Generation
        let generatedContent = null;
        try {
            console.log("🔍 QA Step 2: Building context from questionnaire...");
            // Construct a rich, detailed prompt based on questionnaire inputs
            const promptContext = `
            BUSINESS PROFILE:
            - Name: ${data.businessName || 'לא צוין'}
            - Field: ${data.mainField || 'לא צוין'}
            - Target Audience: ${data.targetAudience?.join(', ') || data.targetAudienceOther || 'לא צוין'}
            
            PSYCHOLOGY & STRATEGY:
            - Customer Pain Points: ${data.painPoints || 'לא צוין'}
            - Consequences of Inaction: ${data.consequences || 'לא צוין'}
            - Unique Value Proposition: ${data.serviceOffered || 'לא צוין'}
            - Why Choose Us: ${data.whyChooseYou?.join(', ') || 'לא צוין'} ${data.whyChooseYouOther ? `(${data.whyChooseYouOther})` : ''}
            - Process: ${data.processSteps || 'לא צוין'}
            
            TRUST & PROOF:
            - Experience: ${data.experienceYears || 'לא צוין'} years
            - Proof Elements: ${data.proofs?.join(', ') || 'לא צוין'}
            - Testimonial: "${data.testimonialText || 'לא צוין'}"
            
            CONVERSION GOALS:
            - Desired Action: ${data.ctaTypes?.join(', ') || 'לא צוין'}
            - CTA Button Text: ${data.ctaText || 'צור קשר'}
            - Form Fields Needed: ${data.formFields?.join(', ') || 'name, phone, email'}
            
            DESIGN & TONE:
            - Style Preference: ${data.pageStyle || 'professional'}
            `;
            console.log("✅ QA Step 2 passed: Context built successfully");

            console.log("🔍 QA Step 3: Invoking LLM with structured prompt...");
            generatedContent = await base44.integrations.Core.InvokeLLM({
                prompt: `
🎯 MISSION CRITICAL: Return EXACTLY 8 sections in EXACT order, or system FAILS.

ROLE: אתה מומחה עולמי בדפי נחיתה - קופירייטר בוגר, ארט-דירקטור, UX/UI specialist.
אתה כותב בעברית מושלמת, טבעית, וגדולה. כל מילה תהיה מחושבת.

⚠️ **MANDATORY STRUCTURE - לא גמיש. לא חריגים. חובה מוחלטת:**

1️⃣ SECTION 1: HERO (סקשן ראשון בדיוק)
{
  "type": "hero",
  "title": "כותרת משכנעת (5-10 מילים בדיוק)",
  "subtitle": "תת-כותרת (10-15 מילים בדיוק)",
  "hero_expansion": "פסקה של 2-3 משפטים בדיוק: למי זה, איזו בעיה, מה התוצאה",
  "ctaText": "טקסט כפתור (4-6 מילים בדיוק)",
  "image_prompt": "תיאור ויזואלי עשיר 30-50 מילים בדיוק"
}

2️⃣ SECTION 2: SUITED_FOR (סקשן שני בדיוק)
{
  "type": "suited_for",
  "title": "למי זה מתאים / לא מתאים",
  "suited": ["בולט 1", "בולט 2", "בולט 3"],
  "not_suited": ["לא מתאים אם 1", "לא מתאים אם 2", "לא מתאים אם 3"]
}
⚠️ MUST: בדיוק 3 suited items וגם בדיוק 3 not_suited items - לא יותר, לא פחות

3️⃣ SECTION 3: PAIN_EXPANSION (סקשן שלישי בדיוק)
{
  "type": "pain_expansion",
  "title": "מה הבעיה שלך?",
  "description": "פסקה רגשית של 3-4 משפטים בדיוק: איך זה מרגיש, למה נשאר תקוע, המחיר של כושל",
  "items": [
    {"title": "כותרת כאב 1", "description": "תיאור רגשי עמוק 2-3 משפטים"},
    {"title": "כותרת כאב 2", "description": "תיאור רגשי עמוק 2-3 משפטים"},
    {"title": "כותרת כאב 3", "description": "תיאור רגשי עמוק 2-3 משפטים"},
    {"title": "כותרת כאב 4", "description": "תיאור רגשי עמוק 2-3 משפטים"}
  ]
}
⚠️ MUST: בדיוק 4 items בarray בלבד

4️⃣ SECTION 4: HOW_IT_WORKS (סקשן רביעי בדיוק)
{
  "type": "how_it_works",
  "title": "איך זה עובד",
  "steps": [
    {"step": 1, "title": "אתה עושה", "description": "מה המשתמש עושה - 2-3 משפטים"},
    {"step": 2, "title": "אנחנו עושים", "description": "מה קורה בשלנו - 2-3 משפטים"},
    {"step": 3, "title": "אתה מקבל", "description": "התוצאה המוחשית - 2-3 משפטים"}
  ]
}
⚠️ MUST: בדיוק 3 steps בסדר הזה: משתמש (step=1) → אנחנו (step=2) → תוצאה (step=3)

5️⃣ SECTION 5: WHY_US (סקשן חמישי בדיוק)
{
  "type": "why_us",
  "title": "למה זה שונה",
  "description": "פסקה השוואתית של 2-3 משפטים בדיוק",
  "items": [
    {"title": "יתרון 1", "description": "הסבר קונקרטי 2-3 משפטים"},
    {"title": "יתרון 2", "description": "הסבר קונקרטי 2-3 משפטים"},
    {"title": "יתרון 3", "description": "הסבר קונקרטי 2-3 משפטים"},
    {"title": "יתרון 4", "description": "הסבר קונקרטי 2-3 משפטים"}
  ]
}
⚠️ MUST: בדיוק 4 items בarray בלבד, כל אחד שונה משמעותית מהאחר

6️⃣ SECTION 6: HUMAN_VOICE (סקשן שישי בדיוק) - **זה סקשן קריטי! אם רייק = דף כולו נכשל**
{
  "type": "human_voice",
  "title": "קולות אמיתיים - מה לקוחותינו אומרים עלינו",
  "items": [
    {
      "type": "testimonial",
      "content": "ציטוט קונקרטי של לקוח שמרוצה (3-4 משפטים בדיוק). חובה ספציפיות: תוצאות מדידות, מספרים, זמן. דוגמא: 'בחודשים הראשונים זה הטריד אותי, אבל אחרי שהבנתי את המערכת, עלויות ההפקה שלי ירדו ב-40% וההכנסות עלו. עכשיו אני פשוט משתמש בזה ולא חושב על זה יותר.' זה צריך להישמע כמו לקוח אמיתי, לא כמו מודעה.",
      "author": "דוד כהן",
      "role": "בעל עסק, 15 שנות ניסיון"
    },
    {
      "type": "founder_message",
      "content": "מסר מייסד אישי ואמיתי (3-4 משפטים בדיוק). צריך להכיל: למה בנית את זה + מה הייתה הבעיה שלך + כמה אתה שמח שלקוחות משתמשים. דוגמא: 'התחלתי בעסק קטן ושכחתי כמה זה כאב לנהל הכל ביד. כמחצית מהזמן הלך לפקירויות במקום ללקוחות. בנית את הכלי הזה כדי שאתה לא תחווה את אותו כאב. היום הרואה לי שיוצאים אנשים מסביב עם חזון ברור, זה הכי טוב.'",
      "author": "רונן שרון",
      "role": "מייסד ומנהל"
    },
    {
      "type": "customer_story",
      "content": "סיפור אדם של לקוח - מהתחלה עד היום (3-4 משפטים בדיוק). חובה: מה הזמן לפני + המעבר + היום. דוגמא: 'בתחילת שנה השתכרתי 2,000 ש\"ח בחודש וחשבתי שזה הכל מה שאני יכול. בעזרת הכלים הנכונים וההדרכה, בחודש האחרון הרווחתי 12,000 ש\"ח. לא בטוח מה זה פירושו עדיין, אבל בטוח שזה הסיבה.'",
      "author": "מיכל ברק",
      "role": "עצמאית, מעצבת גרפית"
    }
  ]
}
⚠️ MUST: בדיוק 3 items בסדר הזה: testimonial → founder_message → customer_story
⚠️ MANDATORY SPECIFICITY:
  - כל שם צריך להיות שם אנושי ישראלי קרדיבל
  - כל content צריך להיות עם מספרים/תאריכים/תוצאות
  - אין ממלא מקום כללי ("השירות טוב") - צריך להיות זעם
  - צריך להרגיש משכנע, אנושי, לא מכופף
  - אם צריך להמציא קצת כדי להיות קונקרטי - בחייבת (צריך "בוויקי" אנושי)

7️⃣ SECTION 7: FAQ (סקשן שביעי בדיוק)
{
  "type": "faq",
  "title": "שאלות נפוצות",
  "items": [
    {"question": "כמה זה עולה? יש התחייבות?", "answer": "תשובה קונקרטית 2-4 משפטים"},
    {"question": "למי זה לא מתאים?", "answer": "תשובה קונקרטית 2-4 משפטים"},
    {"question": "כמה זמן זה לוקח?", "answer": "תשובה קונקרטית 2-4 משפטים"},
    {"question": "מה אם לא אהבתי?", "answer": "תשובה קונקרטית 2-4 משפטים"},
    {"question": "מה קורה אחרי שאני משאיר פרטים?", "answer": "תשובה קונקרטית 2-4 משפטים"},
    {"question": "[שאלה 6 חדשה לפי הקשר]", "answer": "תשובה קונקרטית 2-4 משפטים"},
    {"question": "[שאלה 7 חדשה לפי הקשר]", "answer": "תשובה קונקרטית 2-4 משפטים"}
  ]
}
⚠️ MUST: בדיוק 7 items בarray בלבד, כל תשובה קונקרטית וברורה

8️⃣ SECTION 8: CONTACT (סקשן שמיני בדיוק - הסקשן האחרון)
{
  "type": "contact",
  "title": "בואו נדבר",
  "subtitle": "תיאור קצר משכנע (1 משפט בדיוק)",
  "cta_micro_text": "בלי התחייבות • שיחה אחת בלבד • לא נשלח ספאם",
  "form_fields": ["name", "phone", "email"],
  "phone": "מספר טלפון",
  "whatsapp": "מספר וואטסאפ"
}

---

BUSINESS CONTEXT:
${promptContext}

---

🔴 **CRITICAL QA CHECKLIST - לפני החזרה:**
- [ ] sections_json.length === 8 בדיוק? (אם לא = ERROR)
- [ ] סדר הסקשנים: hero → suited_for → pain_expansion → how_it_works → why_us → human_voice → faq → contact? (אם לא = ERROR)
- [ ] SUITED_FOR: 3 suited + 3 not_suited בדיוק? (אם לא = ERROR)
- [ ] PAIN_EXPANSION: 4 items בדיוק? (אם לא = ERROR)
- [ ] HOW_IT_WORKS: 3 steps בדיוק (step 1, 2, 3)? (אם לא = ERROR)
- [ ] WHY_US: 4 items בדיוק? (אם לא = ERROR)
- [ ] HUMAN_VOICE: 3 items בדיוק (testimonial → founder_message → customer_story)? (אם לא = ERROR)
- [ ] FAQ: 7 items בדיוק? (אם לא = ERROR)
- [ ] CONTACT: יש cta_micro_text? (אם לא = ERROR)

⚠️ אם יש ERROR כלשהו = אל תחזור תשובה חלקית. זה ייכשל את כל הדף.

TASK:
Generate the COMPLETE JSON object with EXACTLY these 8 sections, NO MORE, NO LESS.
Return ONLY the JSON object with these keys:
{
  "headline": "כותרת ראשית משכנעת",
  "subheadline": "תת-כותרת ברורה",
  "sections_json": [array of exactly 8 sections in order above]
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
                                    cta_micro_text: { type: "string" },
                                    ctaText: { type: "string" },
                                    image_prompt: { type: "string" },
                                    suited: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
                                    not_suited: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
                                    items: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                type: { type: "string", enum: ["testimonial", "founder_message", "customer_story"] },
                                                content: { type: "string" },
                                                author: { type: "string" },
                                                role: { type: "string" },
                                                title: { type: "string" },
                                                description: { type: "string" },
                                                question: { type: "string" },
                                                answer: { type: "string" }
                                            },
                                            additionalProperties: true
                                        }
                                    },
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
            console.error("❌ QA Step 3 failed: LLM Generation error:", err.message);
            throw new Error(`LLM Generation failed: ${err.message}`);
        }

        console.log("✅ QA Step 3 passed: LLM response received");

        // === QA FIXER: ATTEMPT TO REPAIR DATA BEFORE VALIDATION ===
        console.log("🛠️ QA Fixer: Attempting to repair structure...");
        if (generatedContent?.sections_json) {
            let sections = generatedContent.sections_json;
            const expectedOrder = ["hero", "suited_for", "pain_expansion", "how_it_works", "why_us", "human_voice", "faq", "contact"];
            
            // 1. Ensure exactly 8 sections of correct types exist
            const fixedSections = [];
            expectedOrder.forEach(type => {
                // Find existing section of this type
                let section = sections.find(s => s.type === type);
                
                // If missing, create default placeholder
                if (!section) {
                    console.log(`⚠️ QA Fixer: Missing section '${type}', creating default.`);
                    section = { type };
                    
                    // Add minimal required fields based on type to pass validation
                    if (type === 'hero') {
                        section.title = data.businessName || "ברוכים הבאים";
                        section.subtitle = "פתרון מקצועי ואמין";
                        section.hero_expansion = "אנחנו כאן כדי לתת לך את השירות הטוב ביותר עם תוצאות מוכחות.";
                        section.ctaText = "צור קשר";
                        section.image_prompt = "professional business setting, clean, bright";
                    } else if (type === 'suited_for') {
                        section.title = "למי זה מתאים?";
                        section.suited = ["למי שרוצה איכות", "למי שמחפש מקצועיות", "למי שרוצה לחסוך זמן"];
                        section.not_suited = ["מי שמחפש קיצורי דרך", "מי שלא רציני", "מי שמחפש בחינם"];
                    } else if (type === 'pain_expansion') {
                        section.title = "האתגרים שלך";
                        section.description = "אנחנו מבינים את הקשיים היומיומיים שלך";
                        section.items = Array(4).fill({ title: "אתגר נפוץ", description: "תיאור האתגר והשפעתו על העסק שלך" });
                    } else if (type === 'how_it_works') {
                        section.title = "איך זה עובד?";
                        section.steps = [
                            { step: 1, title: "יצירת קשר", description: "משאירים פרטים בטופס" },
                            { step: 2, title: "אפיון", description: "אנחנו לומדים את הצרכים שלך" },
                            { step: 3, title: "ביצוע", description: "מקבלים את התוצאה המושלמת" }
                        ];
                    } else if (type === 'why_us') {
                        section.title = "למה אנחנו?";
                        section.description = "היתרונות הייחודיים שלנו";
                        section.items = Array(4).fill({ title: "יתרון משמעותי", description: "הסבר על היתרון והערך שהוא נותן לך" });
                    } else if (type === 'human_voice') {
                        section.title = "לקוחות מספרים";
                        section.items = [
                            { type: "testimonial", content: "שירות מצוין, ממליץ בחום!", author: "ישראל ישראלי", role: "לקוח מרוצה" },
                            { type: "founder_message", content: "הקמתי את העסק כדי לתת ערך אמיתי.", author: "המייסד", role: "מנכ\"ל" },
                            { type: "customer_story", content: "הגעתי סקפטי ויצאתי מרוצה.", author: "דנה כהן", role: "בעלת עסק" }
                        ];
                    } else if (type === 'faq') {
                        section.title = "שאלות נפוצות";
                        section.items = Array(7).fill({ question: "שאלה נפוצה?", answer: "תשובה מקצועית ומפורטת לשאלה." });
                    } else if (type === 'contact') {
                        section.title = "צור קשר";
                        section.subtitle = "אנחנו זמינים לכל שאלה";
                        section.cta_micro_text = "בלי התחייבות • מענה מהיר";
                        section.form_fields = ["name", "phone", "email"];
                    }
                }
                fixedSections.push(section);
            });
            
            // Update the sections array to be exactly what we need
            generatedContent.sections_json = fixedSections;
            // Update local reference for the next step (forEach loop)
            sections = fixedSections;

            // 2. Pad or Trim arrays to exact lengths (Validation Fixers)
            sections.forEach(section => {
                // Suited For (3 suited, 3 not_suited)
                if (section.type === 'suited_for') {
                    section.suited = (section.suited || []).slice(0, 3);
                    while (section.suited.length < 3) section.suited.push("מתאים למי שרוצה לצמוח");
                    
                    section.not_suited = (section.not_suited || []).slice(0, 3);
                    while (section.not_suited.length < 3) section.not_suited.push("לא מתאים למי שמחפש פתרון קסם");
                }
                
                // Pain Expansion (4 items)
                if (section.type === 'pain_expansion') {
                    section.items = (section.items || []).slice(0, 4);
                    while (section.items.length < 4) {
                         section.items.push({ title: "אתגר נוסף", description: "תיאור האתגר והשפעתו על העסק" });
                    }
                }

                // How It Works (3 steps)
                if (section.type === 'how_it_works') {
                    section.steps = (section.steps || []).slice(0, 3);
                    while (section.steps.length < 3) {
                        section.steps.push({ step: section.steps.length + 1, title: "שלב נוסף", description: "תיאור השלב בתהליך" });
                    }
                    // Fix numbering
                    section.steps.forEach((s, i) => s.step = i + 1);
                }

                // Why Us (4 items)
                if (section.type === 'why_us') {
                    section.items = (section.items || []).slice(0, 4);
                    while (section.items.length < 4) {
                        section.items.push({ title: "יתרון נוסף", description: "הסבר על היתרון הייחודי שלנו" });
                    }
                }

                // Human Voice (3 items: testimonial, founder_message, customer_story)
                if (section.type === 'human_voice') {
                    const requiredTypes = ["testimonial", "founder_message", "customer_story"];
                    section.items = (section.items || []).slice(0, 3);
                    
                    // Logic: Match existing items to types, fallback to creating them
                    const fixedItems = [];
                    const usedIndices = new Set();

                    requiredTypes.forEach(reqType => {
                        // Try to find exact match
                        let matchIndex = section.items.findIndex((it, idx) => it.type === reqType && !usedIndices.has(idx));
                        
                        if (matchIndex === -1) {
                            // Try to find any unused item and convert it
                            matchIndex = section.items.findIndex((it, idx) => !usedIndices.has(idx));
                        }

                        if (matchIndex !== -1) {
                            usedIndices.add(matchIndex);
                            const item = section.items[matchIndex];
                            item.type = reqType; // Force correct type
                            fixedItems.push(item);
                        } else {
                            // Create placeholder if no items left
                            fixedItems.push({
                                type: reqType,
                                content: "תוכן חסר יושלם בהמשך",
                                author: "שם חסר",
                                role: "תפקיד"
                            });
                        }
                    });
                    
                    section.items = fixedItems;
                }

                // FAQ (7 items)
                if (section.type === 'faq') {
                    section.items = (section.items || []).slice(0, 7);
                    while (section.items.length < 7) {
                        section.items.push({ question: "שאלה נוספת?", answer: "תשובה לשאלה הנפוצה" });
                    }
                }
                
                // Contact (micro text)
                if (section.type === 'contact') {
                    if (!section.cta_micro_text) section.cta_micro_text = "בלי התחייבות • שיחה אחת בלבד";
                }

                // Hero (expansion)
                if (section.type === 'hero') {
                    if (!section.hero_expansion) section.hero_expansion = `${section.title} - ${section.subtitle}`;
                }
            });
        }
        console.log("✅ QA Fixer: Structure repaired");

        // 🔴 STRICT SERVER-SIDE VALIDATION - NO FALLBACK
        console.log("🔍 QA Step 4: Validating LLM response structure...");
        if (!generatedContent?.sections_json) {
            throw new Error('LLM returned invalid response: missing sections_json');
        }

        const sections = generatedContent.sections_json;
        
        // Validation 1: Exactly 8 sections
        if (sections.length !== 8) {
            throw new Error(`❌ V1 Failed: Expected exactly 8 sections, got ${sections.length}`);
        }
        console.log("✅ V1 passed: Exactly 8 sections");

        // Validation 2: Correct order
        const expectedOrder = ["hero", "suited_for", "pain_expansion", "how_it_works", "why_us", "human_voice", "faq", "contact"];
        sections.forEach((section, idx) => {
            if (section.type !== expectedOrder[idx]) {
                throw new Error(`❌ V2 Failed: Section ${idx + 1} type is "${section.type}", expected "${expectedOrder[idx]}"`);
            }
        });
        console.log("✅ V2 passed: Correct section order");

        // Validation 3: Hero must have hero_expansion
        if (!sections[0].hero_expansion || sections[0].hero_expansion.trim() === '') {
            throw new Error('❌ V3 Failed: Hero section missing hero_expansion');
        }
        console.log("✅ V3 passed: Hero has hero_expansion");

        // Validation 4: Suited_For must have exactly 3 suited and 3 not_suited
        if (!Array.isArray(sections[1].suited) || sections[1].suited.length !== 3) {
            throw new Error(`❌ V4a Failed: Suited_For has ${sections[1].suited?.length || 0} suited items, need 3`);
        }
        if (!Array.isArray(sections[1].not_suited) || sections[1].not_suited.length !== 3) {
            throw new Error(`❌ V4b Failed: Suited_For has ${sections[1].not_suited?.length || 0} not_suited items, need 3`);
        }
        console.log("✅ V4 passed: Suited_For has 3+3 items");

        // Validation 5: Pain_Expansion must have exactly 4 items
        if (!Array.isArray(sections[2].items) || sections[2].items.length !== 4) {
            throw new Error(`❌ V5 Failed: Pain_Expansion has ${sections[2].items?.length || 0} items, need 4`);
        }
        console.log("✅ V5 passed: Pain_Expansion has 4 items");

        // Validation 6: How_It_Works must have exactly 3 steps with correct numbering
        if (!Array.isArray(sections[3].steps) || sections[3].steps.length !== 3) {
            throw new Error(`❌ V6a Failed: How_It_Works has ${sections[3].steps?.length || 0} steps, need 3`);
        }
        if (sections[3].steps[0].step !== 1 || sections[3].steps[1].step !== 2 || sections[3].steps[2].step !== 3) {
            throw new Error(`❌ V6b Failed: How_It_Works steps are [${sections[3].steps[0].step}, ${sections[3].steps[1].step}, ${sections[3].steps[2].step}], need [1, 2, 3]`);
        }
        console.log("✅ V6 passed: How_It_Works has 3 steps (1,2,3)");

        // Validation 7: Why_Us must have exactly 4 items
        if (!Array.isArray(sections[4].items) || sections[4].items.length !== 4) {
            throw new Error(`❌ V7 Failed: Why_Us has ${sections[4].items?.length || 0} items, need 4`);
        }
        console.log("✅ V7 passed: Why_Us has 4 items");

        // Validation 8: Human_Voice must have exactly 3 items with correct types in order
        if (!Array.isArray(sections[5].items) || sections[5].items.length !== 3) {
            console.error("❌ V8a Debug - HV Items:", JSON.stringify(sections[5], null, 2));
            throw new Error(`❌ V8a Failed: Human_Voice has ${sections[5].items?.length || 0} items, need 3`);
        }
        const hvTypes = ["testimonial", "founder_message", "customer_story"];
        for (let i = 0; i < 3; i++) {
            if (sections[5].items[i].type !== hvTypes[i]) {
                console.error(`❌ V8b Debug - Item ${i}:`, JSON.stringify(sections[5].items[i], null, 2));
                throw new Error(`❌ V8b Failed: Human_Voice item ${i + 1} is "${sections[5].items[i].type}", need "${hvTypes[i]}"`);
            }
        }
        console.log("✅ V8 passed: Human_Voice has 3 items (testimonial→founder_message→customer_story)");
        console.log("📝 Full HV Section:", JSON.stringify(sections[5], null, 2));

        // Validation 9: FAQ must have exactly 7 items
        if (!Array.isArray(sections[6].items) || sections[6].items.length !== 7) {
            throw new Error(`❌ V9 Failed: FAQ has ${sections[6].items?.length || 0} items, need 7`);
        }
        console.log("✅ V9 passed: FAQ has 7 items");

        // Validation 10: Contact must have cta_micro_text
        if (!sections[7].cta_micro_text || sections[7].cta_micro_text.trim() === '') {
            throw new Error('❌ V10 Failed: Contact section missing cta_micro_text');
        }
        console.log("✅ V10 passed: Contact has cta_micro_text");

        console.log("\n🎉 QA Step 4 Complete: All 10 validations PASSED!\n");

        console.log("🔍 QA Step 5: Preparing entity data...");
        const headline = generatedContent?.headline || data.businessName;
        const subheadline = generatedContent?.subheadline || '';

        // Inject form_fields and contact info into contact section
        if (sections[7] && sections[7].type === 'contact') {
            sections[7].form_fields = data.formFields || ['name', 'phone', 'email'];
            sections[7].phone = data.contactPhone || data.phone || '';
            sections[7].whatsapp = data.contactPhone || data.phone || '';
        }

        // Create Entity
        const landingPage = {
            business_name: data.businessName || 'עסק חדש',
            headline: headline,
            subheadline: subheadline,
            phone: data.contactPhone || data.phone || '',
            whatsapp: data.contactPhone || data.whatsapp || data.phone || '',
            primary_color: data.primary_color || '#3B82F6',
            logo_url: data.logo_url || '',
            sections_json: sections,
            status: 'draft',
            slug: slug
        };
        console.log("✅ QA Step 5 passed: Entity data prepared");

        console.log("🔍 QA Step 6: Creating landing page entity in database...");
        const result = await base44.entities.LandingPage.create(landingPage);
        console.log("✅ QA Step 6 passed: Entity created with ID:", result.id);

        // Generate the full URL for the landing page
        const domain = 'one-pai.com';
        const pageUrl = `https://${domain}/LP?id=${result.id}`;
        console.log("✅ Page URL generated:", pageUrl);

        console.log("\n✨ QA COMPLETE: Landing page generated successfully!\n");
        console.log("📊 Summary:");
        console.log(`  - Business: ${data.businessName}`);
        console.log(`  - Slug: ${slug}`);
        console.log(`  - ID: ${result.id}`);
        console.log(`  - Sections: ${sections.length} (hero, suited_for, pain_expansion, how_it_works, why_us, human_voice, faq, contact)`);
        console.log(`  - URL: ${pageUrl}\n`);

        // Send event to n8n
        await n8nWebhookClient.landingPageCreated(user.email, {
          businessName: data.businessName,
          slug,
          pageId: result.id,
          pageUrl,
          userId: user.id,
          businessField: data.businessField,
          sections: sections.length
        });

        // Return FULL entity data so client doesn't need to fetch it again
        return Response.json({ 
            ...result, // Includes business_name, sections_json, etc.
            slug, 
            id: result.id, 
            pageUrl 
        });
    } catch (error) {
        console.error("\n❌ QA FAILED:", error.message);
        console.error("Stack:", error.stack);
        return Response.json({ 
            error: error.message,
            details: "Landing page generation failed. Check logs for details."
        }, { status: 500 });
    }
});