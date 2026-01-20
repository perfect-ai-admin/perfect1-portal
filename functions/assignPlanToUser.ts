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

    // Update user with plan details and modules
    await base44.asServiceRole.entities.User.update(user_id, {
      current_plan_id: plan_id,
      marketing_enabled: plan.marketing_enabled || false,
      mentor_enabled: plan.mentor_enabled || false,
      finance_enabled: plan.finance_enabled || false,
      goals_limit: plan.goals_limit || 1,
      max_active_goals: plan.max_active_goals || 1
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error assigning plan:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});