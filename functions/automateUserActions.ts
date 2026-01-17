import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();

        console.log('Automation trigger:', payload.event?.type);

        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all active rules
        const rules = await base44.asServiceRole.entities.RulesEngine.filter({ 
            is_active: true 
        });

        const userEntity = await base44.asServiceRole.entities.User.filter({ 
            id: user.id 
        });

        if (!userEntity || userEntity.length === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const currentUser = userEntity[0];
        const executedRules = [];

        for (const rule of rules) {
            const shouldExecute = await evaluateRule(rule, currentUser, base44);
            
            if (shouldExecute) {
                await executeActions(rule, currentUser, base44);
                executedRules.push(rule.name);
                
                // Update last_executed
                await base44.asServiceRole.entities.RulesEngine.update(rule.id, {
                    last_executed: new Date().toISOString()
                });
            }
        }

        return Response.json({ 
            success: true, 
            executedRules,
            message: `${executedRules.length} rules executed`
        });

    } catch (error) {
        console.error('Automation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function evaluateRule(rule, user, base44) {
    try {
        const now = new Date();
        const conditions = rule.conditions || {};

        switch (rule.trigger_type) {
            case 'inactivity': {
                const daysInactive = conditions.days_inactive || 7;
                const lastLogin = user.last_login_at ? new Date(user.last_login_at) : new Date(user.created_date);
                const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24);
                return daysSinceLogin >= daysInactive;
            }

            case 'plan_expiring': {
                if (!user.plan_id) return false;
                const plans = await base44.asServiceRole.entities.Plan.filter({ id: user.plan_id });
                if (plans.length === 0) return false;
                
                const plan = plans[0];
                if (plan.billing_type === 'one-time') return false;
                
                const planStartDate = user.plan_activated_at ? new Date(user.plan_activated_at) : new Date(user.created_date);
                const daysUntilExpire = conditions.days_until_due || 7;
                const expiryDate = new Date(planStartDate);
                
                if (plan.billing_type === 'monthly') {
                    expiryDate.setMonth(expiryDate.getMonth() + 1);
                } else if (plan.billing_type === 'yearly') {
                    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                }
                
                const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
                return daysUntilExpiry <= daysUntilExpire && daysUntilExpiry > 0;
            }

            case 'goal_completed': {
                const userGoals = await base44.asServiceRole.entities.UserGoal.filter({
                    user_id: user.id,
                    status: 'completed'
                });
                return userGoals.length > 0;
            }

            case 'goal_due': {
                const goals = await base44.asServiceRole.entities.Goal.filter({});
                const userGoals = await base44.asServiceRole.entities.UserGoal.filter({
                    user_id: user.id,
                    status: 'active'
                });

                for (const ug of userGoals) {
                    const goal = goals.find(g => g.id === ug.goal_id);
                    if (!goal) continue;

                    const duration = goal.estimated_duration_days || 30;
                    const activatedAt = ug.activated_at ? new Date(ug.activated_at) : new Date(ug.selected_at);
                    const dueDate = new Date(activatedAt);
                    dueDate.setDate(dueDate.getDate() + duration);

                    const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
                    const threshold = conditions.days_until_due || 7;

                    if (daysUntilDue <= threshold && daysUntilDue > 0) {
                        return true;
                    }
                }
                return false;
            }

            case 'first_login':
                return user.login_count === 1;

            default:
                return false;
        }
    } catch (error) {
        console.error('Rule evaluation error:', error);
        return false;
    }
}

async function executeActions(rule, user, base44) {
    try {
        for (const action of rule.actions || []) {
            switch (action.type) {
                case 'send_notification': {
                    await base44.asServiceRole.entities.ActivityLog.create({
                        user_id: user.id,
                        activity_type: 'other',
                        description: action.data?.message || 'notification from rule engine',
                        details: {
                            rule_id: rule.id,
                            rule_name: rule.name,
                            notification_type: 'automation'
                        }
                    });
                    break;
                }

                case 'send_email': {
                    await base44.integrations.Core.SendEmail({
                        to: user.email,
                        subject: action.data?.subject || 'הודעה חשובה',
                        body: action.data?.body || 'Please check your account'
                    });
                    break;
                }

                case 'upgrade_plan': {
                    if (action.data?.plan_id) {
                        await base44.asServiceRole.entities.User.update(user.id, {
                            plan_id: action.data.plan_id,
                            plan_activated_at: new Date().toISOString()
                        });

                        await base44.asServiceRole.entities.ActivityLog.create({
                            user_id: user.id,
                            activity_type: 'plan_change',
                            description: 'מסלול שודרג אוטומטית',
                            details: {
                                rule_id: rule.id,
                                new_plan_id: action.data.plan_id
                            }
                        });
                    }
                    break;
                }

                case 'create_task': {
                    await base44.asServiceRole.entities.ActivityLog.create({
                        user_id: user.id,
                        activity_type: 'other',
                        description: action.data?.title || 'New task created',
                        details: {
                            rule_id: rule.id,
                            task_description: action.data?.description
                        }
                    });
                    break;
                }

                case 'log_activity': {
                    await base44.asServiceRole.entities.ActivityLog.create({
                        user_id: user.id,
                        activity_type: 'admin_action',
                        description: action.data?.message || 'Rule automation executed',
                        details: {
                            rule_id: rule.id,
                            rule_name: rule.name
                        }
                    });
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Action execution error:', error);
    }
}