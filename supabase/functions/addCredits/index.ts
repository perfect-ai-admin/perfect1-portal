// Migrated from Base44: addCredits (admin only)

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Admin check via customers table
    const customer = await getCustomer(req);
    if (!customer || customer.role !== 'admin') {
      return errorResponse('Unauthorized', 403);
    }

    const { target_customer_id, amount } = await req.json();
    if (!target_customer_id || !amount) {
      return errorResponse('target_customer_id and amount required', 400);
    }

    // Find target customer
    const { data: target, error: findErr } = await supabaseAdmin
      .from('customers')
      .select('id, credits_balance, email')
      .eq('id', target_customer_id)
      .single();

    if (findErr || !target) {
      return errorResponse('Customer not found', 404);
    }

    // Update credits_balance
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('customers')
      .update({
        credits_balance: (target.credits_balance || 0) + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', target_customer_id)
      .select('id, credits_balance')
      .single();

    if (updateErr) return errorResponse(updateErr.message);

    // Log topup
    await supabaseAdmin.from('credit_ledger').insert({
      customer_id: target_customer_id,
      event_type: 'admin_grant',
      amount,
      reason: 'admin_topup'
    });

    return jsonResponse({ success: true, customer: target_customer_id, new_credits: updated.credits_balance });
  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
