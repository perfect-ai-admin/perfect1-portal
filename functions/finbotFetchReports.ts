import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Fetch reports from Finbot
 * Input: {report_type: "pnl" | "vat" | "customers", period_start, period_end}
 */

// TODO: Adjust endpoints based on actual Finbot API documentation
const FINBOT_ENDPOINTS = {
    reports: '/reports',
    pnl: '/reports/profit-loss',
    vat: '/reports/vat',
    customers: '/reports/customers'
};

async function getFinbotClient(base44, userId) {
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    
    if (!connections || connections.length === 0 || connections[0].status !== 'connected') {
        throw new Error('Not connected to Finbot');
    }

    const connection = connections[0];
    const baseUrl = Deno.env.get('FINBOT_BASE_URL') || 'https://api.finbot.co.il';
    
    let authHeader;
    if (connection.api_key_ref) {
        authHeader = `Bearer ${connection.api_key_ref}`;
    } else if (connection.access_token_ref) {
        authHeader = `Bearer ${connection.access_token_ref}`;
    } else {
        throw new Error('No valid credentials found');
    }

    return { baseUrl, authHeader, connection };
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
            return Response.json({ error: 'Invalid report type' }, { status: 400 });
        }

        if (!period_start || !period_end) {
            return Response.json({ error: 'Period start and end are required' }, { status: 400 });
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
            const { baseUrl, authHeader } = await getFinbotClient(base44, user.id);

            // Get appropriate endpoint
            const endpoint = FINBOT_ENDPOINTS[report_type] || FINBOT_ENDPOINTS.reports;
            
            // Fetch report from Finbot
            const url = `${baseUrl}${endpoint}?from=${period_start}&to=${period_end}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Finbot API error: ${errorText}`);
            }

            const reportData = await response.json();

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
            // Update report run with error
            await base44.entities.FinbotReportRun.update(reportRun.id, {
                status: 'error',
                last_error: apiError.message
            });

            throw apiError;
        }
    } catch (error) {
        console.error('Error fetching report:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});