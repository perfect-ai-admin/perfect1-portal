import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Create a document in Finbot (receipt, invoice_receipt, credit)
 * Input: {
 *   type: "receipt" | "invoice_receipt" | "credit",
 *   customer_id: (local) OR customer_finbot_id,
 *   issue_date,
 *   currency: "ILS",
 *   items: [{description, quantity, unit_price, vat_rate?}],
 *   notes?
 * }
 */

// TODO: Adjust endpoints based on actual Finbot API documentation
const FINBOT_ENDPOINTS = {
    documents: '/documents',
    receipts: '/receipts',
    invoices: '/invoices',
    credits: '/credits'
};

const DOCUMENT_TYPE_MAP = {
    receipt: 'receipt',
    invoice_receipt: 'invoice_receipt',
    credit: 'credit_note'
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
        const { type, customer_id, customer_finbot_id, issue_date, currency, items, notes } = body;

        if (!type || !['receipt', 'invoice_receipt', 'credit'].includes(type)) {
            return Response.json({ error: 'Invalid document type' }, { status: 400 });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return Response.json({ error: 'Items are required' }, { status: 400 });
        }

        const { baseUrl, authHeader } = await getFinbotClient(base44, user.id);

        // Resolve customer finbot ID
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

        // Calculate totals
        const VAT_RATE = 0.17; // Default Israeli VAT
        let subtotal = 0;
        const processedItems = items.map(item => {
            const itemTotal = (item.quantity || 1) * (item.unit_price || 0);
            subtotal += itemTotal;
            return {
                description: item.description,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0,
                vat_rate: item.vat_rate !== undefined ? item.vat_rate : VAT_RATE,
                total: itemTotal
            };
        });

        const vat = subtotal * VAT_RATE;
        const total = subtotal + vat;

        // Build Finbot document payload
        // TODO: Adjust field names based on actual Finbot API documentation
        const finbotPayload = {
            type: DOCUMENT_TYPE_MAP[type] || type,
            customer_id: resolvedCustomerFinbotId,
            date: issue_date || new Date().toISOString().split('T')[0],
            currency: currency || 'ILS',
            items: processedItems,
            notes: notes || undefined,
            subtotal,
            vat,
            total
        };

        // Create document in Finbot
        const response = await fetch(`${baseUrl}${FINBOT_ENDPOINTS.documents}`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(finbotPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Finbot API error: ${errorText}`);
        }

        const finbotDocument = await response.json();

        // Save to local database
        const localDocument = await base44.entities.FinbotDocument.create({
            user_id: user.id,
            finbot_document_id: finbotDocument.id || finbotDocument.document_id,
            type,
            customer_finbot_id: resolvedCustomerFinbotId,
            customer_name: customerName,
            issue_date: finbotPayload.date,
            currency: finbotPayload.currency,
            subtotal,
            vat,
            total,
            status: finbotDocument.status || 'created',
            pdf_url: finbotDocument.pdf_url || finbotDocument.download_url,
            items: processedItems,
            notes,
            raw: finbotDocument,
            synced_at: new Date().toISOString()
        });

        // Log action
        await base44.entities.FinbotAuditLog.create({
            user_id: user.id,
            action: 'finbot.create_document',
            entity_type: 'FinbotDocument',
            entity_id: localDocument.id,
            request_data: finbotPayload,
            response_data: finbotDocument,
            success: true
        });

        return Response.json({ document: localDocument });
    } catch (error) {
        console.error('Error creating document:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});