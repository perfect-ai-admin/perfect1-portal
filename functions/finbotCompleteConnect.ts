import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Complete Finbot connection
 * Validates API key via GET /reports/app-dashboard-data-current-month (safe, read-only)
 * Header: secret: <token>
 */

const FINBOT_VALIDATE_URLS = [
    'https://api.finbotai.co.il/reports/app-dashboard-data-current-month',
    'https://api.finbotai.co.il/customers',
    'https://api.finbotai.co.il/income',
];

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
            connection = await base44.entities.FinbotConnection.create({
                user_id: user.id, strategy: 'apikey', status: 'pending'
            });
        } else {
            connection = connections[0];
        }

        try {
            // Try multiple validation endpoints
            let validated = false;
            let lastStatus = 0;
            let lastResponseText = '';

            // If user provides the special keyword, use the global token
            const effectiveKey = api_key;
            
            // Also test with global token for debugging
            const globalToken = Deno.env.get('FINBOT_API_TOKEN');
            if (globalToken) {
                const debugUrl = 'https://api.finbotai.co.il/reports/app-dashboard-data-current-month';
                const gr = await fetch(debugUrl, { method: 'GET', headers: { 'Content-Type': 'application/json', 'secret': globalToken } });
                const gt = await gr.text();
                console.log(`GLOBAL_TOKEN test: ${gr.status} ${gt.substring(0, 300)}`);
            }

            for (const url of FINBOT_VALIDATE_URLS) {
                const testResponse = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'secret': effectiveKey }
                });
                lastStatus = testResponse.status;
                lastResponseText = await testResponse.text();
                console.log(`USER_KEY [${url}]:`, testResponse.status, lastResponseText.substring(0, 200));

                if (testResponse.ok || testResponse.status === 200) {
                    validated = true;
                    break;
                }
            }

            if (!validated) {
                if (lastStatus === 401 || lastStatus === 403) {
                    throw new Error('API Key לא תקין. בדוק את הטוקן ונסה שוב.');
                }
                throw new Error(`שגיאה בבדיקת החיבור (${lastStatus})`);
            }

            await base44.entities.FinbotConnection.update(connection.id, {
                status: 'connected', strategy: 'apikey',
                api_key_ref: api_key, last_error: null
            });

            await base44.entities.FinbotAuditLog.create({
                user_id: user.id, action: 'finbot.connect_complete',
                request_data: { strategy: 'apikey' }, success: true
            });

            return Response.json({ status: 'connected', message: 'התחברת ל-Finbot בהצלחה!' });
        } catch (apiError) {
            await base44.entities.FinbotConnection.update(connection.id, {
                status: 'error', last_error: apiError.message
            });
            await base44.entities.FinbotAuditLog.create({
                user_id: user.id, action: 'finbot.connect_complete',
                request_data: { strategy: 'apikey' },
                response_data: { error: apiError.message }, success: false
            });
            return Response.json({ status: 'error', message: apiError.message }, { status: 400 });
        }
    } catch (error) {
        console.error('Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});