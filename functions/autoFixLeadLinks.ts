import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { normalizePhoneNumber } from './stateSynchronizer.js';

/**
 * תיקון אוטומטי של קישורים חסרים ב-CRMLead
 * מקשר user_id, current_goal_id, ומטפל בכל הבעיות
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Admin only' }, { status: 403 });
        }

        const body = await req.json();
        const { lead_id, phone } = body;

        if (!lead_id) {
            return Response.json({ error: 'lead_id required' }, { status: 400 });
        }

        const lead = await base44.asServiceRole.entities.CRMLead.get(lead_id);
        
        console.log('🔧 Auto-fixing lead:', lead_id);

        const fixes = [];
        let userId = lead.user_id;
        let goalId = lead.current_goal_id;

        // תיקון 1: חיפוש וקישור User
        if (!userId) {
            console.log('🔍 Looking for User to link...');
            
            const normalizedPhone = lead.phone_normalized || normalizePhoneNumber(phone || lead.phone);
            
            // חיפוש לפי טלפון
            const allUsers = await base44.asServiceRole.entities.User.list();
            let matchedUser = allUsers.find(u => 
                u.phone && normalizePhoneNumber(u.phone) === normalizedPhone
            );

            // אם לא נמצא לפי טלפון, חפש לפי אימייל
            if (!matchedUser && lead.email) {
                matchedUser = allUsers.find(u => u.email === lead.email);
            }

            if (matchedUser) {
                userId = matchedUser.id;
                fixes.push('✅ קישרתי ל-User: ' + matchedUser.email);
                console.log('✅ Found User:', matchedUser.id);
            } else {
                fixes.push('⚠️ לא נמצא User מתאים - אנא צור User או הזמן אותו');
            }
        }

        // תיקון 2: חיפוש וקישור מטרה פעילה
        if (!goalId && userId) {
            console.log('🔍 Looking for active goal...');
            
            const userGoals = await base44.asServiceRole.entities.UserGoal.filter({
                user_id: userId,
                status: { $in: ['selected', 'active', 'in_progress'] }
            }, '-created_date', 5);

            if (userGoals.length > 0) {
                // העדף is_first_goal
                const firstGoal = userGoals.find(g => g.is_first_goal === true);
                const targetGoal = firstGoal || userGoals[0];
                
                goalId = targetGoal.id;
                fixes.push('✅ קישרתי למטרה: ' + targetGoal.title);
                console.log('✅ Found goal:', targetGoal.id);

                // עדכן את המטרה עם lead_id אם חסר
                if (!targetGoal.lead_id) {
                    await base44.asServiceRole.entities.UserGoal.update(targetGoal.id, {
                        lead_id: lead.id
                    });
                    fixes.push('✅ עדכנתי את המטרה עם lead_id');
                }
            } else {
                fixes.push('⚠️ אין מטרות פעילות למשתמש - אנא צור מטרה');
            }
        }

        // עדכון ה-CRMLead עם התיקונים
        const updates = {};
        
        if (userId && userId !== lead.user_id) {
            updates.user_id = userId;
        }
        
        if (goalId && goalId !== lead.current_goal_id) {
            updates.current_goal_id = goalId;
        }

        // עדכן active_handler לפי סוג המטרה
        if (goalId) {
            const goal = await base44.asServiceRole.entities.UserGoal.get(goalId);
            const handler = goal.is_first_goal ? 'firstGoalMentorFlow' : 'smartMentorEngine';
            if (handler !== lead.active_handler) {
                updates.active_handler = handler;
                fixes.push(`✅ עדכנתי handler ל-${handler}`);
            }
        }

        if (Object.keys(updates).length > 0) {
            await base44.asServiceRole.entities.CRMLead.update(lead_id, updates);
            fixes.push('✅ CRMLead עודכן');
            console.log('✅ Updates applied:', updates);
        }

        const summary = fixes.length > 0 
            ? fixes.join('\n')
            : 'הכל תקין, אין מה לתקן';

        return Response.json({
            success: true,
            message: summary,
            fixes_applied: fixes.length,
            updated_fields: Object.keys(updates)
        });

    } catch (error) {
        console.error('❌ Auto-fix error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});