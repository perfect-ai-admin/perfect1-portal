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
        const { api_key } = body;

        if (!api_key) {
            return Response.json({ error: 'חסר API Key' }, { status: 400 });
        }

        // Find or create connection record
        let connections = await base44.entities.FinbotConnection.filter({ user_id: user.id });
        let connection;
        
        if (!connections || connections.length === 0) {
            // Auto-create connection record if not exists
            connection = await base44.entities.FinbotConnection.create({
                user_id: user.id,
                strategy: 'apikey',
                status: 'pending'
            });
        } else {
            connection = connections[0];
        }

        let updateData = {};

        try {
            // Validate API key against Finbot API
            const testResponse = await fetch(FINBOT_API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'secret': api_key
                },
                body: JSON.stringify({ type: '1', date: '01/01/2025', language: 'HE', currency: 'ILS', vatType: false, rounding: true })
            });

            const testText = await testResponse.text();
            console.log('Finbot validation response:', testResponse.status, testText);

            // If we get 401/403, the token is invalid
            if (testResponse.status === 401 || testResponse.status === 403) {
                throw new Error('API Key לא תקין. בדוק את הטוקן ונסה שוב.');
            }

            updateData = {
                status: 'connected',
                strategy: 'apikey',
                api_key_ref: api_key,
                last_error: null
            };

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