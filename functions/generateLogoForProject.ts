import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id, variation_mode } = await req.json();

    if (!project_id) {
      return Response.json({ error: 'project_id required' }, { status: 400 });
    }

    // Load project
    const project = await base44.asServiceRole.entities.LogoProject.filter({ id: project_id });
    if (!project[0]) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const logoProject = project[0];

    // Check ownership
    if (logoProject.user_id !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already generating
    if (logoProject.status === 'generating') {
      return Response.json({ error: 'Already generating' }, { status: 409 });
    }

    // Update status to generating
    await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
      status: 'generating'
    });

    // Check and reserve credit
    let creditData;
    try {
      creditData = await base44.asServiceRole.functions.invoke('checkAndReserveCredit', {});
    } catch (err) {
      console.error('[GENERATE] Credit check failed:', err);
      await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
        status: 'failed'
      });
      return Response.json({ error: err.message }, { status: 400 });
    }

    // Build prompt
    let promptData = {
      brand_name: logoProject.brand_name || 'Business',
      business_type: logoProject.business_type || 'professional',
      style: logoProject.style || 'modern',
      slogan: logoProject.slogan || '',
      icon_hint: logoProject.icon_hint || ''
    };

    if (variation_mode) {
      promptData.icon_hint = (promptData.icon_hint || '') + ' Create a different concept while keeping brand identity consistent.';
    }

    console.log('[GENERATE] Building prompt with:', promptData);

    let promptResult;
    try {
      promptResult = await base44.asServiceRole.functions.invoke('buildLogoPrompt', promptData);
    } catch (err) {
      console.error('[GENERATE] Prompt build failed:', err);
      await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
        status: 'failed'
      });
      return Response.json({ error: 'Failed to build prompt' }, { status: 400 });
    }

    const prompt = promptResult.prompt;

    // Call Stockimg API
    const apiPayload = {
      prompt,
      colors: Array.isArray(logoProject.colors) ? logoProject.colors.filter(c => c && typeof c === 'string' && c.startsWith('#')) : ['#1E3A5F', '#3B82F6'],
      width: logoProject.image_width || 1024,
      height: logoProject.image_height || 1024
    };

    console.log('[GENERATE] Calling Stockimg with:', apiPayload);

    let apiData;
    try {
      apiData = await base44.asServiceRole.functions.invoke('callStockimgLogoAPI', apiPayload);
    } catch (err) {
      console.error('[GENERATE] Stockimg call failed:', err);
      apiData = { error: err.message };
    }

    if (!apiData.success) {
      console.error('[GENERATE] API failed:', apiRes.status, apiData);
      
      // Refund credit on failure
      await fetch(new URL(req.url).origin + '/functions/refundCredit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization')
        },
        body: JSON.stringify({
          reason: apiData.error || 'api_failure',
          related_project_id: logoProject.id
        })
      });

      // Save failed generation
      await base44.asServiceRole.entities.LogoGeneration.create({
        project_id: logoProject.id,
        user_id: user.email,
        prompt_used: prompt,
        colors_used: logoProject.colors,
        status: 'failed',
        error_message: apiData.details || apiData.message || apiData.error || 'Unknown error',
        nsfw_flag: apiData.nsfw_flag || false
      });

      await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
        status: 'failed'
      });

      return Response.json({ error: apiData.error || 'Generation failed', details: apiData.details }, { status: 400 });
    }

    // Save successful generation
    const generation = await base44.asServiceRole.entities.LogoGeneration.create({
      project_id: logoProject.id,
      user_id: user.email,
      prompt_used: prompt,
      colors_used: logoProject.colors,
      seed: apiData.seed,
      external_url: apiData.image_url,
      content_type: apiData.content_type,
      width: apiData.width,
      height: apiData.height,
      timings: apiData.timings,
      status: 'generated'
    });

    // Update project status
    await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
      status: 'ready'
    });

    return Response.json({
      success: true,
      generation_id: generation.id,
      image_url: generation.external_url,
      created_at: generation.created_at
    });
  } catch (error) {
    console.error('[GENERATE] Fatal error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});