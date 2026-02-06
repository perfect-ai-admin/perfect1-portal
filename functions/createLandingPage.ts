import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import slugify from 'npm:slugify@1.6.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { data } = await req.json();

        if (!data?.businessName) {
            return Response.json({ error: 'Missing businessName' }, { status: 400 });
        }

        // Generate Slug
        const slug = slugify(data.businessName || 'site', { lower: true, strict: true, locale: 'he' }) || 'site';

        console.log(`🚀 Creating landing page for: ${data.businessName}`);

        // Build compact context
        const ctx = {
            name: data.businessName,
            field: data.mainField || '',
            audience: data.targetAudience?.join(', ') || data.targetAudienceOther || '',
            pain: data.painPoints || '',
            consequences: data.consequences || '',
            service: data.serviceOffered || '',
            why: data.whyChooseYou?.join(', ') || '',
            whyOther: data.whyChooseYouOther || '',
            process: data.processSteps || '',
            experience: data.experienceYears || '',
            proofs: data.proofs?.join(', ') || '',
            testimonial: data.testimonialText || '',
            cta: data.ctaTypes?.join(', ') || '',
            ctaText: data.ctaText || 'צור קשר',
            style: data.pageStyle || 'professional',
            formFields: data.formFields?.join(', ') || 'name, phone',
            phone: data.contactPhone || '',
        };

        // Generate content via LLM
        console.log("⏳ Calling LLM...");
        const generatedContent = await base44.integrations.Core.InvokeLLM({
            prompt: `צור דף נחיתה בעברית עבור: "${ctx.name}" (${ctx.field}).
קהל יעד: ${ctx.audience}. כאב: ${ctx.pain}. תוצאה של אי-פעולה: ${ctx.consequences}.
שירות: ${ctx.service}. למה לבחור: ${ctx.why} ${ctx.whyOther}. תהליך: ${ctx.process}.
ניסיון: ${ctx.experience} שנים. הוכחות: ${ctx.proofs}. המלצה: ${ctx.testimonial}.
CTA: ${ctx.cta}. טקסט כפתור: ${ctx.ctaText}. סגנון: ${ctx.style}.

החזר JSON עם headline, subheadline, ו-sections_json (מערך של 8 סקשנים בדיוק בסדר הבא):

1. hero: {type:"hero", title, subtitle, hero_expansion, ctaText, image_prompt}
2. suited_for: {type:"suited_for", title, suited:[3 strings], not_suited:[3 strings]}
3. pain_expansion: {type:"pain_expansion", title, description, items:[4x {title, description}]}
4. how_it_works: {type:"how_it_works", title, steps:[{step:1,title,description},{step:2,...},{step:3,...}]}
5. why_us: {type:"why_us", title, description, items:[4x {title, description}]}
6. human_voice: {type:"human_voice", title, items:[{type:"testimonial",content,author,role},{type:"founder_message",content,author,role},{type:"customer_story",content,author,role}]}
7. faq: {type:"faq", title, items:[7x {question, answer}]}
8. contact: {type:"contact", title, subtitle, cta_micro_text:"בלי התחייבות • מענה מהיר", form_fields:["name","phone","email"], phone:"${ctx.phone}", whatsapp:"${ctx.phone}"}

כתוב עברית טבעית, משכנעת, עם מספרים ותוצאות. כל ציטוט חייב לכלול שם ישראלי אמין ותפקיד.`,
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
                                type: { type: "string" },
                                title: { type: "string" },
                                subtitle: { type: "string" },
                                description: { type: "string" },
                                hero_expansion: { type: "string" },
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
                required: ["headline", "subheadline", "sections_json"]
            }
        });

        console.log("✅ LLM response received");

        if (!generatedContent?.sections_json) {
            throw new Error('LLM returned invalid response: missing sections_json');
        }

        // === REPAIR STRUCTURE ===
        const expectedOrder = ["hero", "suited_for", "pain_expansion", "how_it_works", "why_us", "human_voice", "faq", "contact"];
        let sections = generatedContent.sections_json;

        // Ensure all 8 sections exist in correct order
        const fixedSections = expectedOrder.map(type => {
            let section = sections.find(s => s.type === type);
            if (!section) {
                console.log(`⚠️ Missing section '${type}', creating default`);
                section = createDefaultSection(type, data);
            }
            return section;
        });
        sections = fixedSections;

        // Fix array lengths
        fixSectionArrays(sections, data);

        // Inject contact info
        const contactSection = sections[7];
        if (contactSection) {
            contactSection.form_fields = data.formFields || ['name', 'phone', 'email'];
            contactSection.phone = ctx.phone;
            contactSection.whatsapp = ctx.phone;
            if (!contactSection.cta_micro_text) contactSection.cta_micro_text = "בלי התחייבות • מענה מהיר";
        }

        // Validate
        if (sections.length !== 8) throw new Error(`Expected 8 sections, got ${sections.length}`);
        for (let i = 0; i < 8; i++) {
            if (sections[i].type !== expectedOrder[i]) {
                throw new Error(`Section ${i+1} is "${sections[i].type}", expected "${expectedOrder[i]}"`);
            }
        }
        console.log("✅ Validation passed: 8 sections in correct order");

        // Create Entity
        const landingPage = {
            business_name: data.businessName,
            headline: generatedContent.headline || data.businessName,
            subheadline: generatedContent.subheadline || '',
            phone: ctx.phone,
            whatsapp: ctx.phone,
            primary_color: data.primary_color || '#3B82F6',
            logo_url: data.logo_url || '',
            sections_json: sections,
            status: 'draft',
            slug
        };

        console.log("⏳ Saving to database...");
        const result = await base44.entities.LandingPage.create(landingPage);
        console.log(`✅ Created with ID: ${result.id}`);

        const pageUrl = `https://one-pai.com/LP?id=${result.id}`;

        // Send n8n webhook (fire and forget, don't block response)
        const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL");
        if (n8nUrl) {
            fetch(`${n8nUrl}/landing-page-created`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'landing_page_created',
                    email: user.email,
                    businessName: data.businessName,
                    slug,
                    pageId: result.id,
                    pageUrl
                })
            }).catch(err => console.log("n8n webhook failed (non-blocking):", err.message));
        }

        // CRITICAL: result from DB may not include sections_json (too large / stripped)
        // Always merge landingPage AFTER result to ensure sections_json is present
        return Response.json({
            ...result,
            ...landingPage,
            id: result.id,
            slug,
            pageUrl
        });
    } catch (error) {
        console.error("❌ Error:", error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function createDefaultSection(type, data) {
    const defaults = {
        hero: { type: "hero", title: data.businessName || "ברוכים הבאים", subtitle: "פתרון מקצועי ואמין", hero_expansion: "אנחנו כאן כדי לתת לך את השירות הטוב ביותר.", ctaText: "צור קשר", image_prompt: "professional business" },
        suited_for: { type: "suited_for", title: "למי זה מתאים?", suited: ["למי שרוצה איכות", "למי שמחפש מקצועיות", "למי שרוצה לחסוך זמן"], not_suited: ["מי שמחפש קיצורי דרך", "מי שלא רציני", "מי שמחפש בחינם"] },
        pain_expansion: { type: "pain_expansion", title: "האתגרים שלך", description: "אנחנו מבינים את הקשיים", items: Array(4).fill(null).map(() => ({ title: "אתגר נפוץ", description: "תיאור האתגר והשפעתו" })) },
        how_it_works: { type: "how_it_works", title: "איך זה עובד?", steps: [{ step: 1, title: "יצירת קשר", description: "משאירים פרטים" }, { step: 2, title: "אפיון", description: "לומדים את הצרכים" }, { step: 3, title: "ביצוע", description: "מקבלים תוצאה" }] },
        why_us: { type: "why_us", title: "למה אנחנו?", description: "היתרונות שלנו", items: Array(4).fill(null).map(() => ({ title: "יתרון", description: "הסבר על היתרון" })) },
        human_voice: { type: "human_voice", title: "לקוחות מספרים", items: [{ type: "testimonial", content: "שירות מעולה, ממליץ!", author: "ישראל כהן", role: "בעל עסק" }, { type: "founder_message", content: "הקמתי את העסק כדי לתת ערך אמיתי.", author: "המייסד", role: "מנכ\"ל" }, { type: "customer_story", content: "השירות שינה את העסק שלי.", author: "דנה לוי", role: "עצמאית" }] },
        faq: { type: "faq", title: "שאלות נפוצות", items: Array(7).fill(null).map(() => ({ question: "שאלה נפוצה?", answer: "תשובה מפורטת." })) },
        contact: { type: "contact", title: "צור קשר", subtitle: "נשמח לעזור", cta_micro_text: "בלי התחייבות • מענה מהיר", form_fields: ["name", "phone", "email"] }
    };
    return defaults[type] || { type };
}

function fixSectionArrays(sections, data) {
    sections.forEach(section => {
        if (section.type === 'suited_for') {
            section.suited = padArray(section.suited, 3, "מתאים למי שרוצה לצמוח");
            section.not_suited = padArray(section.not_suited, 3, "לא מתאים למי שמחפש פתרון קסם");
        }
        if (section.type === 'pain_expansion') {
            section.items = padArray(section.items, 4, { title: "אתגר", description: "תיאור" });
        }
        if (section.type === 'how_it_works') {
            section.steps = padArray(section.steps, 3, { step: 1, title: "שלב", description: "תיאור" });
            section.steps.forEach((s, i) => s.step = i + 1);
        }
        if (section.type === 'why_us') {
            section.items = padArray(section.items, 4, { title: "יתרון", description: "הסבר" });
        }
        if (section.type === 'human_voice') {
            const types = ["testimonial", "founder_message", "customer_story"];
            const items = section.items || [];
            section.items = types.map((t, i) => {
                const found = items.find(it => it.type === t) || items[i] || {};
                return { ...found, type: t, content: found.content || "תוכן", author: found.author || "לקוח", role: found.role || "בעל עסק" };
            });
        }
        if (section.type === 'faq') {
            section.items = padArray(section.items, 7, { question: "שאלה?", answer: "תשובה." });
        }
        if (section.type === 'hero' && !section.hero_expansion) {
            section.hero_expansion = section.subtitle || "פתרון מקצועי";
        }
        if (section.type === 'contact' && !section.cta_micro_text) {
            section.cta_micro_text = "בלי התחייבות • מענה מהיר";
        }
    });
}

function padArray(arr, targetLen, fallback) {
    const result = (arr || []).slice(0, targetLen);
    while (result.length < targetLen) {
        result.push(typeof fallback === 'object' ? { ...fallback } : fallback);
    }
    return result;
}