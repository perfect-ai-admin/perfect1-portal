import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Disconnect from Finbot
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const connections = await base44.entities.FinbotConnection.filter({ user_id: user.id });
        
        if (!connections || connections.length === 0) {
            return Response.json({ status: 'not_connected', message: 'No connection found' });
        }

        const connection = connections[0];

        // Clear sensitive data and mark as disabled
        await base44.entities.FinbotConnection.update(connection.id, {
            status: 'disabled',
            access_token_ref: null,
            refresh_token_ref: null,
            api_key_ref: null,
            password_ref: null,
            token_expires_at: null,
            last_error: null
        });

        // Log action
        await base44.entities.FinbotAuditLog.create({
            user_id: user.id,
            action: 'finbot.disconnect',
            success: true
        });

        return Response.json({ status: 'disconnected', message: 'Successfully disconnected from Finbot' });
    } catch (error) {
        console.error('Error disconnecting:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});