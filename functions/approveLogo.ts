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

    const { generation_id } = await req.json();

    if (!generation_id) {
      return Response.json({ 
        ok: false,
        error_code: 'MISSING_GENERATION_ID',
        message: 'generation_id is required'
      });
    }

    // Load generation
    const generations = await base44.asServiceRole.entities.LogoGeneration.filter({ id: generation_id });
    const generation = generations[0];

    if (!generation) {
      console.log('[APPROVE] Generation not found:', generation_id);
      return Response.json({ 
        ok: false,
        error_code: 'GENERATION_NOT_FOUND',
        message: 'Logo not found'
      });
    }

    if (generation.user_id !== user.email) {
      console.log('[APPROVE] Ownership check failed:', generation.user_id, 'vs', user.email);
      return Response.json({ 
        ok: false,
        error_code: 'UNAUTHORIZED',
        message: 'Not authorized to approve this logo'
      });
    }

    // Approve requires unlock - call unlockLogo internally
    const unlockRes = await base44.functions.invoke('unlockLogo', { generation_id });
    if (!unlockRes.data?.ok) {
      return Response.json({
        ok: false,
        error_code: unlockRes.data?.error_code || 'UNLOCK_FAILED',
        message: unlockRes.data?.message || 'Failed to unlock logo before approval'
      });
    }

    // Generation is now unlocked, ensure it's marked as approved
    await base44.asServiceRole.entities.LogoGeneration.update(generation_id, {
      status: 'approved'
    });

    return Response.json({
      ok: true,
      approved_url: generation.external_url,
      generation_id: generation.id,
      credits_left: unlockRes.data?.credits_left
    });
  } catch (error) {
    console.error('[APPROVE] Error:', error.message);
    return Response.json({ 
      ok: false,
      error_code: 'APPROVE_FAILED',
      message: 'Failed to approve logo'
    });
  }
});