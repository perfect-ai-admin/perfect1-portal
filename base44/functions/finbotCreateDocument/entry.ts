import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Create an income document in Finbot
 * API docs: https://finbot.helpjuice.com/he_IL/api-docs-create-income
 * 
 * URL: POST https://api.finbotai.co.il/income
 * Header: secret: <API_TOKEN>
 * 
 * Document types: 0=חשבונית מס, 1=קבלה, 2=חשבונית מס קבלה, 3=דרישת תשלום, 4=חשבונית זיכוי, 5=הזמנה, 6=תעודת משלוח, 7=הצעת מחיר, 8=חשבונית
 * Payment types: 0=מזומן, 1=העברה בנקאית, 2=אשראי, 3=צ'ק, 4=ניכוי במקור, 5=פייפאל, 8=ביט, 9=פייבוקס
 * Date format: DD/MM/YYYY
 */

const FINBOT_API_URL = 'https://api.finbotai.co.il/income';

// Map our internal types to Finbot numeric types
const DOCUMENT_TYPE_MAP = {
    invoice: '0',              // חשבונית מס
    receipt: '1',              // קבלה
    invoice_receipt: '2',      // חשבונית מס / קבלה
    payment_request: '3',      // דרישת תשלום
    credit: '4',               // חשבונית זיכוי
    order: '5',                // הזמנה
    delivery: '6',             // תעודת משלוח
    quote: '7',                // הצעת מחיר
    bill: '8'                  // חשבונית
};

// Map our payment types to Finbot numeric types
const PAYMENT_TYPE_MAP = {
    cash: '0',
    bank_transfer: '1',
    credit_card: '2',
    cheque: '3',
    withholding: '4',
    paypal: '5',
    bitcoin: '6',
    other: '7',
    bit: '8',
    paybox: '9',
    other_deductions: '10',
    ethereum: '11',
    equivalent: '12',
    gift_card: '13',
    google_pay: '14',
    apple_pay: '15'
};

