import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user?.role || user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

        // Get latest prompt version
        const promptVersions = await base44.asServiceRole.entities.PromptEvolution.filter({}, '-version', 1);
        const currentVersion = promptVersions[0] || { version: 0, improvements_log: [] };

        // Get recent analyses (last 10 pages)
        const analyses = await base44.asServiceRole.entities.PageQualityAnalysis.filter({}, '-analysis_date', 10);

        if (!analyses || analyses.length === 0) {
            return Response.json({ message: 'No analyses available yet. Create and analyze some pages first.' });
        }

        // Calculate average scores by section
        const avgScores = {};
        const allSuggestions = [];

        analyses.forEach(analysis => {
            if (analysis.section_scores) {
                Object.keys(analysis.section_scores).forEach(section => {
                    if (!avgScores[section]) avgScores[section] = { sum: 0, count: 0 };
                    avgScores[section].sum += analysis.section_scores[section].score || 0;
                    avgScores[section].count += 1;
                });
            }
            if (analysis.improvement_suggestions) {
                allSuggestions.push(...analysis.improvement_suggestions);
            }
        });

        Object.keys(avgScores).forEach(section => {
            avgScores[section].avg = avgScores[section].sum / avgScores[section].count;
        });

        // Identify weak sections (score < 7)
        const weakSections = Object.entries(avgScores)
            .filter(([_, data]) => data.avg < 7)
            .map(([section, data]) => ({ section, score: data.avg }));

        // Filter high-priority suggestions
        const prioritySuggestions = allSuggestions
            .filter(s => s.priority === 'high')
            .slice(0, 5);

        if (weakSections.length === 0) {
            return Response.json({ message: 'All sections performing well! No evolution needed yet.' });
        }

        // Ask AI to generate improved prompt
        const improvementPrompt = await base44.integrations.Core.InvokeLLM({
            prompt: `
              אתה עוזר לשיפור מערכת יצירת פרומטים עבור דפי נחיתה.
              
              ניתוח הביצועים:
              ממוצע ציונים לפי סקשן: ${JSON.stringify(avgScores)}
              סקשנים חלשים: ${JSON.stringify(weakSections)}
              הצעות לשיפור עדיפות: ${JSON.stringify(prioritySuggestions)}
              
              בחן היטב את הבעיות וצור הוראות ספציפיות לשיפור הפרומט.
              התמקד בסקשנים החלשים וב-high-priority suggestions.
              
              הנח שנוצרו כבר ${analyses.length} דפים מהפרומט הנוכחי.
              
              תן תשובה כ-JSON עם:
              1. improvements_to_make: array של שיפורים ספציפיים לפרומט
              2. sections_to_strengthen: array של סקשנים שצריך להדגיש יותר
              3. new_instructions: הוראות חדשות לפרומט
            `,
            response_json_schema: {
                type: "object",
                properties: {
                    improvements_to_make: { type: "array", items: { type: "string" } },
                    sections_to_strengthen: { type: "array", items: { type: "string" } },
                    new_instructions: { type: "string" }
                }
            }
        });

        // Log the improvements
        const newVersion = currentVersion.version + 1;
        const improvementLog = {
            date: new Date().toISOString(),
            change: improvementPrompt.new_instructions,
            reason: `התיקון ל-${weakSections.map(s => s.section).join(', ')} על בסיס ניתוח ${analyses.length} דפים`,
            impact_on_next_pages: `צפוי שיפור בסקשנים: ${weakSections.map(s => s.section).join(', ')}`
        };

        // Save new version (minimal for now - in real system, would update the actual prompt)
        const newPromptRecord = {
            version: newVersion,
            prompt_content: `[Version ${newVersion}] ${improvementPrompt.new_instructions}`,
            improvements_log: [...(currentVersion.improvements_log || []), improvementLog],
            pages_generated: 0,
            avg_quality_score: analyses.reduce((sum, a) => sum + a.overall_quality_score, 0) / analyses.length,
            is_active: true,
            created_from_version: currentVersion.version
        };

        const result = await base44.asServiceRole.entities.PromptEvolution.create(newPromptRecord);

        // Deactivate old version
        if (currentVersion.id) {
            await base44.asServiceRole.entities.PromptEvolution.update(currentVersion.id, { is_active: false });
        }

        return Response.json({
            success: true,
            new_version: newVersion,
            improvements: improvementPrompt,
            metrics: {
                avg_quality: newPromptRecord.avg_quality_score,
                weak_sections: weakSections,
                improvement_log: improvementLog
            },
            message: `פרומט V${newVersion} יצור בהצלחה על בסיס ${analyses.length} דפים`
        });
    } catch (error) {
        console.error('Evolution error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});