import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id, generation_id, reason } = await req.json();

        if (!reason) {
            return Response.json({ error: 'Reason required' }, { status: 400 });
        }

        // Get or create account
        const accounts = await base44.entities.UserAccount.filter({ user_id: user.id });
        let account = accounts.length > 0 ? accounts[0] : null;

        if (!account) {
            account = await base44.entities.UserAccount.create({
                user_id: user.id,
                logo_credits: 1,
                total_logo_runs: 0
            });
        } else {
            // Add 1 credit back
            await base44.entities.UserAccount.update(account.id, {
                logo_credits: (account.logo_credits || 0) + 1
            });
        }

        // Log the refund
        await base44.entities.CreditLedger.create({
            user_id: user.id,
            event_type: 'refund',
            amount: 1,
            reason: reason,
            related_project_id: project_id,
            related_generation_id: generation_id
        });

        return Response.json({
            ok: true,
            refunded: 1,
            new_credits: (account.logo_credits || 0) + 1
        });
    } catch (error) {
        console.error('refundCredit error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});