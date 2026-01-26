import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { runAgent, logAgentEvent } from './agentWrapper.js';
import { sendWhatsAppMessage } from './whatsappWrapper.js';
import { invokeLLMWithRetry } from './llmWrapper.js';
import { syncLeadAndGoal, updateChatHistory, normalizePhoneNumber } from './stateSynchronizer.js';

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
            console.log('🔍 Event data:', {
                entity_id: event.entity_id,
                is_first_goal: data?.is_first_goal,
                status: data?.status,
                user_id: data?.user_id
            });

            // בדוק אם זו מטרה ראשונה
            if (!data?.is_first_goal) {
                console.log('⏭️ Not a first goal, skipping. is_first_goal:', data?.is_first_goal);
                return Response.json({ message: 'Not a first goal, skipping' });
            }

            console.log('✅ First goal detected, starting mentor flow');

            // טען את המטרה
            const goalId = event.entity_id;
            const goal = await base44.asServiceRole.entities.UserGoal.get(goalId);
            console.log('📌 Goal loaded:', {
                id: goal.id,
                title: goal.title,
                user_id: goal.user_id,
                status: goal.status,
                is_first_goal: goal.is_first_goal
            });
            
            // מציאת היוזר
            const allUsers = await base44.asServiceRole.entities.User.list();
            const goalUser = allUsers.find(u => u.id === goal.user_id);

            if (!goalUser) {
                console.error('❌ User not found for goal:', goal.user_id);
                return Response.json({ error: 'User not found' }, { status: 404 });
            }

            console.log('👤 User found:', goalUser.email, 'phone:', goalUser.phone);

            // וידא שקיים CRMLead - אם לא, צור אחד
            let existingLeads = await base44.asServiceRole.entities.CRMLead.filter({ 
                $or: [
                    { email: goalUser.email },
                    { user_id: goalUser.id }
                ]
            }, '-created_date', 1);

            let leadId = existingLeads?.[0]?.id;

            if (!leadId && goalUser.phone) {
                console.log('📝 CRMLead לא קיים, יוצר אחד חדש...');
                const phoneNorm = normalizePhoneNumber(goalUser.phone);
                const newLead = await base44.asServiceRole.entities.CRMLead.create({
                    user_id: goalUser.id,
                    email: goalUser.email,
                    full_name: goalUser.full_name || 'User',
                    phone: goalUser.phone,
                    phone_normalized: phoneNorm,
                    source: 'FirstGoalFlow',
                    journey_stage: 'lead_new',
                    active_handler: 'firstGoalMentorFlow',
                    current_goal_id: goalId,
                    chat_history: []
                });
                leadId = newLead.id;
                console.log('✅ CRMLead נוצר:', leadId);
            } else if (leadId) {
                console.log('✅ CRMLead קיים:', leadId);
            }
            
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
            
            // CRITICAL: וידוא שיש leadId לפני עדכון
            if (!leadId && goalUser.phone) {
                console.log('❌ No leadId despite having phone - force creating CRMLead');
                const phoneNorm = normalizePhoneNumber(goalUser.phone);
                const forcedLead = await base44.asServiceRole.entities.CRMLead.create({
                    user_id: goalUser.id,
                    email: goalUser.email,
                    full_name: goalUser.full_name || 'User',
                    phone: goalUser.phone,
                    phone_normalized: phoneNorm,
                    source: 'FirstGoalFlow',
                    journey_stage: 'lead_new',
                    active_handler: 'firstGoalMentorFlow',
                    current_goal_id: goalId,
                    chat_history: []
                });
                leadId = forcedLead.id;
                console.log('✅ Forced CRMLead created:', leadId);
            }

            // עדכון המטרה + קישור user_id + lead_id
            await base44.asServiceRole.entities.UserGoal.update(goalId, {
                user_id: goalUser.id,
                lead_id: leadId || null,
                status: 'active', // שדרוג ל-active
                flow_data: {
                    ...goal.flow_data,
                    mentor_stage: 'agreement',
                    mentor_started_at: new Date().toISOString()
                }
            });
            console.log('✅ Goal updated: user_id, lead_id=' + leadId + ', status=active, mentor_stage=agreement');
            
            // CRITICAL: עדכן גם את CRMLead עם current_goal_id
            if (leadId) {
                await base44.asServiceRole.entities.CRMLead.update(leadId, {
                    current_goal_id: goalId,
                    user_id: goalUser.id,
                    active_handler: 'firstGoalMentorFlow',
                    waiting_for_response: true
                });
                console.log('✅ CRMLead updated with current_goal_id:', goalId);
            }
            
            // שליחת ווטסאפ - קריטי!
            let phoneNumber = goalUser.phone;
            console.log('📱 Phone from User:', phoneNumber, 'leadId:', leadId);
            
            if (!phoneNumber && !leadId) {
                console.error('❌ No phone number and no CRMLead for user:', goalUser.email);
                return Response.json({ 
                    success: false, 
                    error: 'No phone number found',
                    user_email: goalUser.email 
                });
            }

            // אם אין טלפון ב-User אבל יש leadId, קח מה-CRMLead
            if (!phoneNumber && leadId) {
                const leadData = await base44.asServiceRole.entities.CRMLead.get(leadId);
                phoneNumber = leadData.phone || leadData.phone_normalized;
                console.log('📱 Took phone from CRMLead:', phoneNumber);
            }
            
            try {
                const whatsappMessage = `${introMessage}\n\n${agreementMessage}`;
                console.log('📤 Sending WhatsApp to:', phoneNumber, 'lead_id:', leadId);

                const phoneNorm = normalizePhoneNumber(phoneNumber);

                // CRITICAL: סנכרון מצב מלא לפני שליחה
                const { lead: syncedLead } = await syncLeadAndGoal({
                    base44,
                    leadId: leadId,
                    userId: goalUser.id,
                    phoneNormalized: phoneNorm,
                    goalId: goalId
                });

                const finalLeadId = syncedLead?.id || leadId;

                // עדכון chat_history + current_goal_id אטומית
                await updateChatHistory({
                    base44,
                    leadId: finalLeadId,
                    newMessages: [{
                        role: 'assistant',
                        content: whatsappMessage,
                        timestamp: new Date().toISOString(),
                        agent: 'firstGoalMentorFlow',
                        message_type: 'intro_agreement'
                    }]
                });

                await base44.asServiceRole.entities.CRMLead.update(finalLeadId, {
                    waiting_for_response: true,
                    last_outbound_at: new Date().toISOString(),
                    current_goal_id: goalId,
                    active_handler: 'firstGoalMentorFlow'
                });

                console.log('✅ Lead state synced before WhatsApp send');

                await sendWhatsAppMessage({
                    base44,
                    phoneNormalized: phoneNorm,
                    messageText: whatsappMessage,
                    leadId: finalLeadId,
                    userId: goalUser.id,
                    goalId: goalId,
                    agentRunId: null
                });

                console.log('✅ WhatsApp sent successfully for first goal:', goalId);

                return Response.json({ 
                    success: true, 
                    message: 'First goal mentor flow initiated and WhatsApp sent',
                    phone_used: phoneNumber,
                    lead_id: leadId 
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
                    
                    // מצא את ה-CRMLead
                    const leads = await base44.asServiceRole.entities.CRMLead.filter({ 
                        $or: [
                            { user_id: user.id },
                            { email: user.email }
                        ]
                    }, '-created_date', 1);
                    
                    const phoneNorm = normalizePhoneNumber(phoneNumber);
                    const currentLeadId = leads?.[0]?.id;
                    
                    await sendWhatsAppMessage({
                        base44,
                        phoneNormalized: phoneNorm,
                        messageText: whatsappMessage,
                        leadId: currentLeadId || 'unknown',
                        userId: user.id,
                        goalId: goal_id,
                        agentRunId: null
                    });
                    console.log('✅ WhatsApp message sent successfully');
                    
                    // עדכון chat_history של CRMLead - קריטי
                    if (currentLeadId) {
                        try {
                            const currentLead = await base44.asServiceRole.entities.CRMLead.get(currentLeadId);
                            const updatedHistory = [...(currentLead.chat_history || []), {
                                role: 'assistant',
                                content: whatsappMessage,
                                timestamp: new Date().toISOString(),
                                agent: 'firstGoalMentorFlow',
                                message_type: 'start_flow'
                            }].slice(-100);
                            
                            await base44.asServiceRole.entities.CRMLead.update(currentLeadId, {
                                chat_history: updatedHistory,
                                waiting_for_response: true,
                                last_outbound_at: new Date().toISOString(),
                                current_goal_id: goal_id
                            });
                            console.log('✅ Chat history updated with bot message, length:', updatedHistory.length);
                        } catch (histErr) {
                            console.error('❌ Failed to update chat history:', histErr.message);
                        }
                    }
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

            const { lead_id, user_id: passedUserId } = body;

            // טיפול ב-service role (מווטסאפ) או user scope (מהאפליקציה)
            const isServiceRole = !user;

            let currentGoal;
            if (isServiceRole) {
                currentGoal = await base44.asServiceRole.entities.UserGoal.get(goal_id);
            } else {
                currentGoal = goal;
            }
            
            const userId = passedUserId || (isServiceRole ? currentGoal.user_id : user.id);

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

                // שימוש ב-LLM wrapper
                const llmResult = await invokeLLMWithRetry({
                    base44: baseClient,
                    prompt: analysisPrompt,
                    responseJsonSchema: {
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
                    },
                    agentName: 'FirstGoalMentor',
                    goalId: goal_id,
                    fallbackResponse: {
                        sentiment: 'neutral',
                        is_agreement: true,
                        effectiveness_score: 3,
                        suggested_next_message: 'קיבלתי את תגובתך, תודה.',
                        improvements: [],
                        user_pattern: 'unknown'
                    },
                    maxRetries: 3,
                    timeoutMs: 15000
                });

                const analysis = llmResult.response;

            // תיעוד התגובה
            const logClient = isServiceRole ? base44.asServiceRole : base44;

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

                // שימוש ב-LLM wrapper
                const llmResult = await invokeLLMWithRetry({
                    base44: baseClient,
                    prompt: postDiagnosisPrompt,
                    responseJsonSchema: {
                        type: "object",
                        properties: {
                            reflection: { type: "string" },
                            reframe: { type: "string" },
                            focus: { type: "string" },
                            task: { type: "string" }
                        },
                        required: ["reflection", "task"]
                    },
                    agentName: 'FirstGoalMentor',
                    goalId: goal_id,
                    fallbackResponse: {
                        reflection: "אני שומע אותך.",
                        reframe: "זה לגמרי טבעי להרגיש ככה בשלב הזה.",
                        focus: "בוא נתחיל בצעד קטן אחד.",
                        task: "כתוב רשימה של 3 דברים קטנים שאתה יכול לעשות השבוע."
                    },
                    maxRetries: 3,
                    timeoutMs: 15000
                });

                const postDiagnosis = llmResult.response;

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
                    updateData.is_first_goal = false;
                    updateData.status = 'active';
                    console.log('🎉 First goal flow completed, upgrading goal to active');
                }

                await updateClient.entities.UserGoal.update(goal_id, updateData);
                
                // עדכון CRMLead chat_history עם ההודעות שנשלחו
                if (lead_id && nextMessages.length > 0) {
                    try {
                        const currentLead = await base44.asServiceRole.entities.CRMLead.get(lead_id);
                        const newMessages = nextMessages.map(msg => ({
                            role: 'assistant',
                            content: msg.content,
                            timestamp: new Date().toISOString(),
                            agent: 'firstGoalMentorFlow'
                        }));
                        
                        const updatedHistory = [...(currentLead.chat_history || []), ...newMessages].slice(-100);
                        
                        await base44.asServiceRole.entities.CRMLead.update(lead_id, {
                            chat_history: updatedHistory,
                            last_outbound_at: new Date().toISOString(),
                            waiting_for_response: nextStage !== 'completed',
                            current_goal_id: goal_id
                        });
                        console.log('✅ CRMLead chat_history updated with', newMessages.length, 'messages');
                    } catch (histErr) {
                        console.error('❌ Failed to update CRMLead chat_history:', histErr.message);
                    }
                }
                
                // עדכון UserMemory
                if (userId) {
                    try {
                        await base44.asServiceRole.functions.invoke('updateUserMemory', {
                            conversationLogId: null,
                            messages: [
                                { role: 'user', content: user_response, timestamp: new Date().toISOString() },
                                ...nextMessages
                            ],
                            context: { 
                                current_stage: stage,
                                next_stage: nextStage,
                                goal_id: goal_id,
                                goal_title: currentGoal.title
                            },
                            agentName: 'firstGoalMentorFlow',
                            user_id: userId
                        });
                        console.log('✅ Memory updated');
                    } catch (memErr) {
                        console.warn('⚠️ Could not update memory:', memErr.message);
                    }
                }

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

// normalizePhoneNumber moved to stateSynchronizer.js

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