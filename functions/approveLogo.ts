import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.email) {
      return Response.json({ 
        ok: false,
        error_code: 'NO_AUTH',
        message: 'User not authenticated'
      });
    }

    const { generation_id } = await req.json();

    if (!generation_id) {
      return Response.json({ 
        ok: false,
        error_code: 'MISSING_GENERATION_ID',
        message: 'generation_id is required'
      });
    }

    // Load generation
    const generations = await base44.asServiceRole.entities.LogoGeneration.filter({ id: generation_id });
    const generation = generations[0];

    if (!generation) {
      console.log('[APPROVE] Generation not found:', generation_id);
      return Response.json({ 
        ok: false,
        error_code: 'GENERATION_NOT_FOUND',
        message: 'Logo not found'
      });
    }

    if (generation.user_id !== user.email) {
      console.log('[APPROVE] Ownership check failed:', generation.user_id, 'vs', user.email);
      return Response.json({ 
        ok: false,
        error_code: 'UNAUTHORIZED',
        message: 'Not authorized to approve this logo'
      });
    }

    // Update generation status
    await base44.asServiceRole.entities.LogoGeneration.update(generation.id, {
      status: 'approved'
    });

    // Load project and update
    const projects = await base44.asServiceRole.entities.LogoProject.filter({ id: generation.project_id });
    const project = projects[0];

    if (!project) {
      console.error('[APPROVE] Project not found:', generation.project_id);
      return Response.json({ 
        ok: false,
        error_code: 'PROJECT_NOT_FOUND',
        message: 'Associated project not found'
      });
    }

    await base44.asServiceRole.entities.LogoProject.update(project.id, {
      approved_generation_id: generation.id,
      approved_logo_url: generation.external_url,
      status: 'approved'
    });

    return Response.json({
      ok: true,
      approved_url: generation.external_url,
      generation_id: generation.id
    });
  } catch (error) {
    console.error('[APPROVE] Error:', error.message);
    return Response.json({ 
      ok: false,
      error_code: 'APPROVE_FAILED',
      message: 'Failed to approve logo'
    });
  }
});