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

    const { businessName, industry, style, tagline, vibe, colorScheme } = await req.json();

    if (!businessName || !industry) {
      return Response.json({ 
        ok: false,
        error_code: 'MISSING_FIELDS',
        message: 'Missing required fields: businessName, industry'
      });
    }

    // Create LogoProject from questionnaire answers
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

    // Get or create UserAccount
            const accounts = await base44.asServiceRole.entities.UserAccount.filter({ user_id: user.email });
            let account = accounts[0];

            if (!account) {
              console.log('[CREATE_PROJECT] Creating UserAccount for:', user.email);
              account = await base44.asServiceRole.entities.UserAccount.create({
                user_id: user.email,
                logo_credits: 1,
                total_logo_runs: 0
              });
            } else if (account.logo_credits === 0) {
              // Give 1 free credit on first project creation
              console.log('[CREATE_PROJECT] Adding free credit for:', user.email);
              account = await base44.asServiceRole.entities.UserAccount.update(account.id, {
                logo_credits: 1
              });
            }

    return Response.json({
      ok: true,
      project_id: project.id,
      credits: account.logo_credits
    });
  } catch (error) {
    console.error('[CREATE_PROJECT] Error:', error.message);
    return Response.json({ 
      ok: false,
      error_code: 'PROJECT_CREATE_FAILED',
      message: 'Failed to create project'
    });
  }
});