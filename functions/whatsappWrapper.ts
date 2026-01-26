import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Wrapper מרכזי לשליחת WhatsApp
 * מטפל ב-OutboundMessage tracking, retry, DLQ
 */

export async function sendWhatsAppMessage({
    base44,
    phoneNormalized,
    messageText,
    leadId,
    userId,
    goalId,
    agentRunId
}) {
    const messageId = crypto.randomUUID();
    
    try {
        // יצירת OutboundMessage
        const outbound = await base44.asServiceRole.entities.OutboundMessage.create({
            lead_id: leadId,
            user_id: userId,
            goal_id: goalId,
            agent_run_id: agentRunId,
            channel: 'whatsapp',
            provider: 'greenapi',
            message_text: messageText,
            status: 'queued'
        });
        
        // שליחה בפועל
        const result = await sendViaGreenAPI(phoneNormalized, messageText);
        
        // עדכון סטטוס
        await base44.asServiceRole.entities.OutboundMessage.update(outbound.id, {
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_message_id: result.idMessage
        });
        
        console.log(`✅ WhatsApp sent: ${result.idMessage}`);
        return { success: true, messageId: result.idMessage, outboundId: outbound.id };
        
    } catch (error) {
        console.error(`❌ WhatsApp send failed:`, error.message);
        
        // עדכון OutboundMessage כ-failed
        try {
            const outbounds = await base44.asServiceRole.entities.OutboundMessage.filter({
                lead_id: leadId,
                status: 'queued'
            }, '-created_date', 1);
            
            if (outbounds && outbounds.length > 0) {
                await base44.asServiceRole.entities.OutboundMessage.update(outbounds[0].id, {
                    status: 'failed',
                    last_error: error.message,
                    retry_count: (outbounds[0].retry_count || 0) + 1
                });
            }
        } catch (updateErr) {
            console.warn('Could not update OutboundMessage:', updateErr.message);
        }
        
        // יצירת DLQEvent
        await createDLQEventForWhatsApp({
            base44,
            phoneNormalized,
            messageText,
            leadId,
            userId,
            goalId,
            agentRunId,
            error
        });
        
        throw error;
    }
}

/**
 * שליחה בפועל דרך Green API
 */
async function sendViaGreenAPI(phoneNormalized, message) {
    const instanceId = Deno.env.get('GREENAPI_INSTANCE_ID');
    const apiToken = Deno.env.get('GREENAPI_API_TOKEN');
    
    if (!instanceId || !apiToken) {
        throw new Error('Green-API credentials not configured');
    }
    
    const url = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;
    
    const response = await Promise.race([
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId: `${phoneNormalized}@c.us`,
                message
            })
        }),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('GREEN_API_TIMEOUT')), 20000)
        )
    ]);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GREEN_API_HTTP_${response.status}: ${errorText}`);
    }
    
    return await response.json();
}

/**
 * יצירת DLQEvent לכשל WhatsApp
 */
async function createDLQEventForWhatsApp({
    base44,
    phoneNormalized,
    messageText,
    leadId,
    userId,
    goalId,
    agentRunId,
    error
}) {
    const eventId = crypto.randomUUID();
    const idempotencyKey = `out:${leadId}:${hashString(messageText)}:${Math.floor(Date.now() / 60000)}`;
    
    await base44.asServiceRole.entities.DLQEvent.create({
        event_id: eventId,
        status: 'new',
        severity: error.message.includes('TIMEOUT') ? 'high' : 'medium',
        event_type: 'outbound_whatsapp',
        source: 'whatsappWrapper',
        phone_normalized: phoneNormalized,
        user_id: userId,
        lead_id: leadId,
        goal_id: goalId,
        agent_run_id: agentRunId,
        idempotency_key: idempotencyKey,
        attempt_count: 0,
        next_retry_at: new Date(Date.now() + 60000).toISOString(),
        last_error_code: error.code || error.name || 'WHATSAPP_SEND_FAILED',
        last_error_message: error.message.substring(0, 500),
        last_error_stack: error.stack?.substring(0, 2000),
        payload_json: {
            phone_normalized: phoneNormalized,
            message_preview: messageText.substring(0, 100)
        },
        context_json: {
            lead_id: leadId,
            goal_id: goalId,
            agent_name: 'whatsappWrapper'
        }
    });
}

/**
 * Hash פשוט למחרוזת
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// Export for use in other functions
Deno.serve(async (req) => {
    return Response.json({ 
        message: 'This is a library module. Import sendWhatsAppMessage from whatsappWrapper.' 
    });
});