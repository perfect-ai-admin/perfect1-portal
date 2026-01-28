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
    // STEP 2: Get remaining credits for response
    // ========================================
    let remainingCredits = 0;
    try {
      const accounts = await base44.asServiceRole.entities.UserAccount.filter({ user_id: user.email });
      remainingCredits = accounts[0]?.logo_credits || 0;
    } catch (err) {
      console.log('[GENERATE] Could not fetch remaining credits');
    }

    // ========================================
    // STEP 3: Mark as generating
    // ========================================
    try {
      await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
        status: 'generating'
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
      if (!promptResult.ok) {
        throw new Error(promptResult.message || 'Prompt build failed');
      }
    } catch (err) {
      console.error('[GENERATE] Prompt build failed:', err.message);
      await updateProjectStatus(base44, logoProject.id, 'failed');
      return Response.json({ 
        ok: false,
        error_code: 'PROMPT_BUILD_FAILED',
        message: 'Failed to build logo prompt'
      });
    }

    const prompt = promptResult.prompt;
    if (!prompt || typeof prompt !== 'string') {
      console.error('[GENERATE] Invalid prompt received');
      await updateProjectStatus(base44, logoProject.id, 'failed');
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
      await updateProjectStatus(base44, logoProject.id, 'failed');
      await refundCredit(base44, user.email, logoProject.id, 'api_error');
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
      await updateProjectStatus(base44, logoProject.id, 'failed');
      await refundCredit(base44, user.email, logoProject.id, apiResponse?.error_code || 'api_error');

      // Save failed generation
      try {
        await base44.asServiceRole.entities.LogoGeneration.create({
          project_id: logoProject.id,
          user_id: user.email,
          prompt_used: prompt,
          colors_used: logoProject.colors,
          status: 'failed',
          error_message: apiResponse?.message || 'Generation failed',
          nsfw_flag: apiResponse?.error_code === 'NSFW_BLOCKED' ? true : false
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
      await updateProjectStatus(base44, logoProject.id, 'failed');
      await refundCredit(base44, user.email, logoProject.id, 'invalid_response');
      return Response.json({ 
        ok: false,
        error_code: 'INVALID_RESPONSE',
        message: 'Invalid image data received'
      });
    }

    // ========================================
    // STEP 7: Save successful generation
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
        nsfw_flag: false
      });
    } catch (err) {
      console.error('[GENERATE] Failed to save generation:', err.message);
      // Image was created but save failed - still return it
      // User can still use the image URL
      return Response.json({
        ok: true,
        generation_id: 'unsaved_' + Date.now(),
        image_url: apiResponse.image_url,
        project_status: 'ready',
        credits_left: remainingCredits,
        warning: 'Image generated but failed to save to database. You can still download it.'
      });
    }

    // ========================================
    // STEP 8: Update project status to ready
    // ========================================
    try {
      await base44.asServiceRole.entities.LogoProject.update(logoProject.id, {
        status: 'ready'
      });
    } catch (err) {
      console.error('[GENERATE] Failed to update project status:', err.message);
      // Don't fail here, generation was successful
    }

    return Response.json({
      ok: true,
      generation_id: generation.id,
      image_url: generation.external_url,
      project_status: 'ready',
      credits_left: remainingCredits
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

async function refundCredit(base44, userId, projectId, reason) {
  try {
    const accounts = await base44.asServiceRole.entities.UserAccount.filter({ user_id: userId });
    if (accounts[0]) {
      await base44.asServiceRole.entities.UserAccount.update(accounts[0].id, {
        logo_credits: accounts[0].logo_credits + 1
      });
      await base44.asServiceRole.entities.CreditLedger.create({
        user_id: userId,
        event_type: 'refund',
        amount: 1,
        reason: reason,
        related_project_id: projectId
      });
      console.log('[GENERATE] Refunded credit to:', userId);
    }
  } catch (err) {
    console.error('[GENERATE] Refund failed:', err.message);
  }
}