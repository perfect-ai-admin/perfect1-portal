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
        
        const body = await req.json();
        const { action, goal_id, user_response, stage, event, data } = body;
        
        // אם זו קריאה מ-automation (entity create)
        if (event?.type === 'create' && event?.entity_name === 'UserGoal') {
            console.log('🔔 Entity automation triggered for UserGoal create');
            
            // בדוק אם זו מטרה ראשונה - גם לפי flag וגם לפי בדיקה אמיתית ב-DB
            const goalId = event.entity_id;
            const goal = await base44.asServiceRole.entities.UserGoal.get(goalId);
            
            if (!data?.is_first_goal && !goal?.is_first_goal) {
                // Double check: count user's goals in DB
                const userId = goal?.user_id || data?.user_id;
                if (userId) {
                    const userGoals = await base44.asServiceRole.entities.UserGoal.filter({ user_id: userId });
                    if (userGoals.length > 1) {
                        console.log('⏭️ Not a first goal (user has', userGoals.length, 'goals). Skipping.');
                        return Response.json({ message: 'Not a first goal, skipping' });
                    }
                    console.log('✅ First goal detected via DB check (only 1 goal for user)');
                } else {
                    console.log('⏭️ No user_id found, skipping');
                    return Response.json({ message: 'No user_id, skipping' });
                }
            } else {
                console.log('✅ First goal detected via is_first_goal flag');
            }
            
            // עכשיו שלח ווטסאפ למשתמש
            const goalId = event.entity_id;
            const goal = await base44.asServiceRole.entities.UserGoal.get(goalId);
            console.log('📌 Goal loaded:', goal.title, 'user_id:', goal.user_id);
            
            // מציאת היוזר
            const allUsers = await base44.asServiceRole.entities.User.list();
            const goalUser = allUsers.find(u => u.id === goal.user_id);
            
            if (!goalUser) {
                console.error('❌ User not found for goal:', goal.user_id);
                return Response.json({ error: 'User not found' }, { status: 404 });
            }
            
            console.log('👤 User found:', goalUser.email, 'phone:', goalUser.phone);
            
            // שליחת הודעות הפתיחה
            const introMessage = MESSAGE_TEMPLATES.intro.default;
            const agreementMessage = MESSAGE_TEMPLATES.agreement.default
                .replace('{goal_title}', goal.title || 'המטרה שבחרת');
            
            // תיעוד
            await base44.asServiceRole.entities.MentorFlowLog.create({
                user_id: goalUser.id,
                goal_id: goalId,
                flow_stage: 'intro',
                message_sent: introMessage,
                template_used: 'intro.default'
            });
            
            await base44.asServiceRole.entities.MentorFlowLog.create({
                user_id: goalUser.id,
                goal_id: goalId,
                flow_stage: 'agreement',
                message_sent: agreementMessage,
                template_used: 'agreement.default'
            });
            
            // עדכון המטרה + קישור user_id
            await base44.asServiceRole.entities.UserGoal.update(goalId, {
                user_id: goalUser.id, // ודא שיש קישור
                flow_data: {
                    ...goal.flow_data,
                    mentor_stage: 'agreement',
                    mentor_started_at: new Date().toISOString()
                }
            });
            
            // שליחת ווטסאפ - קריטי!
            let phoneNumber = goalUser.phone;
            console.log('📱 Checking phone - User.phone:', phoneNumber);
            
            if (!phoneNumber) {
                console.log('🔍 Phone not in User, searching CRMLead...');
                const leads = await base44.asServiceRole.entities.CRMLead.filter({ 
                    $or: [
                        { email: goalUser.email },
                        { user_id: goalUser.id }
                    ]
                }, '-created_date', 1);
                
                if (leads && leads.length > 0 && leads[0].phone) {
                    phoneNumber = leads[0].phone;
                    console.log('📱 Found phone in CRMLead:', phoneNumber);
                    
                    // סנכרון - עדכן את ה-Lead עם user_id
                    if (!leads[0].user_id) {
                        await base44.asServiceRole.entities.CRMLead.update(leads[0].id, {
                            user_id: goalUser.id
                        });
                        console.log('🔗 Synced CRMLead user_id');
                    }
                }
            }
            
            if (!phoneNumber) {
                console.error('❌ No phone number found for user:', goalUser.email);
                return Response.json({ 
                    success: false, 
                    error: 'No phone number found',
                    user_email: goalUser.email 
                });
            }
            
            try {
                const whatsappMessage = `${introMessage}\n\n${agreementMessage}`;
                console.log('📤 Sending WhatsApp to:', phoneNumber);
                await sendWhatsAppMessage(phoneNumber, whatsappMessage);
                console.log('✅ WhatsApp sent successfully for first goal:', goalId);
                
                return Response.json({ 
                    success: true, 
                    message: 'First goal mentor flow initiated and WhatsApp sent',
                    phone_used: phoneNumber 
                });
            } catch (err) {
                console.error('❌ WhatsApp send failed:', err.message);
                return Response.json({ 
                    success: false, 
                    error: 'WhatsApp send failed: ' + err.message,
                    phone_number: phoneNumber 
                });
            }
        }
        
        // קריאה ידנית רגילה
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

            // שליחת הודעה בווטסאפ
            console.log('🚀 Attempting to send WhatsApp message for goal:', goal_id);
            try {
                // חיפוש מספר הטלפון של המשתמש
                let phoneNumber = null;
                
                // נסה למצוא ב-User
                if (user.phone) {
                    phoneNumber = user.phone;
                    console.log('📱 Found phone in User entity:', phoneNumber);
                }
                
                // אם לא נמצא, חפש ב-CRMLead
                if (!phoneNumber) {
                    const leads = await base44.asServiceRole.entities.CRMLead.filter({ 
                        $or: [
                            { user_id: user.id },
                            { email: user.email }
                        ]
                    }, '-created_date', 1);
                    
                    if (leads && leads.length > 0 && leads[0].phone) {
                        phoneNumber = leads[0].phone;
                        console.log('📱 Found phone in CRMLead:', phoneNumber);
                    }
                }

                if (phoneNumber) {
                    const whatsappMessage = `${introMessage}\n\n${agreementMessage}`;
                    await sendWhatsAppMessage(phoneNumber, whatsappMessage);
                    console.log('✅ WhatsApp message sent successfully');
                } else {
                    console.warn('⚠️ No phone number found for user:', user.id);
                }
            } catch (err) {
                console.error('❌ Failed to send WhatsApp message:', err.message);
                // לא זורקים שגיאה - ממשיכים גם אם הווטסאפ נכשל
            }

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

            // טיפול ב-service role (מווטסאפ) או user scope (מהאפליקציה)
            const isServiceRole = !user;

            let currentGoal;
            if (isServiceRole) {
                currentGoal = await base44.asServiceRole.entities.UserGoal.get(goal_id);
            } else {
                currentGoal = goal;
            }

            const startTime = currentGoal.flow_data?.last_message_time 
                ? new Date(currentGoal.flow_data.last_message_time) 
                : new Date();
            const responseTime = (new Date() - startTime) / 1000;

            // ניתוח התגובה באמצעות AI
            const analysisPrompt = `
            נתח את התגובה הבאה של משתמש לפלואו המנטור הראשון:

            שלב נוכחי: ${stage}
            תגובת משתמש: "${user_response}"
            מטרה: "${currentGoal.title}"

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

                const baseClient = isServiceRole ? base44.asServiceRole : base44;
                const analysis = await baseClient.integrations.Core.InvokeLLM({
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
            const logClient = isServiceRole ? base44.asServiceRole : base44;
            const userId = isServiceRole ? (currentGoal.user_id || 'unknown') : user.id;

            await logClient.entities.MentorFlowLog.create({
                user_id: userId,
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
                    nextMessages.push({
                        role: 'assistant',
                        content: MESSAGE_TEMPLATES.boundaries.default,
                        delay_after: 3000,
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
                    await logClient.entities.MentorFlowLog.create({
                        user_id: userId,
                        goal_id: goal_id,
                        flow_stage: 'boundaries',
                        message_sent: MESSAGE_TEMPLATES.boundaries.default,
                        template_used: 'boundaries.default'
                    });

                    await logClient.entities.MentorFlowLog.create({
                        user_id: userId,
                        goal_id: goal_id,
                        flow_stage: 'diagnosis',
                        message_sent: MESSAGE_TEMPLATES.diagnosis.default,
                        template_used: 'diagnosis.default'
                    });
                }
            } else if (stage === 'diagnosis') {
                // שמירת תשובת האבחון בflow_data
                const updatedFlowData = {
                    ...currentGoal.flow_data,
                    diagnosis_answer: user_response,
                    diagnosis_timestamp: new Date().toISOString()
                };
                
                // שלב פוסט-אבחון: שיקוף + מיקוד + משימה
                const postDiagnosisPrompt = `
            אתה מנטור עסקי. המשתמש ענה על שאלת האבחון:
            "${user_response}"

            המטרה שלו: ${currentGoal.title}

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

                let postDiagnosis;
                try {
                    postDiagnosis = await baseClient.integrations.Core.InvokeLLM({
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
                } catch (llmErr) {
                    console.error('❌ LLM failed for post-diagnosis, using fallback');
                    postDiagnosis = {
                        reflection: "אני שומע אותך.",
                        reframe: "זה לגמרי טבעי להרגיש ככה בשלב הזה.",
                        focus: "בוא נתחיל בצעד קטן אחד.",
                        task: "כתוב רשימה של 3 דברים קטנים שאתה יכול לעשות השבוע."
                    };
                }

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

                // שמירת התגובה בflow_data
                updatedFlowData.post_diagnosis_response = postDiagnosis;
                updatedFlowData.post_diagnosis_sent_at = new Date().toISOString();

                await logClient.entities.MentorFlowLog.create({
                    user_id: userId,
                    goal_id: goal_id,
                    flow_stage: 'post_diagnosis',
                    message_sent: fullResponse,
                    user_response: user_response,
                    personalization_applied: postDiagnosis
                });

                // עדכן flow_data זמנית
                currentGoal.flow_data = updatedFlowData;
                
            } else if (stage === 'post_diagnosis') {
                // המשתמש הגיב למשימה - סיום הפלואו
                await logClient.entities.MentorFlowLog.create({
                    user_id: userId,
                    goal_id: goal_id,
                    flow_stage: 'completion',
                    user_response: user_response,
                    message_sent: 'Flow completed'
                });
                
                nextMessages.push({
                    role: 'assistant',
                    content: 'מעולה! ככה מתחילים. עכשיו המנטור ימשיך ללוות אותך בצעדים קטנים ומדויקים. 🚀',
                    requires_response: false
                });
                
                nextStage = 'completed';
                }

                // עדכון המטרה
                const updateClient = isServiceRole ? base44.asServiceRole : base44;
                const updateData = {
                    flow_data: {
                        ...currentGoal.flow_data,
                        mentor_stage: nextStage,
                        last_message_time: new Date().toISOString(),
                        user_pattern: analysis.user_pattern
                    }
                };

                // אם סיימנו את הפלואו, עדכן גם את הסטטוס
                if (nextStage === 'completed') {
                    updateData.is_first_goal = false; // משדרג - לא עוד מטרה ראשונה
                    updateData.status = 'active'; // מעביר למצב פעיל
                    console.log('🎉 First goal flow completed, upgrading goal to active');
                    
                    // עדכון UserMemory אחרי סיום FirstGoalFlow
                    try {
                        await base44.asServiceRole.functions.invoke('updateUserMemory', {
                            conversationLogId: null,
                            messages: [
                                { role: 'user', content: user_response, timestamp: new Date().toISOString() },
                                { role: 'assistant', content: 'First goal flow completed', timestamp: new Date().toISOString() }
                            ],
                            context: { 
                                current_stage: 'first_goal_completed',
                                goal_id: goal_id,
                                goal_title: currentGoal.title
                            },
                            agentName: 'firstGoalMentorFlow',
                            user_id: userId
                        });
                        console.log('✅ Memory updated after first goal completion');
                    } catch (memErr) {
                        console.warn('⚠️ Could not update memory:', memErr.message);
                    }
                }

                await updateClient.entities.UserGoal.update(goal_id, updateData);

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

/**
 * נרמול מספר טלפון לפורמט בינלאומי (ישראלי)
 * מקבל: 0502277087, 972502277087, 502277087, +972502277087
 * מחזיר: 972502277087
 */
function normalizePhoneNumber(phone) {
    if (!phone) return null;
    
    // הסר רווחים, מקפים, סוגריים, ופלוס
    let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
    
    // אם מתחיל ב-0, החלף ב-972
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
    }
    
    // אם לא מתחיל ב-972, הוסף
    if (!cleaned.startsWith('972')) {
        cleaned = '972' + cleaned;
    }
    
    console.log(`📱 Phone normalized: ${phone} -> ${cleaned}`);
    return cleaned;
}

