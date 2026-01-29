import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { landingPageId } = await req.json();
        if (!landingPageId) return Response.json({ error: 'Missing landingPageId' }, { status: 400 });

        // Get the landing page
        const page = await base44.asServiceRole.entities.LandingPage.get(landingPageId);
        if (!page) return Response.json({ error: 'Page not found' }, { status: 404 });

        // Analyze with AI
        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt: `
              בדוק את דף הנחיתה הזה בפירוט ותן ציון כולל וציונים לכל סקשן.
              
              עמוד:
              ${JSON.stringify(page, null, 2)}
              
              אנליזה נדרשת:
              1. כל סקשן - ציון 0-10 עם קריטריונים ספציפיים
              2. איכות כתיבה - טון בוגר, ללא שיווק אגרסיבי, עברית איכותית, גנואיניות
              3. ציון כולל 0-100
              4. הצעות לשיפור הפרומט
              
              תן תשובה כ-JSON שמכיל את כל הציונים וההערות.
            `,
            response_json_schema: {
                type: "object",
                properties: {
                    overall_quality_score: { type: "number" },
                    section_scores: {
                        type: "object",
                        properties: {
                            hero: { type: "object", properties: { score: { type: "number" }, clarity: { type: "number" }, impact: { type: "number" }, feedback: { type: "string" } } },
                            suited_for: { type: "object", properties: { score: { type: "number" }, specificity: { type: "number" }, usefulness: { type: "number" }, feedback: { type: "string" } } },
                            pain_expansion: { type: "object", properties: { score: { type: "number" }, emotional_depth: { type: "number" }, relatability: { type: "number" }, feedback: { type: "string" } } },
                            how_it_works: { type: "object", properties: { score: { type: "number" }, clarity: { type: "number" }, concreteness: { type: "number" }, feedback: { type: "string" } } },
                            why_us: { type: "object", properties: { score: { type: "number" }, differentiation: { type: "number" }, credibility: { type: "number" }, feedback: { type: "string" } } },
                            human_voice: { type: "object", properties: { score: { type: "number" }, authenticity: { type: "number" }, presence: { type: "number" }, feedback: { type: "string" } } },
                            faq: { type: "object", properties: { score: { type: "number" }, relevance: { type: "number" }, answer_quality: { type: "number" }, feedback: { type: "string" } } },
                            cta: { type: "object", properties: { score: { type: "number" }, confidence_reducing: { type: "number" }, clarity: { type: "number" }, feedback: { type: "string" } } }
                        }
                    },
                    writing_quality: { type: "object", properties: { tone: { type: "number" }, no_aggressive_marketing: { type: "number" }, hebrew_quality: { type: "number" }, authenticity: { type: "number" } } },
                    design_potential: { type: "object", properties: { structure: { type: "number" }, flow: { type: "number" }, image_prompts_quality: { type: "number" } } },
                    improvement_suggestions: { type: "array", items: { type: "object", properties: { section: { type: "string" }, issue: { type: "string" }, suggestion: { type: "string" }, priority: { type: "string", enum: ["high", "medium", "low"] } } } }
                },
                required: ["overall_quality_score"]
            }
        });

        // Get current prompt version
        const promptVersions = await base44.asServiceRole.entities.PromptEvolution.filter({ is_active: true }, '-version', 1);
        const currentVersion = promptVersions[0]?.version || 1;

        // Save analysis
        const analysisRecord = {
            landing_page_id: landingPageId,
            prompt_version_used: currentVersion,
            overall_quality_score: analysis.overall_quality_score,
            section_scores: analysis.section_scores,
            writing_quality: analysis.writing_quality,
            design_potential: analysis.design_potential,
            improvement_suggestions: analysis.improvement_suggestions,
            analysis_date: new Date().toISOString()
        };

        await base44.asServiceRole.entities.PageQualityAnalysis.create(analysisRecord);

        return Response.json({
            success: true,
            analysis: analysisRecord,
            message: 'דף נותח בהצלחה'
        });
    } catch (error) {
        console.error('Analysis error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});