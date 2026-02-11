import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sync data from Finbot
 * Input: {resource: "customers" | "documents" | "expenses", fullSync?: boolean}
 */

// TODO: Adjust endpoints based on actual Finbot API documentation
const FINBOT_ENDPOINTS = {
    customers: '/customers',
    documents: '/documents',
    expenses: '/expenses'
};

const JOB_TYPE_MAP = {
    customers: 'pull_customers',
    documents: 'pull_documents',
    expenses: 'pull_expenses'
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

async function syncCustomers(base44, userId, baseUrl, authHeader) {
    const response = await fetch(`${baseUrl}${FINBOT_ENDPOINTS.customers}`, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`Finbot API error: ${await response.text()}`);
    
    const data = await response.json();
    const customers = data.customers || data.data || data;
    
    let synced = 0;
    for (const customer of customers) {
        const existing = await base44.entities.FinbotCustomer.filter({
            user_id: userId,
            finbot_customer_id: customer.id || customer.customer_id
        });

        const customerData = {
            user_id: userId,
            finbot_customer_id: customer.id || customer.customer_id,
            name: customer.name,
            id_number: customer.id_number,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            zip: customer.zip,
            notes: customer.notes,
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

async function syncDocuments(base44, userId, baseUrl, authHeader) {
    const response = await fetch(`${baseUrl}${FINBOT_ENDPOINTS.documents}`, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`Finbot API error: ${await response.text()}`);
    
    const data = await response.json();
    const documents = data.documents || data.data || data;
    
    let synced = 0;
    for (const doc of documents) {
        const existing = await base44.entities.FinbotDocument.filter({
            user_id: userId,
            finbot_document_id: doc.id || doc.document_id
        });

        const docData = {
            user_id: userId,
            finbot_document_id: doc.id || doc.document_id,
            type: doc.type || doc.document_type || 'receipt',
            customer_finbot_id: doc.customer_id,
            customer_name: doc.customer_name,
            issue_date: doc.date || doc.issue_date,
            currency: doc.currency || 'ILS',
            subtotal: doc.subtotal || doc.amount_before_vat,
            vat: doc.vat || doc.vat_amount,
            total: doc.total || doc.amount,
            status: doc.status,
            pdf_url: doc.pdf_url || doc.download_url,
            items: doc.items || doc.lines,
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

async function syncExpenses(base44, userId, baseUrl, authHeader) {
    const response = await fetch(`${baseUrl}${FINBOT_ENDPOINTS.expenses}`, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`Finbot API error: ${await response.text()}`);
    
    const data = await response.json();
    const expenses = data.expenses || data.data || data;
    
    let synced = 0;
    for (const expense of expenses) {
        const existing = await base44.entities.FinbotExpense.filter({
            user_id: userId,
            finbot_expense_id: expense.id || expense.expense_id
        });

        const expenseData = {
            user_id: userId,
            finbot_expense_id: expense.id || expense.expense_id,
            vendor: expense.vendor || expense.supplier_name,
            category: expense.category,
            date: expense.date,
            amount: expense.amount || expense.total,
            vat: expense.vat || expense.vat_amount,
            payment_method: expense.payment_method,
            attachment_url: expense.attachment_url || expense.file_url,
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
            return Response.json({ error: 'Invalid resource type' }, { status: 400 });
        }

        // Create sync job
        const job = await base44.entities.FinbotSyncJob.create({
            user_id: user.id,
            job_type: JOB_TYPE_MAP[resource],
            status: 'running',
            started_at: new Date().toISOString()
        });

        try {
            const { baseUrl, authHeader, connection } = await getFinbotClient(base44, user.id);

            let syncedCount = 0;

            if (resource === 'customers') {
                syncedCount = await syncCustomers(base44, user.id, baseUrl, authHeader);
            } else if (resource === 'documents') {
                syncedCount = await syncDocuments(base44, user.id, baseUrl, authHeader);
            } else if (resource === 'expenses') {
                syncedCount = await syncExpenses(base44, user.id, baseUrl, authHeader);
            }

            // Update job status
            await base44.entities.FinbotSyncJob.update(job.id, {
                status: 'success',
                finished_at: new Date().toISOString()
            });

            // Update last sync time on connection
            await base44.entities.FinbotConnection.update(connection.id, {
                last_sync_at: new Date().toISOString()
            });

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