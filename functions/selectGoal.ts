import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { goal_id, activate } = await req.json();

        if (!goal_id) {
            return Response.json({ error: 'Missing goal_id' }, { status: 400 });
        }

        // Check if goal exists
        const goals = await base44.entities.Goal.filter({ id: goal_id });
        if (!goals || goals.length === 0) {
            return Response.json({ error: 'Goal not found' }, { status: 404 });
        }

        const goal = goals[0];

        // Get user's current goals
        const userGoals = await base44.entities.UserGoal.filter({ 
            user_id: user.id,
            status: { $in: ['selected', 'active'] }
        });

        // Check goals limit (considering override)
        const goalsLimit = user.goals_limit_override ?? user.goals_limit;
        
        if (goalsLimit !== null && userGoals.length >= goalsLimit) {
            return Response.json({ 
                error: 'goals_limit_reached',
                message: `הגעת למכסת המטרות (${goalsLimit})`,
                current_count: userGoals.length,
                limit: goalsLimit,
                upgrade_required: true
            }, { status: 403 });
        }

        // Check if already selected
        const existing = userGoals.find(ug => ug.goal_id === goal_id);
        if (existing) {
            return Response.json({ 
                error: 'Goal already selected',
                user_goal_id: existing.id 
            }, { status: 400 });
        }

        // מציאת/יצירת CRMLead למשתמש
        let crmLead = null;
        try {
            const leads = await base44.asServiceRole.entities.CRMLead.filter({
                $or: [
                    { user_id: user.id },
                    { email: user.email }
                ]
            }, '-created_date', 1);

            if (leads && leads.length > 0) {
                crmLead = leads[0];
                console.log('✅ Found existing CRMLead:', crmLead.id);
            } else if (user.phone) {
                // יצירת CRMLead חדש
                const phoneNorm = user.phone.replace(/\D/g, '');
                const finalPhone = phoneNorm.startsWith('972') ? phoneNorm : ('972' + phoneNorm.replace(/^0/, ''));
                
                crmLead = await base44.asServiceRole.entities.CRMLead.create({
                    user_id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    phone_normalized: finalPhone,
                    source: 'App',
                    journey_stage: 'lead_new',
                    active_handler: 'firstGoalMentorFlow',
                    chat_history: []
                });
                console.log('✅ Created new CRMLead:', crmLead.id);
            }
        } catch (err) {
            console.warn('⚠️ Could not find/create CRMLead:', err.message);
        }

        // בדיקה אם זו מטרה ראשונה
        const isFirstGoal = userGoals.length === 0;

        // Create UserGoal
        const userGoal = await base44.entities.UserGoal.create({
            user_id: user.id,
            lead_id: crmLead?.id || null,
            goal_id: goal_id,
            title: goal.name,
            description: goal.description,
            category: goal.category,
            status: activate ? 'active' : 'selected',
            selected_at: new Date().toISOString(),
            activated_at: activate ? new Date().toISOString() : null,
            progress: 0,
            is_first_goal: isFirstGoal,
            flow_data: isFirstGoal ? {
                mentor_stage: 'intro',
                mentor_started_at: new Date().toISOString()
            } : {}
        });

        // עדכן CRMLead עם current_goal_id
        if (crmLead) {
            await base44.asServiceRole.entities.CRMLead.update(crmLead.id, {
                current_goal_id: userGoal.id,
                active_handler: isFirstGoal ? 'firstGoalMentorFlow' : 'smartMentorEngine'
            });
            console.log('✅ CRMLead updated with current_goal_id:', userGoal.id);
        }

        // If activating, deactivate other active goals if needed
        if (activate) {
            const maxActiveGoals = user.max_active_goals_override ?? user.max_active_goals;
            const activeGoals = userGoals.filter(ug => ug.status === 'active');
            
            if (maxActiveGoals && activeGoals.length >= maxActiveGoals) {
                // Deactivate oldest active goal
                const oldestActive = activeGoals.sort((a, b) => 
                    new Date(a.activated_at) - new Date(b.activated_at)
                )[0];
                
                await base44.entities.UserGoal.update(oldestActive.id, {
                    status: 'selected'
                });
            }
        }

        return Response.json({
            success: true,
            user_goal: userGoal,
            goal: goal,
            message: activate ? 'המטרה הופעלה בהצלחה' : 'המטרה נבחרה בהצלחה'
        });

    } catch (error) {
        console.error('Error selecting goal:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});