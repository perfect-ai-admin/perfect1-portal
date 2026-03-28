// Migrated from Base44: acctGetConnectionStatus
// Get accounting provider connection status for current customer

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const { data, error } = await supabaseAdmin
      .from('accounting_connections')
      .select('*')
      .eq('customer_id', customer.id)
      .limit(1)
      .maybeSingle();

    if (error) {
      // Table may not exist yet — treat as not connected
      console.warn('acctGetConnectionStatus: query error:', error.message);
      return jsonResponse({ connected: false, provider: null, connection: null });
    }

    return jsonResponse({
      connected: !!data && data.status === 'connected',
      provider: data?.provider ?? null,
      connection: data ?? null,
    });
  } catch (error) {
    console.error('acctGetConnectionStatus error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
