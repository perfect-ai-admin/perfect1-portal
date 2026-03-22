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



    return Response.json({
      ok: true,
      project_id: project.id
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