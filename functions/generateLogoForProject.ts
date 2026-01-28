import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { project_id, variation_mode } = body;

    console.log('[GENERATE] Request received:', { project_id, variation_mode, user_email: user.email });

    if (!project_id) {
      return Response.json({ error: 'project_id required' }, { status: 400 });
    }

    // Load project - use list instead of filter
    console.log('[GENERATE] Attempting to load project...');
    let logoProject;
    try {
      const projects = await base44.asServiceRole.entities.LogoProject.list('', 100);
      console.log('[GENERATE] Total projects available:', projects?.length);
      logoProject = projects.find(p => p.id === project_id);
      console.log('[GENERATE] Project found:', !!logoProject, 'ID:', logoProject?.id);
      
      if (!logoProject) {
        return Response.json({ error: 'Project not found' }, { status: 404 });
      }
    } catch (err) {
      console.error('[GENERATE] Project load error:', err.message);
      return Response.json({ error: 'Failed to load project: ' + err.message }, { status: 500 });
    }

    // Check ownership
    if (logoProject.user_id !== user.email) {
      console.error('[GENERATE] Ownership check failed:', logoProject.user_id, 'vs', user.email);
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
      const creditRes = await base44.asServiceRole.functions.invoke('checkAndReserveCredit', {});
      creditData = creditRes.data || creditRes;
      if (!creditData.success) {
        throw new Error(creditData.error || creditData.message || 'Credit check failed');
      }
      console.log('[GENERATE] Credit reserved:', creditData);
    } catch (err) {
      console.error('[GENERATE] Credit check failed:', err.message);
      await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
        status: 'failed'
      });
      return Response.json({ error: 'NO_CREDITS', message: err.message }, { status: 402 });
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
      const promptRes = await base44.asServiceRole.functions.invoke('buildLogoPrompt', promptData);
      promptResult = promptRes.data || promptRes;
      if (!promptResult.prompt) {
        throw new Error('No prompt in response');
      }
      console.log('[GENERATE] Prompt built successfully');
    } catch (err) {
      console.error('[GENERATE] Prompt build failed:', err.message);
      await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
        status: 'failed'
      });
      return Response.json({ error: 'Failed to build prompt: ' + err.message }, { status: 500 });
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

    let apiResponse;
    try {
      const res = await base44.asServiceRole.functions.invoke('callStockimgLogoAPI', apiPayload);
      apiResponse = res.data || res;
      console.log('[GENERATE] Stockimg response success:', apiResponse.success);
    } catch (err) {
      console.error('[GENERATE] Stockimg call failed:', err.message);
      apiResponse = { error: err.message };
    }

    const apiData = apiResponse;

    if (!apiData.success) {
      console.error('[GENERATE] API failed:', apiData);

      // Refund credit on failure
      try {
        await base44.asServiceRole.functions.invoke('refundCredit', {
          reason: apiData.error || 'api_failure',
          related_project_id: logoProject.id
        });
      } catch (err) {
        console.error('[GENERATE] Refund failed:', err);
      }

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
    console.error('[GENERATE] Fatal error:', error.message);
    console.error('[GENERATE] Stack:', error.stack);
    return Response.json({ error: error.message, type: error.constructor.name }, { status: 500 });
  }
});