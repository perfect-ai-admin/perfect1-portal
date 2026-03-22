import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { user_id, plan_id } = await req.json();

    if (!user_id || !plan_id) {
      return Response.json({ error: 'Missing user_id or plan_id' }, { status: 400 });
    }

    // Get the plan details
    const plans = await base44.asServiceRole.entities.Plan.filter({ id: plan_id });
    if (!plans || plans.length === 0) {
      return Response.json({ error: 'Plan not found' }, { status: 404 });
    }

    const plan = plans[0];

    // Get current user to check for override
    const currentUser = await base44.asServiceRole.entities.User.get(user_id);

    const updateData = {
      current_plan_id: plan_id,
      marketing_enabled: plan.marketing_enabled || false,
      mentor_enabled: plan.mentor_enabled || false,
      finance_enabled: plan.finance_enabled || false,
      goals_limit: plan.goals_limit ?? 1,
      max_active_goals: plan.max_active_goals ?? 1
    };

    // If the new plan has higher limits than existing override, clear the override
    // so the plan limit takes effect
    if (currentUser?.goals_limit_override !== null && currentUser?.goals_limit_override !== undefined) {
      const planLimit = plan.goals_limit ?? 1;
      if (planLimit >= currentUser.goals_limit_override) {
        updateData.goals_limit_override = null;
      }
    }
    if (currentUser?.max_active_goals_override !== null && currentUser?.max_active_goals_override !== undefined) {
      const planMax = plan.max_active_goals ?? 1;
      if (planMax >= currentUser.max_active_goals_override) {
        updateData.max_active_goals_override = null;
      }
    }

    await base44.asServiceRole.entities.User.update(user_id, updateData);

    console.log(`✅ Plan "${plan.name}" assigned to user ${user_id}. Goals limit: ${updateData.goals_limit}, Max active: ${updateData.max_active_goals}`);

    return Response.json({ 
      success: true,
      plan_name: plan.name,
      goals_limit: updateData.goals_limit,
      max_active_goals: updateData.max_active_goals
    });
  } catch (error) {
    console.error('Error assigning plan:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});