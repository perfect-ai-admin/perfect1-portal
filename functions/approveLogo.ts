import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { generation_id } = await req.json();

        if (!generation_id) {
            return Response.json({ error: 'generation_id required' }, { status: 400 });
        }

        // Load generation
        const generation = await base44.entities.LogoGeneration.get(generation_id);
        if (!generation) {
            return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        if (generation.user_id !== user.id) {
            return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
        }

        // Load project and verify ownership
        const project = await base44.entities.LogoProject.get(generation.project_id);
        if (!project || project.user_id !== user.id) {
            return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
        }

        // Update generation status
        await base44.entities.LogoGeneration.update(generation_id, {
            status: 'approved'
        });

        // Update project
        await base44.entities.LogoProject.update(generation.project_id, {
            approved_generation_id: generation_id,
            approved_logo_url: generation.external_url,
            status: 'approved'
        });

        return Response.json({
            ok: true,
            approved_logo_url: generation.external_url,
            project_id: generation.project_id,
            status: 'approved'
        });
    } catch (error) {
        console.error('approveLogo error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});