import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Start Finbot connection process
 * Input: {strategy: "oauth" | "apikey" | "credentials"}
 * Output: 
 *   - oauth: {redirect_url}
 *   - apikey/credentials: {next: "enter_credentials"}
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { strategy } = body;

        if (!strategy || !['oauth', 'apikey', 'credentials'].includes(strategy)) {
            return Response.json({ error: 'Invalid strategy. Must be oauth, apikey, or credentials' }, { status: 400 });
        }

        // Check if connection already exists
        const existing = await base44.entities.FinbotConnection.filter({ user_id: user.id });
        
        if (existing && existing.length > 0) {
            // Update existing connection to pending
            await base44.entities.FinbotConnection.update(existing[0].id, {
                strategy,
                status: 'pending',
                last_error: null
            });
        } else {
            // Create new connection record
            await base44.entities.FinbotConnection.create({
                user_id: user.id,
                strategy,
                status: 'pending'
            });
        }

        // Log action
        await base44.entities.FinbotAuditLog.create({
            user_id: user.id,
            action: 'finbot.start_connect',
            request_data: { strategy },
            success: true
        });

        if (strategy === 'oauth') {
            // Build OAuth redirect URL
            const clientId = Deno.env.get('FINBOT_CLIENT_ID');
            const redirectUrl = Deno.env.get('FINBOT_REDIRECT_URL');
            const baseUrl = Deno.env.get('FINBOT_BASE_URL') || 'https://api.finbot.co.il';
            
            if (!clientId || !redirectUrl) {
                return Response.json({ 
                    error: 'OAuth not configured. Please set FINBOT_CLIENT_ID and FINBOT_REDIRECT_URL' 
                }, { status: 500 });
            }

            // TODO: Adjust OAuth URL path based on actual Finbot documentation
            const oauthUrl = `${baseUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&state=${user.id}`;
            
            return Response.json({ redirect_url: oauthUrl });
        }

        // For apikey or credentials, return next step
        return Response.json({ 
            next: 'enter_credentials',
            fields: strategy === 'apikey' 
                ? ['api_key'] 
                : ['username', 'password']
        });
    } catch (error) {
        console.error('Error starting connection:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});