import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason, related_generation_id, related_project_id } = await req.json();

    // Find user account
    const accounts = await base44.asServiceRole.entities.UserAccount.filter({ user_id: user.email });
    const account = accounts[0];

    if (!account) {
      return Response.json({ error: 'Account not found' }, { status: 404 });
    }

    // Add 1 credit back
    await base44.asServiceRole.entities.UserAccount.update(account.id, {
      logo_credits: account.logo_credits + 1
    });

    // Log refund
    await base44.asServiceRole.entities.CreditLedger.create({
      user_id: user.email,
      event_type: 'refund',
      amount: 1,
      reason: reason || 'api_failure',
      related_generation_id,
      related_project_id
    });

    return Response.json({ success: true, refunded_credits: 1 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});