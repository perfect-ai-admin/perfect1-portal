import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Create a new customer in Finbot
 * Based on Finbot API - customers are typically created alongside documents
 * or via a dedicated endpoint
 * 
 * Input: {name, id_number?, email?, phone?, address?, city?, zip?, notes?}
 */

const FINBOT_API_BASE = 'https://api.finbot.co.il/api/v2';

async function getFinbotAuth(base44, userId) {
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    
    if (connections && connections.length > 0 && connections[0].status === 'connected') {
        const connection = connections[0];
        if (connection.api_key_ref) return connection.api_key_ref;
        if (connection.access_token_ref) return connection.access_token_ref;
    }

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
        const { name, id_number, email, phone, address, city, zip, notes } = body;

        if (!name) {
            return Response.json({ error: 'שם הלקוח הוא שדה חובה' }, { status: 400 });
        }

        const apiToken = await getFinbotAuth(base44, user.id);

        // Build Finbot customer payload
        const finbotPayload = {
            name,
        };
        if (id_number) finbotPayload.id_number = id_number;
        if (email) finbotPayload.email = email;
        if (phone) finbotPayload.phone = phone;
        if (address) finbotPayload.address = address;
        if (city) finbotPayload.city = city;
        if (zip) finbotPayload.zip = zip;
        if (notes) finbotPayload.notes = notes;

        // Try to create customer via Finbot API
        const response = await fetch(`${FINBOT_API_BASE}/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'secret': apiToken
            },
            body: JSON.stringify(finbotPayload)
        });

        const responseText = await response.text();
        console.log('Finbot create customer response:', response.status, responseText);

        let finbotCustomer;
        try {
            finbotCustomer = JSON.parse(responseText);
        } catch {
            finbotCustomer = { raw_response: responseText };
        }

        // Save to local database regardless (so we have local records)
        const localCustomer = await base44.entities.FinbotCustomer.create({
            user_id: user.id,
            finbot_customer_id: String(finbotCustomer?.id || finbotCustomer?.client_id || ''),
            name: name,
            id_number: id_number || null,
            email: email || null,
            phone: phone || null,
            address: address || null,
            city: city || null,
            zip: zip || null,
            notes: notes || null,
            raw: finbotCustomer,
            synced_at: new Date().toISOString()
        });

        // Log action
        await base44.entities.FinbotAuditLog.create({
            user_id: user.id,
            action: 'finbot.create_customer',
            entity_type: 'FinbotCustomer',
            entity_id: localCustomer.id,
            request_data: finbotPayload,
            response_data: finbotCustomer,
            success: response.ok
        });

        return Response.json({ 
            customer: localCustomer,
            finbot_response: finbotCustomer,
            api_success: response.ok
        });
    } catch (error) {
        console.error('Error creating customer:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});