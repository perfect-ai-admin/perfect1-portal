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

    const body = await req.json();
    const { project_id, variation_mode } = body;

    console.log('[GENERATE] Request:', { project_id, user_email: user.email });

    if (!project_id) {
      return Response.json({ 
        ok: false,
        error_code: 'MISSING_PROJECT_ID',
        message: 'project_id is required'
      });
    }

    // ========================================
    // STEP 1: Load and validate project
    // ========================================
    let logoProject;
    try {
      const projects = await base44.asServiceRole.entities.LogoProject.filter({ id: project_id });
      logoProject = projects[0];
    } catch (err) {
      console.error('[GENERATE] Project load error:', err.message);
    }

    if (!logoProject) {
      console.log('[GENERATE] Project not found:', project_id);
      return Response.json({ 
        ok: false,
        error_code: 'PROJECT_NOT_FOUND',
        message: 'Project not found'
      });
    }

    // Ownership check
    if (logoProject.user_id !== user.email) {
      console.log('[GENERATE] Ownership check failed');
      return Response.json({ 
        ok: false,
        error_code: 'UNAUTHORIZED',
        message: 'Not authorized to generate for this project'
      });
    }

    // Status check
    if (logoProject.status === 'generating') {
      console.log('[GENERATE] Already generating');
      return Response.json({ 
        ok: false,
        error_code: 'ALREADY_GENERATING',
        message: 'Logo is already being generated'
      });
    }

    // ========================================
    // STEP 2: Check free preview limit
    // ========================================
    const previewCheckRes = await base44.functions.invoke('canGenerateFreePreview', { project_id });
    if (!previewCheckRes.data?.ok) {
      console.log('[GENERATE] Preview check failed:', previewCheckRes.data?.error_code);
      return Response.json({
        ok: false,
        error_code: previewCheckRes.data?.error_code || 'PREVIEW_CHECK_FAILED',
        message: previewCheckRes.data?.message || 'Cannot generate preview'
      });
    }

    // ========================================
    // STEP 3: Mark as generating
    // ========================================
    try {
      await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
        status: 'generating',
        last_generation_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('[GENERATE] Failed to mark generating:', err.message);
      return Response.json({ 
        ok: false,
        error_code: 'PROJECT_UPDATE_FAILED',
        message: 'Failed to start generation'
      });
    }

    // ========================================
    // STEP 4: Build prompt
    // ========================================
    let promptResult;
    try {
      const promptRes = await base44.functions.invoke('buildLogoPrompt', {
        brand_name: logoProject.brand_name || 'Business',
        business_type: logoProject.business_type || 'professional',
        style: logoProject.style || 'modern',
        slogan: logoProject.slogan || '',
        icon_hint: (logoProject.icon_hint || '') + (variation_mode ? ' Create a different concept while keeping brand identity consistent.' : '')
      });
      promptResult = promptRes.data || promptRes;
      if (!promptResult || !promptResult.ok) {
        throw new Error((promptResult?.message) || 'Prompt build failed');
      }
    } catch (err) {
      console.error('[GENERATE] Prompt build failed:', err.message, err.response?.data);
      await updateProjectStatus(base44, logoProject.id, 'ready');
      return Response.json({ 
        ok: false,
        error_code: 'PROMPT_BUILD_FAILED',
        message: 'Failed to build logo prompt: ' + err.message
      }, { status: 400 });
    }

    const prompt = promptResult.prompt;
    if (!prompt || typeof prompt !== 'string') {
      console.error('[GENERATE] Invalid prompt received');
      await updateProjectStatus(base44, logoProject.id, 'ready');
      return Response.json({ 
        ok: false,
        error_code: 'INVALID_PROMPT',
        message: 'Invalid prompt generated'
      });
    }

    // ========================================
    // STEP 5: Call Stockimg API
    // ========================================
    let apiResponse;
    try {
      const res = await base44.functions.invoke('callStockimgLogoAPI', {
        prompt,
        colors: Array.isArray(logoProject.colors) ? logoProject.colors.filter(c => c && typeof c === 'string' && c.startsWith('#')) : ['#1E3A5F', '#3B82F6'],
        width: logoProject.image_width || 1024,
        height: logoProject.image_height || 1024
      });
      apiResponse = res.data || res;
    } catch (err) {
      console.error('[GENERATE] Stockimg invoke failed:', err.message);
      await updateProjectStatus(base44, logoProject.id, 'ready');
      return Response.json({ 
        ok: false,
        error_code: 'GENERATION_FAILED',
        message: 'Image generation failed'
      });
    }

    // ========================================
    // STEP 6: Validate API response
    // ========================================
    if (!apiResponse || !apiResponse.ok) {
      console.error('[GENERATE] API returned error:', apiResponse?.error_code);
      await updateProjectStatus(base44, logoProject.id, 'ready');

      // Save failed generation
      try {
        await base44.asServiceRole.entities.LogoGeneration.create({
          project_id: logoProject.id,
          user_id: user.email,
          prompt_used: prompt,
          colors_used: logoProject.colors,
          status: 'failed',
          error_message: apiResponse?.message || 'Generation failed',
          nsfw_flag: apiResponse?.error_code === 'NSFW_BLOCKED' ? true : false,
          is_preview: true,
          is_unlocked: false
        });
      } catch (err) {
        console.error('[GENERATE] Failed to save error generation:', err.message);
      }

      return Response.json({ 
        ok: false,
        error_code: apiResponse?.error_code || 'GENERATION_FAILED',
        message: apiResponse?.message || 'Image generation failed'
      });
    }

    if (!apiResponse.image_url || typeof apiResponse.image_url !== 'string') {
      console.error('[GENERATE] No image URL in response');
      await updateProjectStatus(base44, logoProject.id, 'ready');
      return Response.json({ 
        ok: false,
        error_code: 'INVALID_RESPONSE',
        message: 'Invalid image data received'
      });
    }

    // ========================================
    // STEP 7: Save successful generation (as preview)
    // ========================================
    let generation;
    try {
      generation = await base44.asServiceRole.entities.LogoGeneration.create({
        project_id: logoProject.id,
        user_id: user.email,
        prompt_used: prompt,
        colors_used: logoProject.colors,
        seed: apiResponse.seed,
        external_url: apiResponse.image_url,
        content_type: apiResponse.content_type,
        width: apiResponse.width,
        height: apiResponse.height,
        timings: apiResponse.timings,
        status: 'generated',
        is_preview: true,
        is_unlocked: false,
        watermark_applied: false,
        nsfw_flag: false
      });
    } catch (err) {
      console.error('[GENERATE] Failed to save generation:', err.message);
      // Image was created but save failed - still return it
      return Response.json({
        ok: true,
        generation_id: 'unsaved_' + Date.now(),
        image_url: apiResponse.image_url,
        is_preview: true,
        free_previews_left: logoProject.free_previews_limit - logoProject.free_previews_used - 1,
        project_status: 'ready',
        warning: 'Image generated but failed to save to database.'
      });
    }

    // ========================================
    // STEP 8: Update project with new preview count
    // ========================================
    const newPreviewsUsed = logoProject.free_previews_used + 1;
    try {
      await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
        status: 'ready',
        free_previews_used: newPreviewsUsed
      });
    } catch (err) {
      console.error('[GENERATE] Failed to update project status:', err.message);
    }

    console.log('[GENERATE] Success:', { generation_id: generation.id, previews_used: newPreviewsUsed });

    return Response.json({
      ok: true,
      generation_id: generation.id,
      image_url: generation.external_url,
      is_preview: true,
      free_previews_left: logoProject.free_previews_limit - newPreviewsUsed,
      project_status: 'ready'
    });
  } catch (error) {
    console.error('[GENERATE] Fatal error:', error.message);
    return Response.json({ 
      ok: false,
      error_code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    });
  }
});

async function updateProjectStatus(base44, projectId, status) {
  try {
    await base44.asServiceRole.entities.LogoProject.update(projectId, { status });
  } catch (err) {
    console.error('[GENERATE] Failed to update project status:', err.message);
  }
}