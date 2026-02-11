import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Create a new customer in Finbot
 * Input: {name, id_number?, email?, phone?, address?, city?, zip?, notes?}
 */

// TODO: Adjust endpoint based on actual Finbot API documentation
const FINBOT_ENDPOINTS = {
    customers: '/customers'
};

async function getFinbotClient(base44, userId) {
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    
    if (!connections || connections.length === 0 || connections[0].status !== 'connected') {
        throw new Error('Not connected to Finbot');
    }

    const connection = connections[0];
    const baseUrl = Deno.env.get('FINBOT_BASE_URL') || 'https://api.finbot.co.il';
    
    // Get auth token based on strategy
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
        const { name, id_number, email, phone, address, city, zip, notes } = body;

        if (!name) {
            return Response.json({ error: 'Customer name is required' }, { status: 400 });
        }

        const { baseUrl, authHeader, connection } = await getFinbotClient(base44, user.id);

        // Build Finbot customer payload
        // TODO: Adjust field names based on actual Finbot API documentation
        const finbotPayload = {
            name,
            id_number: id_number || undefined,
            email: email || undefined,
            phone: phone || undefined,
            address: address || undefined,
            city: city || undefined,
            zip: zip || undefined,
            notes: notes || undefined
        };

        // Create customer in Finbot
        const response = await fetch(`${baseUrl}${FINBOT_ENDPOINTS.customers}`, {
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

        const finbotCustomer = await response.json();

        // Save to local database
        const localCustomer = await base44.entities.FinbotCustomer.create({
            user_id: user.id,
            finbot_customer_id: finbotCustomer.id || finbotCustomer.customer_id,
            name: finbotCustomer.name || name,
            id_number: finbotCustomer.id_number || id_number,
            email: finbotCustomer.email || email,
            phone: finbotCustomer.phone || phone,
            address: finbotCustomer.address || address,
            city: finbotCustomer.city || city,
            zip: finbotCustomer.zip || zip,
            notes: finbotCustomer.notes || notes,
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
            success: true
        });

        return Response.json({ customer: localCustomer });
    } catch (error) {
        console.error('Error creating customer:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});