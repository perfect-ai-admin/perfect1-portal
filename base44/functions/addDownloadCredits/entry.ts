import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ ok: false, error_code: 'UNAUTHORIZED', message: 'User not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, reason = 'manual_purchase' } = body;

    if (!amount || amount <= 0) {
      return Response.json({ ok: false, error_code: 'INVALID_AMOUNT', message: 'amount must be a positive number' }, { status: 400 });
    }

    // Get or create user account
    let userAccounts = await base44.entities.UserAccount.filter({ user_id: user.email });
    let userAccount = userAccounts[0];

    if (!userAccount) {
      userAccount = await base44.entities.UserAccount.create({
        user_id: user.email,
        download_credits: 0
      });
    }

    const newCredits = userAccount.download_credits + amount;

    // Update credits
    await base44.entities.UserAccount.update(userAccount.id, {
      download_credits: newCredits
    });

    // Log credit topup
    await base44.entities.CreditLedger.create({
      user_id: user.email,
      event_type: 'topup',
      amount: amount,
      reason: reason
    });

    return Response.json({
      ok: true,
      message: `Added ${amount} download credits`,
      download_credits: newCredits
    });
  } catch (error) {
    console.error('[addDownloadCredits] Error:', error);
    return Response.json({ ok: false, error_code: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }
});