import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        // Get active prompt version
        const activePrompts = await base44.asServiceRole.entities.PromptEvolution.filter(
            { is_active: true },
            '-version',
            1
        );

        if (!activePrompts || activePrompts.length === 0) {
            return Response.json({ error: 'No active prompt found' }, { status: 404 });
        }

        const activePrompt = activePrompts[0];

        // Get stats for this version
        const analyses = await base44.asServiceRole.entities.PageQualityAnalysis.filter(
            { prompt_version_used: activePrompt.version },
            '-analysis_date'
        );

        return Response.json({
            version: activePrompt.version,
            prompt_content: activePrompt.prompt_content,
            performance_metrics: activePrompt.performance_metrics,
            pages_generated: analyses.length,
            avg_quality_score: activePrompt.avg_quality_score,
            improvements_log: activePrompt.improvements_log,
            created_from_version: activePrompt.created_from_version
        });
    } catch (error) {
        console.error('Error getting active prompt:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});