/**
 * שליחת הודעה דרך Green-API
 */
async function sendWhatsAppMessage(phoneNumber, message) {
    const instanceId = Deno.env.get('GREENAPI_INSTANCE_ID');
    const apiToken = Deno.env.get('GREENAPI_API_TOKEN');

    console.log('📤 Sending WhatsApp - instanceId:', instanceId);
    console.log('📤 Original phone:', phoneNumber);

    if (!instanceId || !apiToken) {
        throw new Error('Green-API credentials not configured');
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    if (!normalizedPhone) {
        throw new Error('Invalid phone number');
    }
    
    console.log('📤 Normalized phone:', normalizedPhone);

    const url = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;

    const payload = {
        chatId: `${normalizedPhone}@c.us`,
        message: message
    };

    console.log('📤 Payload:', JSON.stringify(payload));

    try {
        const response = await Promise.race([
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('WhatsApp send timeout')), 15000)
            )
        ]);

        const responseText = await response.text();
        console.log('📤 Green-API Response:', responseText);

        if (!response.ok) {
            throw new Error(`Green-API HTTP ${response.status}: ${responseText}`);
        }

        const result = JSON.parse(responseText);
        
        if (result.idMessage) {
            console.log('✅ Message delivered, idMessage:', result.idMessage);
        }
        
        return result;
    } catch (err) {
        console.error('❌ WhatsApp send failed:', err.message);
        throw err;
    }
}