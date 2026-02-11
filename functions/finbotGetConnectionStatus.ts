import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get Finbot connection status for current user
 * Also checks if global FINBOT_API_TOKEN is set as fallback
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find connection for this user
        const connections = await base44.entities.FinbotConnection.filter({ user_id: user.id });
        
        // Check if global token exists
        const hasGlobalToken = !!Deno.env.get('FINBOT_API_TOKEN');

        if (!connections || connections.length === 0) {
            // If there's a global token, user is effectively connected
            if (hasGlobalToken) {
                return Response.json({
                    connected: true,
                    status: 'connected',
                    strategy: 'apikey',
                    last_sync_at: null,
                    last_error: null,
                    finbot_account_id: null,
                    source: 'global_token'
                });
            }

            return Response.json({
                connected: false,
                status: 'not_connected',
                strategy: null,
                last_sync_at: null,
                last_error: null,
                finbot_account_id: null
            });
        }

        const connection = connections[0];
        
        return Response.json({
            connected: connection.status === 'connected' || hasGlobalToken,
            status: connection.status === 'connected' ? 'connected' : (hasGlobalToken ? 'connected' : connection.status),
            strategy: connection.strategy,
            last_sync_at: connection.last_sync_at,
            last_error: connection.last_error,
            finbot_account_id: connection.finbot_account_id,
            source: connection.status === 'connected' ? 'user_token' : (hasGlobalToken ? 'global_token' : null)
        });
    } catch (error) {
        console.error('Error getting connection status:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});