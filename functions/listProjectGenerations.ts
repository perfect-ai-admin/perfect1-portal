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

    const { project_id } = await req.json();

    if (!project_id) {
      return Response.json({ 
        ok: false,
        error_code: 'MISSING_PROJECT_ID',
        message: 'project_id is required'
      });
    }

    // Verify ownership
    const projects = await base44.asServiceRole.entities.LogoProject.filter({ id: project_id });
    const project = projects[0];

    if (!project || project.user_id !== user.email) {
      console.log('[LIST_GEN] Ownership check failed for:', project_id);
      return Response.json({ 
        ok: true,
        generations: []
      });
    }

    // Get all generations
    const generations = await base44.asServiceRole.entities.LogoGeneration.filter(
      { project_id },
      '-created_at',
      100
    );

    return Response.json({
      ok: true,
      generations: (Array.isArray(generations) ? generations : []).map(g => ({
        id: g.id,
        image_url: g.external_url,
        status: g.status,
        created_at: g.created_at,
        nsfw_flag: g.nsfw_flag || false,
        error_message: g.error_message || null
      }))
    });
  } catch (error) {
    console.error('[LIST_GEN] Error:', error.message);
    return Response.json({ 
      ok: true,
      generations: []
    });
  }
});