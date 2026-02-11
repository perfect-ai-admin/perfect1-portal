import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Complete Finbot connection
 * Saves the API key and marks connection as connected.
 * We skip API validation since Finbot endpoints return inconsistent responses.
 * The key will be validated on first actual use (document creation, sync, etc.)
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { api_key } = body;

        if (!api_key || !api_key.trim()) {
            return Response.json({ error: 'חסר API Key' }, { status: 400 });
        }

        // Find or create connection record
        let connections = await base44.entities.FinbotConnection.filter({ user_id: user.id });
        let connection;
        if (!connections || connections.length === 0) {
            connection = await base44.entities.FinbotConnection.create({
                user_id: user.id, strategy: 'apikey', status: 'pending'
            });
        } else {
            connection = connections[0];
        }

        // Save the API key and mark as connected
        // Validation will happen on first actual API call (document creation, sync etc.)
        await base44.entities.FinbotConnection.update(connection.id, {
            status: 'connected',
            strategy: 'apikey',
            api_key_ref: api_key.trim(),
            last_error: null
        });

        await base44.entities.FinbotAuditLog.create({
            user_id: user.id,
            action: 'finbot.connect_complete',
            request_data: { strategy: 'apikey' },
            success: true
        });

        return Response.json({ status: 'connected', message: 'התחברת ל-Finbot בהצלחה!' });
    } catch (error) {
        console.error('Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});