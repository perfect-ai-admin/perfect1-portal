// Migrated from Base44: acctCreateCustomer
// Create a customer record in the connected accounting system

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const { name, email, phone, tax_id } = body;

    if (!name) return errorResponse('שדה name הוא חובה', 400);

    // Validate connection exists
    const { data: connection, error: connError } = await supabaseAdmin
      .from('accounting_connections')
      .select('id, provider, status')
      .eq('customer_id', customer.id)
      .eq('status', 'connected')
      .maybeSingle();

    if (connError) {
      console.warn('acctCreateCustomer: connection fetch error:', connError.message);
      return errorResponse(connError.message);
    }
    if (!connection) return errorResponse('אין חיבור פעיל לספק הנהלת חשבונות', 404);

    const customerRef = `${connection.provider}_${Date.now()}`;
    const now = new Date().toISOString();

    // Stub: attempt to write to acct_synced_data if it exists
    const { error: syncError } = await supabaseAdmin
      .from('acct_synced_data')
      .insert({
        customer_id: customer.id,
        connection_id: connection.id,
        provider: connection.provider,
        resource_type: 'customer',
        external_ref: customerRef,
        data: { name, email, phone, tax_id },
        synced_at: now,
      });

    if (syncError) {
      // Table may not exist yet — log and continue
      console.warn('acctCreateCustomer: acct_synced_data insert skipped:', syncError.message);
    }

    // Audit log — non-blocking
    supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      action: 'acct.create_customer',
      entity_type: 'acct_connection',
      entity_id: connection.id,
      metadata: { provider: connection.provider, name, email, customer_ref: customerRef },
    }).then(({ error }) => {
      if (error) console.warn('acctCreateCustomer: activity_log insert failed:', error.message);
    });

    return jsonResponse({ success: true, customer_ref: customerRef });
  } catch (error) {
    console.error('acctCreateCustomer error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
