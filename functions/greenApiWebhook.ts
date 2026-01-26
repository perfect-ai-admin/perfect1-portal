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
                const newLead = await base44.asServiceRole.entities.CRMLead.create({
                    full_name: senderData?.senderName || 'WhatsApp User',
                    phone: phoneNumber,
                    source: 'WhatsApp',
                    journey_stage: 'lead_new',
                    active_handler: 'mentor',
                    chat_history: [{
                        role: 'user',
                        content: messageText,
                        timestamp: new Date().toISOString()
                    }]
                });

                user = newLead;
                console.log('✅ New lead created:', newLead.id);

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

        // עדכון היסטוריית השיחה
        let chatHistory = (user?.chat_history || []);
        if (!Array.isArray(chatHistory)) {
            chatHistory = [];
        }

        chatHistory.push({
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
        });

        // שמור עדכון מיידי של ההיסטוריה
        try {
            await base44.asServiceRole.entities.CRMLead.update(user.id, {
                chat_history: chatHistory,
                last_contact_at: new Date().toISOString()
            });
        } catch (err) {
            console.warn('⚠️ Could not update chat history immediately:', err.message);
        }

        // בחר goal פעיל (הראשון או הממוקד)
        let activeGoal = null;
        try {
            const userGoals = await base44.asServiceRole.entities.UserGoal.filter({ 
                $or: [{ user_id: user.id }, { user_id: phoneNumber }],
                status: 'active'
            }, '-created_date', 1);

            if (userGoals.length > 0) {
                activeGoal = userGoals[0];
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

        // בדיקה: האם זו מטרה ראשונה בתהליך FirstGoalFlow?
        const mentorStage = activeGoal.flow_data?.mentor_stage;
        const isInFirstGoalFlow = activeGoal.is_first_goal && 
                                   mentorStage && 
                                   mentorStage !== 'completed';

        if (isInFirstGoalFlow) {
            console.log('🔄 User is in FirstGoalFlow, stage:', mentorStage);
            
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
                    if (msg.delay_after && flowResponse.data.messages.indexOf(msg) < flowResponse.data.messages.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, msg.delay_after));
                    }
                    
                    await sendWhatsAppMessage(phoneNumber, msg.content);
                    
                    chatHistory.push({
                        role: 'assistant',
                        content: msg.content,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            // עדכון היסטוריה
            await base44.asServiceRole.entities.CRMLead.update(user.id, {
                chat_history: chatHistory,
                last_contact_at: new Date().toISOString()
            });

            return Response.json({ 
                status: 'success',
                flow: 'firstGoalMentorFlow',
                next_stage: flowResponse.data?.next_stage
            });
        }

        console.log('Calling smartMentorEngine with:', {
            user_id: user.id,
            goal_id: activeGoal.id,
            message: messageText,
            chat_history_length: chatHistory.length
        });

        // קריאה למנוע המנטור החכם
        const mentorResponse = await base44.asServiceRole.functions.invoke('smartMentorEngine', {
            action: 'analyze_response',
            goal_id: activeGoal.id,
            content: 'WhatsApp message',
            client_response: messageText,
            timeline_entry_id: null
        });

        console.log('✅ Smart Mentor Engine response:', mentorResponse.data);

        // smartMentorEngine מחזיר analysis עם deep_meaning והערות
        const analysis = mentorResponse.data?.analysis;
        if (!analysis) {
            console.error('❌ No analysis from smart mentor engine');
            return Response.json({ status: 'error', message: 'No analysis generated' }, { status: 500 });
        }

        // בנה הודעת מנטור בהתאם ל-analysis
        const mentorMessage = `
        ${analysis.deep_meaning}

        ${analysis.strategy_update_for_mentor ? '💡 ' + analysis.strategy_update_for_mentor : ''}
        ${analysis.recommended_adjustment ? '\n👉 ' + analysis.recommended_adjustment : ''}
        `.trim();

        console.log('📤 Sending mentor message to:', phoneNumber);
        await sendWhatsAppMessage(phoneNumber, mentorMessage);

        chatHistory.push({
            role: 'assistant',
            content: mentorMessage,
            timestamp: new Date().toISOString()
        });

        // עדכון סופי של היסטוריית השיחה
        try {
            await base44.asServiceRole.entities.CRMLead.update(user.id, {
                chat_history: chatHistory,
                last_contact_at: new Date().toISOString()
            });
        } catch (err) {
            console.warn('⚠️ Could not update final chat history:', err.message);
        }

        console.log('✅ Webhook completed successfully for user:', user.id);
        return Response.json({ 
            status: 'success',
            user_id: user.id,
            message_processed: true
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

    // URL format: https://api.greenapi.com/waInstance{instanceId}/sendMessage/{apiToken}
    const url = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;

    const payload = {
        chatId: `${phoneNumber}@c.us`,
        message: message
    };

    console.log('📤 URL:', url.replace(apiToken, '***'));
    console.log('📤 ChatID:', `${phoneNumber}@c.us`);
    console.log('📤 Message:', message);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log('📤 Green-API HTTP Status:', response.status);
        console.log('📤 Green-API Response:', responseText);

        if (!response.ok) {
            throw new Error(`Green-API HTTP ${response.status}: ${responseText}`);
        }

        const result = JSON.parse(responseText);
        console.log('✅ Message sent successfully');
        return result;
    } catch (err) {
        console.error('❌ sendWhatsAppMessage error:', err.message);
        throw err;
    }
}