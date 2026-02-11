import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get Finbot connection status for current user
 * Checks user-level connection and global FINBOT_API_TOKEN fallback
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const connections = await base44.entities.FinbotConnection.filter({ user_id: user.id });
        const hasGlobalToken = !!Deno.env.get('FINBOT_API_TOKEN');

        if (!connections || connections.length === 0) {
            if (hasGlobalToken) {
                return Response.json({
                    connected: true, status: 'connected', strategy: 'apikey',
                    last_sync_at: null, last_error: null, finbot_account_id: null, source: 'global_token'
                });
            }
            return Response.json({
                connected: false, status: 'not_connected', strategy: null,
                last_sync_at: null, last_error: null, finbot_account_id: null
            });
        }

        const c = connections[0];
        return Response.json({
            connected: c.status === 'connected' || hasGlobalToken,
            status: c.status === 'connected' ? 'connected' : (hasGlobalToken ? 'connected' : c.status),
            strategy: c.strategy,
            last_sync_at: c.last_sync_at,
            last_error: c.last_error,
            finbot_account_id: c.finbot_account_id,
            source: c.status === 'connected' ? 'user_token' : (hasGlobalToken ? 'global_token' : null)
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});