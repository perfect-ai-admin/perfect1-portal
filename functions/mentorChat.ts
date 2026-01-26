import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { user_id, message, chat_history, goal_id } = await req.json();

        if (!user_id || !message) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // זיהוי user_id
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // שליפת הקשר מותאם אישית
        let personalizedContext = null;
        try {
            const contextRes = await base44.asServiceRole.functions.invoke('getPersonalizedContext', {
                purpose: 'mentor_chat',
                currentGoalId: goal_id,
                user_id: user.id
            });
            personalizedContext = contextRes.data?.context;
            console.log('✅ Personalized context loaded');
        } catch (err) {
            console.warn('⚠️ Could not load personalized context:', err.message);
        }

        // שליפת פרטי המשתמש/ליד
        let userProfile = null;
        const leads = await base44.asServiceRole.entities.CRMLead.filter({ 
            $or: [{ id: user_id }, { phone: user_id }] 
        });
        if (leads.length > 0) {
            userProfile = leads[0];
        }

        // בניית הקשר שיחה
        const conversationHistory = chat_history || [];
        const historyMessages = conversationHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // בניית prompt מותאם למנטור
        const systemPrompt = `אתה מנטור עסקי חכם ואמפתי לעוסקים עצמאיים.
אתה מדבר עברית בצורה חמה ואותנטית.
אתה כאן כדי לעזור לעוסקים להתקדם, לפתור בעיות, ולהשיג מטרות.

${userProfile ? `שם הלקוח: ${userProfile.full_name}` : ''}

${personalizedContext ? `
הקשר מותאם אישית על המשתמש:
- סגנון תקשורת מועדף: ${personalizedContext.personality?.communication_style || 'לא ידוע'}
- קצב עבודה מועדף: ${personalizedContext.personality?.pace_preference || 'לא ידוע'}
- אתגרים עיקריים: ${personalizedContext.business?.main_challenges?.join(', ') || 'לא ידוע'}
- תחומי מומנטום: ${personalizedContext.progress?.momentum_areas?.join(', ') || 'לא ידוע'}
- אסטרטגיה: ${personalizedContext.strategy?.approach || 'כללי'}
- המלצות: עשה יותר: ${personalizedContext.recommendations?.focus_on?.join(', ') || 'לא ידוע'}
- המלצות: עשה פחות: ${personalizedContext.recommendations?.avoid?.join(', ') || 'לא ידוע'}
` : ''}

המשימה שלך:
1. תן תשובה מועילה, מעשית ומעודדת - מותאמת לסגנון התקשורת שלו
2. זהה אם הלקוח זקוק לעזרה מיוחדת
3. השתמש בהקשר המותאם כדי לדבר אליו בצורה הנכונה
4. תמיד סיים עם שאלה או המלצה לצעד הבא

תשובתך צריכה להיות ב-JSON:
{
  "response": "התשובה שלך בעברית..."
}`;

        // קריאה ל-LLM
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...historyMessages,
                { role: "user", content: message }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // עדכון זיכרון לאחר שיחה
        try {
            await base44.asServiceRole.functions.invoke('updateUserMemory', {
                conversationLogId: null,
                messages: [...historyMessages, { role: 'user', content: message }, { role: 'assistant', content: result.response }],
                context: { current_stage: 'mentor_chat', goal_id },
                agentName: 'mentorChat',
                user_id: user.id
            });
            console.log('✅ Memory updated after mentor chat');
        } catch (memErr) {
            console.warn('⚠️ Failed to update memory:', memErr.message);
        }

        return Response.json(result);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});