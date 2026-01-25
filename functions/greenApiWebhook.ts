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
        
        // חיפוש ב-CRMLead
        const leads = await base44.asServiceRole.entities.CRMLead.filter({ phone: phoneNumber });
        if (leads.length > 0) {
            user = leads[0];
            console.log('Found user in CRMLead:', user.id);
        } else {
            // חיפוש ב-Lead
            const basicLeads = await base44.asServiceRole.entities.Lead.filter({ phone: phoneNumber });
            if (basicLeads.length > 0) {
                user = basicLeads[0];
                console.log('Found user in Lead:', user.id);
            }
        }

        // אם לא נמצא משתמש - יצירת ליד חדש
        if (!user) {
            console.log('Creating new CRMLead for:', phoneNumber);
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

            return Response.json({ status: 'new_lead_created', lead_id: newLead.id });
        }

        // בדיקה אם המשתמש במצב 'נא לא ליצור קשר'
        if (user.do_not_contact) {
            console.log(`User ${phoneNumber} has do_not_contact=true. Ignoring message.`);
            return Response.json({ status: 'do_not_contact_ignored' });
        }

        // עדכון היסטוריית השיחה
        const chatHistory = user.chat_history || [];
        chatHistory.push({
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
        });

        console.log('Calling mentorChat with:', {
            user_id: phoneNumber,
            message: messageText,
            chat_history_length: chatHistory.length
        });

        // קריאה למנטור
        const mentorResponse = await base44.asServiceRole.functions.invoke('mentorChat', {
            user_id: phoneNumber,
            message: messageText,
            chat_history: chatHistory.slice(-10) // 10 הודעות אחרונות
        });

        console.log('Mentor response:', mentorResponse.data);

        if (mentorResponse.data?.response) {
            console.log('Sending WhatsApp message to:', phoneNumber);
            await sendWhatsAppMessage(phoneNumber, mentorResponse.data.response);
            
            chatHistory.push({
                role: 'assistant',
                content: mentorResponse.data.response,
                timestamp: new Date().toISOString()
            });
        } else {
            console.error('No response from mentor:', mentorResponse);
        }

        // עדכון היסטוריית השיחה
        await base44.asServiceRole.entities.CRMLead.update(user.id, {
            chat_history: chatHistory,
            last_contact_at: new Date().toISOString()
        });

        return Response.json({ 
            status: 'success',
            user_id: user.id,
            response_sent: !!mentorResponse.data?.response
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

    console.log('Sending WhatsApp message - instanceId:', instanceId ? 'SET' : 'NOT SET');

    if (!instanceId || !apiToken) {
        throw new Error('Green-API credentials not configured');
    }

    const url = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;
    
    const payload = {
        chatId: `${phoneNumber}@c.us`,
        message: message
    };

    console.log('Sending to URL:', `https://api.greenapi.com/waInstance${instanceId}/sendMessage/***`);
    console.log('Payload:', JSON.stringify(payload));

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Green-API Status:', response.status);
    console.log('Green-API Response:', responseText);

    if (!response.ok) {
        throw new Error(`Green-API error ${response.status}: ${responseText}`);
    }

    return JSON.parse(responseText);
}