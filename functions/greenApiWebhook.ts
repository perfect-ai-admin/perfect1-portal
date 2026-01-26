import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { runAgent, logAgentEvent, createDLQEvent } from './agentWrapper.js';
import { sendWhatsAppMessage } from './whatsappWrapper.js';

/**
 * Green-API Webhook Handler
 * מקבל הודעות WhatsApp ומנתב אותן למנטור או לסוכנים
 */

Deno.serve(async (req) => {
    let agentRunId = null;
    
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        console.log('Green-API webhook received:', JSON.stringify(body, null, 2));

        // Green-API שולח typeWebhook שונים - נטפל רק בהודעות נכנסות
        if (body.typeWebhook !== 'incomingMessageReceived') {
            return Response.json({ status: 'ignored' });
        }

        const messageData = body.messageData;
        const senderData = body.senderData;

        // שליפת פרטי ההודעה - תמיכה בפורמטים שונים
        let phoneNumber = '';
        let messageText = '';

        if (senderData?.sender) {
            phoneNumber = senderData.sender.replace('@c.us', '').replace('+', '');
        }

        if (messageData?.textMessageData?.textMessage) {
            messageText = messageData.textMessageData.textMessage;
        } else if (messageData?.extendedTextMessageData?.text) {
            messageText = messageData.extendedTextMessageData.text;
        } else if (messageData?.textMessage) {
            messageText = messageData.textMessage;
        }

        console.log('📱 Message from:', phoneNumber);
        console.log('📝 Message text:', messageText);

        if (!messageText || !phoneNumber) {
            console.warn('⚠️ Missing message text or phone number');
            return Response.json({ status: 'invalid_message' });
        }

        // חיפוש המשתמש לפי מספר טלפון - נרמול קודם
        let user = null;
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        console.log('🔍 Searching for user with phone:', phoneNumber, '-> normalized:', normalizedPhone);

        // חיפוש ב-CRMLead - קודם לפי phone_normalized, אחר כך fallback
        try {
            const leads = await base44.asServiceRole.entities.CRMLead.filter({ 
                phone_normalized: normalizedPhone
            });
            
            // אם לא נמצא, חפש גם לפי phone מקורי
            if (!leads || leads.length === 0) {
                const fallbackLeads = await base44.asServiceRole.entities.CRMLead.filter({ 
                    $or: [
                        { phone: phoneNumber },
                        { phone: normalizedPhone },
                        { phone: '0' + normalizedPhone.substring(3) }
                    ]
                });
                if (fallbackLeads && fallbackLeads.length > 0) {
                    user = fallbackLeads[0];
                    console.log('✅ Found user in CRMLead (fallback):', user.id);
                    // עדכן phone_normalized אם חסר
                    if (!user.phone_normalized) {
                        await base44.asServiceRole.entities.CRMLead.update(user.id, {
                            phone_normalized: normalizedPhone
                        });
                        user.phone_normalized = normalizedPhone;
                    }
                }
            } else {
                user = leads[0];
                console.log('✅ Found user in CRMLead:', user.id, user.email);
            }
        } catch (err) {
            console.warn('⚠️ Error searching CRMLead:', err.message);
        }

        // אם לא נמצא ב-CRMLead, חיפוש ב-Lead
        if (!user) {
            try {
                const basicLeads = await base44.asServiceRole.entities.Lead.filter({ 
                    $or: [
                        { phone: phoneNumber },
                        { phone: normalizedPhone },
                        { phone: '0' + normalizedPhone.substring(3) }
                    ]
                });
                if (basicLeads && basicLeads.length > 0) {
                    user = basicLeads[0];
                    console.log('✅ Found user in Lead:', user.id);
                }
            } catch (err) {
                console.warn('⚠️ Error searching Lead:', err.message);
            }
        }

        // אם לא נמצא משתמש - יצירת ליד חדש
        if (!user) {
            console.log('📝 Creating new CRMLead for:', phoneNumber);
            try {
                // חיפוש User קיים לפי טלפון
                let linkedUserId = null;
                try {
                    const allUsers = await base44.asServiceRole.entities.User.list();
                    const matchingUser = allUsers.find(u => 
                        u.phone && (normalizePhoneNumber(u.phone) === normalizedPhone)
                    );
                    if (matchingUser) {
                        linkedUserId = matchingUser.id;
                        console.log('✅ Found existing User to link:', matchingUser.email);
                    }
                } catch (err) {
                    console.warn('⚠️ Could not search for existing user:', err.message);
                }

                const newLead = await base44.asServiceRole.entities.CRMLead.create({
                    full_name: senderData?.senderName || 'WhatsApp User',
                    phone: phoneNumber, // שמור מקורי
                    phone_normalized: normalizedPhone, // שמור מנורמל
                    source: 'WhatsApp',
                    journey_stage: 'lead_new',
                    active_handler: 'mentor',
                    user_id: linkedUserId, // קישור ל-User אם קיים
                    chat_history: [{
                        role: 'user',
                        content: messageText,
                        timestamp: new Date().toISOString()
                    }],
                    waiting_for_response: true
                });

                user = newLead;
                console.log('✅ New lead created:', newLead.id, 'linked_user:', linkedUserId);

                // שליחת הודעת ברוכים הבאים ועדכון chat_history
                const welcomeMessage = 'היי! 👋\n\nאני המנטור העסקי החכם של Perfect One.\n\nאני כאן כדי לעזור לך להתקדם בעסק שלך.\n\nספר לי - מה הכי מעסיק אותך היום?';
                
                await sendWhatsAppMessage({
                    base44,
                    phoneNormalized: normalizedPhone,
                    messageText: welcomeMessage,
                    leadId: newLead.id,
                    userId: linkedUserId || 'new_user',
                    goalId: null,
                    agentRunId: null
                });
                
                // עדכן chat_history עם הודעת הברוכים הבאים
                const updatedHistory = [...(newLead.chat_history || []), {
                    role: 'assistant',
                    content: welcomeMessage,
                    timestamp: new Date().toISOString(),
                    agent: 'greenApiWebhook',
                    message_type: 'welcome'
                }];
                
                await base44.asServiceRole.entities.CRMLead.update(newLead.id, {
                    chat_history: updatedHistory,
                    last_outbound_at: new Date().toISOString()
                });

                return Response.json({ status: 'new_lead_created', lead_id: newLead.id });
            } catch (err) {
                console.error('❌ Error creating new lead:', err.message);
                throw err;
            }
        }

        // בדיקה אם המשתמש במצב 'נא לא ליצור קשר'
        if (user?.do_not_contact) {
            console.log(`⛔ User ${phoneNumber} has do_not_contact=true. Ignoring message.`);
            return Response.json({ status: 'do_not_contact_ignored' });
        }

        // עדכון היסטוריית השיחה עם נעילה אופטימיסטית (מונע race conditions)
        const MAX_RETRIES = 3;
        let chatHistory = [];
        let chatUpdateSuccess = false;
        
        for (let attempt = 0; attempt < MAX_RETRIES && !chatUpdateSuccess; attempt++) {
            try {
                // קרא מחדש מהדאטאבייס כדי לקבל את הגרסה העדכנית ביותר
                const freshUser = await base44.asServiceRole.entities.CRMLead.get(user.id);
                chatHistory = (freshUser?.chat_history || []);
                if (!Array.isArray(chatHistory)) {
                    chatHistory = [];
                }

                chatHistory.push({
                    role: 'user',
                    content: messageText,
                    timestamp: new Date().toISOString()
                });

                await base44.asServiceRole.entities.CRMLead.update(user.id, {
                    chat_history: chatHistory,
                    last_contact_at: new Date().toISOString(),
                    waiting_for_response: true // מצב המתנה
                });
                
                chatUpdateSuccess = true;
                console.log('✅ Chat history updated (attempt', attempt + 1, ')');
            } catch (err) {
                console.warn(`⚠️ Chat update attempt ${attempt + 1} failed:`, err.message);
                if (attempt === MAX_RETRIES - 1) {
                    console.error('❌ Failed to update chat history after', MAX_RETRIES, 'attempts');
                }
                await new Promise(r => setTimeout(r, 100 * (attempt + 1))); // backoff
            }
        }

        // קישור CRMLead ל-User - חובה לפני חיפוש מטרות
        let effectiveUserId = user.user_id;
        
        // אם אין user_id, חפש User לפי טלפון
        if (!effectiveUserId) {
            try {
                const phoneToSearch = user.phone_normalized || normalizedPhone;
                console.log('🔍 CRMLead ללא user_id, מחפש User לפי טלפון:', phoneToSearch);
                
                const allUsers = await base44.asServiceRole.entities.User.list();
                const matchingUser = allUsers.find(u => 
                    u.phone && (normalizePhoneNumber(u.phone) === phoneToSearch)
                );
                
                if (matchingUser) {
                    effectiveUserId = matchingUser.id;
                    console.log('🔗 נמצא User תואם:', matchingUser.email, '- מעדכן CRMLead');
                    
                    await base44.asServiceRole.entities.CRMLead.update(user.id, {
                        user_id: effectiveUserId,
                        email: matchingUser.email // סנכרון גם email
                    });
                    user.user_id = effectiveUserId;
                    user.email = matchingUser.email;
                    console.log('✅ CRMLead מקושר ל-User:', effectiveUserId);
                } else {
                    console.warn('⚠️ לא נמצא User עבור הטלפון:', phoneToSearch);
                }
            } catch (err) {
                console.error('❌ שגיאה בקישור CRMLead ל-User:', err.message);
            }
        }

        // חיפוש מטרות פעילות
        let activeGoal = null;
        try {
            let userGoals = [];

            if (effectiveUserId) {
                console.log('🔍 מחפש מטרות עבור user_id:', effectiveUserId);
                userGoals = await base44.asServiceRole.entities.UserGoal.filter({ 
                    user_id: effectiveUserId,
                    status: { $in: ['selected', 'active', 'in_progress'] }
                }, '-created_date', 10);
                console.log('📊 נמצאו', userGoals.length, 'מטרות');
            }

            // Fallback: אם לא נמצא, נסה לפי created_by
            if (userGoals.length === 0 && user.email) {
                console.log('🔍 חיפוש חלופי לפי created_by:', user.email);
                userGoals = await base44.asServiceRole.entities.UserGoal.filter({ 
                    created_by: user.email,
                    status: { $in: ['selected', 'active', 'in_progress'] }
                }, '-created_date', 10);
                console.log('📊 נמצאו', userGoals.length, 'מטרות (created_by)');
            }

            if (userGoals.length > 0) {
                console.log('📋 Goals found:', userGoals.map(g => ({
                    id: g.id,
                    title: g.title,
                    status: g.status,
                    is_first_goal: g.is_first_goal,
                    mentor_stage: g.flow_data?.mentor_stage
                })));
                
                // העדף מטרה ראשונה שעדיין בפלואו
                const firstGoalInProgress = userGoals.find(g => 
                    g.is_first_goal && 
                    g.flow_data?.mentor_stage && 
                    g.flow_data.mentor_stage !== 'completed'
                );
                
                // אם לא נמצאה מטרה ראשונה בפלואו, קח מטרה עם status='selected' או 'active'
                if (!firstGoalInProgress) {
                    const selectedGoal = userGoals.find(g => g.status === 'selected' || g.status === 'active');
                    activeGoal = selectedGoal || userGoals[0];
                } else {
                    activeGoal = firstGoalInProgress;
                }
                
                console.log('✅ Active goal selected:', activeGoal.id, 'title:', activeGoal.title, 'status:', activeGoal.status);
            } else {
                console.warn('⚠️ No goals found for effectiveUserId:', effectiveUserId);
            }
        } catch (err) {
            console.error('❌ Could not fetch active goal:', err.message);
        }

        if (!activeGoal) {
            console.error('❌ NO ACTIVE GOAL FOUND');
            console.error('Debug info:', {
                user_id: user.id,
                user_email: user.email,
                effectiveUserId: effectiveUserId,
                has_phone_normalized: !!user.phone_normalized,
                phone_normalized: user.phone_normalized
            });
            
            // חיפוש אגרסיבי - כל המטרות של היוזר
            try {
                const allUserGoals = await base44.asServiceRole.entities.UserGoal.filter({
                    user_id: effectiveUserId
                }, '-created_date', 20);
                
                console.log('🔍 ALL goals for user:', allUserGoals.map(g => ({
                    id: g.id,
                    title: g.title,
                    status: g.status,
                    is_first_goal: g.is_first_goal
                })));
                
                // אם יש מטרה כלשהי - השתמש בה
                if (allUserGoals.length > 0) {
                    activeGoal = allUserGoals[0];
                    console.log('✅ Using first available goal:', activeGoal.id);
                    
                    // אם הסטטוס selected, שדרג ל-active
                    if (activeGoal.status === 'selected') {
                        await base44.asServiceRole.entities.UserGoal.update(activeGoal.id, {
                            status: 'active'
                        });
                        console.log('🔄 Upgraded goal status to active');
                    }
                }
            } catch (err) {
                console.error('❌ Error in aggressive goal search:', err.message);
            }
            
            // אם עדיין אין מטרה
            if (!activeGoal) {
                console.log('⚠️ Absolutely no goals found, sending generic response');
                const noGoalMessage = 'שלום! 👋\n\nנראה שאתה עדיין לא בחרת מטרה. בואנו נגדיר ביחד את הצעד הראשון שלך.';
                
                await sendWhatsAppMessage({
                    base44,
                    phoneNormalized: normalizedPhone,
                    messageText: noGoalMessage,
                    leadId: user.id,
                    userId: effectiveUserId || user.id,
                    goalId: null,
                    agentRunId: null
                });
                
                // עדכן chat_history
                const freshLead = await base44.asServiceRole.entities.CRMLead.get(user.id);
                const updatedHistory = [...(freshLead.chat_history || []), {
                    role: 'assistant',
                    content: noGoalMessage,
                    timestamp: new Date().toISOString(),
                    agent: 'greenApiWebhook'
                }].slice(-100);
                
                await base44.asServiceRole.entities.CRMLead.update(user.id, {
                    chat_history: updatedHistory,
                    last_outbound_at: new Date().toISOString(),
                    waiting_for_response: false
                });
                
                return Response.json({ status: 'no_goal', message: 'User needs to select a goal first' });
            }
        }

        console.log('🎯 Active goal found:', activeGoal.id, 'title:', activeGoal.title, 'is_first_goal:', activeGoal.is_first_goal, 'status:', activeGoal.status);

        // סנכרון user_id ו-lead_id אם חסר
        const syncData = {};
        if (activeGoal.user_id !== effectiveUserId && effectiveUserId) {
            syncData.user_id = effectiveUserId;
        }
        if (!activeGoal.lead_id && user.id) {
            syncData.lead_id = user.id;
        }
        
        if (Object.keys(syncData).length > 0) {
            await base44.asServiceRole.entities.UserGoal.update(activeGoal.id, syncData);
            console.log('🔗 Synced goal:', Object.keys(syncData).join(', '));
        }
        
        // עדכן CRMLead עם current_goal_id
        await base44.asServiceRole.entities.CRMLead.update(user.id, {
            current_goal_id: activeGoal.id
        });
        console.log('✅ CRMLead.current_goal_id updated:', activeGoal.id);

        // בדיקה: האם זו מטרה ראשונה בתהליך FirstGoalFlow?
        const mentorStage = activeGoal.flow_data?.mentor_stage;
        const isInFirstGoalFlow = activeGoal.is_first_goal && 
                                   mentorStage && 
                                   mentorStage !== 'completed';
        
        console.log('🔍 Goal check - is_first_goal:', activeGoal.is_first_goal, 'mentor_stage:', mentorStage, 'isInFirstGoalFlow:', isInFirstGoalFlow);

        if (isInFirstGoalFlow) {
            console.log('🔄 User is in FirstGoalFlow, stage:', mentorStage);
            
            // עדכון active_handler
            await base44.asServiceRole.entities.CRMLead.update(user.id, {
                active_handler: 'firstGoalMentorFlow',
                last_contact_at: new Date().toISOString()
            });
            
            // שלח את התגובה ל-firstGoalMentorFlow
            const flowResponse = await base44.asServiceRole.functions.invoke('firstGoalMentorFlow', {
                action: 'handle_response',
                goal_id: activeGoal.id,
                user_response: messageText,
                stage: mentorStage,
                lead_id: user.id,
                user_id: effectiveUserId
            });

            console.log('✅ FirstGoalMentorFlow response:', JSON.stringify(flowResponse.data, null, 2));

            // שלח את ההודעות שחזרו מהפלואו ועדכן chat_history
            if (flowResponse.data?.messages && flowResponse.data.messages.length > 0) {
                for (const msg of flowResponse.data.messages) {
                    const maxDelay = Math.min(msg.delay_after || 0, 8000);
                    if (maxDelay > 0 && flowResponse.data.messages.indexOf(msg) < flowResponse.data.messages.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, maxDelay));
                    }
                    
                    // שליחה דרך wrapper
                    await sendWhatsAppMessage({
                        base44,
                        phoneNormalized: normalizedPhone,
                        messageText: msg.content,
                        leadId: user.id,
                        userId: effectiveUserId || user.id,
                        goalId: activeGoal.id,
                        agentRunId: null
                    });
                    
                    chatHistory.push({
                        role: 'assistant',
                        content: msg.content,
                        timestamp: new Date().toISOString(),
                        agent: 'firstGoalMentorFlow'
                    });
                }
            }

            // עדכון היסטוריה מוגבלת
            const limitedHistory = [...chatHistory].slice(-100);
            
            await base44.asServiceRole.entities.CRMLead.update(user.id, {
                chat_history: limitedHistory,
                last_contact_at: new Date().toISOString(),
                last_outbound_at: new Date().toISOString(),
                waiting_for_response: flowResponse.data?.next_stage !== 'completed'
            });

            return Response.json({ 
                status: 'success',
                flow: 'firstGoalMentorFlow',
                next_stage: flowResponse.data?.next_stage
            });
        }

        // עדכון active_handler
        await base44.asServiceRole.entities.CRMLead.update(user.id, {
            active_handler: 'smartMentorEngine',
            last_contact_at: new Date().toISOString()
        });

        console.log('Calling smartMentorEngine with:', {
            user_id: user.id,
            goal_id: activeGoal.id,
            message: messageText,
            chat_history_length: chatHistory.length
        });

        let mentorMessage = '';

        // שימוש ב-runAgent wrapper
        const agentResult = await runAgent({
            base44,
            agentName: 'SmartMentor',
            handlerName: 'smartMentorEngine',
            userId: user.user_id || user.id,
            leadId: user.id,
            goalId: activeGoal.id,
            channel: 'whatsapp',
            stage: 'executing',
            inputSummary: messageText.substring(0, 100),
            executeFunction: async (runId) => {
                agentRunId = runId;

                // לוג אירוע message_in
                await logAgentEvent({
                    base44,
                    agentRunId: runId,
                    eventType: 'message_in',
                    summary: 'Received WhatsApp message',
                    dataJson: { message: messageText.substring(0, 200) }
                });

                // קריאה ל-smartMentorEngine
                const mentorResponse = await base44.asServiceRole.functions.invoke('smartMentorEngine', {
                    action: 'analyze_response',
                    goal_id: activeGoal.id,
                    content: 'WhatsApp message',
                    client_response: messageText,
                    timeline_entry_id: null,
                    user_id: user.id
                });

                // לוג אירוע llm_call
                await logAgentEvent({
                    base44,
                    agentRunId: runId,
                    eventType: 'llm_call',
                    summary: 'SmartMentor analysis',
                    dataJson: { analysis: mentorResponse.data?.analysis }
                });

                const analysis = mentorResponse.data?.analysis;
                if (analysis) {
                    mentorMessage = `${analysis.deep_meaning}

        ${analysis.strategy_update_for_mentor ? '💡 ' + analysis.strategy_update_for_mentor : ''}
        ${analysis.recommended_adjustment ? '\n👉 ' + analysis.recommended_adjustment : ''}`.trim();
                } else {
                    mentorMessage = 'קיבלתי את הודעתך, אחזור אליך בהקדם.';
                }

                return {
                    outputSummary: mentorMessage.substring(0, 100),
                    waitingUser: false
                };
            }
        });

        // אם נכשל - mentorMessage יהיה ריק, נשתמש ב-fallback
        if (!mentorMessage) {
            mentorMessage = 'קיבלתי את הודעתך 👍 אחזור אליך בהקדם עם תשובה מפורטת.';
        }

        console.log('📤 Sending mentor message to:', phoneNumber);

        // שימוש ב-wrapper
        const sendResult = await sendWhatsAppMessage({
            base44,
            phoneNormalized: normalizePhoneNumber(phoneNumber),
            messageText: mentorMessage,
            leadId: user.id,
            userId: user.user_id || user.id,
            goalId: activeGoal.id,
            agentRunId
        });

        // לוג אירוע message_out
        if (agentRunId) {
            await logAgentEvent({
                base44,
                agentRunId,
                eventType: 'message_out',
                summary: 'Sent WhatsApp message',
                dataJson: { message: mentorMessage.substring(0, 200) }
            });
        }

        console.log('✅ WhatsApp send result:', sendResult);

        chatHistory.push({
            role: 'assistant',
            content: mentorMessage,
            timestamp: new Date().toISOString()
        });

        // עדכון סופי של היסטוריית השיחה - עם retry והגבלה
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const freshUser = await base44.asServiceRole.entities.CRMLead.get(user.id);
                let finalHistory = [...(freshUser.chat_history || []), {
                    role: 'assistant',
                    content: mentorMessage,
                    timestamp: new Date().toISOString(),
                    agent: isInFirstGoalFlow ? 'firstGoalMentorFlow' : 'smartMentorEngine'
                }];
                
                // הגבל ל-100 הודעות אחרונות
                if (finalHistory.length > 100) {
                    finalHistory = finalHistory.slice(-100);
                    console.log('📊 Chat history trimmed to last 100 messages');
                }
                
                await base44.asServiceRole.entities.CRMLead.update(user.id, {
                    chat_history: finalHistory,
                    last_contact_at: new Date().toISOString(),
                    waiting_for_response: false, // אין המתנה - שלחנו תגובה
                    active_handler: isInFirstGoalFlow ? 'firstGoalMentorFlow' : 'smartMentorEngine'
                });
                console.log('✅ Final chat history updated');
                break;
            } catch (err) {
                console.warn(`⚠️ Final update attempt ${attempt + 1} failed:`, err.message);
                if (attempt < MAX_RETRIES - 1) {
                    await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
                }
            }
        }

        // עדכון UserMemory
        if (effectiveUserId) {
            try {
                await base44.asServiceRole.functions.invoke('updateUserMemory', {
                    conversationLogId: null,
                    messages: chatHistory.slice(-2),
                    context: { 
                        current_stage: isInFirstGoalFlow ? mentorStage : 'ongoing',
                        goal_id: activeGoal.id,
                        goal_title: activeGoal.title
                    },
                    agentName: isInFirstGoalFlow ? 'firstGoalMentorFlow' : 'smartMentorEngine',
                    user_id: effectiveUserId
                });
                console.log('✅ Memory updated');
            } catch (memErr) {
                console.warn('⚠️ Could not update memory:', memErr.message);
            }
        }
        
        // תיעוד ביצועי הסוכן
        try {
            await base44.asServiceRole.functions.invoke('agentPerformanceTracker', {
                action: 'log_interaction',
                agent_name: isInFirstGoalFlow ? 'firstGoalMentorFlow' : 'smartMentorEngine',
                user_id: effectiveUserId || user.id,
                goal_id: activeGoal.id,
                outcome: 'message_sent',
                metadata: {
                    messages: chatHistory.slice(-2),
                    sentiment: { overall: 'neutral' }
                }
            });
        } catch (trackErr) {
            console.warn('⚠️ Could not track agent performance:', trackErr.message);
        }

        console.log('✅ Webhook completed successfully for user:', user.id);
        return Response.json({ 
            status: 'success',
            user_id: user.id,
            effective_user_id: effectiveUserId,
            message_processed: true,
            agent_used: isInFirstGoalFlow ? 'firstGoalMentorFlow' : 'smartMentorEngine',
            goal_found: activeGoal.id
        });

    } catch (error) {
        console.error('❌ Green-API webhook error:', error.message);
        console.error('Error stack:', error.stack);

        // יצירת DLQEvent
        try {
            await createDLQEvent({
                base44,
                eventType: 'inbound_whatsapp',
                source: 'greenApiWebhook',
                severity: 'high',
                phoneNormalized: body?.messageData?.phone || 'unknown',
                agentRunId,
                error,
                payloadJson: body,
                contextJson: { handler: 'greenApiWebhook' }
            });
        } catch (dlqErr) {
            console.error('❌ Could not create DLQ:', dlqErr.message);
        }

        // לא זורקים תשובת שגיאה - מחזירים 200 כדי שGreen-API יוותר בשקט
        return Response.json({ 
            status: 'error',
            error: error.message 
        }, { status: 200 });
    }
    });

