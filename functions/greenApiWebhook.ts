import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Green-API Webhook Handler
 * מקבל הודעות WhatsApp ומנתב אותן למנטור או לסוכנים
 */

Deno.serve(async (req) => {
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

        // חיפוש ב-CRMLead - גם לפי מקור וגם לפי מנורמל
        try {
            const leads = await base44.asServiceRole.entities.CRMLead.filter({ 
                $or: [
                    { phone: phoneNumber },
                    { phone: normalizedPhone },
                    { phone: '0' + normalizedPhone.substring(3) } // גם 05...
                ]
            });
            if (leads && leads.length > 0) {
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
                    phone: normalizedPhone, // שמור בפורמט מנורמל
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

                // Also create a Lead record for LeadsAdmin CRM with the real phone number
                const localPhone = '0' + normalizedPhone.substring(3);
                try {
                    await base44.asServiceRole.entities.Lead.create({
                        name: senderData?.senderName || 'ליד וואטסאפ',
                        phone: localPhone,
                        source_page: 'WhatsApp - הודעה נכנסת',
                        category: 'other',
                        status: 'new',
                        priority: 'medium',
                        interaction_type: 'whatsapp_click',
                        notes: 'הודעה ראשונה: ' + (messageText.length > 100 ? messageText.substring(0, 100) + '...' : messageText)
                    });
                    console.log('✅ Lead also created in LeadsAdmin with phone:', localPhone);
                } catch (leadErr) {
                    console.warn('⚠️ Could not create Lead for LeadsAdmin:', leadErr.message);
                }

                // שליחת הודעת ברוכים הבאים
                await sendWhatsAppMessage(phoneNumber, 
                    'היי! 👋\n\nאני המנטור העסקי החכם של Perfect One.\n\nאני כאן כדי לעזור לך להתקדם בעסק שלך.\n\nספר לי - מה הכי מעסיק אותך היום?'
                );

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

        // בחר goal פעיל - חיפוש חכם
        let activeGoal = null;
        try {
            // נסה למצוא לפי user_id אם קיים
            let userGoals = [];
            
            if (user.user_id) {
                userGoals = await base44.asServiceRole.entities.UserGoal.filter({ 
                    user_id: user.user_id,
                    status: 'active'
                }, '-created_date', 5);
            }
            
            // אם לא נמצא, נסה לפי created_by
            if (userGoals.length === 0 && user.email) {
                userGoals = await base44.asServiceRole.entities.UserGoal.filter({ 
                    created_by: user.email,
                    status: 'active'
                }, '-created_date', 5);
            }

            if (userGoals.length > 0) {
                // העדף מטרה ראשונה שעדיין בפלואו
                const firstGoalInProgress = userGoals.find(g => 
                    g.is_first_goal && 
                    g.flow_data?.mentor_stage && 
                    g.flow_data.mentor_stage !== 'completed'
                );
                
                activeGoal = firstGoalInProgress || userGoals[0];
                console.log('✅ Active goal selected:', activeGoal.id, 'isPrimary:', activeGoal.isPrimary);
            }
        } catch (err) {
            console.log('Could not fetch active goal:', err.message);
        }

        if (!activeGoal) {
            // אם אין goal פעיל, צור timeline entry זמני או שלח הודעה
            console.log('⚠️ No active goal for user, sending generic response');
            await sendWhatsAppMessage(phoneNumber, 'שלום! 👋\n\nנראה שאתה עדיין לא בחרת מטרה. בואנו נגדיר ביחד את הצעד הראשון שלך.');
            return Response.json({ status: 'no_goal', message: 'User needs to select a goal first' });
        }

        console.log('🎯 Active goal found:', activeGoal.id, 'is_first_goal:', activeGoal.is_first_goal);

        // סנכרון user_id אם חסר
        if (activeGoal.user_id !== user.user_id && user.user_id) {
            await base44.asServiceRole.entities.UserGoal.update(activeGoal.id, {
                user_id: user.user_id
            });
            console.log('🔗 Synced goal user_id:', user.user_id);
        }

        // בדיקה: האם זו מטרה ראשונה בתהליך FirstGoalFlow?
        const mentorStage = activeGoal.flow_data?.mentor_stage;
        const isInFirstGoalFlow = activeGoal.is_first_goal && 
                                   mentorStage && 
                                   mentorStage !== 'completed';

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
                stage: mentorStage
            });

            console.log('✅ FirstGoalMentorFlow response:', flowResponse.data);

            // שלח את ההודעות שחזרו מהפלואו
            if (flowResponse.data?.messages && flowResponse.data.messages.length > 0) {
                for (const msg of flowResponse.data.messages) {
                    const maxDelay = Math.min(msg.delay_after || 0, 8000); // מקסימום 8 שניות
                    if (maxDelay > 0 && flowResponse.data.messages.indexOf(msg) < flowResponse.data.messages.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, maxDelay));
                    }
                    
                    await sendWhatsAppMessage(phoneNumber, msg.content);
                    
                    chatHistory.push({
                        role: 'assistant',
                        content: msg.content,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            // עדכון היסטוריה מוגבלת (שמור רק 50 הודעות אחרונות)
            const limitedHistory = [...chatHistory].slice(-50);
            
            await base44.asServiceRole.entities.CRMLead.update(user.id, {
                chat_history: limitedHistory,
                last_contact_at: new Date().toISOString(),
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
        let retryCount = 0;
        const MAX_LLM_RETRIES = 2;
        
        // קריאה למנוע המנטור החכם - עם retry ו-fallback
        while (retryCount < MAX_LLM_RETRIES && !mentorMessage) {
            try {
                const mentorResponse = await Promise.race([
                    base44.asServiceRole.functions.invoke('smartMentorEngine', {
                        action: 'analyze_response',
                        goal_id: activeGoal.id,
                        content: 'WhatsApp message',
                        client_response: messageText,
                        timeline_entry_id: null,
                        user_id: user.id // העבר במפורש
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
                ]);

                console.log('✅ Smart Mentor Engine response:', mentorResponse.data);

                const analysis = mentorResponse.data?.analysis;
                if (analysis) {
                    mentorMessage = `${analysis.deep_meaning}

${analysis.strategy_update_for_mentor ? '💡 ' + analysis.strategy_update_for_mentor : ''}
${analysis.recommended_adjustment ? '\n👉 ' + analysis.recommended_adjustment : ''}`.trim();
                }
                break; // הצלחנו - צא מהלולאה
            } catch (mentorErr) {
                retryCount++;
                console.error(`❌ Smart Mentor attempt ${retryCount} failed:`, mentorErr.message);
                
                if (retryCount >= MAX_LLM_RETRIES) {
                    // Fallback - תגובה בסיסית עם mentorChat
                    try {
                        const fallbackRes = await base44.asServiceRole.functions.invoke('mentorChat', {
                            user_id: user.id,
                            message: messageText,
                            chat_history: chatHistory.slice(-10), // רק 10 אחרונות
                            goal_id: activeGoal.id
                        });
                        mentorMessage = fallbackRes.data?.response || 'קיבלתי את הודעתך, אחזור אליך בהקדם.';
                    } catch (fallbackErr) {
                        console.error('❌ Fallback also failed:', fallbackErr.message);
                        mentorMessage = 'קיבלתי את הודעתך 👍 אחזור אליך בהקדם עם תשובה מפורטת.';
                    }
                }
                
                await new Promise(r => setTimeout(r, 1000)); // המתן שנייה לפני retry
            }
        }

        console.log('📤 Sending mentor message to:', phoneNumber);
        const sendResult = await sendWhatsAppMessage(phoneNumber, mentorMessage);
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

        // תיעוד ביצועי הסוכן
        try {
            await base44.asServiceRole.functions.invoke('agentPerformanceTracker', {
                action: 'log_interaction',
                agent_name: isInFirstGoalFlow ? 'firstGoalMentorFlow' : 'smartMentorEngine',
                user_id: user.user_id || user.id,
                goal_id: activeGoal.id,
                outcome: 'message_sent',
                metadata: {
                    messages: chatHistory.slice(-2), // 2 אחרונות בלבד
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
            message_processed: true,
            agent_used: isInFirstGoalFlow ? 'firstGoalMentorFlow' : 'smartMentorEngine'
        });

    } catch (error) {
        console.error('❌ Green-API webhook error:', error.message);
        console.error('Error stack:', error.stack);
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