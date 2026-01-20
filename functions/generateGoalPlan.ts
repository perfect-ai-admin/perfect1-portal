import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        let goalData = body.goalData || {};
        
        // Support legacy/direct title call
        if (body.title && !goalData.title) {
            goalData.title = body.title;
        }

        if (!goalData.title) {
            return Response.json({ error: 'Goal title is required' }, { status: 400 });
        }

        const customAnswersStr = goalData.customAnswers 
            ? JSON.stringify(goalData.customAnswers) 
            : 'No specific context provided';

        const prompt = `
You are a senior business mentor AI that specializes in turning business goals into clear, minimal, actionable task plans for small business owners and freelancers.

Your job is NOT to teach theory.
Your job is to create clarity, order, and momentum.

INPUT YOU RECEIVED:
- goal_title: "${goalData.title}"
- goal_context: ${customAnswersStr}. Category: ${goalData.category || 'General'}
- business_stage: Active/Growing (Small Business)

CORE RESPONSIBILITY:
Convert the goal into a structured task map that:
- Is not overwhelming
- Is not vague
- Is not theoretical
- Moves the user toward real decisions and actions

TASK COUNT LOGIC (MANDATORY):
1. Classify the goal as:
   - simple (low uncertainty, mostly execution)
   - medium (thinking + action)
   - complex (high uncertainty, risk, or strategic decisions)

2. Decide number of tasks:
   - simple → 3–5 tasks
   - medium → 6–9 tasks
   - complex → 10–14 tasks

Never create fewer than 3 or more than 14 tasks.
If unsure, choose fewer tasks.

TASK DESIGN RULES:
Each task must:
- Have one clear purpose
- Be human and simple
- Avoid jargon
- Be something a real person can do

Tasks may include:
- thinking
- checking reality
- making a decision
- planning
- acting

Tasks must NOT be:
- abstract
- generic
- overloaded
- theoretical

INTERNAL TASK TYPES:
- THINK
- CHECK
- DECIDE
- PLAN
- ACT

TASK ORDERING RULES:
- Clarity before action
- Decisions before execution
- Numbers before commitment
- First task must feel easy and safe and MUST be the "next_recommended_task"

NEXT STEP RULE:
After creating all tasks, select ONE task as the next recommended task.
Choose the task that reduces uncertainty the most with the least emotional resistance.
IMPORTANT: The "next_recommended_task" MUST be the first item in the "tasks" array.

LANGUAGE STYLE:
- Hebrew (Friendly, professional, direct, no buzzwords)
- Simple
- Calm
- Direct
- Supportive
- No hype
- No coaching clichés

OUTPUT FORMAT (STRICT JSON):
{
  "goal_title": "refined title if needed",
  "goal_complexity": "simple | medium | complex",
  "total_tasks": number,
  "tasks": [
    {
      "task_title": "The task text in Hebrew",
      "task_type": "THINK | CHECK | DECIDE | PLAN | ACT"
    }
  ],
  "next_recommended_task": "The title of the recommended task (must match first task)"
}
`;

        let plan;
        try {
            plan = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        goal_title: { type: "string" },
                        goal_complexity: { type: "string", enum: ["simple", "medium", "complex"] },
                        total_tasks: { type: "integer" },
                        tasks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_title: { type: "string" },
                                    task_type: { type: "string", enum: ["THINK", "CHECK", "DECIDE", "PLAN", "ACT"] }
                                },
                                required: ["task_title", "task_type"]
                            }
                        },
                        next_recommended_task: { type: "string" }
                    },
                    required: ["goal_complexity", "tasks", "next_recommended_task"]
                }
            });
        } catch (err) {
            console.error('LLM invocation failed:', err);
            // Fallback
            plan = {
                goal_complexity: 'simple',
                tasks: [
                    { task_title: 'הגדרת היעד המדויק שלך', task_type: 'THINK' },
                    { task_title: 'בדיקת היתכנות ראשונית', task_type: 'CHECK' },
                    { task_title: 'יציאה לדרך עם פעולה אחת קטנה', task_type: 'ACT' }
                ],
                next_recommended_task: 'הגדרת היעד המדויק שלך'
            };
        }

        // Map response to entity structure
        const tasksWithIds = (plan.tasks || []).map(t => ({
            id: crypto.randomUUID(),
            title: t.task_title,
            type: t.task_type?.toLowerCase() || 'action',
            isCompleted: false,
            createdAt: new Date().toISOString()
        }));

        // Determine complexity label for insight
        const complexityMap = {
            'simple': 'פשוטה',
            'medium': 'בינונית',
            'complex': 'גבוהה'
        };
        const complexityLabel = complexityMap[plan.goal_complexity] || 'רגילה';

        const finalDescription = goalData.description || 'תוכנית עבודה ממוקדת';
        
        const goalToCreate = {
            ...goalData,
            user_id: user.id,
            // Use refined title if AI provided one, otherwise original
            title: plan.goal_title || goalData.title, 
            description: finalDescription,
            status: goalData.status || 'active',
            progress: goalData.progress || 0,
            tasks: tasksWithIds,
            aiInsight: `המנטור בנה עבורך תוכנית ברמת מורכבות ${complexityLabel} עם ${tasksWithIds.length} צעדים. הצעד הראשון המומלץ: ${plan.next_recommended_task}`
        };

        const newGoal = await base44.entities.UserGoal.create(goalToCreate);

        return Response.json(newGoal);

    } catch (error) {
        console.error('Error generating goal plan:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});