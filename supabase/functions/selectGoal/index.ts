// Migrated from Base44: selectGoal
// Selects or activates a goal for the authenticated customer, enforcing goals_limit

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const customer = await getCustomer(req);
    if (!customer) {
      return errorResponse('Unauthorized', 401);
    }

    const { goal_id, activate } = await req.json();
    if (!goal_id) {
      return errorResponse('Missing goal_id', 400);
    }

    // Check if goal exists
    const { data: goal, error: goalErr } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('id', goal_id)
      .single();

    if (goalErr || !goal) {
      return errorResponse('Goal not found', 404);
    }

    // Get customer's current goals (selected or active)
    const { data: customerGoals, error: goalsErr } = await supabaseAdmin
      .from('customer_goals')
      .select('*')
      .eq('customer_id', customer.id)
      .in('status', ['selected', 'active']);

    if (goalsErr) throw new Error(goalsErr.message);
    const userGoals = customerGoals || [];

    // Check goals limit (override > plan limit > default of 1)
    const goalsLimit = customer.goals_limit_override !== null && customer.goals_limit_override !== undefined
      ? customer.goals_limit_override
      : (customer.goals_limit !== null && customer.goals_limit !== undefined ? customer.goals_limit : 1);

    // goalsLimit === 0 means unlimited
    if (goalsLimit !== 0 && goalsLimit !== null && userGoals.length >= goalsLimit) {
      return jsonResponse({
        error: 'goals_limit_reached',
        message: `הגעת למכסת המטרות (${goalsLimit})`,
        current_count: userGoals.length,
        limit: goalsLimit,
        upgrade_required: true
      }, 403);
    }

    // Check if already selected
    const existing = userGoals.find(ug => ug.goal_id === goal_id);
    if (existing) {
      return jsonResponse({
        error: 'Goal already selected',
        user_goal_id: existing.id
      }, 400);
    }

    // Create customer_goal record
    const { data: newGoal, error: createErr } = await supabaseAdmin
      .from('customer_goals')
      .insert({
        customer_id: customer.id,
        goal_id: goal_id,
        status: activate ? 'active' : 'selected',
        selected_at: new Date().toISOString(),
        activated_at: activate ? new Date().toISOString() : null,
        progress: 0
      })
      .select()
      .single();

    if (createErr) throw new Error(createErr.message);

    // If activating, deactivate oldest active goal if over max_active_goals limit
    if (activate) {
      const maxActiveGoals = customer.max_active_goals_override ?? customer.max_active_goals;
      const activeGoals = userGoals.filter(ug => ug.status === 'active');

      if (maxActiveGoals && activeGoals.length >= maxActiveGoals) {
        const oldestActive = activeGoals.sort((a: any, b: any) =>
          new Date(a.activated_at).getTime() - new Date(b.activated_at).getTime()
        )[0];

        await supabaseAdmin
          .from('customer_goals')
          .update({ status: 'selected' })
          .eq('id', oldestActive.id);
      }
    }

    return jsonResponse({
      success: true,
      user_goal: newGoal,
      goal: goal,
      message: activate ? 'המטרה הופעלה בהצלחה' : 'המטרה נבחרה בהצלחה'
    });

  } catch (error) {
    console.error('Error selecting goal:', error);
    return errorResponse((error as Error).message);
  }
});
