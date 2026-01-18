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
        const fullName = name && name.trim() ? name : email.split('@')[0] || 'משתמש חדש';
        
        // Get free plan - MUST exist or create placeholder
        let freePlan = null;
        try {
            const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
            freePlan = freePlans.length > 0 ? freePlans[0] : null;
            console.log('Free plan found:', freePlan?.id);
        } catch (planErr) {
            console.error('Plan filter error:', planErr);
        }

        // If no free plan exists, create one as fallback
        if (!freePlan) {
            try {
                console.log('Creating fallback free plan...');
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
                console.log('Fallback plan created:', freePlan.id);
            } catch (createPlanErr) {
                console.error('Failed to create fallback plan:', createPlanErr.message);
                throw new Error('System configuration error: cannot create free plan');
            }
        }

        // Find or create user in database
        let user;
        const existingUsers = await base44.asServiceRole.entities.User.filter({ email });

        if (existingUsers.length > 0) {
            user = existingUsers[0];
            console.log('Google user exists, updating login:', user.id);
            await base44.asServiceRole.entities.User.update(user.id, {
                last_login_at: new Date().toISOString()
            });
        } else {
            console.log('Creating new Google user:', email);
            user = await base44.asServiceRole.entities.User.create({
                email,
                full_name: fullName,
                phone: '0000000000',
                status: 'active',
                login_provider: 'google',
                last_login_at: new Date().toISOString(),
                current_plan_id: freePlan.id,
                plan_start_date: new Date().toISOString(),
                marketing_enabled: false,
                mentor_enabled: true,
                finance_enabled: false,
                goals_limit: 1,
                max_active_goals: 1
            });
            console.log('New Google user created:', user.id);
        }
        
        const userToReturn = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            status: user.status
        };
        
        console.log('User prepared successfully');
        
        return Response.json({ user: userToReturn });
        
    } catch (error) {
        console.error('Google auth callback error - FULL STACK:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        return Response.json({ 
            error: 'Authentication failed',
            step: 'user_creation',
            details: error?.message || 'Unknown error',
            stack: error?.stack
        }, { status: 500 });
    }
});