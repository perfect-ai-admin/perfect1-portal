import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Fetch reports from Finbot
 * 
 * Real Finbot API (from Swagger):
 * - GET /reports/app-dashboard-data-current-month → dashboard summary with income/expense data
 * - GET /user-income/{id} → single income doc
 * - GET /customer/{id} → single customer
 * 
 * Header: secret: <token>
 */

const FINBOT_API_BASE = 'https://api.finbotai.co.il';

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
        const base44sdk = createClientFromRequest(req);
        const user = await base44sdk.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { report_type, period_start, period_end } = body;

        const apiToken = await getFinbotToken(base44sdk, user.id);

        const reportRun = await base44sdk.entities.FinbotReportRun.create({
            user_id: user.id, report_type: report_type || 'dashboard',
            period_start: period_start || '', period_end: period_end || '',
            status: 'running'
        });

        try {
            // Use the real dashboard endpoint
            const url = `${FINBOT_API_BASE}/reports/app-dashboard-data-current-month`;
            console.log('Fetching Finbot report:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'secret': apiToken }
            });

            const responseText = await response.text();
            console.log('Finbot report response:', response.status, responseText.substring(0, 500));

            let reportData;
            try { reportData = JSON.parse(responseText); }
            catch { reportData = { raw_response: responseText }; }

            // If Finbot API fails (403/etc), fall back to local data only
            if (!response.ok) {
                console.log('Finbot API not available, using local data only');
                reportData = null;
            }

            // Enrich with local data
            const localDocs = await base44sdk.entities.FinbotDocument.filter({ user_id: user.id });
            const localExpenses = await base44sdk.entities.FinbotExpense.filter({ user_id: user.id });
            const localCustomers = await base44sdk.entities.FinbotCustomer.filter({ user_id: user.id });

            const totalIncome = localDocs.reduce((s, d) => s + (d.total || 0), 0);
            const totalExpenses = localExpenses.reduce((s, e) => s + (e.amount || 0), 0);

            const enrichedResult = {
                finbot_data: reportData || {},
                local_summary: {
                    total_income: totalIncome,
                    total_expenses: totalExpenses,
                    profit: totalIncome - totalExpenses,
                    documents_count: localDocs.length,
                    expenses_count: localExpenses.length,
                    customers_count: localCustomers.length
                }
            };

            await base44sdk.entities.FinbotReportRun.update(reportRun.id, {
                status: 'success',
                result: enrichedResult
            });

            await base44sdk.entities.FinbotAuditLog.create({
                user_id: user.id, action: 'finbot.fetch_report',
                entity_type: 'FinbotReportRun', entity_id: reportRun.id,
                request_data: { report_type, period_start, period_end }, success: true
            });

            return Response.json({
                reportRun: { ...reportRun, status: 'success', result: enrichedResult }
            });
        } catch (apiError) {
            console.error('Report error:', apiError.message);
            await base44sdk.entities.FinbotReportRun.update(reportRun.id, {
                status: 'error', last_error: apiError.message
            });
            throw apiError;
        }
    } catch (error) {
        console.error('Error fetching report:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});