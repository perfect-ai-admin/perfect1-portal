// Migrated from Base44: unlockLogo
// Unlock a generated logo (mark as purchased/downloadable)

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const { generation_id } = await req.json();
    if (!generation_id) return errorResponse('generation_id is required', 400);

    // Get generation and verify ownership via project
    const { data: generation, error: genErr } = await supabaseAdmin
      .from('logo_generations')
      .select('*, logo_projects!inner(customer_id)')
      .eq('id', generation_id)
      .single();

    if (genErr || !generation) {
      return errorResponse('Generation not found', 404);
    }

    if (generation.logo_projects.customer_id !== customer.id) {
      return errorResponse('Access denied', 403);
    }

    // Check that generation is in a valid state
    if (generation.status === 'unlocked') {
      return jsonResponse({ success: true, generation });
    }

    // Check credits
    if ((customer.credits_balance || 0) < 1) {
      return errorResponse('Insufficient credits to unlock logo', 402);
    }

    // Unlock the generation
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('logo_generations')
      .update({ status: 'unlocked', unlocked_at: new Date().toISOString() })
      .eq('id', generation_id)
      .select()
      .single();

    if (updateErr) return errorResponse(updateErr.message);

    // Deduct 1 credit
    await supabaseAdmin
      .from('customers')
      .update({ credits_balance: (customer.credits_balance || 0) - 1 })
      .eq('id', customer.id);

    await supabaseAdmin.from('credit_ledger').insert({
      customer_id: customer.id,
      event_type: 'usage',
      amount: -1,
      reason: 'logo_unlock',
      reference_id: generation_id
    }).catch((e: Error) => console.warn('credit_ledger insert failed:', e.message));

    return jsonResponse({ success: true, generation: updated });
  } catch (error) {
    console.error('unlockLogo error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
