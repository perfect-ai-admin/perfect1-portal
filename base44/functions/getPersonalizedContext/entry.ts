import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * מחזיר הקשר מותאם אישית למשתמש
 * משמש לפני אינטראקציות כדי להתאים תוכן, שאלות, משימות
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { purpose, currentGoalId, user_id } = body;
        
        // תמיכה ב-service role (webhook) וב-user scope (app)
        let user = null;
        let isServiceRole = false;
        let effectiveUserId = null;
        
        try {
            user = await base44.auth.me();
            effectiveUserId = user.id;
        } catch (err) {
            isServiceRole = true;
            effectiveUserId = user_id;
            if (!effectiveUserId) {
                return Response.json({ error: 'user_id required for service role' }, { status: 400 });
            }
        }
        
        const client = isServiceRole ? base44.asServiceRole : base44;

        // 1. שלוף זיכרון משתמש
        const memoryList = await client.entities.UserMemory.filter({ user_id: effectiveUserId }, '-created_date', 1);
        const userMemory = memoryList.length > 0 ? memoryList[0] : null;

        if (!userMemory) {
            return Response.json({
                hasMemory: false,
                message: 'משתמש חדש - אין זיכרון קודם',
                suggestions: {
                    approach: 'התחל בהיכרות, שאל על הרקע והמטרות',
                    tone: 'חם ומזמין'
                }
            });
        }

        // 2. שלוף מטרה נוכחית אם יש
        let currentGoal = null;
        if (currentGoalId) {
            try {
                currentGoal = await client.entities.UserGoal.get(currentGoalId);
            } catch (err) {
                console.warn('⚠️ Could not fetch goal:', err.message);
            }
        }

        // 3. שלוף שיחות אחרונות
        const recentConversations = await client.entities.ConversationLog.filter(
            { user_id: effectiveUserId },
            '-created_date',
            5
        );

        // 4. בנה הקשר מותאם אישית
        const personalizedContext = {
            // זיכרון בסיסי
            memory: {
                total_interactions: userMemory.total_interactions,
                last_context: userMemory.last_context,
                learning_summary: userMemory.learning_summary
            },
            
            // אישיות ועדפות
            personality: {
                communication_style: userMemory.personality_traits?.communication_style,
                pace_preference: userMemory.personality_traits?.pace_preference,
                learning_style: userMemory.personality_traits?.learning_style,
                decision_making: userMemory.personality_traits?.decision_making
            },

            // הקשר עסקי
            business: {
                industry: userMemory.business_context?.industry,
                experience_level: userMemory.business_context?.experience_level,
                main_challenges: userMemory.business_context?.main_challenges || [],
                strengths: userMemory.business_context?.strengths || []
            },

            // דפוסי אינטראקציה
            patterns: {
                engagement_triggers: userMemory.interaction_patterns?.engagement_triggers || [],
                response_rate: userMemory.interaction_patterns?.response_rate,
                best_time: userMemory.interaction_patterns?.best_time_to_engage
            },

            // התקדמות
            progress: {
                current_stage: userMemory.progress_tracking?.current_stage,
                stuck_points: userMemory.progress_tracking?.stuck_points || [],
                momentum_areas: userMemory.progress_tracking?.momentum_areas || [],
                completed_milestones: userMemory.progress_tracking?.completed_milestones || []
            },

            // אסטרטגיית התאמה אישית
            strategy: userMemory.personalization_strategy || {
                approach: 'כללי - התאם לפי תגובות',
                do_more: [],
                do_less: [],
                next_best_actions: []
            },

            // תובנות אחרונות
            recent_insights: (userMemory.ai_insights || [])
                .slice(-5)
                .map(i => ({
                    insight: i.insight,
                    confidence: i.confidence,
                    date: i.date
                })),

            // הקשר מהשיחות האחרונות
            recent_conversations: recentConversations.map(c => ({
                date: c.created_date,
                agent: c.agent_name,
                outcome: c.outcome,
                sentiment: c.sentiment_analysis?.overall
            })),

            // מטרה נוכחית
            current_goal: currentGoal ? {
                title: currentGoal.title,
                status: currentGoal.status,
                progress: currentGoal.progress,
                tasks: currentGoal.tasks
            } : null,

            // המלצות לאינטראקציה הבאה
            recommendations: {
                suggested_tone: userMemory.personality_traits?.communication_style === 'direct' 
                    ? 'ישיר וממוקד' 
                    : userMemory.personality_traits?.communication_style === 'emotional'
                    ? 'אמפתי ותומך'
                    : 'מאוזן',
                    
                suggested_format: userMemory.personality_traits?.learning_style === 'doing'
                    ? 'משימות מעשיות'
                    : userMemory.personality_traits?.learning_style === 'reading'
                    ? 'טקסט מפורט עם דוגמאות'
                    : 'שילוב',

                next_best_actions: userMemory.personalization_strategy?.next_best_actions || [],
                
                avoid: userMemory.personalization_strategy?.do_less || [],
                
                focus_on: userMemory.personalization_strategy?.do_more || []
            }
        };

        return Response.json({
            success: true,
            hasMemory: true,
            context: personalizedContext,
            purpose: purpose
        });

    } catch (error) {
        console.error('Error getting personalized context:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});