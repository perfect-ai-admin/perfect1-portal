import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id } = await req.json();

        // Get or create account
        const accounts = await base44.entities.UserAccount.filter({ user_id: user.id });
        let account = accounts.length > 0 ? accounts[0] : null;

        if (!account) {
            account = await base44.entities.UserAccount.create({
                user_id: user.id,
                logo_credits: 0,
                total_logo_runs: 0
            });
        }

        // Check credits
        if (account.logo_credits <= 0) {
            return Response.json({ error: 'NO_CREDITS' }, { status: 400 });
        }

        // Reserve 1 credit
        await base44.entities.UserAccount.update(account.id, {
            logo_credits: account.logo_credits - 1,
            total_logo_runs: (account.total_logo_runs || 0) + 1
        });

        // Log the spend
        await base44.entities.CreditLedger.create({
            user_id: user.id,
            event_type: 'spend',
            amount: -1,
            reason: 'logo_generation_reserve',
            related_project_id: project_id
        });

        return Response.json({
            ok: true,
            credits_reserved: 1,
            credits_left: account.logo_credits - 1
        });
    } catch (error) {
        console.error('reserveCredit error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});