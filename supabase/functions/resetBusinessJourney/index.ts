// Migrated from Base44: resetBusinessJourney
// Reset a customer's business journey answers

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const { error } = await supabaseAdmin
      .from('customers')
      .update({
        business_journey_answers: null,
        business_journey_completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.id);

    if (error) return errorResponse(error.message);

    // Log reset event
    await supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      event_type: 'business_journey_reset',
      data: { reset_at: new Date().toISOString() }
    }).catch((e: Error) => console.warn('activity_log insert failed:', e.message));

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('resetBusinessJourney error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
