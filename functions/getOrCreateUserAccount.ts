import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Try to find existing UserAccount
        const existing = await base44.entities.UserAccount.filter({ user_id: user.id });
        
        if (existing.length > 0) {
            return Response.json({ 
                ok: true, 
                account: existing[0] 
            });
        }

        // Create new UserAccount
        const newAccount = await base44.entities.UserAccount.create({
            user_id: user.id,
            logo_credits: 0,
            total_logo_runs: 0
        });

        return Response.json({ 
            ok: true, 
            account: newAccount,
            created: true
        });
    } catch (error) {
        console.error('getOrCreateUserAccount error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});