import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Validates the AI response structure
 */
function validatePlan(plan) {
    if (!plan) return { valid: false, reason: "Empty plan" };
    if (!plan.tasks || !Array.isArray(plan.tasks)) return { valid: false, reason: "Missing tasks array" };
    if (plan.tasks.length === 0) return { valid: false, reason: "Empty tasks array" };
    
    // Validate required fields in tasks
    const missingFields = plan.tasks.some(t => !t.task_title || !t.why_it_matters || !t.definition_of_done);
    if (missingFields) return { valid: false, reason: "Tasks missing required fields (title, why, DoD)" };

    // Validate Momentum Rule (at least one task must be momentum)
    const hasMomentum = plan.tasks.some(t => t.momentum === true);
    if (!hasMomentum) return { valid: false, reason: "Missing 'momentum' task (48h rule)" };

    return { valid: true };
}

/**
 * Attempts to repair broken JSON via LLM
 */
async function repairJSON(base44, brokenJsonString, errorReason) {
    console.log(`Attempting to repair JSON. Reason: ${errorReason}`);
    try {
        const repairPrompt = `
        You are a JSON Repair Agent.
        The following JSON string is invalid or missing required fields based on the business logic.
        
        Error/Reason: ${errorReason}
        
        Broken JSON:
        ${brokenJsonString}
        
        Your Task:
        1. Fix the syntax errors.
        2. Ensure all fields exist.
        3. IF "momentum" is missing, mark the first actionable task as "momentum": true.
        4. Return ONLY the valid JSON.
        `;

        const repaired = await base44.integrations.Core.InvokeLLM({
            prompt: repairPrompt,
            response_json_schema: { type: "object", additionalProperties: true } // Loose schema for repair
        });
        
        return repaired;
    } catch (e) {
        console.error("Repair failed:", e);
        return null;
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        let goalData = body.goalData || {};
        
        if (body.title && !goalData.title) goalData.title = body.title;
        if (!goalData.title) return Response.json({ error: 'Goal title is required' }, { status: 400 });

        const customAnswersStr = goalData.customAnswers ? JSON.stringify(goalData.customAnswers) : 'No specific context provided';

        const prompt = `
### 🧠 ROLE DEFINITION (CRITICAL)
You are **Task Builder + Task Critic** — a world-class business mentor AI.

## 🔹 GOAL INPUT
* **Goal**: "${goalData.title}"
* **Context**: ${customAnswersStr}

## 🧱 SUPER RULES (STRICT)
1. **Simple** (3-5 tasks) | **Medium** (6-9 tasks) | **Complex** (10-14 tasks).
2. **Single Task Rule**: One clear action per task.
3. **No Fluff**: Real actions only. No "Think about strategy".
4. **48h Momentum Rule**: You MUST tag exactly one task as \`momentum: true\`. This task must be doable within 48 hours to create quick wins.
5. **Quality**: Every task needs \`task_title\`, \`why_it_matters\`, \`definition_of_done\`, \`effort_level\`.

# =========================
# PART A — Task Builder
# =========================
Build the tasks.

# =========================
# PART B — Task Critic (Self-Correction)
# =========================
Before outputting, verify:
* Is there a momentum task?
* Is the order Easy → Medium → Hard?
* Are the explanations ("why") convincing?
* **Write a 'plan_summary' explaining your logic (2-3 sentences).**

## 📦 OUTPUT FORMAT (JSON ONLY)
{
  "goal_title": "Refined title",
  "goal_complexity": "simple | medium | complex",
  "plan_summary": "Logic of the plan...",
  "clarifying_questions": [],
  "tasks": [
    {
      "task_title": "",
      "why_it_matters": "",
      "definition_of_done": "",
      "effort_level": "קל | בינוני | קשה",
      "task_type": "THINK | CHECK | DECIDE | PLAN | ACT",
      "momentum": true/false,
      "status": "todo"
    }
  ],
  "next_step": ""
}
`;

        let plan;
        let rawResponse; // Keep raw for repair if needed

        // 1. First Attempt
        try {
            // We use a looser schema here to allow the LLM to include the "momentum" field properly without strict validation failing immediately, 
            // we will validate manually.
            plan = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        goal_title: { type: "string" },
                        goal_complexity: { type: "string" },
                        plan_summary: { type: "string" },
                        clarifying_questions: { type: "array", items: { type: "string" } },
                        tasks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_title: { type: "string" },
                                    why_it_matters: { type: "string" },
                                    definition_of_done: { type: "string" },
                                    effort_level: { type: "string" },
                                    task_type: { type: "string" },
                                    momentum: { type: "boolean" },
                                    status: { type: "string" }
                                },
                                required: ["task_title", "why_it_matters", "definition_of_done", "momentum"]
                            }
                        },
                        next_step: { type: "string" }
                    },
                    required: ["tasks", "plan_summary"]
                }
            });
            rawResponse = JSON.stringify(plan);
        } catch (err) {
            console.error("LLM Generation Error:", err);
            plan = null; 
        }

        // 2. Validation & Repair
        const validation = validatePlan(plan);
        
        if (!validation.valid) {
            console.warn(`Plan validation failed: ${validation.reason}. Attempting repair...`);
            const repairedPlan = await repairJSON(base44, rawResponse || "{}", validation.reason);
            
            if (repairedPlan && validatePlan(repairedPlan).valid) {
                plan = repairedPlan;
                console.log("Plan repaired successfully.");
            } else {
                console.error("Repair failed or produced invalid plan.");
                // Fallback MVP Plan
                plan = {
                    goal_title: goalData.title,
                    goal_complexity: 'simple',
                    plan_summary: 'תוכנית חירום בסיסית עקב תקלה ביצירת התוכנית המלאה.',
                    tasks: [
                        { 
                            task_title: 'הגדרת צעד ראשון', 
                            why_it_matters: 'להתחיל תנועה', 
                            definition_of_done: 'יש משימה אחת', 
                            effort_level: 'קל', 
                            task_type: 'THINK',
                            momentum: true,
                            status: 'todo'
                        }
                    ],
                    next_step: 'הגדרת צעד ראשון',
                    clarifying_questions: []
                };
            }
        }

        // 3. Map to Entity
        const tasksWithIds = (plan.tasks || []).map(t => ({
            id: crypto.randomUUID(),
            title: t.task_title,
            type: t.task_type?.toLowerCase() || 'action',
            why: t.why_it_matters,
            definition_of_done: t.definition_of_done,
            effort: t.effort_level,
            momentum: !!t.momentum,
            status: 'todo', // Force default
            isCompleted: false,
            createdAt: new Date().toISOString()
        }));

        const complexityMap = { 'simple': 'פשוטה', 'medium': 'בינונית', 'complex': 'מורכבת' };
        const complexityLabel = complexityMap[plan.goal_complexity] || 'רגילה';

        const goalToCreate = {
            ...goalData,
            user_id: user.id,
            title: plan.goal_title || goalData.title, 
            description: goalData.description || 'תוכנית עבודה ממוקדת',
            status: goalData.status || 'active',
            progress: 0,
            tasks: tasksWithIds,
            plan_summary: plan.plan_summary || "לא התקבל תקציר.",
            clarifying_questions: plan.clarifying_questions || [],
            aiInsight: `המנטור בנה תוכנית ${complexityLabel} עם ${tasksWithIds.length} צעדים.`
        };

        const newGoal = await base44.entities.UserGoal.create(goalToCreate);
        return Response.json(newGoal);

    } catch (error) {
        console.error('Critical Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});