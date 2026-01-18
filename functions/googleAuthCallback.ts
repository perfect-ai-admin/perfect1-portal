import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const BASE_URL = Deno.env.get('BASE_URL');

// Generate server-side error ID for tracing
const generateErrorId = () => `SERVER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Log auth error to database for telemetry
const logAuthError = async (base44, errorId, endpoint, step, message, statusCode, userEmail = null) => {
  try {
    await base44.asServiceRole.entities.AuthError.create({
      error_id: errorId,
      endpoint,
      step,
      message: message.substring(0, 500), // Truncate if too long
      status_code: statusCode,
      user_email: userEmail,
      timestamp: new Date().toISOString(),
      resolved: false
    });
    console.log(`[${errorId}] Error logged to database`);
  } catch (logErr) {
    console.warn(`[${errorId}] Could not log error to DB:`, logErr.message);
    // Non-critical - don't fail auth because of telemetry
  }
};

Deno.serve(async (req) => {
    const errorId = generateErrorId();
    
    try {
        let base44;
        let body;
        
        try {
            base44 = createClientFromRequest(req);
            body = await req.json();
        } catch (parseErr) {
            console.error(`[${errorId}] [STEP: request_parse] Error:`, parseErr);
            // Can't log to DB yet (no base44), so skip
            return Response.json({ 
                error: 'Invalid request', 
                step: 'request_parse',
                errorId 
            }, { status: 400 });
        }
        const code = body.code;
        
        if (!code) {
            console.error(`[${errorId}] [STEP: code_validation] Missing code`);
            return Response.json({ 
                error: 'Missing authorization code', 
                step: 'code_validation',
                errorId 
            }, { status: 400 });
        }
        
        console.log(`[${errorId}] [STEP: token_exchange] Starting...`);

        let tokenResponse;
        try {
            // Exchange code for tokens
            tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code: code,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    redirect_uri: `${BASE_URL.replace(/\/$/, '')}/ClientLogin`,
                    grant_type: 'authorization_code'
                })
            });
        } catch (fetchErr) {
            console.error(`[${errorId}] [STEP: token_exchange] Fetch failed:`, fetchErr.message);
            return Response.json({ 
                error: 'Token exchange failed', 
                step: 'token_exchange', 
                errorId 
            }, { status: 503 });
        }

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error(`[${errorId}] [STEP: token_exchange] Failed:`, tokenResponse.status, errorData);
            return Response.json({ 
                error: 'Token exchange failed', 
                step: 'token_exchange', 
                errorId 
            }, { status: 400 });
        }
        
        let tokens;
        try {
            tokens = await tokenResponse.json();
        } catch (parseErr) {
            console.error(`[${errorId}] [STEP: token_parse] JSON parse failed:`, parseErr.message);
            return Response.json({ 
                error: 'Invalid token response', 
                step: 'token_parse', 
                errorId 
            }, { status: 400 });
        }

        console.log(`[${errorId}] [STEP: token_exchange] Success - tokens received`);

        if (!tokens.id_token) {
            console.error(`[${errorId}] [STEP: token_validation] No id_token in response`);
            return Response.json({ 
                error: 'No id_token in response', 
                step: 'token_validation', 
                errorId 
            }, { status: 400 });
        }

        // Decode id_token
        let payload;
        try {
            const idTokenParts = tokens.id_token.split('.');
            payload = JSON.parse(atob(idTokenParts[1]));
        } catch (decodeErr) {
            console.error(`[${errorId}] [STEP: token_decode] Decode failed:`, decodeErr.message);
            return Response.json({ 
                error: 'Invalid token format', 
                step: 'token_decode', 
                errorId 
            }, { status: 400 });
        }

        const { email, name, sub } = payload;

        if (!email) {
            console.error(`[${errorId}] [STEP: token_parse] No email in token`);
            return Response.json({ 
                error: 'No email in token', 
                step: 'token_parse', 
                errorId 
            }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        console.log(`[${errorId}] [STEP: token_parse] Email: ${normalizedEmail}, GoogleSub: ${sub}`);
        
        // Create user object
        const fullName = name && name.trim() ? name : normalizedEmail.split('@')[0] || 'משתמש חדש';
        
        // Get free plan - best effort, but DON'T block authentication
        let freePlan = null;

        try {
            console.log(`[${errorId}] [STEP: plan_lookup] Fetching free plan...`);
            const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });

            if (freePlans && freePlans.length > 0) {
                freePlan = freePlans[0];
                console.log(`[${errorId}] [STEP: plan_lookup] Found: ${freePlan.id}`);
            }
        } catch (lookupErr) {
            console.error(`[${errorId}] [STEP: plan_lookup] Error:`, lookupErr.message);
        }

        // If no plan, use placeholder (user will have pending status, plan created async later)
        if (!freePlan) {
            console.log(`[${errorId}] [STEP: plan_default] Using pending status, plan will be resolved later`);
            freePlan = { id: null }; // Proceed with null, user becomes pending
        }

        // Find or create user - with comprehensive error handling
        let user;
        try {
            console.log(`[${errorId}] [STEP: user_lookup] Searching for user: ${normalizedEmail}`);

            // Try to find existing user
            let existingUsers = [];
            try {
                existingUsers = await base44.asServiceRole.entities.User.filter({ email: normalizedEmail });
                console.log(`[${errorId}] [STEP: user_lookup] Found ${existingUsers.length} user(s)`);
            } catch (filterErr) {
                console.error(`[${errorId}] [STEP: user_lookup] Filter error:`, filterErr.message);
                // Continue - filter might fail for new users, but create should work
            }

            if (existingUsers && existingUsers.length > 0) {
                // User exists - use existing
                user = existingUsers[0];
                console.log(`[${errorId}] [STEP: user_found] User exists: ${user.id}`);

                // Try to update last login (non-critical)
                try {
                    await base44.asServiceRole.entities.User.update(user.id, {
                        last_login_at: new Date().toISOString()
                    });
                    console.log(`[${errorId}] [STEP: user_update] Last login updated`);
                } catch (updateErr) {
                    console.warn(`[${errorId}] [STEP: user_update] Non-critical error:`, updateErr.message);
                }
            } else {
                // NEW USER - ATOMIC UPSERT (find-or-create)
                console.log(`[${errorId}] [STEP: user_create] Creating new user: ${normalizedEmail}`);

                const now = new Date().toISOString();
                const newUserData = {
                    email: normalizedEmail,
                    full_name: fullName,
                    phone: '0000000000',
                    status: freePlan?.id ? 'active' : 'pending', // pending if no plan yet
                    login_provider: 'google',
                    last_login_at: now,
                    current_plan_id: freePlan?.id || null,
                    plan_start_date: now,
                    marketing_enabled: false,
                    mentor_enabled: true,
                    finance_enabled: false,
                    goals_limit: 1,
                    max_active_goals: 1
                };

                console.log(`[${errorId}] [STEP: user_create] Fields: ${Object.keys(newUserData).join(', ')}`);

                try {
                    user = await base44.asServiceRole.entities.User.create(newUserData);
                    console.log(`[${errorId}] [STEP: user_create] ✓ Created: ${user.id}`);
                } catch (createErr) {
                    // If unique constraint, retry lookup
                    if (createErr.message?.toLowerCase().includes('unique') || createErr.code === 'UNIQUE_CONSTRAINT') {
                        console.log(`[${errorId}] [STEP: user_create] Unique constraint - retrying lookup...`);
                        try {
                            const retryUsers = await base44.asServiceRole.entities.User.filter({ email: normalizedEmail });
                            if (retryUsers && retryUsers.length > 0) {
                                user = retryUsers[0];
                                console.log(`[${errorId}] [STEP: user_create] ✓ Found on retry: ${user.id}`);
                            } else {
                                throw new Error('Retry lookup also failed');
                            }
                        } catch (retryErr) {
                            console.error(`[${errorId}] [STEP: user_create] Retry failed:`, retryErr.message);
                            return Response.json({
                                error: 'Failed to create user account',
                                step: 'user_create',
                                errorId
                            }, { status: 503 });
                        }
                    } else {
                        // Other DB error
                        console.error(`[${errorId}] [STEP: user_create] Error:`, createErr.message);
                        return Response.json({
                            error: 'Failed to create user account',
                            step: 'user_create',
                            errorId
                        }, { status: 503 });
                    }
                }
            }
        } catch (userErr) {
            console.error(`[${errorId}] [STEP: user_lookup] Unexpected error:`, userErr.message);
            console.error(`[${errorId}] [STEP: user_lookup] Stack:`, userErr.stack);
            return Response.json({ 
                error: 'Failed to create or find user',
                step: 'user_lookup',
                errorId
            }, { status: 503 });
        }
        
        const userToReturn = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            status: user.status
        };

        console.log(`[${errorId}] [STEP: response] Success, user: ${user.id}`);
        return Response.json({ user: userToReturn });

        } catch (error) {
            console.error(`[${errorId}] [STEP: unexpected_error] Error:`, error?.message);
            console.error(`[${errorId}] [STEP: unexpected_error] Stack:`, error?.stack);

            // Log to telemetry
            try {
                await logAuthError(base44, errorId, 'googleAuthCallback', 'unexpected', 
                  error?.message || 'Unknown error', 503, normalizedEmail || null);
            } catch (_) {}

            return Response.json({ 
                error: 'Authentication failed',
                step: 'unexpected',
                errorId
            }, { status: 503 });
        }
        });