function formatDateDDMMYYYY(dateStr) {
    if (!dateStr) {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }
    // If already in DD/MM/YYYY format
    if (dateStr.includes('/')) return dateStr;
    // Convert from YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}

async function getFinbotToken(base44, userId) {
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    if (connections && connections.length > 0 && connections[0].status === 'connected') {
        if (connections[0].api_key_ref) return connections[0].api_key_ref;
        if (connections[0].access_token_ref) return connections[0].access_token_ref;
    }
    const globalToken = Deno.env.get('FINBOT_API_TOKEN');
    if (globalToken) return globalToken;
    throw new Error('לא נמצא טוקן Finbot. יש להתחבר למערכת חשבונות.');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { 
            type, customer_id, customer_finbot_id, issue_date, currency, 
            items, payment, lang, notes, description,
            vatType, rounding, customer_name, customer_email, customer_phone,
            customer_address, customer_tax, customer_save,
            discountAmount, discountType, email_to, email_subject, email_body,
            linked_document_id
        } = body;

        // Validate
        if (!type || !DOCUMENT_TYPE_MAP[type]) {
            return Response.json({ 
                error: 'סוג מסמך לא תקין', 
                valid_types: Object.keys(DOCUMENT_TYPE_MAP) 
            }, { status: 400 });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return Response.json({ error: 'חובה להוסיף לפחות פריט אחד' }, { status: 400 });
        }

        const apiToken = await getFinbotToken(base44, user.id);
        const formattedDate = formatDateDDMMYYYY(issue_date);

        // Resolve customer from local DB if needed
        let resolvedCustomerName = customer_name;
        let resolvedCustomerFinbotId = customer_finbot_id;
        if (customer_id && !customer_finbot_id) {
            const customers = await base44.entities.FinbotCustomer.filter({ user_id: user.id, id: customer_id });
            if (customers && customers.length > 0) {
                resolvedCustomerFinbotId = customers[0].finbot_customer_id;
                resolvedCustomerName = customers[0].name;
            }
        }

        // Build Finbot payload per official API spec
        const finbotPayload = {
            type: DOCUMENT_TYPE_MAP[type],
            date: formattedDate,
            language: (lang || 'HE').toUpperCase(),
            currency: currency || 'ILS',
            vatType: vatType !== undefined ? vatType : false, // false = prices before VAT
            rounding: rounding !== undefined ? rounding : true,
        };

        // Customer
        finbotPayload.customer = {};
        if (resolvedCustomerFinbotId) {
            finbotPayload.customer.id = Number(resolvedCustomerFinbotId);
        } else if (resolvedCustomerName) {
            finbotPayload.customer.name = resolvedCustomerName;
        }
        if (customer_email) finbotPayload.customer.email = customer_email;
        if (customer_phone) finbotPayload.customer.phone = customer_phone;
        if (customer_address) finbotPayload.customer.address = customer_address;
        if (customer_tax) finbotPayload.customer.tax = customer_tax;
        if (customer_save !== undefined) finbotPayload.customer.save = customer_save;

        // Items
        finbotPayload.items = items.map(item => {
            const row = {
                name: item.description || item.name,
                amount: item.quantity || item.amount || 1,
                price: item.unit_price || item.price || 0,
            };
            if (item.id || item.item_id) row.id = String(item.id || item.item_id);
            if (item.save !== undefined) row.save = item.save;
            return row;
        });

        // Payments (required for receipt and invoice_receipt)
        if (type === 'receipt' || type === 'invoice_receipt') {
            if (payment && Array.isArray(payment) && payment.length > 0) {
                finbotPayload.payments = payment.map(p => {
                    const payRow = {
                        type: typeof p.type === 'string' ? (PAYMENT_TYPE_MAP[p.type] || p.type) : String(p.type),
                        date: formatDateDDMMYYYY(p.date || issue_date),
                        sum: p.price || p.sum || 0,
                    };
                    if (p.bankName) payRow.bankName = p.bankName;
                    if (p.bankBranch) payRow.bankBranch = p.bankBranch;
                    if (p.bankAccount) payRow.bankAccount = p.bankAccount;
                    if (p.chequeNum) payRow.chequeNum = p.chequeNum;
                    if (p.cardType) payRow.cardType = p.cardType;
                    if (p.cardNum) payRow.cardNum = p.cardNum;
                    if (p.dealType) payRow.dealType = p.dealType;
                    if (p.numPayments) payRow.numPayments = p.numPayments;
                    return payRow;
                });
            } else {
                // Default: cash for total amount (including VAT)
                const subtotalAmount = finbotPayload.items.reduce((sum, item) => sum + (item.amount * item.price), 0);
                // vatType=false means prices are BEFORE VAT, so total = subtotal * 1.17
                const totalWithVat = finbotPayload.vatType ? subtotalAmount : Math.round(subtotalAmount * 1.17 * 100) / 100;
                finbotPayload.payments = [{
                    type: '0', // cash
                    date: formattedDate,
                    sum: totalWithVat
                }];
            }
        }

        // Optional fields
        if (description) finbotPayload.description = description;
        if (notes) finbotPayload.remark = notes;
        if (discountAmount) finbotPayload.discountAmount = discountAmount;
        if (discountType) finbotPayload.discountType = discountType;
        if (linked_document_id) finbotPayload.linkedDocumentId = linked_document_id;

        // Email sending
        if (email_to || email_subject || email_body) {
            finbotPayload.email = {};
            if (email_to) finbotPayload.email.to = email_to;
            if (email_subject) finbotPayload.email.subject = email_subject;
            if (email_body) finbotPayload.email.body = email_body;
        }

        console.log('Finbot payload:', JSON.stringify(finbotPayload));

        // Call Finbot API
        const response = await fetch(FINBOT_API_URL, {
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
        try { finbotResult = JSON.parse(responseText); } 
        catch { finbotResult = { raw_response: responseText }; }

        // Ensure finbotResult is always an object for DB storage
        if (typeof finbotResult !== 'object' || finbotResult === null) {
            finbotResult = { raw_value: String(finbotResult) };
        }

        // Finbot returns status=1 for success
        const isSuccess = finbotResult?.status === 1 || response.ok;

        // Wrap finbotResult for safe DB storage (response_data must be an object)
        const safeResponseData = { result: finbotResult };

        if (!isSuccess) {
            await base44.entities.FinbotAuditLog.create({
                user_id: user.id,
                action: 'finbot.create_document',
                request_data: { payload: finbotPayload },
                response_data: safeResponseData,
                success: false
            });
            return Response.json({ 
                error: finbotResult?.message || `שגיאה מ-Finbot`,
                errors: finbotResult?.errors || [],
                details: finbotResult
            }, { status: 400 });
        }

        // Extract PDF URL - Finbot returns the link in "data" field on success
        const pdfUrl = (typeof finbotResult.data === 'string') ? finbotResult.data : null;

        // Calculate totals for local storage
        const subtotal = finbotPayload.items.reduce((sum, item) => sum + (item.amount * item.price), 0);
        const vat = subtotal * 0.17;
        const total = subtotal + vat;

        // Save to local database
        const localDocument = await base44.entities.FinbotDocument.create({
            user_id: user.id,
            finbot_document_id: String(finbotResult.id || ''),
            type,
            customer_finbot_id: resolvedCustomerFinbotId ? String(resolvedCustomerFinbotId) : null,
            customer_name: resolvedCustomerName || finbotPayload.customer?.name,
            issue_date: issue_date || new Date().toISOString().split('T')[0],
            currency: finbotPayload.currency,
            subtotal,
            vat,
            total,
            status: 'created',
            pdf_url: pdfUrl,
            items: finbotPayload.items.map(i => ({ description: i.name, quantity: i.amount, unit_price: i.price, total: i.amount * i.price })),
            notes,
            raw: safeResponseData,
            synced_at: new Date().toISOString()
        });

        await base44.entities.FinbotAuditLog.create({
            user_id: user.id,
            action: 'finbot.create_document',
            entity_type: 'FinbotDocument',
            entity_id: localDocument.id,
            request_data: { payload: finbotPayload },
            response_data: safeResponseData,
            success: true
        });

        return Response.json({ 
            document: localDocument,
            finbot_response: finbotResult,
            pdf_url: pdfUrl
        });
    } catch (error) {
        console.error('Error creating document:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});