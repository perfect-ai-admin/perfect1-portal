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

        // Extract context for smarter planning
        const context = goalData._context || {};
        const activeGoalsCount = context.activeGoalsCount || 0;
        const goalPosition = context.goalPosition || 1;
        const businessState = context.businessState || {};
        const businessJourneyAnswers = context.businessJourneyAnswers || {};
        
        const customAnswersStr = goalData.customAnswers ? JSON.stringify(goalData.customAnswers) : 'אין מידע נוסף';
        const businessStateStr = businessState.stage ? `שלב עסקי: ${businessState.stage}, אתגר עיקרי: ${businessState.primary_challenge || 'לא ידוע'}` : 'לא ידוע';
        const journeyContext = businessJourneyAnswers ? `מידע מהשאלון: ${JSON.stringify(businessJourneyAnswers).substring(0, 300)}` : 'אין';

        const prompt = `
### 🧠 ROLE DEFINITION (CRITICAL)
      You are **Task Builder + Task Critic** — a world-class business mentor AI specialized in Israeli small businesses.
      **IMPORTANT: You must output everything in Hebrew (עברית) ONLY.**

      ## 🔹 GOAL INPUT
      * **Goal**: "${goalData.title}"
      * **Context from user**: ${customAnswersStr}
      * **Business State**: ${businessStateStr}
      * **Journey Context**: ${journeyContext}

      ## 📊 USER CONTEXT (CRITICAL FOR TASK PLANNING)
      * **Active Goals Count**: ${activeGoalsCount} מטרות פעילות כרגע
      * **Goal Position**: זו המטרה ה-${goalPosition} של המשתמש
      * **Implication**: ${goalPosition === 1 ? 'משתמש חדש - יצור משימות פשוטות וממוקדות (3-4 משימות)' : goalPosition === 2 ? 'משתמש עם ניסיון - אפשר להוסיף עומק (5-7 משימות)' : 'משתמש מתקדם - אפשר משימות מורכבות יותר (6-10 משימות)'}

      ## 🧱 SUPER RULES (STRICT)
      1. **Language**: ALL OUTPUT MUST BE IN HEBREW. Titles, descriptions, summaries - EVERYTHING.
      
      2. **Dynamic Task Count (CRITICAL)**:
         * מטרה ראשונה (position=1): 3-4 משימות פשוטות, ברורות, ברות ביצוע. התמקד ב-quick wins.
         * מטרה שנייה (position=2): 5-7 משימות עם יותר עומק. המשתמש כבר מכיר את המערכת.
         * מטרה שלישית+ (position≥3): 6-10 משימות מפורטות. המשתמש מנוסה ומחפש תוכנית מקיפה.
      
      3. **Business Impact Priority**: תעדף משימות שמשפיעות ישירות על הכנסות/לקוחות/צמיחה.
      
      4. **Single Task Rule**: כל משימה = פעולה אחת ברורה ומדידה.
      
      5. **No Fluff**: רק פעולות קונקרטיות. אין "לחשוב על אסטרטגיה" או "לתכנן". רק ACT.
      
      6. **48h Momentum Rule (MANDATORY)**: 
         * תסמן בדיוק משימה אחת כ-\`momentum: true\`
         * המשימה חייבת להיות ניתנת לביצוע תוך 48 שעות
         * זו חייבת להיות המשימה הראשונה ברשימה
         * דוגמאות טובות: "שלח הודעה ללקוח פוטנציאלי אחד", "צור טיוטה של חשבונית", "פרסם פוסט אחד ברשתות"
      
      7. **Quality Standards**: 
         * כל משימה חייבת להכיל: \`task_title\`, \`why_it_matters\`, \`definition_of_done\`, \`effort_level\`
         * ה-\`why_it_matters\` צריך להיות משכנע ולהסביר איך זה עוזר למטרה
         * ה-\`definition_of_done\` צריך להיות מדיד וברור (לא "לעשות טוב" אלא "לשלוח 3 הודעות")

      8. **Actionable Task Sequence**: 
         * סדר המשימות חייב להיות הגיוני - כל משימה מובילה לבאה
         * התחל קל, עלה בהדרגה בקושי
         * וודא שהמשתמש יכול להתחיל מיד במשימה הראשונה

# =========================
# PART A — Task Builder
# =========================
בנה את המשימות בהתאם למטרה, למצב העסקי, ולמיקום של המטרה (ראשונה/שנייה/שלישית).

דוגמה למטרה ראשונה "גיוס לקוח ראשון":
1. (momentum=true) שלח הודעה אישית ללקוח פוטנציאלי אחד מהרשימה שלך
2. הכן הצעת מחיר פשוטה (תבנית בסיסית)
3. תזמן שיחת ייעוץ ראשונה (אפילו עם חבר)

דוגמה למטרה שלישית "הגדלת מכירות ב-30%":
1. (momentum=true) פרסם פוסט אחד עם מבצע בפייסבוק
2. צור רשימה של 10 לקוחות קיימים לפנייה חוזרת
3. הכן תסריט שיחה לפנייה ללקוחות
4. פנה ללקוח אחד מהרשימה וקבל משוב
5. שפר את התסריט בהתאם למשוב
6. פנה ל-5 לקוחות נוספים
7. נתח תוצאות וקבע צעדים הבאים

# =========================
# PART B — Task Critic (Self-Correction)
# =========================
לפני פלט, בדוק:
* ✅ יש משימת momentum אחת ברורה (48 שעות)?
* ✅ הסדר הוא מקל לקשה?
* ✅ כל ההסברים ("למה זה חשוב") משכנעים?
* ✅ כל משימה ברת ביצוע ומדידה?
* ✅ כמות המשימות מתאימה למיקום המטרה (${goalPosition === 1 ? '3-4' : goalPosition === 2 ? '5-7' : '6-10'})?
* ✅ כתוב 'plan_summary' שמסביר את ההיגיון (2-3 משפטים).

## 📦 OUTPUT FORMAT (JSON ONLY)
{
  "goal_title": "כותרת מדויקת ומשודרגת",
  "goal_complexity": "simple | medium | complex",
  "plan_summary": "הסבר ההיגיון של התוכנית בעברית...",
  "clarifying_questions": [],
  "tasks": [
    {
      "task_title": "כותרת ברורה",
      "why_it_matters": "הסבר משכנע למה זה חשוב",
      "definition_of_done": "קריטריון מדיד להצלחה",
      "effort_level": "קל | בינוני | קשה",
      "task_type": "THINK | CHECK | DECIDE | PLAN | ACT",
      "momentum": true/false,
      "status": "todo"
    }
  ],
  "next_step": "מה לעשות אחרי השלמת כל המשימות"
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

        const commonData = {
            title: plan.goal_title || goalData.title, 
            description: goalData.description || 'תוכנית עבודה ממוקדת',
            status: goalData.status || 'active',
            tasks: tasksWithIds,
            plan_summary: plan.plan_summary || "לא התקבל תקציר.",
            clarifying_questions: plan.clarifying_questions || [],
            aiInsight: `המנטור בנה תוכנית ${complexityLabel} עם ${tasksWithIds.length} צעדים.`
        };

        let resultGoal;
        if (body.goalId) {
            // Update existing goal
            resultGoal = await base44.entities.UserGoal.update(body.goalId, commonData);
        } else {
            // Create new goal
            const goalToCreate = {
                ...goalData,
                ...commonData,
                user_id: user.id,
                progress: 0,
            };
            resultGoal = await base44.entities.UserGoal.create(goalToCreate);
        }

        return Response.json(resultGoal);

    } catch (error) {
        console.error('Critical Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});