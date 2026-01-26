import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Wrapper סטנדרטי להרצת Agent
 * יוצר AgentRun, מעקב אחר שלבים, DLQ על כשל
 */

export async function runAgent({
    base44,
    agentName,
    handlerName,
    userId,
    leadId,
    goalId,
    channel = 'whatsapp',
    agentVersion = '1.0.0',
    promptVersion = 'default',
    stage = 'other',
    inputSummary,
    executeFunction
}) {
    const runId = crypto.randomUUID();
    const startedAt = new Date();
    
    let agentRun;
    
    try {
        // יצירת AgentRun
        agentRun = await base44.asServiceRole.entities.AgentRun.create({
            run_id: runId,
            user_id: userId,
            lead_id: leadId,
            goal_id: goalId,
            channel,
            handler_name: handlerName,
            agent_name: agentName,
            agent_version: agentVersion,
            prompt_version: promptVersion,
            stage,
            status: 'started',
            started_at: startedAt.toISOString(),
            input_summary: inputSummary
        });
        
        console.log(`🚀 AgentRun started: ${runId} (${agentName})`);
        
        // הרצת הפונקציה בפועל
        const result = await executeFunction(agentRun.id);
        
        // הצלחה - עדכון AgentRun
        const endedAt = new Date();
        const durationMs = endedAt - startedAt;
        
        await base44.asServiceRole.entities.AgentRun.update(agentRun.id, {
            status: result.waitingUser ? 'waiting_user' : 'completed',
            ended_at: endedAt.toISOString(),
            duration_ms: durationMs,
            output_summary: result.outputSummary || 'Completed',
            tokens_in: result.tokensIn,
            tokens_out: result.tokensOut,
            cost_usd: result.costUsd,
            llm_provider: result.llmProvider,
            llm_model: result.llmModel,
            retries_count: result.retriesCount || 0,
            metrics_json: result.metricsJson
        });
        
        console.log(`✅ AgentRun completed: ${runId} (${durationMs}ms)`);
        
        return { success: true, agentRunId: agentRun.id, result };
        
    } catch (error) {
        console.error(`❌ AgentRun failed: ${runId}`, error.message);
        
        // עדכון AgentRun כ-failed
        if (agentRun) {
            const endedAt = new Date();
            await base44.asServiceRole.entities.AgentRun.update(agentRun.id, {
                status: 'failed',
                ended_at: endedAt.toISOString(),
                duration_ms: endedAt - startedAt,
                error_code: error.code || 'UNKNOWN',
                error_message: error.message
            });
        }
        
        // יצירת DLQEvent
        await createDLQEvent({
            base44,
            eventType: 'agent_run_failure',
            source: handlerName,
            severity: determineSeverity(error),
            userId,
            leadId,
            goalId,
            agentRunId: agentRun?.id,
            error,
            payloadJson: { 
                agentName, 
                handlerName, 
                inputSummary,
                stage
            },
            contextJson: {
                channel,
                agentVersion,
                promptVersion
            }
        });
        
        return { success: false, error: error.message, agentRunId: agentRun?.id };
    }
}

/**
 * רישום אירוע ב-AgentRun
 */
export async function logAgentEvent({
    base44,
    agentRunId,
    eventType,
    summary,
    dataJson
}) {
    const startTime = Date.now();
    
    try {
        await base44.asServiceRole.entities.AgentEvent.create({
            agent_run_id: agentRunId,
            event_type: eventType,
            summary,
            data_json: dataJson,
            duration_ms: Date.now() - startTime
        });
    } catch (err) {
        console.warn(`⚠️ Could not log AgentEvent: ${err.message}`);
    }
}

/**
 * יצירת DLQEvent
 */
export async function createDLQEvent({
    base44,
    eventType,
    source,
    severity = 'medium',
    userId,
    leadId,
    goalId,
    agentRunId,
    phoneNormalized,
    idempotencyKey,
    error,
    payloadJson,
    contextJson,
    lastResponseJson
}) {
    const eventId = crypto.randomUUID();
    const now = new Date();
    
    // חישוב backoff
    const backoffMinutes = [1, 5, 15, 60, 360]; // 1m, 5m, 15m, 1h, 6h
    const nextRetryAt = new Date(now.getTime() + backoffMinutes[0] * 60000);
    
    try {
        await base44.asServiceRole.entities.DLQEvent.create({
            event_id: eventId,
            status: 'new',
            severity,
            event_type: eventType,
            source,
            phone_normalized: phoneNormalized,
            user_id: userId,
            lead_id: leadId,
            goal_id: goalId,
            agent_run_id: agentRunId,
            idempotency_key: idempotencyKey,
            attempt_count: 0,
            max_attempts: 5,
            next_retry_at: nextRetryAt.toISOString(),
            last_error_code: error?.code || error?.name || 'UNKNOWN',
            last_error_message: error?.message?.substring(0, 500) || 'Unknown error',
            last_error_stack: error?.stack?.substring(0, 2000),
            payload_json: sanitizePII(payloadJson),
            context_json: contextJson,
            last_response_json: lastResponseJson
        });
        
        console.log(`📝 DLQEvent created: ${eventId} (${eventType})`);
        return eventId;
    } catch (err) {
        console.error(`❌ Failed to create DLQEvent:`, err.message);
        throw err;
    }
}

/**
 * סניטציה של PII
 */
function sanitizePII(obj) {
    if (!obj) return obj;
    
    const sanitized = JSON.parse(JSON.stringify(obj));
    
    // מחק/מסכה שדות רגישים
    const sensitiveKeys = ['password', 'ssn', 'credit_card', 'api_key', 'token'];
    
    function recursiveSanitize(o) {
        if (typeof o !== 'object' || o === null) return;
        
        for (const key in o) {
            if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
                o[key] = '***REDACTED***';
            } else if (typeof o[key] === 'object') {
                recursiveSanitize(o[key]);
            }
        }
    }
    
    recursiveSanitize(sanitized);
    return sanitized;
}

/**
 * קביעת severity לפי error
 */
function determineSeverity(error) {
    const msg = error?.message?.toLowerCase() || '';
    
    if (msg.includes('timeout') || msg.includes('network')) return 'high';
    if (msg.includes('unauthorized') || msg.includes('forbidden')) return 'critical';
    if (msg.includes('not found')) return 'medium';
    if (msg.includes('validation')) return 'low';
    
    return 'medium';
}

/**
 * Deno.serve wrapper - ייצא לשימוש ב-functions אחרות
 */
Deno.serve(async (req) => {
    return Response.json({ 
        message: 'This is a library module. Import functions from agentWrapper.' 
    });
});