import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sync data from Finbot
 * Input: {resource: "customers" | "documents" | "expenses", fullSync?: boolean}
 * 
 * Real Finbot API: https://api.finbotai.co.il/
 * Header: secret: <token>
 */

const FINBOT_API_BASE = 'https://api.finbotai.co.il';

const FINBOT_ENDPOINTS = {
    customers: '/clients',
    documents: '/income',
    expenses: '/expense'
};

const JOB_TYPE_MAP = {
    customers: 'pull_customers',
    documents: 'pull_documents',
    expenses: 'pull_expenses'
};

async function getFinbotAuth(base44, userId) {
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    if (connections && connections.length > 0 && connections[0].status === 'connected') {
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

async function syncCustomers(base44, userId, apiToken) {
    const response = await fetch(`${FINBOT_API_BASE}${FINBOT_ENDPOINTS.customers}`, {
        headers: { 'Content-Type': 'application/json', 'secret': apiToken }
    });
    if (!response.ok) throw new Error(`שגיאה בשליפת לקוחות: ${await response.text()}`);
    
    const data = await response.json();
    const customers = Array.isArray(data) ? data : (data.clients || data.data || data.items || []);
    
    let synced = 0;
    for (const c of customers) {
        const custId = String(c.id || c.client_id || '');
        const existing = await base44.entities.FinbotCustomer.filter({ user_id: userId, finbot_customer_id: custId });
        const d = {
            user_id: userId, finbot_customer_id: custId,
            name: c.name || '', id_number: c.tax || c.id_number || null,
            email: c.email || null, phone: c.phone || null,
            address: c.address || null, city: c.city || null, zip: c.zip || null,
            notes: c.notes || null, raw: c, synced_at: new Date().toISOString()
        };
        if (existing?.length > 0) await base44.entities.FinbotCustomer.update(existing[0].id, d);
        else await base44.entities.FinbotCustomer.create(d);
        synced++;
    }
    return synced;
}

async function syncDocuments(base44, userId, apiToken) {
    const response = await fetch(`${FINBOT_API_BASE}${FINBOT_ENDPOINTS.documents}`, {
        headers: { 'Content-Type': 'application/json', 'secret': apiToken }
    });
    if (!response.ok) throw new Error(`שגיאה בשליפת מסמכים: ${await response.text()}`);
    
    const data = await response.json();
    const documents = Array.isArray(data) ? data : (data.documents || data.data || data.items || []);
    
    const typeMap = { '0': 'invoice', '1': 'receipt', '2': 'invoice_receipt', '3': 'payment_request', '4': 'credit' };
    let synced = 0;
    for (const doc of documents) {
        const docId = String(doc.id || doc.document_id || '');
        const existing = await base44.entities.FinbotDocument.filter({ user_id: userId, finbot_document_id: docId });
        const d = {
            user_id: userId, finbot_document_id: docId,
            type: typeMap[String(doc.type)] || 'receipt',
            customer_finbot_id: doc.customer?.id ? String(doc.customer.id) : null,
            customer_name: doc.customer?.name || null,
            issue_date: doc.date || null,
            currency: doc.currency || 'ILS',
            subtotal: doc.sub_total || doc.subtotal || null,
            vat: doc.vat_total || doc.vat || null,
            total: doc.total || null,
            status: doc.status || 'created',
            pdf_url: doc.pdf_link || doc.link || doc.data || null,
            items: doc.items || null,
            raw: doc, synced_at: new Date().toISOString()
        };
        if (existing?.length > 0) await base44.entities.FinbotDocument.update(existing[0].id, d);
        else await base44.entities.FinbotDocument.create(d);
        synced++;
    }
    return synced;
}

async function syncExpenses(base44, userId, apiToken) {
    const response = await fetch(`${FINBOT_API_BASE}${FINBOT_ENDPOINTS.expenses}`, {
        headers: { 'Content-Type': 'application/json', 'secret': apiToken }
    });
    if (!response.ok) throw new Error(`שגיאה בשליפת הוצאות: ${await response.text()}`);
    
    const data = await response.json();
    const expenses = Array.isArray(data) ? data : (data.expenses || data.data || data.items || []);
    
    let synced = 0;
    for (const e of expenses) {
        const expId = String(e.id || e.expense_id || '');
        const existing = await base44.entities.FinbotExpense.filter({ user_id: userId, finbot_expense_id: expId });
        const d = {
            user_id: userId, finbot_expense_id: expId,
            vendor: e.vendor || e.supplier_name || e.name || null,
            category: e.category || null, date: e.date || null,
            amount: e.amount || e.total || null, vat: e.vat || e.vat_total || null,
            payment_method: e.payment_method || null,
            attachment_url: e.attachment_url || e.pdf_link || null,
            raw: e, synced_at: new Date().toISOString()
        };
        if (existing?.length > 0) await base44.entities.FinbotExpense.update(existing[0].id, d);
        else await base44.entities.FinbotExpense.create(d);
        synced++;
    }
    return synced;
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
            await base44.entities.FinbotSyncJob.update(job.id, { status: 'error', last_error: apiError.message, finished_at: new Date().toISOString() });
            throw apiError;
        }
    } catch (error) {
        console.error('Error syncing:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});