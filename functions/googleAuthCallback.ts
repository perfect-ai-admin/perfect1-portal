import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const JWT_SECRET = Deno.env.get('JWT_SECRET');
const BASE_URL = Deno.env.get('BASE_URL');

// Simple JWT creation (or use a library like jose)
async function createJWT(payload) {
    const encoder = new TextEncoder();
    const header = { alg: 'HS256', typ: 'JWT' };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const keyData = encoder.encode(JWT_SECRET);
    
    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, data);
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
    
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const url = new URL(req.url);
        
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        
        if (!code || !state) {
            console.error('Missing code or state');
            return new Response(null, {
                status: 302,
                headers: { 'Location': '/ClientLogin?error=missing_params' }
            });
        }
        
        console.log('Google auth callback - code received, exchanging for tokens...');
        
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: `${BASE_URL.replace(/\/$/, '')}/functions/googleAuthCallback`,
                grant_type: 'authorization_code'
            })
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', tokenResponse.status, errorData);
            return new Response(null, {
                status: 302,
                headers: { 'Location': '/ClientLogin?error=token_exchange_failed' }
            });
        }
        
        const tokens = await tokenResponse.json();
        console.log('Tokens received successfully');
        
        if (!tokens.id_token) {
            console.error('No id_token in response');
            return new Response(null, {
                status: 302,
                headers: { 'Location': '/ClientLogin?error=no_id_token' }
            });
        }
        
        // Decode id_token
        const idTokenParts = tokens.id_token.split('.');
        const payload = JSON.parse(atob(idTokenParts[1]));
        
        const { email, name } = payload;
        
        if (!email) {
            console.error('No email in token');
            return new Response(null, {
                status: 302,
                headers: { 'Location': '/ClientLogin?error=no_email' }
            });
        }
        
        console.log('Email from Google:', email);
        
        // Find or create user
        let user;
        
        try {
            const usersByEmail = await base44.asServiceRole.entities.User.filter({ email });
            
            if (usersByEmail.length > 0) {
                user = usersByEmail[0];
                console.log('User exists:', user.id);
                await base44.asServiceRole.entities.User.update(user.id, {
                    last_login_at: new Date().toISOString()
                });
            } else {
                console.log('Creating new user for:', email);
                const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
                const freePlan = freePlans.length > 0 ? freePlans[0] : null;

                const fullName = name && name.trim() ? name : email.split('@')[0] || 'משתמש חדש';
                user = await base44.asServiceRole.entities.User.create({
                    full_name: fullName,
                    email,
                    login_provider: 'google',
                    status: 'active',
                    last_login_at: new Date().toISOString(),
                    current_plan_id: freePlan?.id || null,
                    plan_start_date: new Date().toISOString(),
                    marketing_enabled: freePlan?.marketing_enabled || false,
                    mentor_enabled: freePlan?.mentor_enabled || true,
                    finance_enabled: freePlan?.finance_enabled || false,
                    goals_limit: freePlan?.goals_limit || 1,
                    max_active_goals: freePlan?.max_active_goals || 1,
                    phone: '',
                    business_journey_completed: false
                });
                console.log('User created:', user.id);
            }
        } catch (dbError) {
            console.error('Database error:', dbError);
            throw dbError;
        }
        
        console.log('Preparing redirect with user data');
        
        const userJson = JSON.stringify(user);
        const encodedUser = btoa(userJson);
        const redirectUrl = `/ClientLogin?authData=${encodedUser}`;
        
        console.log('Redirecting to:', redirectUrl);

        return new Response(null, {
            status: 302,
            headers: { 
                'Location': redirectUrl,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        
    } catch (error) {
        console.error('Google auth callback error:', error.message, error.stack);
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});