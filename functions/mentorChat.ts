import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { message, clientData } = await req.json();

        // 1. Get Conversation History (Last 10 messages)
        const history = await base44.entities.MentorMessage.filter(
            { created_by: user.email }, 
            '-created_date', 
            10
        );

        // 2. Get Today's Focus
        const today = new Date().toISOString().split('T')[0];
        const dailyFocusList = await base44.entities.DailyFocus.filter({ date: today });
        let dailyFocus = dailyFocusList[0];

        // 3. Construct System Prompt
        const systemPrompt = `You are an elite Business Mentor for freelancers. You speak Hebrew.
Your goal is not just to chat, but to actively MANAGE the user's business state.
You are "The System" that learns them.

Current User State:
- Name: ${user.full_name}
- Profession: ${clientData.profession || 'Freelancer'}
- Current Focus (Today): ${dailyFocus?.primary_focus || 'None'}
- Load Level: ${dailyFocus?.load_score || 50}%

User's input: "${message}"

Your tasks:
1. Answer the user helpfully and empathetically.
2. ANALYZE if the user needs a NEW Focus or if their Load Level changed based on the sentiment.
   - If they are overwhelmed -> High Load.
   - If they are lost -> Suggest a Focus.
   - If they achieved something -> Celebrate.

Output MUST be valid JSON:
{
  "reply": "Your helpful text response here...",
  "suggested_focus": "A short, sharp focus task (or null if no change needed)",
  "focus_reasoning": "Why you suggest this",
  "load_score_update": number (0-100) or null (if no clear signal)
}`;

        // 4. Call LLM
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...history.reverse().map(m => ({ role: m.role, content: m.content })),
                { role: "user", content: message }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // 5. Update DB
        // Save User Message
        await base44.entities.MentorMessage.create({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Save Assistant Message
        await base44.entities.MentorMessage.create({
            role: 'assistant',
            content: result.reply,
            timestamp: new Date().toISOString()
        });

        // Update Daily Focus if needed
        if (result.suggested_focus || result.load_score_update !== null) {
            const updateData = {};
            if (result.suggested_focus) {
                updateData.ai_suggestion = result.suggested_focus;
                updateData.ai_reasoning = result.focus_reasoning;
                updateData.ai_context = message;
            }
            if (result.load_score_update !== null) {
                updateData.load_score = result.load_score_update;
            }

            if (Object.keys(updateData).length > 0) {
                if (dailyFocus) {
                    await base44.entities.DailyFocus.update(dailyFocus.id, updateData);
                } else {
                    await base44.entities.DailyFocus.create({
                        date: today,
                        ...updateData
                    });
                }
            }
        }

        return Response.json(result);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});