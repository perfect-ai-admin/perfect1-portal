// Migrated from Base44: assignPlanToUser
// Admin: assign a subscription plan to a user (customer)

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = await requireAdmin(req);

    const { user_id, plan_id } = await req.json();
    if (!user_id || !plan_id) {
      return errorResponse('user_id and plan_id are required', 400);
    }

    // Verify target customer exists
    const { data: targetCustomer, error: findErr } = await supabaseAdmin
      .from('customers')
      .select('id, email, plan_id')
      .eq('id', user_id)
      .single();

    if (findErr || !targetCustomer) {
      return errorResponse('Customer not found', 404);
    }

    // Update plan
    const { error: updateErr } = await supabaseAdmin
      .from('customers')
      .update({ plan_id, updated_at: new Date().toISOString() })
      .eq('id', user_id);

    if (updateErr) return errorResponse(updateErr.message);

    // Log to activity_log
    await supabaseAdmin.from('activity_log').insert({
      customer_id: user_id,
      event_type: 'plan_assigned',
      data: {
        assigned_by: admin.id,
        previous_plan_id: targetCustomer.plan_id,
        new_plan_id: plan_id
      }
    }).catch((e: Error) => console.warn('activity_log insert failed:', e.message));

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('assignPlanToUser error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
