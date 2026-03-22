import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * שולח כל מטרה חדשה שנוצרת (UserGoal) ל-N8N
 * נקרא אוטומטית על ידי entity automation על כל יצירת UserGoal
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        const { event, data } = body;

        // וידוא שזו קריאה מ-entity automation
        if (!event || event.type !== 'create' || event.entity_name !== 'UserGoal') {
            return Response.json({ skipped: true, reason: 'Not a UserGoal create event' });
        }

        const goalId = event.entity_id;
        console.log('🎯 New UserGoal created:', goalId);

        // טען את המטרה המלאה
        const goal = data || await base44.asServiceRole.entities.UserGoal.get(goalId);

        if (!goal) {
            console.error('❌ Goal not found:', goalId);
            return Response.json({ error: 'Goal not found' }, { status: 404 });
        }

        console.log('📌 Goal title:', goal.title);
        console.log('📌 Goal category:', goal.category);
        console.log('📌 Goal user_id:', goal.user_id);

        // מצא את היוזר
        let userName = '';
        let userEmail = '';
        let userPhone = '';

        try {
            const allUsers = await base44.asServiceRole.entities.User.list();
            const goalUser = allUsers.find(u => u.id === goal.user_id);

            if (goalUser) {
                userName = goalUser.full_name || '';
                userEmail = goalUser.email || '';
                userPhone = goalUser.phone || '';
                console.log('👤 User found:', userEmail);
            }

            // אם אין טלפון ביוזר, חפש ב-CRMLead
            if (!userPhone && goalUser) {
                try {
                    const leads = await base44.asServiceRole.entities.CRMLead.filter({
                        user_id: goalUser.id
                    }, '-created_date', 1);

                    if (leads && leads.length > 0 && leads[0].phone) {
                        userPhone = leads[0].phone;
                        console.log('📱 Phone from CRMLead:', userPhone);
                    }
                } catch (e) {
                    console.warn('⚠️ CRMLead lookup failed:', e.message);
                }
            }
        } catch (e) {
            console.warn('⚠️ User lookup failed:', e.message);
        }

        // בנה את הפיילוד ל-N8N
        const n8nPayload = {
            event_type: 'goal_created',
            timestamp: new Date().toISOString(),
            
            // פרטי המטרה
            goal: {
                id: goalId,
                title: goal.title || '',
                description: goal.description || '',
                category: goal.category || '',
                status: goal.status || 'active',
                urgency: goal.urgency || 'medium',
                isPrimary: goal.isPrimary || false,
                is_first_goal: goal.is_first_goal || false,
                plan_summary: goal.plan_summary || '',
                aiInsight: goal.aiInsight || '',
                target: goal.target || 100,
                current: goal.current || 0,
                progress: goal.progress || 0,
                tasks_count: (goal.tasks || []).length,
                tasks: (goal.tasks || []).map(t => ({
                    title: t.title,
                    status: t.status,
                    effort: t.effort,
                    momentum: t.momentum
                })),
                strategic_context: goal.strategic_context || {},
                customAnswers: goal.customAnswers || {},
                created_date: goal.created_date || new Date().toISOString()
            },

            // פרטי המשתמש
            user: {
                id: goal.user_id || '',
                full_name: userName,
                email: userEmail,
                phone: userPhone
            },

            // מקור האירוע
            source: 'base44_automation'
        };

        console.log('📤 Sending to N8N:', JSON.stringify(n8nPayload, null, 2));

        // שלח ל-N8N
        const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');

        if (!webhookUrl) {
            console.error('❌ N8N_WEBHOOK_URL not configured');
            return Response.json({ error: 'N8N webhook not configured' }, { status: 500 });
        }

        const n8nResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(n8nPayload)
        });

        const responseText = await n8nResponse.text();
        console.log('📥 N8N Response:', n8nResponse.status, responseText);

        if (!n8nResponse.ok) {
            console.error('❌ N8N webhook failed:', n8nResponse.status, responseText);
            return Response.json({ 
                success: false, 
                error: `N8N returned ${n8nResponse.status}`,
                details: responseText
            });
        }

        console.log('✅ Goal sent to N8N successfully:', goal.title);

        return Response.json({
            success: true,
            goal_id: goalId,
            goal_title: goal.title,
            user_name: userName,
            n8n_status: n8nResponse.status
        });

    } catch (error) {
        console.error('❌ sendGoalToN8N error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});