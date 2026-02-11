import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Create an income document in Finbot (receipt, invoice_receipt, credit)
 * Based on Finbot API docs: POST https://api.finbot.co.il/api/v2/income
 * Headers: Content-Type: application/json, secret: <API_TOKEN>
 * 
 * Input: {
 *   type: "receipt" | "invoice_receipt" | "credit",
 *   customer_id: (local) OR customer_finbot_id,
 *   issue_date,
 *   currency: "ILS",
 *   items: [{description, quantity, unit_price, vat_rate?}],
 *   payment: [{date, type, price, currency?, currency_rate?, bank_name?, branch?, account?, cheque_num?, card_type?, card_num?, deal_type?, num_payments?}],
 *   lang?: "he" | "en",
 *   notes?
 * }
 */

// Finbot document type mapping to API values
const DOCUMENT_TYPE_MAP = {
    receipt: 405,              // קבלה
    invoice_receipt: 320,      // חשבונית מס / קבלה
    credit: 330                // זיכוי
};

// Payment type mapping
const PAYMENT_TYPE_MAP = {
    cash: 1,
    cheque: 2,
    bank_transfer: 3,
    credit_card: 4,
    other: 10,
    paypal: 11,
    payment_app: 12
};

const FINBOT_API_BASE = 'https://api.finbot.co.il/api/v2';

async function getFinbotAuth(base44, userId) {
    // First check if user has a personal connection
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    
    if (connections && connections.length > 0 && connections[0].status === 'connected') {
        const connection = connections[0];
        // Use the user's personal token if available
        if (connection.api_key_ref) return connection.api_key_ref;
        if (connection.access_token_ref) return connection.access_token_ref;
    }

    // Fallback to global API token
    const globalToken = Deno.env.get('FINBOT_API_TOKEN');
    if (globalToken) return globalToken;

    throw new Error('לא נמצא טוקן Finbot. יש להתחבר למערכת חשבונות.');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, customer_id, customer_finbot_id, issue_date, currency, items, payment, lang, notes } = body;

        // Validate document type
        if (!type || !DOCUMENT_TYPE_MAP[type]) {
            return Response.json({ error: 'סוג מסמך לא תקין. אפשרויות: receipt, invoice_receipt, credit' }, { status: 400 });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return Response.json({ error: 'חובה להוסיף לפחות פריט אחד' }, { status: 400 });
        }

        const apiToken = await getFinbotAuth(base44, user.id);

        // Resolve customer info
        let resolvedCustomerFinbotId = customer_finbot_id;
        let customerName = null;
        
        if (customer_id && !customer_finbot_id) {
            const customers = await base44.entities.FinbotCustomer.filter({ 
                user_id: user.id,
                id: customer_id 
            });
            if (customers && customers.length > 0) {
                resolvedCustomerFinbotId = customers[0].finbot_customer_id;
                customerName = customers[0].name;
            }
        }

        // Build items array per Finbot API spec
        const finbotItems = items.map(item => {
            const row = {
                description: item.description,
                quantity: item.quantity || 1,
                price: item.unit_price || item.price || 0,
            };
            // vat_type: 0 = default VAT, 1 = exempt, 2 = no VAT
            if (item.vat_type !== undefined) row.vat_type = item.vat_type;
            if (item.item_id) row.item_id = item.item_id;
            return row;
        });

        // Build payment array per Finbot API spec
        let finbotPayment = [];
        if (payment && Array.isArray(payment) && payment.length > 0) {
            finbotPayment = payment.map(p => {
                const payRow = {
                    date: p.date || issue_date || new Date().toISOString().split('T')[0],
                    type: typeof p.type === 'number' ? p.type : (PAYMENT_TYPE_MAP[p.type] || 1),
                    price: p.price || 0,
                };
                if (p.currency) payRow.currency = p.currency;
                if (p.currency_rate) payRow.currency_rate = p.currency_rate;
                // Cheque fields
                if (p.bank_name) payRow.bank_name = p.bank_name;
                if (p.branch) payRow.branch = p.branch;
                if (p.account) payRow.account = p.account;
                if (p.cheque_num) payRow.cheque_num = p.cheque_num;
                // Credit card fields
                if (p.card_type) payRow.card_type = p.card_type;
                if (p.card_num) payRow.card_num = p.card_num;
                if (p.deal_type) payRow.deal_type = p.deal_type;
                if (p.num_payments) payRow.num_payments = p.num_payments;
                return payRow;
            });
        } else {
            // Default payment: cash, full amount, today
            const totalAmount = finbotItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            finbotPayment = [{
                date: issue_date || new Date().toISOString().split('T')[0],
                type: 1, // cash
                price: totalAmount
            }];
        }

        // Build the Finbot API payload
        const finbotPayload = {
            type: DOCUMENT_TYPE_MAP[type],
            lang: lang || 'he',
            currency: currency || 'ILS',
            date: issue_date || new Date().toISOString().split('T')[0],
            item: finbotItems,
            payment: finbotPayment,
        };

        // Add customer if resolved
        if (resolvedCustomerFinbotId) {
            finbotPayload.client_id = resolvedCustomerFinbotId;
        }

        // Add description/notes if provided
        if (notes) {
            finbotPayload.comment = notes;
        }

        console.log('Finbot payload:', JSON.stringify(finbotPayload));

        // Call Finbot API
        const response = await fetch(`${FINBOT_API_BASE}/income`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'secret': apiToken
            },
            body: JSON.stringify(finbotPayload)
        });

        const responseText = await response.text();
        console.log('Finbot response status:', response.status, 'body:', responseText);

        let finbotResult;
        try {
            finbotResult = JSON.parse(responseText);
        } catch {
            finbotResult = { raw_response: responseText };
        }

        if (!response.ok) {
            // Log error
            await base44.entities.FinbotAuditLog.create({
                user_id: user.id,
                action: 'finbot.create_document',
                entity_type: 'FinbotDocument',
                request_data: finbotPayload,
                response_data: finbotResult,
                success: false
            });
            return Response.json({ 
                error: finbotResult?.message || finbotResult?.error || `שגיאה מ-Finbot (${response.status})`,
                details: finbotResult
            }, { status: 400 });
        }

        // Calculate totals for local storage
        const subtotal = finbotItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const vat = subtotal * 0.17;
        const total = subtotal + vat;

        // Save to local database
        const localDocument = await base44.entities.FinbotDocument.create({
            user_id: user.id,
            finbot_document_id: String(finbotResult.id || finbotResult.document_id || finbotResult.doc_id || ''),
            type,
            customer_finbot_id: resolvedCustomerFinbotId,
            customer_name: customerName || finbotResult.client_name,
            issue_date: finbotPayload.date,
            currency: finbotPayload.currency,
            subtotal: finbotResult.sub_total || subtotal,
            vat: finbotResult.vat_total || vat,
            total: finbotResult.total || total,
            status: 'created',
            pdf_url: finbotResult.pdf_link || finbotResult.pdf_url || finbotResult.link || null,
            items: finbotItems,
            notes,
            raw: finbotResult,
            synced_at: new Date().toISOString()
        });

        // Log success
        await base44.entities.FinbotAuditLog.create({
            user_id: user.id,
            action: 'finbot.create_document',
            entity_type: 'FinbotDocument',
            entity_id: localDocument.id,
            request_data: finbotPayload,
            response_data: finbotResult,
            success: true
        });

        return Response.json({ 
            document: localDocument,
            finbot_response: finbotResult
        });
    } catch (error) {
        console.error('Error creating document:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});