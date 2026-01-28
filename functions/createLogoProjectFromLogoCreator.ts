import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessName, industry, style, tagline, vibe, colorScheme } = await req.json();

    if (!businessName || !industry) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create LogoProject from questionnaire answers
    // Must match user_id in RLS policy, service role bypasses validation
    const project = await base44.asServiceRole.entities.LogoProject.create({
      user_id: user.email,
      source_form: 'LogoCreator',
      brand_name: businessName,
      business_type: industry,
      style: style || 'minimal',
      slogan: tagline || '',
      icon_hint: vibe || '',
      colors: Array.isArray(colorScheme?.colors) ? colorScheme.colors : ['#1E3A5F', '#3B82F6'],
      image_width: 1024,
      image_height: 1024,
      status: 'draft'
    });

    // Get or create UserAccount for credits (service role is OK for this)
    const accounts = await base44.asServiceRole.entities.UserAccount.filter({ user_id: user.email });
    let account = accounts[0];

    if (!account) {
      // Give new user 1 free credit for first generation
      account = await base44.asServiceRole.entities.UserAccount.create({
        user_id: user.email,
        logo_credits: 1,
        total_logo_runs: 0
      });
    }

    return Response.json({
      ok: true,
      project_id: project.id,
      credits: account.logo_credits
    });
  } catch (error) {
    console.error('createLogoProjectFromLogoCreator error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});