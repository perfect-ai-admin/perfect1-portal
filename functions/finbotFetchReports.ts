import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Fetch reports from Finbot
 * Input: {report_type: "pnl" | "vat" | "customers", period_start, period_end}
 * 
 * Uses Finbot API v2 with secret header
 */

const FINBOT_API_BASE = 'https://api.finbot.co.il/api/v2';

const REPORT_ENDPOINTS = {
    pnl: '/reports/profit-loss',
    vat: '/reports/vat',
    customers: '/reports/customers'
};

async function getFinbotAuth(base44, userId) {
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    
    if (connections && connections.length > 0 && connections[0].status === 'connected') {
        const connection = connections[0];
        if (connection.api_key_ref) return connection.api_key_ref;
        if (connection.access_token_ref) return connection.access_token_ref;
    }

    const globalToken = Deno.env.get('FINBOT_API_TOKEN');
    if (globalToken) return globalToken;

    throw new Error('לא נמצא טוקן Finbot.');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { report_type, period_start, period_end } = body;

        if (!report_type || !['pnl', 'vat', 'customers'].includes(report_type)) {
            return Response.json({ error: 'סוג דוח לא תקין' }, { status: 400 });
        }

        if (!period_start || !period_end) {
            return Response.json({ error: 'חובה לציין תאריך התחלה וסיום' }, { status: 400 });
        }

        // Create report run record
        const reportRun = await base44.entities.FinbotReportRun.create({
            user_id: user.id,
            report_type,
            period_start,
            period_end,
            status: 'running'
        });

        try {
            const apiToken = await getFinbotAuth(base44, user.id);

            const endpoint = REPORT_ENDPOINTS[report_type];
            const url = `${FINBOT_API_BASE}${endpoint}?from=${period_start}&to=${period_end}`;
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'secret': apiToken
                }
            });

            const responseText = await response.text();
            console.log('Finbot report response:', response.status, responseText.substring(0, 500));

            let reportData;
            try {
                reportData = JSON.parse(responseText);
            } catch {
                reportData = { raw_response: responseText };
            }

            if (!response.ok) {
                throw new Error(reportData?.message || `שגיאה בשליפת דוח מ-Finbot (${response.status})`);
            }

            // Update report run with results
            await base44.entities.FinbotReportRun.update(reportRun.id, {
                status: 'success',
                result: reportData
            });

            // Log action
            await base44.entities.FinbotAuditLog.create({
                user_id: user.id,
                action: 'finbot.fetch_report',
                entity_type: 'FinbotReportRun',
                entity_id: reportRun.id,
                request_data: { report_type, period_start, period_end },
                success: true
            });

            return Response.json({ 
                reportRun: {
                    ...reportRun,
                    status: 'success',
                    result: reportData
                }
            });

        } catch (apiError) {
            await base44.entities.FinbotReportRun.update(reportRun.id, {
                status: 'error',
                last_error: apiError.message
            });

            // Log failure
            await base44.entities.FinbotAuditLog.create({
                user_id: user.id,
                action: 'finbot.fetch_report',
                entity_type: 'FinbotReportRun',
                entity_id: reportRun.id,
                request_data: { report_type, period_start, period_end },
                response_data: { error: apiError.message },
                success: false
            });

            throw apiError;
        }
    } catch (error) {
        console.error('Error fetching report:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});