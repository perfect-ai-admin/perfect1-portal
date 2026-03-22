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
      console.log('[RESERVE_CREDIT] Creating UserAccount for:', user.email);
      account = await base44.asServiceRole.entities.UserAccount.create({
        user_id: user.email,
        logo_credits: 1,
        total_logo_runs: 0
      });
      await base44.asServiceRole.entities.CreditLedger.create({
        user_id: user.email,
        event_type: 'topup',
        amount: 1,
        reason: 'free_credit_for_new_user'
      });
    }

    if (account.logo_credits <= 0) {
      console.log('[RESERVE_CREDIT] No credits for user:', user.email);
      return Response.json({ 
        ok: false,
        error_code: 'NO_CREDITS',
        message: 'No logo credits available'
      });
    }

    // Deduct 1 credit
    const updated = await base44.asServiceRole.entities.UserAccount.update(account.id, {
      logo_credits: account.logo_credits - 1,
      total_logo_runs: (account.total_logo_runs || 0) + 1
    });

    // Log to ledger
    await base44.asServiceRole.entities.CreditLedger.create({
      user_id: user.email,
      event_type: 'spend',
      amount: -1,
      reason: 'logo_generation'
    });

    return Response.json({ 
      ok: true,
      remaining_credits: updated.logo_credits 
    });
  } catch (error) {
    console.error('[RESERVE_CREDIT] Error:', error.message);
    return Response.json({ 
      ok: false,
      error_code: 'CREDIT_RESERVE_FAILED',
      message: 'Could not reserve credit'
    });
  }
});