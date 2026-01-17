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
            Analyze the following user questionnaire answers and determine which of the 6 business states fits them best.
            
            User Answers: ${JSON.stringify(answers)}
            
            Business States Definitions:
            ${statesDefinitions}
            
            Return a JSON object with the following structure:
            {
                "state_id": "string (e.g., state_1, state_2)",
                "state_name": "string (The name of the state)",
                "state_description": "string (The description / subtext)",
                "state_goal": "string (Where we lead them)",
                "tasks": [
                    {
                        "title": "string (Task title)",
                        "description": "string (Short description based on the task name)",
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
            status: "pending",
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