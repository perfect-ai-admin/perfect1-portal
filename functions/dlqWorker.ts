import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * DLQ Worker - עובד מתוזמן שמעבד אירועי DLQ
 * רץ כל 2-5 דקות, מעבד retries לפי backoff
 */

const BACKOFF_MINUTES = [1, 5, 15, 60, 360]; // 1m, 5m, 15m, 1h, 6h

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json().catch(() => ({}));
        
        const { action = 'process_pending' } = body;
        
        if (action === 'process_pending') {
            return await processPendingDLQEvents(base44);
        }
        
        return Response.json({ error: 'Invalid action' }, { status: 400 });
        
    } catch (error) {
        console.error('❌ DLQWorker error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

/**
 * עיבוד כל אירועי DLQ הממתינים
 */
async function processPendingDLQEvents(base44) {
    const now = new Date();
    
    // שליפת אירועים שמוכנים ל-retry
    const events = await base44.asServiceRole.entities.DLQEvent.filter({
        status: { $in: ['new', 'retrying'] },
        next_retry_at: { $lte: now.toISOString() }
    }, 'next_retry_at', 20); // עד 20 אירועים בכל run
    
    console.log(`📋 Found ${events.length} DLQ events to process`);
    
    const results = {
        processed: 0,
        resolved: 0,
        retrying: 0,
        failed_permanent: 0,
        errors: []
    };
    
    for (const event of events) {
        try {
            await processOneDLQEvent(base44, event, results);
            results.processed++;
        } catch (err) {
            console.error(`❌ Error processing DLQ ${event.event_id}:`, err.message);
            results.errors.push({ event_id: event.event_id, error: err.message });
        }
    }
    
    return Response.json({ 
        success: true, 
        results,
        timestamp: new Date().toISOString()
    });
}

/**
 * עיבוד אירוע DLQ בודד
 */
async function processOneDLQEvent(base44, event, results) {
    const attemptNo = event.attempt_count + 1;
    
    console.log(`🔄 Processing DLQ ${event.event_id} (attempt ${attemptNo}/${event.max_attempts})`);
    
    // רישום ניסיון
    const retryLogStart = Date.now();
    
    let retryResult = 'fail';
    let errorCode = null;
    let errorMessage = null;
    
    try {
        // ביצוע retry לפי event_type
        switch (event.event_type) {
            case 'outbound_whatsapp':
                await retryOutboundWhatsApp(base44, event);
                retryResult = 'success';
                break;
                
            case 'invoke_llm':
                await retryInvokeLLM(base44, event);
                retryResult = 'success';
                break;
                
            case 'inbound_whatsapp':
                await retryInboundRouting(base44, event);
                retryResult = 'success';
                break;
                
            case 'db_write':
                await retryDBWrite(base44, event);
                retryResult = 'success';
                break;
                
            default:
                console.warn(`⚠️ Unknown event_type: ${event.event_type}`);
                retryResult = 'fail';
                errorCode = 'UNKNOWN_EVENT_TYPE';
                errorMessage = `Cannot retry event_type: ${event.event_type}`;
        }
    } catch (err) {
        retryResult = 'fail';
        errorCode = err.code || err.name || 'RETRY_FAILED';
        errorMessage = err.message;
        console.error(`❌ Retry failed:`, err.message);
    }
    
    // רישום DLQRetryLog
    await base44.asServiceRole.entities.DLQRetryLog.create({
        dlq_event_id: event.event_id,
        attempt_no: attemptNo,
        tried_at: new Date().toISOString(),
        result: retryResult,
        error_code: errorCode,
        error_message: errorMessage,
        snapshot_json: {
            duration_ms: Date.now() - retryLogStart
        }
    });
    
    // עדכון DLQEvent
    if (retryResult === 'success') {
        await base44.asServiceRole.entities.DLQEvent.update(event.id, {
            status: 'resolved',
            updated_at: new Date().toISOString()
        });
        results.resolved++;
        console.log(`✅ DLQ ${event.event_id} resolved`);
        
    } else if (attemptNo >= event.max_attempts) {
        // נכשל לצמיתות
        await base44.asServiceRole.entities.DLQEvent.update(event.id, {
            status: 'failed_permanent',
            severity: 'critical',
            attempt_count: attemptNo,
            last_error_code: errorCode,
            last_error_message: errorMessage,
            updated_at: new Date().toISOString()
        });
        results.failed_permanent++;
        console.log(`❌ DLQ ${event.event_id} failed permanently`);
        
    } else {
        // retry נוסף
        const nextRetryAt = new Date(Date.now() + BACKOFF_MINUTES[attemptNo] * 60000);
        
        await base44.asServiceRole.entities.DLQEvent.update(event.id, {
            status: 'retrying',
            attempt_count: attemptNo,
            next_retry_at: nextRetryAt.toISOString(),
            last_error_code: errorCode,
            last_error_message: errorMessage,
            updated_at: new Date().toISOString()
        });
        results.retrying++;
        console.log(`🔄 DLQ ${event.event_id} scheduled for retry at ${nextRetryAt.toISOString()}`);
    }
}

/**
 * Retry handlers לפי event_type
 */
async function retryOutboundWhatsApp(base44, event) {
    const { phone_normalized, message_preview } = event.payload_json;
    
    // נסה לשלוח שוב
    const instanceId = Deno.env.get('GREENAPI_INSTANCE_ID');
    const apiToken = Deno.env.get('GREENAPI_API_TOKEN');
    
    const url = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chatId: `${phone_normalized}@c.us`,
            message: message_preview
        })
    });
    
    if (!response.ok) {
        throw new Error(`GREEN_API_HTTP_${response.status}`);
    }
    
    const result = await response.json();
    
    // עדכן OutboundMessage
    const outbounds = await base44.asServiceRole.entities.OutboundMessage.filter({
        lead_id: event.lead_id,
        status: 'failed'
    }, '-created_date', 1);
    
    if (outbounds && outbounds.length > 0) {
        await base44.asServiceRole.entities.OutboundMessage.update(outbounds[0].id, {
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_message_id: result.idMessage
        });
    }
    
    console.log(`✅ Retry WhatsApp success: ${result.idMessage}`);
}

async function retryInvokeLLM(base44, event) {
    const { prompt_preview, agent_name } = event.payload_json;
    
    // קריאה מחדש ל-LLM
    const response = await Promise.race([
        base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: prompt_preview
        }),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('LLM_TIMEOUT')), 15000)
        )
    ]);
    
    console.log(`✅ Retry LLM success`);
    return response;
}

async function retryInboundRouting(base44, event) {
    // קריאה מחדש ל-greenWebhook
    await base44.asServiceRole.functions.invoke('greenApiWebhook', 
        event.payload_json
    );
    
    console.log(`✅ Retry inbound routing success`);
}

async function retryDBWrite(base44, event) {
    const { entity, record_id, operation, data } = event.payload_json;
    
    if (operation === 'create') {
        await base44.asServiceRole.entities[entity].create(data);
    } else if (operation === 'update') {
        await base44.asServiceRole.entities[entity].update(record_id, data);
    }
    
    console.log(`✅ Retry DB write success`);
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}