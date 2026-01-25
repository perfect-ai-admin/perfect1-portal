import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { user_id, message, chat_history } = await req.json();

        if (!user_id || !message) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
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

        // בניית prompt למנטור
        const systemPrompt = `אתה מנטור עסקי חכם ואמפתי לעוסקים עצמאיים.
אתה מדבר עברית בצורה חמה ואותנטית.
אתה כאן כדי לעזור לעוסקים להתקדם, לפתור בעיות, ולהשיג מטרות.

${userProfile ? `שם הלקוח: ${userProfile.full_name}` : ''}

המשימה שלך:
1. תן תשובה מועילה, מעשית ומעודדת
2. זהה אם הלקוח זקוק לעזרה מיוחדת
3. תמיד סיים עם שאלה או המלצה לצעד הבא

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

        return Response.json(result);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});