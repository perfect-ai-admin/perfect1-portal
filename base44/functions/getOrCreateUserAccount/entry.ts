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

    // Try to find existing account
    const accounts = await base44.asServiceRole.entities.UserAccount.filter({ user_id: user.email });
    let account = accounts[0];

    if (!account) {
      console.log('[GET_OR_CREATE] Creating new UserAccount for:', user.email);
      account = await base44.asServiceRole.entities.UserAccount.create({
        user_id: user.email,
        logo_credits: 0,
        total_logo_runs: 0
      });
    }

    return Response.json({
      ok: true,
      account_id: account.id,
      logo_credits: account.logo_credits,
      total_logo_runs: account.total_logo_runs
    });
  } catch (error) {
    console.error('[GET_OR_CREATE] Error:', error.message);
    return Response.json({
      ok: false,
      error_code: 'ACCOUNT_ERROR',
      message: 'Failed to access account'
    });
  }
});