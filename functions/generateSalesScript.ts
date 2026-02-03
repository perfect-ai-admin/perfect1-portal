import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

export default async function handler(req) {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { scenario, goal, audience, keyPoints, type } = await req.json();

    const openai = new OpenAI({
        apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    const systemPrompt = `You are an expert sales mentor and script writer for small business owners in Israel.
    Create a natural, effective, and professional sales script in Hebrew.
    
    The script should be:
    1. Conversational and not robotic.
    2. Focused on value and empathy.
    3. Clear and concise.
    4. Include placeholders like [Name] where needed.
    
    Format the output as a JSON object with:
    - title: A short catchy title for the script.
    - script: The actual script text (can include newlines).
    - tips: An array of 3-4 short actionable tips for delivering this specific script.
    - duration: Estimated duration (e.g., "2-3 minutes").
    `;

    const userPrompt = `
    Create a sales script for the following context:
    - Type: ${type || 'General'}
    - Scenario: ${scenario}
    - Target Audience: ${audience}
    - Goal: ${goal}
    - Key Points to Include: ${keyPoints}
    
    Language: Hebrew
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error generating script:", error);
        return new Response(JSON.stringify({ error: "Failed to generate script" }), { status: 500 });
    }
}

Deno.serve(handler);