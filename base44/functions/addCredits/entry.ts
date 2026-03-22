import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { target_email, amount } = await req.json();

    if (!target_email || !amount) {
      return Response.json({ error: 'target_email and amount required' }, { status: 400 });
    }

    // Find or create account
    const accounts = await base44.asServiceRole.entities.UserAccount.filter({ user_id: target_email });
    let account = accounts[0];

    if (!account) {
      account = await base44.asServiceRole.entities.UserAccount.create({
        user_id: target_email,
        logo_credits: amount,
        total_logo_runs: 0
      });
    } else {
      account = await base44.asServiceRole.entities.UserAccount.update(account.id, {
        logo_credits: (account.logo_credits || 0) + amount
      });
    }

    // Log topup
    await base44.asServiceRole.entities.CreditLedger.create({
      user_id: target_email,
      event_type: 'topup',
      amount,
      reason: 'admin_topup'
    });

    return Response.json({
      success: true,
      user: target_email,
      new_credits: account.logo_credits
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});