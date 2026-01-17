import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins can assign plans
        if (user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { user_id, plan_id } = await req.json();

        if (!user_id || !plan_id) {
            return Response.json({ error: 'Missing user_id or plan_id' }, { status: 400 });
        }

        // Get plan details
        const plans = await base44.asServiceRole.entities.Plan.filter({ id: plan_id });
        if (!plans || plans.length === 0) {
            return Response.json({ error: 'Plan not found' }, { status: 404 });
        }

        const plan = plans[0];

        // Calculate renewal date (for monthly/yearly plans)
        let renewal_date = null;
        if (plan.billing_type === 'monthly') {
            const renewalDate = new Date();
            renewalDate.setMonth(renewalDate.getMonth() + 1);
            renewal_date = renewalDate.toISOString();
        } else if (plan.billing_type === 'yearly') {
            const renewalDate = new Date();
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
            renewal_date = renewalDate.toISOString();
        }

        // Update user with plan permissions
        const updateData = {
            current_plan_id: plan_id,
            plan_start_date: new Date().toISOString(),
            plan_renewal_date: renewal_date,
            marketing_enabled: plan.marketing_enabled,
            mentor_enabled: plan.mentor_enabled,
            finance_enabled: plan.finance_enabled,
            goals_limit: plan.goals_limit,
            max_active_goals: plan.max_active_goals
        };

        await base44.asServiceRole.entities.User.update(user_id, updateData);

        // Log the activity
        await base44.asServiceRole.entities.ActivityLog.create({
            user_id: user_id,
            activity_type: 'plan_change',
            description: `מסלול שונה ל-${plan.name}`,
            details: {
                plan_id: plan_id,
                plan_name: plan.name,
                changed_by: user.id
            },
            performed_by: user.id
        });

        return Response.json({
            success: true,
            message: `מסלול ${plan.name} הוקצה בהצלחה`,
            permissions: {
                marketing_enabled: plan.marketing_enabled,
                mentor_enabled: plan.mentor_enabled,
                finance_enabled: plan.finance_enabled
            }
        });

    } catch (error) {
        console.error('Error assigning plan:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});