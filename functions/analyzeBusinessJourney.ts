import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { answers } = await req.json();

        if (!answers) {
            return Response.json({ error: 'Answers are required' }, { status: 400 });
        }

        // Define the 6 states and their tasks
        const statesDefinitions = `
        מצב 1: מגבש כיוון (עוד לא פתח עסק / בתחילת מחשבה)
        לאן נוביל אותו: עסק פתוח עם בסיס ראשון למכירות
        משימות:
        1. בחירת כיוון עסקי
        2. הגדרת תחום וקהל יעד
        3. פתיחת עוסק פטור
        4. מיתוג בסיסי לעסק (שם, לוגו, שפה)
        5. יצירת לקוחות ראשונים
        6. הדרכת מכירות בסיסית

        מצב 2: בהקמה (פתח עכשיו / עסק צעיר)
        לאן נוביל אותו: לקוחות ראשונים בצורה מסודרת
        משימות:
        1. חידוד השירות המרכזי
        2. דיוק הצעת ערך ומסר שיווקי
        3. מיתוג מסודר
        4. בניית נכס שיווקי ראשון (דף / פרופיל)
        5. יצירת פניות ראשונות
        6. סגירת לקוחות ראשונים

        מצב 3: מחפש לקוחות ראשונים (יש עסק, אין יציבות)
        לאן נוביל אותו: תהליך שחוזר על עצמו
        משימות:
        1. ניתוח למה לקוחות לא מגיעים
        2. שיפור השירות והתמחור
        3. בניית משפך שיווקי פשוט
        4. יצירת תנועה עקבית
        5. שיפור תהליך מכירה
        6. לקוחות חוזרים / המלצות

        מצב 4: פעיל אך מבולגן (יש לקוחות, אין שליטה)
        לאן נוביל אותו: סדר, יציבות, שליטה
        משימות:
        1. מיפוי כל ההכנסות וההוצאות
        2. סידור שירותים ותמחור
        3. בניית סדר יום ושגרות
        4. ניהול פיננסי בסיסי
        5. הפחתת עומס ותקלות
        6. יציבות חודשית

        מצב 5: יציב ורוצה לגדול (עסק עובד 2–5 שנים)
        לאן נוביל אותו: צמיחה חכמה
        משימות:
        1. זיהוי צוואר בקבוק מרכזי
        2. בחירת מנוע צמיחה אחד
        3. שדרוג שיווק ומיתוג
        4. הגדלת ערך לקוח
        5. שיפור תהליך חוזר
        6. צמיחה מדידה

        מצב 6: ותיק וממנף (עסק בוגר 5–10+)
        לאן נוביל אותו: אופטימיזציה ושקט ניהולי
        משימות:
        1. ניתוח עומסים וניהול זמן
        2. האצלה / אוטומציה
        3. שליטה פיננסית מלאה
        4. קבלת החלטות מבוססת נתונים
        5. הפחתת תלות בבעלים
        6. עסק שעובד גם בלעדיו
        `;

        // Call LLM to analyze
        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `
            You are an expert business consultant. Your goal is to build a *personalized* growth plan for a freelancer/small business owner based on their questionnaire answers.

            User Answers: ${JSON.stringify(answers)}
            
            **Guidelines:**
            1. Analyze the user's answers to understand their specific profession, current situation, and pain points.
            2. Classify them into one of the following 6 "Business States" (conceptual frameworks):
            
            ${statesDefinitions}

            3. **CRITICAL:** Do NOT just copy the generic tasks from the state definitions above. Instead, generate 6 **UNIQUE and PERSONALIZED** steps (milestones) that are specifically tailored to *this specific user* and their profession.
               - For example, if they are a "Graphic Designer" in "State 1", don't just say "Find direction", say "Define your design niche and portfolio style".
               - The steps should take them from their *current situation* to the *State Goal*.
               - The steps must be actionable and concrete.

            4. **Output Requirements:**
               - STRICTLY in Hebrew (עברית).
               - Return exactly 6 steps in the 'tasks' array.
            
            Return a JSON object with this structure:
            {
                "state_id": "string (e.g., state_1, state_2)",
                "state_name": "string (The name of the state in Hebrew)",
                "state_description": "string (A short personalized summary of their current situation in Hebrew)",
                "state_goal": "string (The main goal we are aiming for in Hebrew)",
                "tasks": [
                    {
                        "title": "string (Specific, action-oriented task title in Hebrew)",
                        "description": "string (Brief explanation of why this step is important for THEM)",
                        "is_milestone": boolean (true for major steps)
                    }
                ]
            }
            `,
            response_json_schema: {
                type: "object",
                properties: {
                    state_id: { type: "string" },
                    state_name: { type: "string" },
                    state_description: { type: "string" },
                    state_goal: { type: "string" },
                    tasks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                is_milestone: { type: "boolean" }
                            },
                            required: ["title", "description", "is_milestone"]
                        }
                    }
                },
                required: ["state_id", "state_name", "tasks"]
            }
        });

        const analysis = llmResponse;

        // Update user entity
        const tasksWithIds = analysis.tasks.map((task, index) => ({
            id: crypto.randomUUID(),
            title: task.title,
            description: task.description || task.title,
            status: index === 0 ? "in_progress" : "pending",
            is_milestone: task.is_milestone || false
        }));

        await base44.auth.updateMe({
            business_journey_completed: true,
            business_journey_answers: answers,
            business_state: {
                id: analysis.state_id,
                name: analysis.state_name,
                description: analysis.state_description,
                goal: analysis.state_goal
            },
            client_tasks: tasksWithIds
        });

        return Response.json({ success: true, analysis: analysis });

    } catch (error) {
        console.error("Error analyzing business journey:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});