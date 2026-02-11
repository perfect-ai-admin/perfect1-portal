import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Complete Finbot connection
 * Input:
 *   - apikey: {api_key}
 *   - credentials: {username, password}
 *   - oauth: {code}
 */

// TODO: Adjust endpoints based on actual Finbot API documentation
const FINBOT_ENDPOINTS = {
    oauth_token: '/oauth/token',
    auth_login: '/auth/login',
    me: '/me',
    validate: '/validate'
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { api_key, username, password, code } = body;

        // Find pending connection
        const connections = await base44.entities.FinbotConnection.filter({ user_id: user.id });
        
        if (!connections || connections.length === 0) {
            return Response.json({ error: 'No pending connection found. Start connection first.' }, { status: 400 });
        }

        const connection = connections[0];
        const baseUrl = Deno.env.get('FINBOT_BASE_URL') || 'https://api.finbot.co.il';

        let updateData = {};
        let finbotAccountId = null;

        try {
            if (connection.strategy === 'oauth' && code) {
                // Exchange code for tokens
                const clientId = Deno.env.get('FINBOT_CLIENT_ID');
                const clientSecret = Deno.env.get('FINBOT_CLIENT_SECRET');
                const redirectUrl = Deno.env.get('FINBOT_REDIRECT_URL');

                const tokenResponse = await fetch(`${baseUrl}${FINBOT_ENDPOINTS.oauth_token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        grant_type: 'authorization_code',
                        code,
                        client_id: clientId,
                        client_secret: clientSecret,
                        redirect_uri: redirectUrl
                    })
                });

                if (!tokenResponse.ok) {
                    const errorText = await tokenResponse.text();
                    throw new Error(`OAuth token exchange failed: ${errorText}`);
                }

                const tokenData = await tokenResponse.json();
                
                updateData = {
                    status: 'connected',
                    access_token_ref: tokenData.access_token, // TODO: Encrypt in production
                    refresh_token_ref: tokenData.refresh_token,
                    token_expires_at: tokenData.expires_in 
                        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
                        : null,
                    finbot_account_id: tokenData.account_id || null,
                    last_error: null
                };
                finbotAccountId = tokenData.account_id;

            } else if (connection.strategy === 'apikey' && api_key) {
                // Validate API key by making a test request
                const testResponse = await fetch(`${baseUrl}${FINBOT_ENDPOINTS.me}`, {
                    headers: { 
                        'Authorization': `Bearer ${api_key}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!testResponse.ok) {
                    throw new Error('Invalid API key');
                }

                const accountData = await testResponse.json();
                
                updateData = {
                    status: 'connected',
                    api_key_ref: api_key, // TODO: Encrypt in production
                    finbot_account_id: accountData.id || accountData.account_id || null,
                    last_error: null
                };
                finbotAccountId = accountData.id || accountData.account_id;

            } else if (connection.strategy === 'credentials' && username && password) {
                // Login with credentials to get token
                const loginResponse = await fetch(`${baseUrl}${FINBOT_ENDPOINTS.auth_login}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!loginResponse.ok) {
                    throw new Error('Invalid credentials');
                }

                const loginData = await loginResponse.json();
                
                updateData = {
                    status: 'connected',
                    username,
                    password_ref: password, // TODO: Encrypt in production
                    access_token_ref: loginData.token || loginData.access_token,
                    token_expires_at: loginData.expires_at || null,
                    finbot_account_id: loginData.account_id || null,
                    last_error: null
                };
                finbotAccountId = loginData.account_id;

            } else {
                return Response.json({ 
                    error: 'Missing credentials for the selected strategy' 
                }, { status: 400 });
            }

            // Update connection
            await base44.entities.FinbotConnection.update(connection.id, updateData);

            // Log success
            await base44.entities.FinbotAuditLog.create({
                user_id: user.id,
                action: 'finbot.connect_complete',
                request_data: { strategy: connection.strategy },
                response_data: { finbot_account_id: finbotAccountId },
                success: true
            });

            return Response.json({ 
                status: 'connected', 
                message: 'Successfully connected to Finbot',
                finbot_account_id: finbotAccountId
            });

        } catch (apiError) {
            // Update connection with error
            await base44.entities.FinbotConnection.update(connection.id, {
                status: 'error',
                last_error: apiError.message
            });

            // Log failure
            await base44.entities.FinbotAuditLog.create({
                user_id: user.id,
                action: 'finbot.connect_complete',
                request_data: { strategy: connection.strategy },
                response_data: { error: apiError.message },
                success: false
            });

            return Response.json({ 
                status: 'error', 
                message: apiError.message 
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error completing connection:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});