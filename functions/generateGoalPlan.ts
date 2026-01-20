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
אתה "Task Builder + Task Critic" — מוח מנטורינג עולמי (עסקי + שיווק + פיננסי) שמתרגם כל מטרה של עצמאי לתוכנית משימות פרקטית, יציבה ובריאה שמביאה תוצאה.

הקלט שאני נותן לך:
1) goal_title — ${goalData.title}
2) goal_context — ${customAnswersStr}
3) business_stage — רעיון / התחלה / פעיל / גדילה (Small Business)
4) constraints: דחיפות ${goalData.urgency || 'medium'}

המטרה שלך:
ליצור "מפת עבודה" למטרה: סדרת משימות קטנות שמתחילות קל → בינוני → קשה, בקצב נכון שמאפשר ביצוע אמיתי והתקדמות יציבה.

חוקי על (אסור לשבור):
- לא יותר מדי משימות ולא מעט מדי:
  * פשוטה: 3–5 משימות
  * בינונית: 6–9 משימות
  * מורכבת: 10–14 משימות
- כל משימה = דבר אחד ברור (לא משימה עם 3 משימות בפנים)
- משימות חייבות להיות מהשטח, לא תיאוריה
- בלי קלישאות (כמו "לבנות אסטרטגיה" בלי פירוק)
- אם חסר מידע קריטי כדי לבנות משימות טובות: בנה גרסת MVP משימות עם הנחות מינימליות.
- תמיד להגדיר "Next Step" אחד ברור להתחלה.

חוק איכות:
כל משימה חייבת לעמוד ב־4 קריטריונים:
1) Actionable — אפשר לבצע בפועל
2) Measurable — יש תוצאה/סימן שסיימתי
3) Realistic — מתאים לזמן ולשלב העסק
4) Outcome-linked — מקרב ישירות למטרה

סוגי משימות (לסיווג פנימי):
- THINK (חשיבה קצרה ומוגדרת)
- CHECK (בדיקה/איסוף נתון)
- DECIDE (החלטה)
- PLAN (תכנון קטן)
- ACT (ביצוע בפועל)

סדר משימות חובה:
1) משימת "קל וסוגר אי־ודאות"
2) משימת "חיבור למספרים / מציאות"
3) משימת "ביצוע ראשון קטן" (ניסוי)
4) משימות הגדלה/שיפור
5) משימת "מדידה ושיפור"

========================
חלק A — בניית משימות (Task Builder)
========================
תבנה רשימת משימות לפי הכללים למעלה.

========================
חלק B — ביקורת ושיפור לפני הצגה (Task Critic)
========================
אחרי שיצרת משימות, בצע ביקורת עצמית:
1) האם יש משימה כללית/תיאורטית מדי? אם כן — להחליף למשימה מעשית.
2) האם יש עומס? אם כן — לצמצם.
3) האם חסר "ניסוי קטן"? אם חסר — להוסיף.
4) האם הסדר נכון (קל→בינוני→קשה)? אם לא — לסדר מחדש.
5) האם יש משימה אחת לפחות שמייצרת מומנטום תוך 24–48 שעות?

רק אחרי הביקורת—תחזיר את הגרסה הסופית בפורמט JSON בלבד.

OUTPUT FORMAT (STRICT JSON):
{
  "goal_title": "refined title if needed",
  "goal_complexity": "simple|medium|complex",
  "total_tasks": number,
  "clarifying_questions": ["question1", "question2"],
  "tasks": [
    {
      "task_title": "Actionable task text in Hebrew",
      "why_it_matters": "One line explanation",
      "definition_of_done": "One line completion criteria",
      "effort_level": "קל|בינוני|קשה",
      "task_type": "THINK|CHECK|DECIDE|PLAN|ACT"
    }
  ],
  "next_step": "Title of the first recommended task",
  "review_notes_internal": ["critic note 1"]
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
                    { task_title: 'הגדרת היעד המדויק שלך', task_type: 'THINK', why_it_matters: 'מיקוד', definition_of_done: 'יש יעד כתוב', effort_level: 'קל' },
                    { task_title: 'בדיקת היתכנות ראשונית', task_type: 'CHECK', why_it_matters: 'מציאות', definition_of_done: 'יש נתונים', effort_level: 'קל' },
                    { task_title: 'יציאה לדרך עם פעולה אחת קטנה', task_type: 'ACT', why_it_matters: 'מומנטום', definition_of_done: 'בוצע צעד ראשון', effort_level: 'בינוני' }
                ],
                next_step: 'הגדרת היעד המדויק שלך'
            };
        }

        // Map response to entity structure
        const tasksWithIds = (plan.tasks || []).map(t => ({
            id: crypto.randomUUID(),
            title: t.task_title,
            type: t.task_type?.toLowerCase() || 'action',
            // New fields
            why_it_matters: t.why_it_matters,
            definition_of_done: t.definition_of_done,
            effort_level: t.effort_level,
            // Standard fields
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
        
        // Append clarifying questions if relevant (optional enhancement)
        let insightText = `המנטור בנה עבורך תוכנית ברמת מורכבות ${complexityLabel} עם ${tasksWithIds.length} צעדים.`;
        if (plan.clarifying_questions && plan.clarifying_questions.length > 0) {
            // Note: We are not asking the user these questions in the UI yet, 
            // but we can show them as "points to consider" in the insight
            insightText += `\nנקודות למחשבה: ${plan.clarifying_questions.join(', ')}`;
        }

        const goalToCreate = {
            ...goalData,
            user_id: user.id,
            // Use refined title if AI provided one, otherwise original
            title: plan.goal_title || goalData.title, 
            description: finalDescription,
            status: goalData.status || 'active',
            progress: goalData.progress || 0,
            tasks: tasksWithIds,
            aiInsight: insightText,
            // Store next step as actionHint
            actionHint: plan.next_step
        };

        const newGoal = await base44.entities.UserGoal.create(goalToCreate);

        return Response.json(newGoal);

    } catch (error) {
        console.error('Error generating goal plan:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});