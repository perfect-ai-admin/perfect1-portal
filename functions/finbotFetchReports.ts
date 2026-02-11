import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Fetch reports from Finbot
 * Input: {report_type: "pnl" | "vat" | "customers", period_start, period_end}
 * 
 * Uses Finbot API: https://api.finbotai.co.il/
 * Header: secret: <token>
 */

const FINBOT_API_BASE = 'https://api.finbotai.co.il';

const REPORT_ENDPOINTS = {
    pnl: '/reports/profit-loss',
    vat: '/reports/vat',
    customers: '/reports/customers'
};

async function getFinbotToken(base44, userId) {
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    if (connections?.length > 0 && connections[0].status === 'connected') {
        if (connections[0].api_key_ref) return connections[0].api_key_ref;
        if (connections[0].access_token_ref) return connections[0].access_token_ref;
    }
    const globalToken = Deno.env.get('FINBOT_API_TOKEN');
    if (globalToken) return globalToken;
    throw new Error('לא נמצא טוקן Finbot.');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { report_type, period_start, period_end } = await req.json();

        if (!report_type || !REPORT_ENDPOINTS[report_type]) {
            return Response.json({ error: 'סוג דוח לא תקין' }, { status: 400 });
        }
        if (!period_start || !period_end) {
            return Response.json({ error: 'חובה לציין תאריך התחלה וסיום' }, { status: 400 });
        }

        const reportRun = await base44.entities.FinbotReportRun.create({
            user_id: user.id, report_type, period_start, period_end, status: 'running'
        });

        try {
            const apiToken = await getFinbotToken(base44, user.id);
            const url = `${FINBOT_API_BASE}${REPORT_ENDPOINTS[report_type]}?from=${period_start}&to=${period_end}`;
            
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json', 'secret': apiToken }
            });

            const responseText = await response.text();
            let reportData;
            try { reportData = JSON.parse(responseText); } 
            catch { reportData = { raw_response: responseText }; }

            if (!response.ok) {
                throw new Error(reportData?.message || `שגיאה בשליפת דוח (${response.status})`);
            }

            await base44.entities.FinbotReportRun.update(reportRun.id, { status: 'success', result: reportData });

            await base44.entities.FinbotAuditLog.create({
                user_id: user.id, action: 'finbot.fetch_report',
                entity_type: 'FinbotReportRun', entity_id: reportRun.id,
                request_data: { report_type, period_start, period_end }, success: true
            });

            return Response.json({ reportRun: { ...reportRun, status: 'success', result: reportData } });
        } catch (apiError) {
            await base44.entities.FinbotReportRun.update(reportRun.id, { status: 'error', last_error: apiError.message });
            throw apiError;
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});