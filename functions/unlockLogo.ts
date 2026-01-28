import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ ok: false, error_code: 'UNAUTHORIZED', message: 'User not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { generation_id } = body;

    if (!generation_id) {
      return Response.json({ ok: false, error_code: 'MISSING_GENERATION_ID', message: 'generation_id is required' }, { status: 400 });
    }

    // Get generation
    const generations = await base44.entities.LogoGeneration.filter({ id: generation_id });
    if (!generations || generations.length === 0) {
      return Response.json({ ok: false, error_code: 'GENERATION_NOT_FOUND', message: 'Generation not found' }, { status: 404 });
    }

    const generation = generations[0];

    // Verify ownership
    if (generation.user_id !== user.email) {
      return Response.json({ ok: false, error_code: 'FORBIDDEN', message: 'You do not own this generation' }, { status: 403 });
    }

    // If already unlocked, return success (idempotent)
    if (generation.is_unlocked) {
      return Response.json({
        ok: true,
        message: 'Generation already unlocked',
        approved_logo_url: generation.external_url,
        is_idempotent: true
      });
    }

    // Get or create user account
    let userAccounts = await base44.entities.UserAccount.filter({ user_id: user.email });
    let userAccount = userAccounts[0];

    if (!userAccount) {
      const newAccount = await base44.entities.UserAccount.create({
        user_id: user.email,
        download_credits: 0
      });
      userAccount = newAccount;
    }

    // Check download credits
    if (userAccount.download_credits <= 0) {
      return Response.json({
        ok: false,
        error_code: 'NO_DOWNLOAD_CREDITS',
        message: 'You do not have download credits. Please purchase credits to unlock this logo.'
      });
    }

    // Deduct 1 credit
    const newCredits = userAccount.download_credits - 1;
    await base44.entities.UserAccount.update(userAccount.id, {
      download_credits: newCredits
    });

    // Log credit spend
    await base44.entities.CreditLedger.create({
      user_id: user.email,
      event_type: 'spend',
      amount: -1,
      reason: 'logo_unlock_download',
      related_project_id: generation.project_id,
      related_generation_id: generation_id
    });

    // Unlock the generation
    await base44.entities.LogoGeneration.update(generation_id, {
      is_unlocked: true,
      unlocked_at: new Date().toISOString(),
      status: 'approved'
    });

    // Get project and update it
    const projects = await base44.entities.LogoProject.filter({ id: generation.project_id });
    if (projects && projects[0]) {
      await base44.entities.LogoProject.update(projects[0].id, {
        approved_generation_id: generation_id,
        approved_logo_url: generation.external_url,
        status: 'approved',
        is_paid: true
      });
    }

    return Response.json({
      ok: true,
      message: 'Logo unlocked successfully',
      approved_logo_url: generation.external_url,
      credits_left: newCredits
    });
  } catch (error) {
    console.error('[unlockLogo] Error:', error);
    return Response.json({ ok: false, error_code: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }
});