import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ ok: false, error_code: 'UNAUTHORIZED', message: 'User not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { project_id } = body;

    if (!project_id) {
      return Response.json({ ok: false, error_code: 'MISSING_PROJECT_ID', message: 'project_id is required' }, { status: 400 });
    }

    // Get project
    const projects = await base44.entities.LogoProject.filter({ id: project_id });
    if (!projects || projects.length === 0) {
      return Response.json({ ok: false, error_code: 'PROJECT_NOT_FOUND', message: 'Project not found' }, { status: 404 });
    }

    const project = projects[0];

    // Verify ownership
    if (project.user_id !== user.email) {
      return Response.json({ ok: false, error_code: 'FORBIDDEN', message: 'You do not own this project' }, { status: 403 });
    }

    // Check preview limit
    if (project.free_previews_used >= project.free_previews_limit) {
      return Response.json({
        ok: false,
        error_code: 'PREVIEW_LIMIT_REACHED',
        message: 'Free previews limit reached. Please unlock a logo to continue.',
        free_previews_used: project.free_previews_used,
        free_previews_limit: project.free_previews_limit
      });
    }

    // Check rate limit (10 seconds between generations)
    if (project.last_generation_at) {
      const lastGenTime = new Date(project.last_generation_at);
      const nowTime = new Date();
      const secondsElapsed = (nowTime - lastGenTime) / 1000;

      if (secondsElapsed < 10) {
        return Response.json({
          ok: false,
          error_code: 'RATE_LIMIT',
          message: 'Please wait a few seconds before generating another logo.',
          wait_seconds: Math.ceil(10 - secondsElapsed)
        });
      }
    }

    return Response.json({
      ok: true,
      free_previews_left: project.free_previews_limit - project.free_previews_used
    });
  } catch (error) {
    console.error('[canGenerateFreePreview] Error:', error);
    return Response.json({ ok: false, error_code: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }
});