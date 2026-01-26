import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

/**
 * מעדכן את זיכרון המשתמש על בסיס שיחה/אינטראקציה
 * מחלץ תובנות, מזהה דפוסים, ומשפר את ההתאמה האישית
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            conversationLogId, 
            messages, 
            context,
            agentName 
        } = await req.json();

        // 1. שלוף את זיכרון המשתמש הקיים (חיפוש חכם למניעת כפילויות)
        const memoryList = await base44.entities.UserMemory.filter({ user_id: user.id }, '-created_date', 1);
        let userMemory = memoryList.length > 0 ? memoryList[0] : null;
        
        // בדיקה לכפילויות - מחק ישנים
        if (memoryList.length > 1) {
            console.warn('⚠️ Found', memoryList.length, 'memory records, keeping only the latest');
            for (let i = 1; i < memoryList.length; i++) {
                await base44.entities.UserMemory.delete(memoryList[i].id);
            }
        }

        // 2. שלוף שיחות אחרונות למידע מצטבר
        const recentConversations = await base44.entities.ConversationLog.filter(
            { user_id: user.id },
            '-created_date',
            10
        );

        // 3. בנה פרומפט לניתוח ועדכון הזיכרון
        const analysisPrompt = `אתה מערכת למידה מתקדמת שמנתחת אינטראקציות עם משתמשים.

**זיכרון קיים על המשתמש:**
${JSON.stringify(userMemory || {}, null, 2)}

**שיחות אחרונות (10 אחרונות):**
${JSON.stringify(recentConversations.map(c => ({
    date: c.created_date,
    agent: c.agent_name,
    insights: c.extracted_insights,
    sentiment: c.sentiment_analysis,
    outcome: c.outcome
})), null, 2)}

**השיחה הנוכחית:**
${JSON.stringify(messages, null, 2)}

**הקשר נוסף:**
${JSON.stringify(context, null, 2)}

---

**המשימה שלך:**
1. נתח את השיחה הנוכחית וחלץ תובנות על המשתמש
2. זהה דפוסים והתנהגויות חוזרות
3. עדכן את הזיכרון המצטבר עם מידע חדש
4. הצע אסטרטגיית התאמה אישית משופרת

**פלט בפורמט JSON:**
{
  "new_insights": [
    {
      "type": "preference|challenge|success|pattern|goal|emotion",
      "content": "התובנה עצמה",
      "confidence": 0.0-1.0
    }
  ],
  "personality_updates": {
    "communication_style": "direct|detailed|visual|emotional",
    "pace_preference": "fast|moderate|slow",
    "decision_making": "quick|analytical|collaborative",
    "learning_style": "doing|reading|watching|discussing"
  },
  "business_context_updates": {
    "main_challenges": ["..."],
    "strengths": ["..."],
    "experience_level": "beginner|intermediate|advanced"
  },
  "interaction_patterns_updates": {
    "engagement_triggers": ["..."],
    "response_rate": 0-100,
    "sentiment_trend": "improving|stable|declining"
  },
  "progress_updates": {
    "current_stage": "תיאור השלב הנוכחי",
    "stuck_points": [{
      "topic": "...",
      "reason": "..."
    }],
    "momentum_areas": ["..."]
  },
  "personalization_strategy": {
    "approach": "איך לגשת למשתמש הזה",
    "do_more": ["..."],
    "do_less": ["..."],
    "next_best_actions": ["פעולה ספציפית 1", "פעולה ספציפית 2"]
  },
  "learning_summary_update": "סיכום מעודכן של כל מה שלמדנו על המשתמש",
  "last_context": "תיאור קצר - איפה עצרנו והמשך מומלץ"
}

חשוב: התמקד בתובנות מעשיות שיעזרו לשפר את ההתאמה האישית.`;

        // 4. קרא ל-LLM לניתוח
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: analysisPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(completion.choices[0].message.content);

        // 5. עדכן או צור זיכרון משתמש
        const memoryData = {
            user_id: user.id,
            total_interactions: (userMemory?.total_interactions || 0) + 1,
            learning_summary: analysis.learning_summary_update || userMemory?.learning_summary,
            personality_traits: {
                ...(userMemory?.personality_traits || {}),
                ...(analysis.personality_updates || {})
            },
            business_context: {
                ...(userMemory?.business_context || {}),
                ...(analysis.business_context_updates || {})
            },
            interaction_patterns: {
                ...(userMemory?.interaction_patterns || {}),
                ...(analysis.interaction_patterns_updates || {})
            },
            progress_tracking: {
                ...(userMemory?.progress_tracking || {}),
                ...(analysis.progress_updates || {})
            },
            contextual_history: [
                ...(userMemory?.contextual_history || []).slice(-20), // שמור רק 20 אחרונים
                {
                    date: new Date().toISOString(),
                    context: context?.current_stage || agentName,
                    key_points: analysis.new_insights?.map(i => i.content) || [],
                    next_steps: analysis.personalization_strategy?.next_best_actions || [],
                    sentiment: messages[messages.length - 1]?.metadata?.sentiment || 'neutral'
                }
            ],
            ai_insights: [
                ...(userMemory?.ai_insights || []).slice(-30), // שמור רק 30 אחרונים
                ...analysis.new_insights?.map(insight => ({
                    date: new Date().toISOString(),
                    insight: insight.content,
                    confidence: insight.confidence,
                    applied: false,
                    outcome: null
                })) || []
            ],
            personalization_strategy: analysis.personalization_strategy || userMemory?.personalization_strategy,
            last_context: analysis.last_context || userMemory?.last_context,
            last_updated: new Date().toISOString()
        };

        if (userMemory) {
            await base44.entities.UserMemory.update(userMemory.id, memoryData);
        } else {
            await base44.entities.UserMemory.create(memoryData);
        }

        // 6. עדכן את ה-ConversationLog עם התובנות
        if (conversationLogId) {
            await base44.entities.ConversationLog.update(conversationLogId, {
                extracted_insights: analysis.new_insights,
                outcome: analysis.last_context
            });
        }

        return Response.json({
            success: true,
            insights: analysis.new_insights,
            personalization: analysis.personalization_strategy,
            memory_updated: true
        });

    } catch (error) {
        console.error('Error updating user memory:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});