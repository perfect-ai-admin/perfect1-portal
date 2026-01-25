import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * פלואו מנטור ראשון × מטרה ראשונה
 * מנהל את כל האינטראקציה הראשונית עם המשתמש
 * כולל מנגנון למידה ושיפור עצמי
 */

const MESSAGE_TEMPLATES = {
    intro: {
        default: `היי, אני המנטור שמלווה אותך במטרה הזו.

חשוב לי שתדע משהו אחד לפני שמתחילים:
אני לא כאן כדי לתת רעיונות,
אני כאן כדי להחזיק איתך תהליך – עד שיש התקדמות אמיתית, בקצב שמתאים לך.`
    },
    
    agreement: {
        default: `המערכת שלנו בנויה סביב תהליך, לא סביב עצות.
אנחנו מתחילים בהבנה, מתקדמים שלב־שלב,
ועוצרים רק כשמשהו באמת משתנה.

בחרת לעבוד על: {goal_title}
זו מטרה שאנשים נוטים להיתקע בה,
כי קשה לדעת מה הצעד הבא.

שנתחיל?`
    },
    
    boundaries: {
        default: `מעולה.

ככה זה הולך לעבוד:
• מתקדמים שלב־שלב
• בלי הצפה
• ואם משהו לא זז – עוצרים ומבינים למה

המטרה היא לא לסמן וי,
אלא להזיז אותך קדימה.`
    },
    
    diagnosis: {
        default: `לפני שאנחנו עושים משהו –
מה הכי מתסכל אותך היום סביב המטרה הזו?`
    }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action, goal_id, user_response, stage } = body;

        if (!goal_id) {
            return Response.json({ error: 'goal_id is required' }, { status: 400 });
        }

        const goal = await base44.entities.UserGoal.get(goal_id);
        if (!goal) {
            return Response.json({ error: 'Goal not found' }, { status: 404 });
        }

        // ==========================================
        // ACTION: START_FLOW - תחילת הפלואו
        // ==========================================
        if (action === 'start_flow') {
            const messages = [];
            const logEntries = [];

            // הודעה 1: פתיחה + החזקה
            const introMessage = MESSAGE_TEMPLATES.intro.default;
            messages.push({
                role: 'assistant',
                content: introMessage,
                delay_after: 25000, // 20-30 שניות
                timestamp: new Date().toISOString()
            });

            logEntries.push({
                user_id: user.id,
                goal_id: goal_id,
                flow_stage: 'intro',
                message_sent: introMessage,
                template_used: 'intro.default'
            });

            // הודעה 2: מי אנחנו + חיבור למטרה + הסכמה
            const agreementMessage = MESSAGE_TEMPLATES.agreement.default
                .replace('{goal_title}', goal.title || 'המטרה שבחרת');
            
            messages.push({
                role: 'assistant',
                content: agreementMessage,
                requires_response: true,
                expected_response_type: 'yes_no',
                timestamp: new Date().toISOString()
            });

            logEntries.push({
                user_id: user.id,
                goal_id: goal_id,
                flow_stage: 'agreement',
                message_sent: agreementMessage,
                template_used: 'agreement.default'
            });

            // שמירת הלוג
            for (const log of logEntries) {
                await base44.entities.MentorFlowLog.create(log);
            }

            // עדכון המטרה
            await base44.entities.UserGoal.update(goal_id, {
                flow_data: {
                    ...goal.flow_data,
                    mentor_stage: 'agreement',
                    mentor_started_at: new Date().toISOString()
                }
            });

            return Response.json({
                success: true,
                messages,
                next_stage: 'agreement'
            });
        }

        // ==========================================
        // ACTION: HANDLE_RESPONSE - טיפול בתגובת משתמש
        // ==========================================
        if (action === 'handle_response') {
            if (!user_response || !stage) {
                return Response.json({ error: 'user_response and stage required' }, { status: 400 });
            }

            const startTime = goal.flow_data?.last_message_time 
                ? new Date(goal.flow_data.last_message_time) 
                : new Date();
            const responseTime = (new Date() - startTime) / 1000;

            // ניתוח התגובה באמצעות AI
            const analysisPrompt = `
נתח את התגובה הבאה של משתמש לפלואו המנטור הראשון:

שלב נוכחי: ${stage}
תגובת משתמש: "${user_response}"

החזר JSON עם:
{
    "sentiment": "positive/neutral/negative/confused/engaged",
    "is_agreement": boolean (רלוונטי רק לשלב agreement),
    "effectiveness_score": number 1-5,
    "suggested_next_message": "ההודעה הבאה המותאמת",
    "improvements": ["הצעות שיפור לתבנית"],
    "user_pattern": "זיהוי דפוס התנהגות"
}
`;

            const analysis = await base44.integrations.Core.InvokeLLM({
                prompt: analysisPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        sentiment: { type: "string" },
                        is_agreement: { type: "boolean" },
                        effectiveness_score: { type: "number" },
                        suggested_next_message: { type: "string" },
                        improvements: { type: "array", items: { type: "string" } },
                        user_pattern: { type: "string" }
                    },
                    required: ["sentiment", "effectiveness_score"]
                }
            });

            // תיעוד התגובה
            await base44.entities.MentorFlowLog.create({
                user_id: user.id,
                goal_id: goal_id,
                flow_stage: stage,
                user_response: user_response,
                response_time_seconds: responseTime,
                user_sentiment: analysis.sentiment,
                effectiveness_score: analysis.effectiveness_score,
                improvements_suggested: analysis.improvements || []
            });

            // החלטה על השלב הבא
            let nextMessages = [];
            let nextStage = stage;

            if (stage === 'agreement') {
                if (!analysis.is_agreement) {
                    // לא הסכים - הודעת הבהרה
                    nextMessages.push({
                        role: 'assistant',
                        content: 'אין בעיה בכלל. אני כאן כשתהיה מוכן/ה. פשוט תגיד לי מתי בא לך להתחיל.',
                        requires_response: false
                    });
                } else {
                    // הסכים - ממשיכים לגבולות
                    await new Promise(resolve => setTimeout(resolve, 7500)); // 5-10 שניות
                    
                    nextMessages.push({
                        role: 'assistant',
                        content: MESSAGE_TEMPLATES.boundaries.default,
                        delay_after: 12500, // 10-15 שניות
                        timestamp: new Date().toISOString()
                    });

                    nextMessages.push({
                        role: 'assistant',
                        content: MESSAGE_TEMPLATES.diagnosis.default,
                        requires_response: true,
                        expected_response_type: 'open',
                        timestamp: new Date().toISOString()
                    });

                    nextStage = 'diagnosis';

                    // תיעוד שליחת ההודעות
                    await base44.entities.MentorFlowLog.create({
                        user_id: user.id,
                        goal_id: goal_id,
                        flow_stage: 'boundaries',
                        message_sent: MESSAGE_TEMPLATES.boundaries.default,
                        template_used: 'boundaries.default'
                    });

                    await base44.entities.MentorFlowLog.create({
                        user_id: user.id,
                        goal_id: goal_id,
                        flow_stage: 'diagnosis',
                        message_sent: MESSAGE_TEMPLATES.diagnosis.default,
                        template_used: 'diagnosis.default'
                    });
                }
            } else if (stage === 'diagnosis') {
                // שלב פוסט-אבחון: שיקוף + מיקוד + משימה
                const postDiagnosisPrompt = `
אתה מנטור עסקי. המשתמש ענה על שאלת האבחון:
"${user_response}"

המטרה שלו: ${goal.title}

צור תגובה בפורמט הבא:
1. שיקוף קצר (1-2 משפטים) - מה הוא אמר, איזו תחושה עולה
2. מסגור מחדש (משפט אחד) - להוריד אשמה ולהחזיר שליטה
3. בחירת כיוון (משפט אחד) - מה עובדים עליו עכשיו
4. משימה ראשונה קטנה - פעולה של 3-5 דקות, חד משמעית

החזר JSON:
{
    "reflection": "שיקוף",
    "reframe": "מסגור מחדש",
    "focus": "הכיוון שנבחר",
    "task": "המשימה הקטנה"
}
`;

                const postDiagnosis = await base44.integrations.Core.InvokeLLM({
                    prompt: postDiagnosisPrompt,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            reflection: { type: "string" },
                            reframe: { type: "string" },
                            focus: { type: "string" },
                            task: { type: "string" }
                        },
                        required: ["reflection", "task"]
                    }
                });

                const fullResponse = `${postDiagnosis.reflection}

${postDiagnosis.reframe || ''}

${postDiagnosis.focus || ''}

בוא נתחיל ממשהו קטן.
כשנוח לך, תענה לי על זה:
${postDiagnosis.task}`;

                nextMessages.push({
                    role: 'assistant',
                    content: fullResponse,
                    requires_response: true,
                    expected_response_type: 'task',
                    timestamp: new Date().toISOString()
                });

                nextStage = 'post_diagnosis';

                await base44.entities.MentorFlowLog.create({
                    user_id: user.id,
                    goal_id: goal_id,
                    flow_stage: 'post_diagnosis',
                    message_sent: fullResponse,
                    personalization_applied: postDiagnosis
                });
            }

            // עדכון המטרה
            await base44.entities.UserGoal.update(goal_id, {
                flow_data: {
                    ...goal.flow_data,
                    mentor_stage: nextStage,
                    last_message_time: new Date().toISOString(),
                    user_pattern: analysis.user_pattern
                }
            });

            return Response.json({
                success: true,
                messages: nextMessages,
                next_stage: nextStage,
                analysis: analysis
            });
        }

        // ==========================================
        // ACTION: ANALYZE_EFFECTIVENESS - ניתוח אפקטיביות
        // ==========================================
        if (action === 'analyze_effectiveness') {
            // שליפת כל הלוגים של המטרה
            const logs = await base44.entities.MentorFlowLog.filter({ goal_id }, '-created_date', 100);

            if (logs.length === 0) {
                return Response.json({ message: 'No data yet' });
            }

            // ניתוח סטטיסטי
            const stats = {
                total_interactions: logs.length,
                avg_response_time: logs
                    .filter(l => l.response_time_seconds)
                    .reduce((sum, l) => sum + l.response_time_seconds, 0) / logs.length || 0,
                sentiment_distribution: {},
                avg_effectiveness: logs
                    .filter(l => l.effectiveness_score)
                    .reduce((sum, l) => sum + l.effectiveness_score, 0) / logs.length || 0,
                drop_rate_by_stage: {}
            };

            logs.forEach(log => {
                if (log.user_sentiment) {
                    stats.sentiment_distribution[log.user_sentiment] = 
                        (stats.sentiment_distribution[log.user_sentiment] || 0) + 1;
                }
                if (log.dropped_at_stage) {
                    stats.drop_rate_by_stage[log.flow_stage] = 
                        (stats.drop_rate_by_stage[log.flow_stage] || 0) + 1;
                }
            });

            // AI מנתח ומציע שיפורים
            const improvementPrompt = `
נתח את הנתונים הבאים מפלואו המנטור הראשון:

סטטיסטיקות:
${JSON.stringify(stats, null, 2)}

דוגמאות תגובות:
${logs.slice(0, 10).map(l => `שלב: ${l.flow_stage}, תגובה: ${l.user_response}, סנטימנט: ${l.user_sentiment}`).join('\n')}

זהה דפוסים והמלץ על שיפורים ספציפיים לתבניות ההודעות.

החזר JSON:
{
    "patterns_identified": ["דפוס 1", "דפוס 2"],
    "template_improvements": {
        "intro": "הצעה לשיפור התבנית",
        "agreement": "הצעה לשיפור",
        "diagnosis": "הצעה לשיפור"
    },
    "timing_adjustments": {
        "delay_intro_to_agreement": "המלצה לזמן השהיה",
        "delay_boundaries_to_diagnosis": "המלצה"
    },
    "overall_recommendation": "המלצה כללית"
}
`;

            const improvements = await base44.integrations.Core.InvokeLLM({
                prompt: improvementPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        patterns_identified: { type: "array", items: { type: "string" } },
                        template_improvements: { type: "object" },
                        timing_adjustments: { type: "object" },
                        overall_recommendation: { type: "string" }
                    }
                }
            });

            return Response.json({
                success: true,
                stats,
                improvements,
                suggestion: 'עדכן את MESSAGE_TEMPLATES בקוד לפי ההמלצות'
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});