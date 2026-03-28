// Migrated from Base44: activateGoal

import { supabaseAdmin, getUser, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const { user_goal_id } = await req.json();
    if (!user_goal_id) return errorResponse('Missing user_goal_id', 400);

    // Get user goal - check ownership via customer_id
    const { data: customerGoals } = await supabaseAdmin
      .from('customer_goals')
      .select('*')
      .eq('id', user_goal_id);

    if (!customerGoals || customerGoals.length === 0) {
      return errorResponse('UserGoal not found', 404);
    }
    const userGoal = customerGoals[0];

    // Check max active goals (default: 3)
    const maxActiveGoals = 3;
    const { data: activeGoals } = await supabaseAdmin
      .from('customer_goals')
      .select('*')
      .eq('customer_id', userGoal.customer_id)
      .eq('status', 'active');

    if (activeGoals && activeGoals.length >= maxActiveGoals) {
      // Deactivate oldest active goal
      const oldest = activeGoals.sort((a: any, b: any) =>
        new Date(a.activated_at || a.created_at).getTime() - new Date(b.activated_at || b.created_at).getTime()
      )[0];

      await supabaseAdmin
        .from('customer_goals')
        .update({ status: 'selected' })
        .eq('id', oldest.id);
    }

    // Activate goal
    const { error: updateErr } = await supabaseAdmin
      .from('customer_goals')
      .update({
        status: 'active',
        activated_at: new Date().toISOString()
      })
      .eq('id', user_goal_id);

    if (updateErr) return errorResponse(updateErr.message);

    // Activate customer if paused
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id, status, phone')
      .eq('id', userGoal.customer_id)
      .single();

    if (customer?.status === 'paused' && customer?.phone) {
      await supabaseAdmin
        .from('customers')
        .update({ status: 'active' })
        .eq('id', customer.id);
    }

    return jsonResponse({ success: true, message: 'המטרה הופעלה בהצלחה' });
  } catch (error) {
    console.error('Error activating goal:', error);
    return errorResponse((error as Error).message);
  }
});
