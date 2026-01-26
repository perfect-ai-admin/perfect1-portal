import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Wrapper אמין ל-InvokeLLM
 * Retry + Timeout + Fallback + Circuit Breaker
 */

const circuitBreaker = {
    failures: 0,
    lastFailure: null,
    isOpen: false
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { prompt, response_json_schema, add_context_from_internet, file_urls, user_id, fallback_response } = body;

        // תמיכה ב-service role
        let isServiceRole = false;
        try {
            await base44.auth.me();
        } catch {
            isServiceRole = true;
        }

        const client = isServiceRole ? base44.asServiceRole : base44;

        // Circuit Breaker: אם LLM נפל הרבה לאחרונה, החזר fallback מיד
        if (circuitBreaker.isOpen) {
            const timeSinceFailure = Date.now() - circuitBreaker.lastFailure;
            if (timeSinceFailure < 60000) { // דקה
                console.warn('⚠️ Circuit breaker OPEN - returning fallback immediately');
                return Response.json({
                    success: false,
                    circuit_breaker_open: true,
                    fallback_used: true,
                    response: fallback_response || 'המערכת עמוסה כרגע. אנא נסה שוב בעוד רגע.'
                });
            } else {
                // נסה לסגור את ה-circuit
                circuitBreaker.isOpen = false;
                circuitBreaker.failures = 0;
            }
        }

        const MAX_RETRIES = 3;
        const TIMEOUT_MS = 15000; // 15 שניות

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const result = await Promise.race([
                    client.integrations.Core.InvokeLLM({
                        prompt,
                        response_json_schema,
                        add_context_from_internet: add_context_from_internet || false,
                        file_urls: file_urls || null
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('LLM_TIMEOUT')), TIMEOUT_MS)
                    )
                ]);

                // הצלחה - אפס circuit breaker
                circuitBreaker.failures = 0;
                circuitBreaker.isOpen = false;

                return Response.json({
                    success: true,
                    response: result,
                    attempts: attempt + 1
                });

            } catch (err) {
                console.error(`❌ LLM attempt ${attempt + 1}/${MAX_RETRIES} failed:`, err.message);
                
                if (attempt === MAX_RETRIES - 1) {
                    // כשל סופי - עדכן circuit breaker
                    circuitBreaker.failures++;
                    circuitBreaker.lastFailure = Date.now();
                    
                    if (circuitBreaker.failures >= 5) {
                        circuitBreaker.isOpen = true;
                        console.error('🔴 Circuit breaker OPENED after', circuitBreaker.failures, 'failures');
                    }
                    
                    // החזר fallback
                    return Response.json({
                        success: false,
                        error: err.message,
                        fallback_used: true,
                        response: fallback_response || 'אני זקוק לרגע כדי לעבד את בקשתך. אחזור אליך בהקדם.',
                        attempts: MAX_RETRIES
                    });
                }
                
                // Exponential backoff
                const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
                await new Promise(r => setTimeout(r, backoffMs));
            }
        }

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});