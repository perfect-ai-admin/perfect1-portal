import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sync data from Finbot
 * Input: {resource: "customers" | "documents" | "expenses", fullSync?: boolean}
 * 
 * Uses Finbot API v2 with secret header authentication
 */

const FINBOT_API_BASE = 'https://api.finbot.co.il/api/v2';

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
        const connection = connections[0];
        if (connection.api_key_ref) return { token: connection.api_key_ref, connection };
        if (connection.access_token_ref) return { token: connection.access_token_ref, connection };
    }

    const globalToken = Deno.env.get('FINBOT_API_TOKEN');
    if (globalToken) {
        const conns = await base44.entities.FinbotConnection.filter({ user_id: userId });
        return { token: globalToken, connection: conns?.[0] || null };
    }

    throw new Error('לא נמצא טוקן Finbot. יש להתחבר למערכת חשבונות.');
}

async function syncCustomers(base44, userId, apiToken) {
    const response = await fetch(`${FINBOT_API_BASE}${FINBOT_ENDPOINTS.customers}`, {
        headers: { 'Content-Type': 'application/json', 'secret': apiToken }
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`שגיאה בשליפת לקוחות מ-Finbot: ${errText}`);
    }
    
    const data = await response.json();
    const customers = Array.isArray(data) ? data : (data.clients || data.data || data.items || []);
    
    let synced = 0;
    for (const customer of customers) {
        const custId = String(customer.id || customer.client_id || '');
        const existing = await base44.entities.FinbotCustomer.filter({
            user_id: userId,
            finbot_customer_id: custId
        });

        const customerData = {
            user_id: userId,
            finbot_customer_id: custId,
            name: customer.name || customer.client_name || '',
            id_number: customer.id_number || customer.tax_id || null,
            email: customer.email || null,
            phone: customer.phone || customer.mobile || null,
            address: customer.address || null,
            city: customer.city || null,
            zip: customer.zip || customer.zipcode || null,
            notes: customer.notes || null,
            raw: customer,
            synced_at: new Date().toISOString()
        };

        if (existing && existing.length > 0) {
            await base44.entities.FinbotCustomer.update(existing[0].id, customerData);
        } else {
            await base44.entities.FinbotCustomer.create(customerData);
        }
        synced++;
    }
    return synced;
}

async function syncDocuments(base44, userId, apiToken) {
    const response = await fetch(`${FINBOT_API_BASE}${FINBOT_ENDPOINTS.documents}`, {
        headers: { 'Content-Type': 'application/json', 'secret': apiToken }
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`שגיאה בשליפת מסמכים מ-Finbot: ${errText}`);
    }
    
    const data = await response.json();
    const documents = Array.isArray(data) ? data : (data.documents || data.data || data.items || []);
    
    let synced = 0;
    for (const doc of documents) {
        const docId = String(doc.id || doc.document_id || doc.doc_id || '');
        const existing = await base44.entities.FinbotDocument.filter({
            user_id: userId,
            finbot_document_id: docId
        });

        // Map Finbot type numbers to our types
        let docType = 'receipt';
        if (doc.type === 320 || doc.type === 'invoice_receipt') docType = 'invoice_receipt';
        else if (doc.type === 330 || doc.type === 'credit') docType = 'credit';
        else if (doc.type === 405 || doc.type === 'receipt') docType = 'receipt';

        const docData = {
            user_id: userId,
            finbot_document_id: docId,
            type: docType,
            customer_finbot_id: doc.client_id ? String(doc.client_id) : null,
            customer_name: doc.client_name || doc.customer_name || null,
            issue_date: doc.date || doc.issue_date || null,
            currency: doc.currency || 'ILS',
            subtotal: doc.sub_total || doc.subtotal || doc.amount_before_vat || null,
            vat: doc.vat_total || doc.vat || doc.vat_amount || null,
            total: doc.total || doc.amount || null,
            status: doc.status || 'created',
            pdf_url: doc.pdf_link || doc.pdf_url || doc.link || null,
            items: doc.items || doc.item || null,
            raw: doc,
            synced_at: new Date().toISOString()
        };

        if (existing && existing.length > 0) {
            await base44.entities.FinbotDocument.update(existing[0].id, docData);
        } else {
            await base44.entities.FinbotDocument.create(docData);
        }
        synced++;
    }
    return synced;
}

async function syncExpenses(base44, userId, apiToken) {
    const response = await fetch(`${FINBOT_API_BASE}${FINBOT_ENDPOINTS.expenses}`, {
        headers: { 'Content-Type': 'application/json', 'secret': apiToken }
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`שגיאה בשליפת הוצאות מ-Finbot: ${errText}`);
    }
    
    const data = await response.json();
    const expenses = Array.isArray(data) ? data : (data.expenses || data.data || data.items || []);
    
    let synced = 0;
    for (const expense of expenses) {
        const expId = String(expense.id || expense.expense_id || '');
        const existing = await base44.entities.FinbotExpense.filter({
            user_id: userId,
            finbot_expense_id: expId
        });

        const expenseData = {
            user_id: userId,
            finbot_expense_id: expId,
            vendor: expense.vendor || expense.supplier_name || expense.name || null,
            category: expense.category || null,
            date: expense.date || null,
            amount: expense.amount || expense.total || null,
            vat: expense.vat || expense.vat_amount || expense.vat_total || null,
            payment_method: expense.payment_method || null,
            attachment_url: expense.attachment_url || expense.file_url || expense.pdf_link || null,
            raw: expense,
            synced_at: new Date().toISOString()
        };

        if (existing && existing.length > 0) {
            await base44.entities.FinbotExpense.update(existing[0].id, expenseData);
        } else {
            await base44.entities.FinbotExpense.create(expenseData);
        }
        synced++;
    }
    return synced;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { resource, fullSync } = body;

        if (!resource || !['customers', 'documents', 'expenses'].includes(resource)) {
            return Response.json({ error: 'סוג משאב לא תקין' }, { status: 400 });
        }

        // Create sync job
        const job = await base44.entities.FinbotSyncJob.create({
            user_id: user.id,
            job_type: JOB_TYPE_MAP[resource],
            status: 'running',
            started_at: new Date().toISOString()
        });

        try {
            const { token, connection } = await getFinbotAuth(base44, user.id);

            let syncedCount = 0;

            if (resource === 'customers') {
                syncedCount = await syncCustomers(base44, user.id, token);
            } else if (resource === 'documents') {
                syncedCount = await syncDocuments(base44, user.id, token);
            } else if (resource === 'expenses') {
                syncedCount = await syncExpenses(base44, user.id, token);
            }

            // Update job status
            await base44.entities.FinbotSyncJob.update(job.id, {
                status: 'success',
                finished_at: new Date().toISOString()
            });

            // Update last sync time on connection
            if (connection) {
                await base44.entities.FinbotConnection.update(connection.id, {
                    last_sync_at: new Date().toISOString()
                });
            }

            // Log action
            await base44.entities.FinbotAuditLog.create({
                user_id: user.id,
                action: `finbot.sync_${resource}`,
                entity_type: 'FinbotSyncJob',
                entity_id: job.id,
                response_data: { synced_count: syncedCount },
                success: true
            });

            return Response.json({ 
                job_id: job.id, 
                status: 'success',
                synced_count: syncedCount
            });

        } catch (apiError) {
            await base44.entities.FinbotSyncJob.update(job.id, {
                status: 'error',
                last_error: apiError.message,
                finished_at: new Date().toISOString()
            });

            throw apiError;
        }
    } catch (error) {
        console.error('Error syncing:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});