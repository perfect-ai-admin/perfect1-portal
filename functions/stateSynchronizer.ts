import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * State Synchronizer - Single Source of Truth
 * מוודא סנכרון מלא בין CRMLead ↔ UserGoal ↔ User
 * קוראים לזה לפני כל פעולה קריטית
 */

/**
 * סנכרון מלא של מצב ליד + מטרה
 * מחזיר אובייקט עם כל המידע המסונכרן
 */
export async function syncLeadAndGoal({ base44, leadId, userId, phoneNormalized, goalId }) {
    console.log('🔄 State Sync Start:', { leadId, userId, phoneNormalized, goalId });

    let lead = null;
    let user = null;
    let activeGoal = null;

    // ========================================
    // שלב 1: מציאת CRMLead
    // ========================================
    if (leadId) {
        lead = await base44.asServiceRole.entities.CRMLead.get(leadId);
    } else if (phoneNormalized) {
        const leads = await base44.asServiceRole.entities.CRMLead.filter({ 
            phone_normalized: phoneNormalized 
        }, '-created_date', 1);
        lead = leads?.[0];
    } else if (userId) {
        const leads = await base44.asServiceRole.entities.CRMLead.filter({ 
            user_id: userId 
        }, '-created_date', 1);
        lead = leads?.[0];
    }

    if (!lead) {
        console.warn('⚠️ No CRMLead found');
        return { lead: null, user: null, activeGoal: null, syncedData: null };
    }

    console.log('✅ Lead found:', lead.id);

    // ========================================
    // שלב 2: מציאת User
    // ========================================
    if (lead.user_id) {
        const allUsers = await base44.asServiceRole.entities.User.list();
        user = allUsers.find(u => u.id === lead.user_id);
    }

    if (!user && lead.email) {
        const allUsers = await base44.asServiceRole.entities.User.list();
        user = allUsers.find(u => u.email === lead.email);
    }

    const effectiveUserId = user?.id || lead.user_id;
    console.log('✅ Effective User ID:', effectiveUserId);

    // ========================================
    // שלב 3: מציאת המטרה הפעילה
    // ========================================
    
    // אסטרטגיה: נעדיף תמיד את current_goal_id אם קיים
    let targetGoalId = goalId || lead.current_goal_id;

    if (targetGoalId) {
        try {
            activeGoal = await base44.asServiceRole.entities.UserGoal.get(targetGoalId);
            console.log('✅ Goal loaded by ID:', activeGoal.id, activeGoal.title);
        } catch (err) {
            console.warn('⚠️ Goal ID in CRMLead not found:', targetGoalId);
            activeGoal = null;
        }
    }

    // אם לא מצאנו לפי ID, חפש לפי user_id
    if (!activeGoal && effectiveUserId) {
        const userGoals = await base44.asServiceRole.entities.UserGoal.filter({ 
            user_id: effectiveUserId,
            status: { $in: ['selected', 'active', 'in_progress'] }
        }, '-created_date', 10);

        console.log('🔍 Found', userGoals.length, 'goals for user');

        if (userGoals.length > 0) {
            // העדף is_first_goal=true
            const firstGoal = userGoals.find(g => g.is_first_goal === true);
            
            if (firstGoal) {
                activeGoal = firstGoal;
                console.log('✅ Selected first_goal:', firstGoal.id);
            } else {
                // קח active או selected
                const priorityGoal = userGoals.find(g => g.status === 'active') || userGoals[0];
                activeGoal = priorityGoal;
                console.log('✅ Selected priority goal:', activeGoal.id);
            }
        }
    }

    if (!activeGoal) {
        console.warn('⚠️ No active goal found');
        return { lead, user, activeGoal: null, syncedData: { effectiveUserId } };
    }

    console.log('✅ Active Goal:', {
        id: activeGoal.id,
        title: activeGoal.title,
        is_first_goal: activeGoal.is_first_goal,
        status: activeGoal.status,
        mentor_stage: activeGoal.flow_data?.mentor_stage
    });

    // ========================================
    // שלב 4: סנכרון נתונים
    // ========================================
    const updates = {};
    const goalUpdates = {};

    // סנכרון user_id
    if (effectiveUserId && lead.user_id !== effectiveUserId) {
        updates.user_id = effectiveUserId;
    }

    // סנכרון current_goal_id - CRITICAL
    if (lead.current_goal_id !== activeGoal.id) {
        updates.current_goal_id = activeGoal.id;
        console.log('🔄 Syncing current_goal_id:', activeGoal.id);
    }

    // סנכרון active_handler
    const expectedHandler = activeGoal.is_first_goal ? 'firstGoalMentorFlow' : 'smartMentorEngine';
    if (lead.active_handler !== expectedHandler) {
        updates.active_handler = expectedHandler;
    }

    // עדכן CRMLead אם יש שינויים
    if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.CRMLead.update(lead.id, updates);
        console.log('✅ CRMLead synced:', Object.keys(updates).join(', '));
        lead = { ...lead, ...updates };
    }

    // סנכרון UserGoal
    if (!activeGoal.user_id && effectiveUserId) {
        goalUpdates.user_id = effectiveUserId;
    }
    if (!activeGoal.lead_id && lead.id) {
        goalUpdates.lead_id = lead.id;
    }

    if (Object.keys(goalUpdates).length > 0) {
        await base44.asServiceRole.entities.UserGoal.update(activeGoal.id, goalUpdates);
        console.log('✅ UserGoal synced:', Object.keys(goalUpdates).join(', '));
        activeGoal = { ...activeGoal, ...goalUpdates };
    }

    // ========================================
    // שלב 5: החזרת מצב מסונכרן
    // ========================================
    const syncedData = {
        effectiveUserId,
        leadId: lead.id,
        goalId: activeGoal.id,
        isFirstGoal: activeGoal.is_first_goal === true,
        mentorStage: activeGoal.flow_data?.mentor_stage || 'agreement',
        activeHandler: lead.active_handler,
        chatHistoryLength: lead.chat_history?.length || 0
    };

    console.log('✅ State Sync Complete:', syncedData);

    return { lead, user, activeGoal, syncedData };
}

/**
 * עדכון chat_history בצורה בטוחה עם retry
 */
export async function updateChatHistory({ base44, leadId, newMessages, maxRetries = 3 }) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const currentLead = await base44.asServiceRole.entities.CRMLead.get(leadId);
            const currentHistory = Array.isArray(currentLead?.chat_history) ? currentLead.chat_history : [];
            
            const updatedHistory = [...currentHistory, ...newMessages].slice(-100);

            await base44.asServiceRole.entities.CRMLead.update(leadId, {
                chat_history: updatedHistory,
                last_contact_at: new Date().toISOString()
            });

            console.log('✅ Chat history updated, total:', updatedHistory.length);
            return updatedHistory;
        } catch (err) {
            console.warn(`⚠️ Chat update attempt ${attempt + 1} failed:`, err.message);
            if (attempt === maxRetries - 1) throw err;
            await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
        }
    }
}

/**
 * נרמול מספר טלפון
 */
export function normalizePhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('972')) {
        cleaned = '972' + cleaned;
    }
    return cleaned;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        
        const result = await syncLeadAndGoal({
            base44,
            leadId: body.lead_id,
            userId: body.user_id,
            phoneNormalized: body.phone_normalized,
            goalId: body.goal_id
        });

        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});