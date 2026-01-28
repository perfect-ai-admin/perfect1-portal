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
    const generations = await base44.asServiceRole.entities.LogoGeneration.filter({ id: generation_id });
    const generation = generations[0];

    if (!generation) {
      return Response.json({ error: 'Generation not found' }, { status: 404 });
    }

    if (generation.user_id !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update generation status
    await base44.asServiceRole.entities.LogoGeneration.update(generation.id, {
      status: 'approved'
    });

    // Load project and update
    const projects = await base44.asServiceRole.entities.LogoProject.filter({ id: generation.project_id });
    const project = projects[0];

    await base44.asServiceRole.entities.LogoProject.update(project.id, {
      approved_generation_id: generation.id,
      approved_logo_url: generation.external_url,
      status: 'approved'
    });

    return Response.json({
      success: true,
      approved_url: generation.external_url
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});