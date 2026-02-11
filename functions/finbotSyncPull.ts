import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sync data from Finbot
 * Input: {resource: "customers" | "documents" | "expenses"}
 *
 * Real Finbot API (from Swagger):
 * - GET /reports/app-dashboard-data-current-month → dashboard with recent data
 * - GET /customer/{id} → single customer by ID
 * - GET /user-income/{id} → single income doc by ID
 * - GET /accounting-docs/{id} → single expense doc by ID
 *
 * Finbot has NO bulk-list endpoints. We sync from dashboard + known IDs.
 * Header: secret: <token>
 */

const FINBOT_API_BASE = 'https://api.finbotai.co.il';

const JOB_TYPE_MAP = {
    customers: 'pull_customers',
    documents: 'pull_documents',
    expenses: 'pull_expenses'
};

async function getFinbotAuth(base44, userId) {
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    if (connections?.length > 0 && connections[0].status === 'connected') {
        if (connections[0].api_key_ref) return { token: connections[0].api_key_ref, connection: connections[0] };
        if (connections[0].access_token_ref) return { token: connections[0].access_token_ref, connection: connections[0] };
    }
    const globalToken = Deno.env.get('FINBOT_API_TOKEN');
    if (globalToken) {
        const conns = await base44.entities.FinbotConnection.filter({ user_id: userId });
        return { token: globalToken, connection: conns?.[0] || null };
    }
    throw new Error('לא נמצא טוקן Finbot.');
}

async function fetchDashboard(apiToken) {
    const res = await fetch(`${FINBOT_API_BASE}/reports/app-dashboard-data-current-month`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'secret': apiToken }
    });
    if (!res.ok) throw new Error(`Finbot dashboard error: ${res.status}`);
    return await res.json();
}

async function syncCustomers(base44, userId, apiToken) {
    let synced = 0;

    // Try dashboard data first
    try {
        const dashboard = await fetchDashboard(apiToken);
        const customers = dashboard?.customers || [];
        for (const c of customers) {
            const custId = String(c.id || '');
            if (!custId) continue;
            const existing = await base44.entities.FinbotCustomer.filter({ user_id: userId, finbot_customer_id: custId });
            const d = {
                user_id: userId, finbot_customer_id: custId,
                name: c.name || '', id_number: c.tax || null,
                email: c.email || null, phone: c.phone || null,
                address: c.address || null,
                raw: typeof c === 'object' ? c : { data: c },
                synced_at: new Date().toISOString()
            };
            if (existing?.length > 0) await base44.entities.FinbotCustomer.update(existing[0].id, d);
            else await base44.entities.FinbotCustomer.create(d);
            synced++;
        }
    } catch (e) {
        console.log('Dashboard customers error:', e.message);
    }

    // Also refresh known customers by ID
    const locals = await base44.entities.FinbotCustomer.filter({ user_id: userId });
    for (const local of locals) {
        if (!local.finbot_customer_id) continue;
        try {
            const res = await fetch(`${FINBOT_API_BASE}/customer/${local.finbot_customer_id}`, {
                headers: { 'Content-Type': 'application/json', 'secret': apiToken }
            });
            if (res.ok) {
                const c = await res.json();
                await base44.entities.FinbotCustomer.update(local.id, {
                    name: c.name || local.name, email: c.email || local.email,
                    phone: c.phone || local.phone,
                    raw: typeof c === 'object' ? c : { data: c },
                    synced_at: new Date().toISOString()
                });
                if (synced === 0) synced++;
            }
        } catch (e) {
            console.log(`Customer ${local.finbot_customer_id} fetch error:`, e.message);
        }
    }

    return synced || locals.length;
}

