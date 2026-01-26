import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { runAgent, logAgentEvent, createDLQEvent } from './agentWrapper.js';
import { sendWhatsAppMessage } from './whatsappWrapper.js';
import { syncLeadAndGoal, updateChatHistory, normalizePhoneNumber } from './stateSynchronizer.js';

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

        console.log('🔄 Starting State Sync...');

        // שימוש ב-State Synchronizer
        const { lead: syncedLead, user: syncedUser, activeGoal, syncedData } = await syncLeadAndGoal({
            base44,
            leadId: user.id,
            userId: user.user_id,
            phoneNormalized: normalizedPhone,
            goalId: null
        });

        if (!syncedLead) {
            console.error('❌ State sync failed - no lead');
            return Response.json({ status: 'error', error: 'Lead not found' }, { status: 200 });
        }

        const effectiveUserId = syncedData.effectiveUserId;

        console.log('✅ State synced:', syncedData);

        // עדכון chat_history עם הודעת המשתמש
        const chatHistory = await updateChatHistory({
            base44,
            leadId: syncedLead.id,
            newMessages: [{
                role: 'user',
                content: messageText,
                timestamp: new Date().toISOString(),
                message_id: messageData?.idMessage || null
            }]
        });

        // עדכן waiting_for_response=false
        await base44.asServiceRole.entities.CRMLead.update(syncedLead.id, {
            last_inbound_at: new Date().toISOString(),
            waiting_for_response: false
        });

        user = syncedLead;

        // בדיקה: האם זו מטרה ראשונה בתהליך FirstGoalFlow?
        const isInFirstGoalFlow = syncedData.isFirstGoal;
        const mentorStage = syncedData.mentorStage;

        console.log('🔍 Goal routing - isFirstGoal:', isInFirstGoalFlow, 'stage:', mentorStage);

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

        // עדכון סופי של CRMLead - chat_history כבר מתעדכן בתוך הפונקציות
        // כאן רק נעדכן מטא-דאטה
        try {
            await base44.asServiceRole.entities.CRMLead.update(user.id, {
                last_contact_at: new Date().toISOString(),
                last_outbound_at: new Date().toISOString(),
                waiting_for_response: false,
                active_handler: isInFirstGoalFlow ? 'firstGoalMentorFlow' : 'smartMentorEngine'
            });
            console.log('✅ CRMLead metadata updated');
        } catch (err) {
            console.error('❌ Failed to update CRMLead metadata:', err.message);
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

// normalizePhoneNumber moved to stateSynchronizer.js

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