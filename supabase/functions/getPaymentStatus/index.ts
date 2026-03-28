// Migrated from Base44: getPaymentStatus

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const { payment_id } = await req.json();
    if (!payment_id) return errorResponse('Missing payment_id', 400);

    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .eq('customer_id', customer.id);

    if (error) return errorResponse(error.message);

    return jsonResponse({ payments: payments || [] });
  } catch (error) {
    console.error('getPaymentStatus error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