/**
 * נרמול מספר טלפון לפורמט בינלאומי
 */
function normalizePhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('972')) {
        cleaned = '972' + cleaned;
    }
    return cleaned;
}

/**
 * שליחת הודעה דרך Green-API
 */
async function sendWhatsAppMessage(phoneNumber, message) {
    const instanceId = Deno.env.get('GREENAPI_INSTANCE_ID');
    const apiToken = Deno.env.get('GREENAPI_API_TOKEN');

    console.log('📤 Sending WhatsApp message - instanceId:', instanceId);
    console.log('📤 API Token available:', apiToken ? 'YES' : 'NO');

    if (!instanceId || !apiToken) {
        throw new Error('Green-API credentials not configured');
    }

    // נרמול הטלפון לפני שליחה
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    const url = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;

    const payload = {
        chatId: `${normalizedPhone}@c.us`,
        message: message
    };

    console.log('📤 URL:', url.replace(apiToken, '***'));
    console.log('📤 ChatID:', `${normalizedPhone}@c.us`);
    console.log('📤 Message preview:', message.substring(0, 100) + '...');

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
        console.log('📤 Green-API HTTP Status:', response.status);
        console.log('📤 Green-API Response:', responseText);

        if (!response.ok) {
            throw new Error(`Green-API HTTP ${response.status}: ${responseText}`);
        }

        const result = JSON.parse(responseText);
        
        // בדיקת הצלחה
        if (result.idMessage) {
            console.log('✅ Message sent successfully, idMessage:', result.idMessage);
        } else {
            console.warn('⚠️ Message sent but no idMessage returned:', result);
        }
        
        return result;
    } catch (err) {
        console.error('❌ sendWhatsAppMessage error:', err.message);
        throw err;
    }
}