import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Wrapper מרכזי לקריאות LLM
 * Retry + Timeout + Circuit Breaker + DLQ + Fallback
 */

const circuitBreaker = {
    failures: 0,
    lastFailure: null,
    isOpen: false,
    threshold: 5,
    timeout: 60000 // 1 minute
};

export async function invokeLLMWithRetry({
    base44,
    prompt,
    responseJsonSchema,
    addContextFromInternet = false,
    fileUrls,
    agentRunId,
    agentName,
    goalId,
    fallbackResponse,
    maxRetries = 3,
    timeoutMs = 15000
}) {
    // Circuit breaker check
    if (circuitBreaker.isOpen) {
        const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailure;
        if (timeSinceLastFailure < circuitBreaker.timeout) {
            console.warn('⚡ Circuit breaker OPEN, using fallback');
            return { 
                success: false, 
                error: 'CIRCUIT_BREAKER_OPEN',
                response: fallbackResponse 
            };
        } else {
            console.log('🔄 Circuit breaker reset attempt');
            circuitBreaker.isOpen = false;
            circuitBreaker.failures = 0;
        }
    }
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🤖 LLM attempt ${attempt}/${maxRetries}`);
            
            const response = await Promise.race([
                base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt,
                    response_json_schema: responseJsonSchema,
                    add_context_from_internet: addContextFromInternet,
                    file_urls: fileUrls
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('LLM_TIMEOUT')), timeoutMs)
                )
            ]);
            
            // הצלחה - reset circuit breaker
            circuitBreaker.failures = 0;
            circuitBreaker.isOpen = false;
            
            console.log(`✅ LLM success on attempt ${attempt}`);
            return { 
                success: true, 
                response,
                retriesCount: attempt - 1 
            };
            
        } catch (error) {
            lastError = error;
            console.error(`❌ LLM attempt ${attempt} failed:`, error.message);
            
            // Circuit breaker logic
            circuitBreaker.failures++;
            if (circuitBreaker.failures >= circuitBreaker.threshold) {
                circuitBreaker.isOpen = true;
                circuitBreaker.lastFailure = Date.now();
                console.warn('⚡ Circuit breaker OPENED');
            }
            
            // אם זה לא הניסיון האחרון - המתן לפני retry
            if (attempt < maxRetries) {
                const backoffMs = Math.pow(2, attempt) * 1000; // exponential: 2s, 4s, 8s
                await new Promise(resolve => setTimeout(resolve, backoffMs));
            }
        }
    }
    
    // כל הניסיונות נכשלו - יצירת DLQEvent
    console.error(`❌ All LLM attempts failed, creating DLQ`);
    
    const idempotencyKey = `llm:${agentName}:${goalId}:${hashString(prompt.substring(0, 200))}`;
    
    await createDLQEventForLLM({
        base44,
        agentName,
        goalId,
        agentRunId,
        prompt: prompt.substring(0, 500),
        idempotencyKey,
        error: lastError
    });
    
    return { 
        success: false, 
        error: lastError.message,
        response: fallbackResponse,
        retriesCount: maxRetries 
    };
}

/**
 * יצירת DLQEvent לכשל LLM
 */
async function createDLQEventForLLM({
    base44,
    agentName,
    goalId,
    agentRunId,
    prompt,
    idempotencyKey,
    error
}) {
    const eventId = crypto.randomUUID();
    
    await base44.asServiceRole.entities.DLQEvent.create({
        event_id: eventId,
        status: 'new',
        severity: 'high',
        event_type: 'invoke_llm',
        source: agentName,
        goal_id: goalId,
        agent_run_id: agentRunId,
        idempotency_key: idempotencyKey,
        attempt_count: 0,
        max_attempts: 5,
        next_retry_at: new Date(Date.now() + 60000).toISOString(),
        last_error_code: error?.code || 'LLM_FAILURE',
        last_error_message: error?.message?.substring(0, 500),
        last_error_stack: error?.stack?.substring(0, 2000),
        payload_json: {
            prompt_preview: prompt,
            agent_name: agentName
        },
        context_json: {
            goal_id: goalId
        }
    });
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

Deno.serve(async (req) => {
    return Response.json({ 
        message: 'This is a library module. Import invokeLLMWithRetry from llmWrapper.' 
    });
});