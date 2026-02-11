import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Complete Finbot connection
 * For apikey strategy: validates the API token against Finbot API
 * Uses the real Finbot endpoint: GET https://api.finbot.co.il/api/v2/income
 * with header: secret: <token>
 */

const FINBOT_API_BASE = 'https://api.finbot.co.il/api/v2';

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
            return Response.json({ error: 'לא נמצא חיבור ממתין. יש להתחיל תהליך חיבור קודם.' }, { status: 400 });
        }

        const connection = connections[0];
        let updateData = {};
        let finbotAccountId = null;

        try {
            if (connection.strategy === 'apikey' && api_key) {
                // Validate API key by making a test request to Finbot
                // We use the income endpoint with GET to test the token
                const testResponse = await fetch(`${FINBOT_API_BASE}/income`, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'secret': api_key
                    }
                });

                console.log('Finbot validation response status:', testResponse.status);

                if (!testResponse.ok && testResponse.status !== 404) {
                    const errorText = await testResponse.text();
                    console.log('Finbot validation error:', errorText);
                    throw new Error('API Key לא תקין. בדוק את הטוקן ונסה שוב.');
                }

                // Token is valid
                updateData = {
                    status: 'connected',
                    api_key_ref: api_key,
                    finbot_account_id: null,
                    last_error: null
                };

            } else if (connection.strategy === 'credentials' && username && password) {
                // For credentials strategy - not officially supported by Finbot API
                // Store credentials and try to use them
                updateData = {
                    status: 'connected',
                    username,
                    password_ref: password,
                    last_error: null
                };

            } else if (connection.strategy === 'oauth' && code) {
                // OAuth flow
                const clientId = Deno.env.get('FINBOT_CLIENT_ID');
                const clientSecret = Deno.env.get('FINBOT_CLIENT_SECRET');
                const redirectUrl = Deno.env.get('FINBOT_REDIRECT_URL');

                const tokenResponse = await fetch(`${FINBOT_API_BASE}/oauth/token`, {
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
                    throw new Error(`שגיאה בהחלפת קוד OAuth: ${errorText}`);
                }

                const tokenData = await tokenResponse.json();
                
                updateData = {
                    status: 'connected',
                    access_token_ref: tokenData.access_token,
                    refresh_token_ref: tokenData.refresh_token,
                    token_expires_at: tokenData.expires_in 
                        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
                        : null,
                    finbot_account_id: tokenData.account_id || null,
                    last_error: null
                };
                finbotAccountId = tokenData.account_id;

            } else {
                return Response.json({ 
                    error: 'חסרים פרטי התחברות לשיטה שנבחרה' 
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
                message: 'התחברת ל-Finbot בהצלחה!',
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