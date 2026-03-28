// Migrated from Base44: checkAndReserveCredit
// Checks if customer has credits and reserves one for logo generation

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const customer = await getCustomer(req);
    if (!customer) {
      return jsonResponse({ ok: false, error_code: 'NO_AUTH', message: 'User not authenticated' });
    }

    if (customer.credits_balance <= 0) {
      console.log('[RESERVE_CREDIT] No credits for customer:', customer.email);
      return jsonResponse({ ok: false, error_code: 'NO_CREDITS', message: 'No credits available' });
    }

    // Deduct 1 credit atomically using optimistic lock
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('customers')
      .update({
        credits_balance: customer.credits_balance - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.id)
      .eq('credits_balance', customer.credits_balance) // Optimistic lock
      .select('credits_balance')
      .single();

    if (updateErr || !updated) {
      return jsonResponse({ ok: false, error_code: 'CREDIT_RESERVE_FAILED', message: 'Race condition - try again' });
    }

    // Log to ledger
    await supabaseAdmin.from('credit_ledger').insert({
      customer_id: customer.id,
      event_type: 'spend',
      amount: -1,
      reason: 'logo_generation'
    });

    return jsonResponse({ ok: true, remaining_credits: updated.credits_balance });
  } catch (error) {
    console.error('[RESERVE_CREDIT] Error:', (error as Error).message);
    return jsonResponse({ ok: false, error_code: 'CREDIT_RESERVE_FAILED', message: 'Could not reserve credit' });
  }
});
