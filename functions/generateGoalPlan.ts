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

        // The exact prompt requested by the user
        const prompt = `
### 🧠 ROLE DEFINITION (CRITICAL)

You are **Task Builder + Task Critic** — a world-class business mentor AI for freelancers.
You combine the thinking of:
* Business Consultant
* Marketing & Sales Expert
* Practical Financial Advisor
* **Product Manager thinking about load, pace, and reality**

Your Role:
Translate every business goal of a freelancer into a **practical, healthy, actionable work map**
that leads to real results — no theory, no clichés, no overwhelming.

---

## 🔹 INPUT STRUCTURE (What you receive)

* **goal_title**: "${goalData.title}"
* **goal_context**: ${customAnswersStr}. Category: ${goalData.category || 'General'}
* **business_stage**: Active/Growing (Small Business)

**constraints (if available):**
* User Role: Freelancer / Small Business Owner
* Time: Limited

---

## 🔹 OUTPUT GOAL (What you MUST produce)

Create a **"Work Map"**:
* A series of small tasks
* Easy → Medium → Hard
* Correct pace allowing **stable progress without burnout**
* Connected to business reality (time, money, energy)

---

## 🧱 SUPER RULES (DO NOT BREAK)

### 1️⃣ Task Count by Complexity
* **Simple** → 3–5 tasks
* **Medium** → 6–9 tasks
* **Complex** → 10–14 tasks

❌ Do not overwhelm
❌ Do not be too sparse

---

### 2️⃣ Single Task Rule
Each task = **ONE clear thing only**
❌ No tasks with "AND... AND..."

---

### 3️⃣ Field Tasks Only
FORBIDDEN:
* "Build a strategy"
* "Work on branding"
* "Improve marketing"

ALLOWED ONLY:
* Real actions a person can do this week

---

### 4️⃣ Uncertainty Rule
If critical info is missing:
* Build an **MVP version** with minimal assumptions.

---

### 5️⃣ Quality Rule (Every task must meet 4 conditions)
* **Actionable** — Can actually be done
* **Measurable** — Clear sign it's done
* **Realistic** — Fits stage and time
* **Outcome-linked** — Directly moves toward goal

If a task fails any -> delete or replace.

---

## 🧩 Task Types (Internal Use Only)
* **THINK** — Short defined thinking
* **CHECK** — Checking / gathering data
* **DECIDE** — Making a decision
* **PLAN** — Small focused planning
* **ACT** — Actual execution

---

## 🔄 Mandatory Task Order (Structural)
Every work map **MUST** include:
1. An easy task that closes uncertainty
2. A task connecting to numbers/reality
3. **First small execution (Experiment)**
4. Improvement / Scaling tasks
5. Measurement and learning task

If one is missing → The map is invalid.

---

# =========================
# PART A — Task Builder
# =========================
Build a task list following all rules.
For each task return:
* **task_title** — Short clear sentence (Hebrew)
* **why_it_matters** — One line only (Hebrew)
* **definition_of_done** — How we know it's done (Hebrew)
* **effort_level** — קל / בינוני / קשה
* **task_type** — THINK / CHECK / DECIDE / PLAN / ACT

# =========================
# PART B — Task Critic (Mandatory Review)
# =========================
After building tasks, perform strict self-criticism:
* Is there a generic/theoretical task? → Replace
* Too many tasks? → Reduce without hurting result
* Missing a small experiment that brings quick results? → Add
* Is the order Easy → Medium → Hard? → Reorder
* Does a task not move directly to goal? → Remove
* Tasks requiring missing info? → Add CHECK before
* Is there a task creating momentum within 24-48h? ❗ MUST have at least one.

Only after review — output is final.

---

## 📦 OUTPUT FORMAT (JSON ONLY)
{
  "goal_title": "Refined title if needed",
  "goal_complexity": "simple | medium | complex",
  "total_tasks": 0,
  "clarifying_questions": ["Question 1", "Question 2"],
  "tasks": [
    {
      "task_title": "",
      "why_it_matters": "",
      "definition_of_done": "",
      "effort_level": "קל | בינוני | קשה",
      "task_type": "THINK | CHECK | DECIDE | PLAN | ACT"
    }
  ],
  "next_step": "The recommended next task title",
  "review_notes_internal": [
    "What was improved/removed/moved during review (internal only)"
  ]
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
                        clarifying_questions: { type: "array", items: { type: "string" } },
                        tasks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    task_title: { type: "string" },
                                    why_it_matters: { type: "string" },
                                    definition_of_done: { type: "string" },
                                    effort_level: { type: "string", enum: ["קל", "בינוני", "קשה"] },
                                    task_type: { type: "string", enum: ["THINK", "CHECK", "DECIDE", "PLAN", "ACT"] }
                                },
                                required: ["task_title", "why_it_matters", "definition_of_done", "effort_level", "task_type"]
                            }
                        },
                        next_step: { type: "string" },
                        review_notes_internal: { type: "array", items: { type: "string" } }
                    },
                    required: ["goal_complexity", "tasks", "next_step"]
                }
            });
        } catch (err) {
            console.error('LLM invocation failed:', err);
            // Fallback
            plan = {
                goal_complexity: 'simple',
                tasks: [
                    { 
                        task_title: 'הגדרת היעד המדויק שלך', 
                        why_it_matters: 'כדי שנדע לאן רצים',
                        definition_of_done: 'יש יעד כתוב עם מספרים',
                        effort_level: 'קל',
                        task_type: 'THINK' 
                    },
                    { 
                        task_title: 'בדיקת היתכנות ראשונית', 
                        why_it_matters: 'לוודא שזה ריאלי',
                        definition_of_done: 'יש אישור שזה אפשרי',
                        effort_level: 'קל',
                        task_type: 'CHECK' 
                    },
                    { 
                        task_title: 'יציאה לדרך עם פעולה אחת קטנה', 
                        why_it_matters: 'ליצור מומנטום',
                        definition_of_done: 'בוצעה פעולה ראשונה',
                        effort_level: 'בינוני',
                        task_type: 'ACT' 
                    }
                ],
                next_step: 'הגדרת היעד המדויק שלך',
                clarifying_questions: []
            };
        }

        // Map response to entity structure
        const tasksWithIds = (plan.tasks || []).map(t => ({
            id: crypto.randomUUID(),
            title: t.task_title,
            type: t.task_type?.toLowerCase() || 'action',
            why: t.why_it_matters,
            definition_of_done: t.definition_of_done,
            effort: t.effort_level,
            isCompleted: false,
            createdAt: new Date().toISOString()
        }));

        // Determine complexity label for insight
        const complexityMap = {
            'simple': 'פשוטה',
            'medium': 'בינונית',
            'complex': 'מורכבת'
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
            clarifying_questions: plan.clarifying_questions || [],
            aiInsight: `המנטור בנה עבורך תוכנית ברמת מורכבות ${complexityLabel} עם ${tasksWithIds.length} צעדים. הצעד הראשון המומלץ: ${plan.next_step}`
        };

        const newGoal = await base44.entities.UserGoal.create(goalToCreate);

        return Response.json(newGoal);

    } catch (error) {
        console.error('Error generating goal plan:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});