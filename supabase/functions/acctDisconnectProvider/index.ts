// Migrated from Base44: acctDisconnectProvider
// Disconnect accounting provider for current customer

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    // Fetch the connection before deleting (for the audit log)
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('accounting_connections')
      .select('id, provider')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (fetchError) {
      console.warn('acctDisconnectProvider: fetch error:', fetchError.message);
      return errorResponse(fetchError.message);
    }

    if (!existing) {
      return errorResponse('אין חיבור פעיל לנתק', 404);
    }

    const { error: deleteError } = await supabaseAdmin
      .from('accounting_connections')
      .delete()
      .eq('customer_id', customer.id);

    if (deleteError) return errorResponse(deleteError.message);

    // Audit log — non-blocking
    supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      action: 'provider.disconnect',
      entity_type: 'acct_connection',
      entity_id: existing.id,
      metadata: { provider: existing.provider },
    }).then(({ error }) => {
      if (error) console.warn('acctDisconnectProvider: activity_log insert failed:', error.message);
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('acctDisconnectProvider error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
