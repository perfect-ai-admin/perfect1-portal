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

    // Load project
    const projects = await base44.asServiceRole.entities.LogoProject.filter({ id: project_id });
    const project = projects[0];

    if (!project || project.user_id !== user.email) {
      return Response.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    // Load generations
    const generations = await base44.asServiceRole.entities.LogoGeneration.filter(
      { project_id },
      '-created_at',
      50
    );

    // Load user credits
    const accounts = await base44.asServiceRole.entities.UserAccount.filter({ user_id: user.email });
    const account = accounts[0];
    const credits = account ? account.logo_credits : 0;

    return Response.json({
      project,
      generations,
      credits
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});