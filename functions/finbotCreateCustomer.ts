import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Create a new customer in Finbot
 * 
 * Finbot does NOT have a dedicated create-customer API.
 * Customers are created via the income API with customer.save=true.
 * We create a zero-amount quote (type 7 = הצעת מחיר) to register the customer.
 * 
 * API: POST https://api.finbotai.co.il/income
 * Header: secret: <API_TOKEN>
 */

const FINBOT_API_URL = 'https://api.finbotai.co.il/income';

function todayDDMMYYYY() {
    const now = new Date();
    return `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
}

async function getFinbotToken(base44, userId) {
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    if (connections?.length > 0 && connections[0].status === 'connected') {
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
        const { name, id_number, email, phone, address, city, zip, notes } = body;

        if (!name) {
            return Response.json({ error: 'שם הלקוח הוא שדה חובה' }, { status: 400 });
        }

        const apiToken = await getFinbotToken(base44, user.id);

        // Build a receipt (type 1) with 0 price to register the customer in Finbot
        // Quotes (type 7) may fail for Osek Patur, receipts are universally supported
        const customerObj = { name, save: true };
        if (email) customerObj.email = email;
        if (phone) customerObj.phone = phone;
        if (address) customerObj.address = address;
        if (id_number) customerObj.tax = id_number;

        const finbotPayload = {
            type: '1',
            date: todayDDMMYYYY(),
            language: 'HE',
            currency: 'ILS',
            vatType: false,
            rounding: true,
            customer: customerObj,
            items: [{ name: 'רישום לקוח', amount: 1, price: 1 }],
            payments: [{ type: '0', date: todayDDMMYYYY(), sum: 1.17 }]
        };

        console.log('Finbot create customer payload:', JSON.stringify(finbotPayload));

        const response = await fetch(FINBOT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'secret': apiToken },
            body: JSON.stringify(finbotPayload)
        });

        const responseText = await response.text();
        console.log('Finbot response:', response.status, responseText);

        let finbotResult;
        try { 
            const parsed = JSON.parse(responseText);
            // Ensure it's a plain object (not array)
            if (Array.isArray(parsed)) {
                finbotResult = { items: parsed };
            } else if (typeof parsed === 'object' && parsed !== null) {
                finbotResult = parsed;
            } else {
                finbotResult = { value: String(parsed) };
            }
        } catch { 
            finbotResult = { raw_response: responseText.substring(0, 500) }; 
        }

        const isSuccess = finbotResult?.status === 1;

        // Save locally
        const localCustomer = await base44.entities.FinbotCustomer.create({
            user_id: user.id,
            finbot_customer_id: '',
            name, id_number: id_number || null, email: email || null,
            phone: phone || null, address: address || null, city: city || null,
            zip: zip || null, notes: notes || null,
            raw: finbotResult,
            synced_at: new Date().toISOString()
        });

        await base44.entities.FinbotAuditLog.create({
            user_id: user.id, action: 'finbot.create_customer',
            entity_type: 'FinbotCustomer', entity_id: localCustomer.id,
            request_data: { payload: finbotPayload },
            response_data: { result: finbotResult },
            success: isSuccess
        });

        return Response.json({
            customer: localCustomer,
            finbot_synced: isSuccess,
            message: isSuccess
                ? 'לקוח נוצר בהצלחה ב-Finbot ובמערכת'
                : 'לקוח נשמר במערכת. ' + (finbotResult?.message || '')
        });
    } catch (error) {
        console.error('Error creating customer:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});