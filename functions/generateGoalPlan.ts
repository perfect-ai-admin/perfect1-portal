import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Support both old format {title} and new format {goalData}
        const body = await req.json();
        let goalData = body.goalData || {};
        
        // If called with just title (old format or from MentorOverview)
        if (body.title && !goalData.title) {
            goalData.title = body.title;
        }

        if (!goalData.title) {
            return Response.json({ error: 'Goal title is required' }, { status: 400 });
        }

        const customAnswersStr = goalData.customAnswers 
            ? JSON.stringify(goalData.customAnswers) 
            : '';

        const prompt = `
        You are an expert business mentor for freelancers and small business owners in Israel.
        Your task is to take a user's goal and decompose it into a concrete, actionable plan of small, atomic tasks.

        User's Goal: "${goalData.title}"
        Context/Answers: ${customAnswersStr}
        Category: ${goalData.category || 'General'}

        GUIDELINES:
        1. Analyze the goal type (Idea, Revenue, Clients, Organization, Marketing, Sales).
        2. Determine complexity (Low: 3-5 tasks, Medium: 6-9 tasks, High: 10-15 tasks).
        3. Break down into atomic tasks that are clear, manageable, and not intimidating.
        4. Task types can be: 'thinking', 'checking', 'numbers', 'decision', 'action'.
        5. LANGUAGE: Hebrew (Friendly, professional, direct, no buzzwords).
        6. NO abstract terms like "Strategy", "Branding", "MVP". Use simple, direct terms.
        7. The tasks should follow a logical sequence.
        
        OUTPUT FORMAT (JSON):
        {
            "description": "One line description of the goal context (if not provided)",
            "complexity": "low/medium/high",
            "tasks": [
                { "title": "Task text", "type": "action" }
            ]
        }
        `;

        // Using Core.InvokeLLM which is always available
        const plan = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    description: { type: "string" },
                    complexity: { type: "string" },
                    tasks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                type: { type: "string" }
                            },
                            required: ["title", "type"]
                        }
                    }
                },
                required: ["description", "tasks"]
            }
        });

        // Create the goal entity with the generated plan
        const tasksWithIds = plan.tasks.map(t => ({
            id: crypto.randomUUID(),
            title: t.title,
            type: t.type,
            isCompleted: false,
            createdAt: new Date().toISOString()
        }));

        // Merge generated data with provided goalData
        // If goalData has description, keep it. If not, use generated one.
        const finalDescription = goalData.description || plan.description || 'תוכנית עבודה מותאמת אישית';
        
        // Construct the final object for creation
        const goalToCreate = {
            ...goalData,
            user_id: user.id,
            description: finalDescription,
            status: goalData.status || 'active',
            progress: goalData.progress || 0,
            tasks: tasksWithIds,
            // Append complexity info to existing insight or create new one
            aiInsight: goalData.aiInsight 
                ? `${goalData.aiInsight}\n(תוכנית ברמת מורכבות ${plan.complexity === 'high' ? 'גבוהה' : plan.complexity === 'medium' ? 'בינונית' : 'נמוכה'})`
                : `תוכנית זו הוגדרה כרמת מורכבות ${plan.complexity === 'high' ? 'גבוהה' : plan.complexity === 'medium' ? 'בינונית' : 'נמוכה'} ומכילה ${tasksWithIds.length} צעדים.`
        };

        const newGoal = await base44.entities.UserGoal.create(goalToCreate);

        return Response.json(newGoal);

    } catch (error) {
        console.error('Error generating goal plan:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});