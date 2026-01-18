import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const BASE_URL = Deno.env.get('BASE_URL');

Deno.serve(async (req) => {
    try {
        let base44;
        let body;
        
        try {
            base44 = createClientFromRequest(req);
            body = await req.json();
        } catch (parseErr) {
            console.error('[STEP: request_parse] Error:', parseErr);
            return Response.json({ error: 'Invalid request', step: 'request_parse' }, { status: 400 });
        }
        const code = body.code;
        
        if (!code) {
            console.error('[STEP: code_validation] Missing code');
            return Response.json({ error: 'Missing authorization code', step: 'code_validation' }, { status: 400 });
        }
        
        console.log('[STEP: token_exchange] Starting...');
        
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('[STEP: token_exchange] Failed:', tokenResponse.status, errorData);
            return Response.json({ error: 'Token exchange failed', step: 'token_exchange', details: errorData }, { status: 400 });
        }
        
        const tokens = await tokenResponse.json();
        console.log('[STEP: token_exchange] Success - tokens received');
        
        if (!tokens.id_token) {
            console.error('[STEP: token_validation] No id_token in response');
            return Response.json({ error: 'No id_token in response', step: 'token_validation' }, { status: 400 });
        }
        
        // Decode id_token
        const idTokenParts = tokens.id_token.split('.');
        const payload = JSON.parse(atob(idTokenParts[1]));
        
        const { email, name, sub } = payload;
        
        if (!email) {
            console.error('[STEP: token_parse] No email in token');
            return Response.json({ error: 'No email in token', step: 'token_parse' }, { status: 400 });
        }
        
        const normalizedEmail = email.trim().toLowerCase();
        console.log('[STEP: token_parse] Email:', normalizedEmail, 'GoogleSub:', sub);
        
        // Create user object
        const fullName = name && name.trim() ? name : normalizedEmail.split('@')[0] || 'משתמש חדש';
        
        // Get free plan - with retry
        let freePlan = null;
        const MAX_PLAN_RETRIES = 2;
        
        for (let attempt = 0; attempt < MAX_PLAN_RETRIES; attempt++) {
            try {
                console.log(`[STEP: plan_lookup] Attempt ${attempt + 1}/${MAX_PLAN_RETRIES}...`);
                const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
                if (freePlans.length > 0) {
                    freePlan = freePlans[0];
                    console.log('[STEP: plan_lookup] Found existing plan:', freePlan.id);
                    break;
                } else {
                    console.log('[STEP: plan_lookup] No plan found, creating new one...');
                }
            } catch (lookupErr) {
                console.error(`[STEP: plan_lookup] Lookup attempt ${attempt + 1} failed:`, lookupErr.message);
                if (attempt === MAX_PLAN_RETRIES - 1) {
                    console.error('[STEP: plan_lookup] Max retries reached');
                }
            }
            
            // Try to create plan
            if (!freePlan) {
                try {
                    console.log('[STEP: plan_creation] Creating fallback plan...');
                    freePlan = await base44.asServiceRole.entities.Plan.create({
                        name: 'חינמי',
                        name_en: 'Free',
                        price: 0,
                        billing_type: 'monthly',
                        marketing_enabled: false,
                        mentor_enabled: true,
                        finance_enabled: false,
                        goals_limit: 1,
                        max_active_goals: 1,
                        is_active: true,
                        display_order: 0
                    });
                    console.log('[STEP: plan_creation] Success, plan ID:', freePlan.id);
                    break;
                } catch (createErr) {
                    console.error(`[STEP: plan_creation] Attempt ${attempt + 1} failed:`, createErr.message);
                }
            }
        }
        
        // If still no plan, HARD FAIL - plan MUST exist
        if (!freePlan) {
            console.error('[STEP: plan_fallback] CRITICAL: Could not find or create free plan');
            return Response.json({
                error: 'System configuration error: free plan not available',
                step: 'plan_creation',
                details: 'Free plan could not be created or found'
            }, { status: 503 });
        }

        // Find or create user - with detailed validation
        let user;
        try {
            console.log('[STEP: user_lookup] Searching for user:', normalizedEmail);
            
            // Try to find existing user
            let existingUsers = [];
            try {
                existingUsers = await base44.asServiceRole.entities.User.filter({ email: normalizedEmail });
                console.log('[STEP: user_lookup] Query result:', existingUsers.length, 'users found');
            } catch (filterErr) {
                console.error('[STEP: user_lookup] Filter error:', filterErr.message);
                // Continue - might be permission issue for new users
            }

            if (existingUsers.length > 0) {
                // User exists - use existing
                user = existingUsers[0];
                console.log('[STEP: user_exists] User already exists, ID:', user.id);
                
                // Try to update last login (non-critical)
                try {
                    await base44.asServiceRole.entities.User.update(user.id, {
                        last_login_at: new Date().toISOString()
                    });
                    console.log('[STEP: user_update] Last login updated');
                } catch (updateErr) {
                    console.warn('[STEP: user_update] Non-critical: could not update last_login_at:', updateErr.message);
                }
            } else {
                // NEW USER - ATOMIC UPSERT (find-or-create)
                console.log('[STEP: user_create] Attempting atomic create or find for:', normalizedEmail);
                
                const now = new Date().toISOString();
                const newUserData = {
                    email: normalizedEmail,
                    full_name: fullName,
                    phone: '0000000000',
                    status: 'active',
                    login_provider: 'google',
                    last_login_at: now,
                    current_plan_id: freePlan.id,
                    plan_start_date: now,
                    marketing_enabled: false,
                    mentor_enabled: true,
                    finance_enabled: false,
                    goals_limit: 1,
                    max_active_goals: 1
                };
                
                console.log('[STEP: user_create] Fields to create:', Object.keys(newUserData).join(', '));
                
                try {
                    user = await base44.asServiceRole.entities.User.create(newUserData);
                    console.log('[STEP: user_create] ✓ User created, ID:', user.id);
                } catch (createErr) {
                    // If unique constraint fails, user likely already exists
                    if (createErr.message?.includes('unique') || createErr.message?.includes('UNIQUE') || createErr.code === 'UNIQUE_CONSTRAINT') {
                        console.log('[STEP: user_create] User already exists (UNIQUE constraint), fetching...');
                        const retryUsers = await base44.asServiceRole.entities.User.filter({ email: normalizedEmail });
                        if (retryUsers && retryUsers.length > 0) {
                            user = retryUsers[0];
                            console.log('[STEP: user_create] ✓ User found on retry, ID:', user.id);
                        } else {
                            throw new Error('User creation failed and re-fetch also failed');
                        }
                    } else {
                        console.error('[STEP: user_create] Create failed:', createErr.message);
                        throw createErr;
                    }
                }
            }
        } catch (userErr) {
            console.error('[STEP: user_lookup/create] CRITICAL ERROR:', userErr.message);
            console.error('[STEP: user_lookup/create] Stack:', userErr.stack);
            console.error('[STEP: user_lookup/create] Full error object:', JSON.stringify(userErr, null, 2));
            return Response.json({ 
                error: 'Failed to create or find user',
                step: 'user_lookup',
                message: userErr.message,
                details: userErr.toString()
            }, { status: 500 });
        }
        
        const userToReturn = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            status: user.status
        };
        
        console.log('[STEP: response] User prepared successfully:', user.id);
        return Response.json({ user: userToReturn });
        
    } catch (error) {
        console.error('[STEP: unexpected_error] Full error:', error);
        console.error('[STEP: unexpected_error] Message:', error?.message);
        console.error('[STEP: unexpected_error] Stack:', error?.stack);
        return Response.json({ 
            error: 'Authentication failed',
            step: 'unexpected',
            details: error?.message || 'Unknown error'
        }, { status: 500 });
    }
});