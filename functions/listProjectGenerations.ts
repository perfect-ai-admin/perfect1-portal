import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id } = await req.json();

        if (!project_id) {
            return Response.json({ error: 'project_id required' }, { status: 400 });
        }

        // Verify project ownership
        const project = await base44.entities.LogoProject.get(project_id);
        if (!project) {
            return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        if (project.user_id !== user.id) {
            return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
        }

        // Query generations for project, sorted by created_at desc
        const generations = await base44.entities.LogoGeneration.filter({
            project_id: project_id
        });

        // Sort by created_at DESC
        const sorted = (generations || []).sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
        });

        const result = sorted.map(gen => ({
            id: gen.id,
            external_url: gen.external_url,
            status: gen.status,
            created_at: gen.created_at,
            nsfw_flag: gen.nsfw_flag,
            error_message: gen.error_message || null
        }));

        return Response.json({
            ok: true,
            generations: result,
            total: result.length
        });
    } catch (error) {
        console.error('listProjectGenerations error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});