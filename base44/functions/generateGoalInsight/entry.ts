import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { title, customAnswers } = await req.json();

        // If no title, return default insight
        if (!title) {
            return Response.json({ insight: 'מטרה חדשה נוצרה - התחל לעבוד לקראתה!' });
        }

        // Construct a prompt for the LLM
        let prompt = `Act as an expert business mentor. Generate a short, encouraging, and actionable insight (1 sentence max) in Hebrew for a user who just set the following business goal: "${title}".`;

        if (customAnswers && Object.keys(customAnswers).length > 0) {
            prompt += `\n\nTake into account their answers to these questions:\n`;
            for (const [key, value] of Object.entries(customAnswers)) {
                if (value) {
                    prompt += `- Answer: ${value}\n`;
                }
            }
        }

        prompt += `\nThe insight should be motivating and suggest a generic first step or a thought provoking question related to their specific answers if possible. Keep it under 20 words. No emojis in the text itself (or minimal).`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    insight: { type: "string" }
                }
            }
        });

        // Ensure we have a string
        let insight = 'מטרה חדשה נוצרה - התחל לעבוד לקראתה!';
        if (response && response.insight) {
            insight = response.insight;
        } else if (typeof response === 'string') {
             try {
                const parsed = JSON.parse(response);
                if (parsed.insight) insight = parsed.insight;
             } catch (e) {
                // If not JSON, maybe it's the raw string
                insight = response;
             }
        }

        return Response.json({ insight });

    } catch (error) {
        console.error('Error generating insight:', error);
        // Return default on error to not block flow
        return Response.json({ insight: 'מטרה חדשה נוצרה - התחל לעבוד לקראתה!' });
    }
});