async function syncDocuments(base44, userId, apiToken) {
    let synced = 0;
    const typeMap = { '0':'invoice','1':'receipt','2':'invoice_receipt','3':'payment_request','4':'credit','5':'order','6':'delivery','7':'quote','8':'bill' };

    // Try dashboard
    try {
        const dashboard = await fetchDashboard(apiToken);
        const docs = dashboard?.incomes || dashboard?.documents || [];
        for (const doc of docs) {
            const docId = String(doc.id || '');
            if (!docId) continue;
            const existing = await base44.entities.FinbotDocument.filter({ user_id: userId, finbot_document_id: docId });
            const d = {
                user_id: userId, finbot_document_id: docId,
                type: typeMap[String(doc.type)] || 'receipt',
                customer_name: doc.customer?.name || doc.customerName || null,
                issue_date: doc.date || null, currency: doc.currency || 'ILS',
                total: doc.total || null, status: 'created',
                pdf_url: doc.pdf_link || doc.link || (typeof doc.data === 'string' ? doc.data : null),
                raw: typeof doc === 'object' ? doc : { data: doc },
                synced_at: new Date().toISOString()
            };
            if (existing?.length > 0) await base44.entities.FinbotDocument.update(existing[0].id, d);
            else await base44.entities.FinbotDocument.create(d);
            synced++;
        }
    } catch (e) {
        console.log('Dashboard documents error:', e.message);
    }

    // Refresh known docs by ID
    const locals = await base44.entities.FinbotDocument.filter({ user_id: userId });
    for (const local of locals) {
        if (!local.finbot_document_id) continue;
        try {
            const res = await fetch(`${FINBOT_API_BASE}/user-income/${local.finbot_document_id}`, {
                headers: { 'Content-Type': 'application/json', 'secret': apiToken }
            });
            if (res.ok) {
                const doc = await res.json();
                await base44.entities.FinbotDocument.update(local.id, {
                    total: doc.total || local.total,
                    pdf_url: doc.pdf_link || doc.link || local.pdf_url,
                    raw: typeof doc === 'object' ? doc : { data: doc },
                    synced_at: new Date().toISOString()
                });
                if (synced === 0) synced++;
            }
        } catch (e) {
            console.log(`Doc ${local.finbot_document_id} fetch error:`, e.message);
        }
    }

    return synced || locals.length;
}

async function syncExpenses(base44, userId, apiToken) {
    let synced = 0;

    try {
        const dashboard = await fetchDashboard(apiToken);
        const expenses = dashboard?.expenses || dashboard?.accountingDocs || [];
        for (const e of expenses) {
            const expId = String(e.id || '');
            if (!expId) continue;
            const existing = await base44.entities.FinbotExpense.filter({ user_id: userId, finbot_expense_id: expId });
            const d = {
                user_id: userId, finbot_expense_id: expId,
                vendor: e.vendor || e.supplier_name || e.name || null,
                category: e.category || null, date: e.date || null,
                amount: e.amount || e.total || null, vat: e.vat || null,
                raw: typeof e === 'object' ? e : { data: e },
                synced_at: new Date().toISOString()
            };
            if (existing?.length > 0) await base44.entities.FinbotExpense.update(existing[0].id, d);
            else await base44.entities.FinbotExpense.create(d);
            synced++;
        }
    } catch (e) {
        console.log('Dashboard expenses error:', e.message);
    }

    // Refresh known expenses by ID
    const locals = await base44.entities.FinbotExpense.filter({ user_id: userId });
    for (const local of locals) {
        if (!local.finbot_expense_id) continue;
        try {
            const res = await fetch(`${FINBOT_API_BASE}/accounting-docs/${local.finbot_expense_id}`, {
                headers: { 'Content-Type': 'application/json', 'secret': apiToken }
            });
            if (res.ok) {
                const exp = await res.json();
                await base44.entities.FinbotExpense.update(local.id, {
                    amount: exp.amount || exp.total || local.amount,
                    raw: typeof exp === 'object' ? exp : { data: exp },
                    synced_at: new Date().toISOString()
                });
                if (synced === 0) synced++;
            }
        } catch (e) {
            console.log(`Expense ${local.finbot_expense_id} fetch error:`, e.message);
        }
    }

    return synced || locals.length;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { resource } = await req.json();
        if (!resource || !['customers', 'documents', 'expenses'].includes(resource)) {
            return Response.json({ error: 'סוג משאב לא תקין' }, { status: 400 });
        }

        const job = await base44.entities.FinbotSyncJob.create({
            user_id: user.id, job_type: JOB_TYPE_MAP[resource],
            status: 'running', started_at: new Date().toISOString()
        });

        try {
            const { token, connection } = await getFinbotAuth(base44, user.id);
            let syncedCount = 0;
            if (resource === 'customers') syncedCount = await syncCustomers(base44, user.id, token);
            else if (resource === 'documents') syncedCount = await syncDocuments(base44, user.id, token);
            else if (resource === 'expenses') syncedCount = await syncExpenses(base44, user.id, token);

            await base44.entities.FinbotSyncJob.update(job.id, { status: 'success', finished_at: new Date().toISOString() });
            if (connection) await base44.entities.FinbotConnection.update(connection.id, { last_sync_at: new Date().toISOString() });

            await base44.entities.FinbotAuditLog.create({
                user_id: user.id, action: `finbot.sync_${resource}`,
                entity_type: 'FinbotSyncJob', entity_id: job.id,
                response_data: { synced_count: syncedCount }, success: true
            });

            return Response.json({ job_id: job.id, status: 'success', synced_count: syncedCount });
        } catch (apiError) {
            console.error('Sync error:', apiError.message);
            await base44.entities.FinbotSyncJob.update(job.id, {
                status: 'error', last_error: apiError.message, finished_at: new Date().toISOString()
            });
            throw apiError;
        }
    } catch (error) {
        console.error('Error syncing:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});