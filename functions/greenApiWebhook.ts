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

        // שליפת פרטי ההודעה
        const phoneNumber = senderData.sender.replace('@c.us', ''); // הסרת הסיומת של WhatsApp
        const messageText = messageData.textMessageData?.textMessage || 
                           messageData.extendedTextMessageData?.text || '';

        if (!messageText) {
            return Response.json({ status: 'no_text' });
        }

        console.log(`Message from ${phoneNumber}: ${messageText}`);

        // חיפוש המשתמש לפי מספר טלפון
        let user = null;
        
        // חיפוש ב-User entity
        const users = await base44.asServiceRole.entities.User.filter({ phone: phoneNumber });
        if (users.length > 0) {
            user = users[0];
        } else {
            // חיפוש ב-CRMLead
            const leads = await base44.asServiceRole.entities.CRMLead.filter({ phone: phoneNumber });
            if (leads.length > 0) {
                user = leads[0];
            } else {
                // חיפוש ב-Lead
                const basicLeads = await base44.asServiceRole.entities.Lead.filter({ phone: phoneNumber });
                if (basicLeads.length > 0) {
                    user = basicLeads[0];
                }
            }
        }

        // אם לא נמצא משתמש - יצירת ליד חדש
        if (!user) {
            const newLead = await base44.asServiceRole.entities.CRMLead.create({
                full_name: senderData.senderName || 'WhatsApp User',
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

            // שליחת הודעת ברוכים הבאים
            await sendWhatsAppMessage(phoneNumber, 
                'היי! 👋\n\nאני המנטור העסקי החכם של Perfect One.\n\nאני כאן כדי לעזור לך להתקדם בעסק שלך.\n\nספר לי - מה הכי מעסיק אותך היום?'
            );

            return Response.json({ status: 'new_lead_created' });
        }

        // עדכון היסטוריית השיחה
        const chatHistory = user.chat_history || [];
        chatHistory.push({
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
        });

        // ניתוב למנטור או לסוכן רלוונטי
        let response;
        
        // בדיקה אם יש מטרה פעילה
        const activeGoals = await base44.asServiceRole.entities.UserGoal.filter({
            user_id: user.id || user.email,
            status: 'active'
        });

        if (activeGoals.length > 0 && activeGoals[0].is_first_goal) {
            // מטרה ראשונה - ניתוב לפלואו המנטור
            const flowResponse = await base44.asServiceRole.functions.invoke('firstGoalMentorFlow', {
                action: 'handle_response',
                goal_id: activeGoals[0].id,
                user_response: messageText,
                stage: activeGoals[0].flow_data?.mentor_stage || 'intro'
            });

            if (flowResponse.data.success && flowResponse.data.messages?.length > 0) {
                // שליחת ההודעות מהמנטור
                for (const msg of flowResponse.data.messages) {
                    if (msg.delay_after) {
                        await new Promise(resolve => setTimeout(resolve, msg.delay_after));
                    }
                    await sendWhatsAppMessage(phoneNumber, msg.content);
                    
                    chatHistory.push({
                        role: 'assistant',
                        content: msg.content,
                        timestamp: new Date().toISOString()
                    });
                }
                response = 'mentor_flow_handled';
            }
        } else {
            // שיחה רגילה עם המנטור
            const mentorResponse = await base44.asServiceRole.functions.invoke('mentorChat', {
                user_id: user.id || user.email,
                message: messageText,
                chat_history: chatHistory.slice(-10) // 10 הודעות אחרונות
            });

            if (mentorResponse.data.response) {
                await sendWhatsAppMessage(phoneNumber, mentorResponse.data.response);
                
                chatHistory.push({
                    role: 'assistant',
                    content: mentorResponse.data.response,
                    timestamp: new Date().toISOString()
                });
                response = 'mentor_handled';
            }
        }

        // עדכון היסטוריית השיחה
        if (user.id) {
            await base44.asServiceRole.entities.CRMLead.update(user.id, {
                chat_history: chatHistory,
                last_contact_at: new Date().toISOString()
            });
        }

        return Response.json({ 
            status: 'success',
            response_sent: response 
        });

    } catch (error) {
        console.error('Green-API webhook error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

/**
 * שליחת הודעה דרך Green-API
 */
async function sendWhatsAppMessage(phoneNumber, message) {
    const instanceId = Deno.env.get('GREENAPI_INSTANCE_ID');
    const apiToken = Deno.env.get('GREENAPI_API_TOKEN');

    if (!instanceId || !apiToken) {
        console.error('Missing credentials - instanceId:', !!instanceId, 'apiToken:', !!apiToken);
        throw new Error('Green-API credentials not configured');
    }

    // פורמט נכון של Green-API
    const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`;
    
    const payload = {
        chatId: `${phoneNumber}@c.us`,
        message: message
    };

    console.log('Sending WhatsApp message to:', phoneNumber);
    console.log('URL:', url.replace(apiToken, '***'));

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Green-API response status:', response.status);
    console.log('Green-API response:', responseText);

    if (!response.ok) {
        throw new Error(`Failed to send WhatsApp message (${response.status}): ${responseText}`);
    }

    return JSON.parse(responseText);
}