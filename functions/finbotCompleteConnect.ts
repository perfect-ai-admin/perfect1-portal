import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Complete Finbot connection
 * For apikey strategy: validates the API token against Finbot API
 * Real API URL: https://api.finbotai.co.il/income (GET to validate)
 * Header: secret: <token>
 */

const FINBOT_API_URL = 'https://api.finbotai.co.il/income';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { api_key, username, password, code } = body;

        const connections = await base44.entities.FinbotConnection.filter({ user_id: user.id });
        if (!connections || connections.length === 0) {
            return Response.json({ error: 'לא נמצא חיבור ממתין. יש להתחיל תהליך חיבור קודם.' }, { status: 400 });
        }

        const connection = connections[0];
        let updateData = {};

        try {
            if (connection.strategy === 'apikey' && api_key) {
                // Validate API key by making a test POST with minimal data
                // We'll send an intentionally incomplete request - if we get a Finbot error (not 401), the token is valid
                const testResponse = await fetch(FINBOT_API_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'secret': api_key
                    },
                    body: JSON.stringify({ type: '1', date: '01/01/2025', language: 'he', currency: 'ILS', vatType: false, rounding: true })
                });

                const testText = await testResponse.text();
                console.log('Finbot validation response:', testResponse.status, testText);

                // If we get 401/403, the token is invalid. Any other response means the token works.
                if (testResponse.status === 401 || testResponse.status === 403) {
                    throw new Error('API Key לא תקין. בדוק את הטוקן ונסה שוב.');
                }

                updateData = {
                    status: 'connected',
                    api_key_ref: api_key,
                    last_error: null
                };

            } else if (connection.strategy === 'credentials' && username && password) {
                updateData = {
                    status: 'connected',
                    username,
                    password_ref: password,
                    last_error: null
                };
            } else {
                return Response.json({ error: 'חסרים פרטי התחברות' }, { status: 400 });
            }

            await base44.entities.FinbotConnection.update(connection.id, updateData);

            await base44.entities.FinbotAuditLog.create({
                user_id: user.id,
                action: 'finbot.connect_complete',
                request_data: { strategy: connection.strategy },
                success: true
            });

            return Response.json({ 
                status: 'connected', 
                message: 'התחברת ל-Finbot בהצלחה!'
            });

        } catch (apiError) {
            await base44.entities.FinbotConnection.update(connection.id, {
                status: 'error',
                last_error: apiError.message
            });

            await base44.entities.FinbotAuditLog.create({
                user_id: user.id,
                action: 'finbot.connect_complete',
                request_data: { strategy: connection.strategy },
                response_data: { error: apiError.message },
                success: false
            });

            return Response.json({ status: 'error', message: apiError.message }, { status: 400 });
        }
    } catch (error) {
        console.error('Error completing connection:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});