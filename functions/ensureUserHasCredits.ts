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

    // Find or create UserAccount
    const accounts = await base44.asServiceRole.entities.UserAccount.filter({ user_id: user.email });
    let account = accounts[0];

    if (!account) {
      console.log('[ENSURE_CREDITS] Creating new UserAccount for:', user.email);
      account = await base44.asServiceRole.entities.UserAccount.create({
        user_id: user.email,
        logo_credits: 1,
        total_logo_runs: 0
      });
      console.log('[ENSURE_CREDITS] Created account with 1 free credit');
    } else if (account.logo_credits <= 0) {
      console.log('[ENSURE_CREDITS] Account exists but no credits, giving 1 free credit');
      account = await base44.asServiceRole.entities.UserAccount.update(account.id, {
        logo_credits: 1
      });
      await base44.asServiceRole.entities.CreditLedger.create({
        user_id: user.email,
        event_type: 'topup',
        amount: 1,
        reason: 'free_credit_for_user'
      });
    }

    return Response.json({
      ok: true,
      logo_credits: account.logo_credits
    });
  } catch (error) {
    console.error('[ENSURE_CREDITS] Error:', error.message);
    return Response.json({ 
      ok: false,
      error_code: 'ENSURE_FAILED',
      message: 'Failed to ensure credits'
    });
  }
});