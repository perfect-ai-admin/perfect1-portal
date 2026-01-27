import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, reason } = await req.json();

        if (!amount || amount <= 0 || !Number.isInteger(amount)) {
            return Response.json({ error: 'Amount must be positive integer' }, { status: 400 });
        }

        if (!reason) {
            return Response.json({ error: 'Reason required' }, { status: 400 });
        }

        // Get or create account
        const accounts = await base44.entities.UserAccount.filter({ user_id: user.id });
        let account = accounts.length > 0 ? accounts[0] : null;

        if (!account) {
            account = await base44.entities.UserAccount.create({
                user_id: user.id,
                logo_credits: amount,
                total_logo_runs: 0
            });
        } else {
            // Add credits
            await base44.entities.UserAccount.update(account.id, {
                logo_credits: (account.logo_credits || 0) + amount
            });
        }

        // Log the topup
        await base44.entities.CreditLedger.create({
            user_id: user.id,
            event_type: 'topup',
            amount: amount,
            reason: reason
        });

        const updatedAccounts = await base44.entities.UserAccount.filter({ user_id: user.id });
        const updatedAccount = updatedAccounts[0];

        return Response.json({
            ok: true,
            added: amount,
            logo_credits: updatedAccount.logo_credits,
            total_logo_runs: updatedAccount.total_logo_runs
        });
    } catch (error) {
        console.error('addCredits error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});