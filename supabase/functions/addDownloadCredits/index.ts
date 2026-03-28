// Migrated from Base44: addDownloadCredits
// Add download credits (admin only)

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    await requireAdmin(req);

    const body = await req.json();
    const customer_id: string = body.customer_id;
    const amount: number = body.amount;
    const reason: string = body.reason;

    if (!customer_id || amount === undefined || amount === null) {
      return errorResponse('customer_id and amount are required', 400);
    }

    // Update credits_balance by incrementing
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('customers')
      .update({ credits_balance: supabaseAdmin.rpc('increment', { x: amount }) })
      .eq('id', customer_id)
      .select('id, credits_balance')
      .single();

    // Fallback: fetch current balance and set manually if rpc update is unsupported
    if (updateError) {
      const { data: current, error: fetchError } = await supabaseAdmin
        .from('customers')
        .select('id, credits_balance')
        .eq('id', customer_id)
        .single();

      if (fetchError || !current) {
        return errorResponse('Customer not found', 404);
      }

      const new_balance = (current.credits_balance || 0) + amount;

      const { data: patched, error: patchError } = await supabaseAdmin
        .from('customers')
        .update({ credits_balance: new_balance, updated_at: new Date().toISOString() })
        .eq('id', customer_id)
        .select('id, credits_balance')
        .single();

      if (patchError) return errorResponse(patchError.message);

      await supabaseAdmin.from('credit_ledger').insert({
        customer_id,
        amount,
        type: 'admin_add',
        description: reason ?? null
      });

      return jsonResponse({ success: true, new_balance: patched.credits_balance });
    }

    // Log to credit_ledger
    await supabaseAdmin.from('credit_ledger').insert({
      customer_id,
      amount,
      type: 'admin_add',
      description: reason ?? null
    });

    return jsonResponse({ success: true, new_balance: updated.credits_balance });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('addDownloadCredits error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
