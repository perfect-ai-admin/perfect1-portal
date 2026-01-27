import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        return Response.json({
            ok: true,
            logo_credits: account.logo_credits || 0,
            total_logo_runs: account.total_logo_runs || 0
        });
    } catch (error) {
        console.error('getCredits error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});