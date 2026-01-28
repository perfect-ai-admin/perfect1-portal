import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create UserAccount
    const accounts = await base44.asServiceRole.entities.UserAccount.filter({ user_id: user.email });
    let account = accounts[0];

    if (!account) {
      account = await base44.asServiceRole.entities.UserAccount.create({
        user_id: user.email,
        logo_credits: 0,
        total_logo_runs: 0
      });
    }

    if (account.logo_credits <= 0) {
      return Response.json({ error: 'NO_CREDITS', message: 'You have no logo credits' }, { status: 402 });
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
      success: true, 
      remaining_credits: updated.logo_credits 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});