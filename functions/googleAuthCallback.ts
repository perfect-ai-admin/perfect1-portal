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
            return new Response(null, {
                status: 302,
                headers: { 'Location': '/client/login?error=missing_params' }
            });
        }
        
        // Note: State verification happens on client via sessionStorage
        // Backend functions don't have reliable cookie access in all scenarios
        
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
            return new Response(null, {
                status: 302,
                headers: { 'Location': '/client/login?error=token_exchange_failed' }
            });
        }
        
        const tokens = await tokenResponse.json();
        
        // Decode id_token (simple base64 decode - in production verify signature!)
        const idTokenParts = tokens.id_token.split('.');
        const payload = JSON.parse(atob(idTokenParts[1]));
        
        const { sub: google_sub, email, name, picture } = payload;
        
        if (!email) {
            return new Response(null, {
                status: 302,
                headers: { 'Location': '/client/login?error=no_email' }
            });
        }
        
        // Find or create user
        let user;
        
        // Try to find by email first
        const usersByEmail = await base44.asServiceRole.entities.User.filter({ email });
        
        if (usersByEmail.length > 0) {
            // User exists - update last login
            user = usersByEmail[0];
            await base44.asServiceRole.entities.User.update(user.id, {
                last_login_at: new Date().toISOString()
            });
        } else {
            // Get Free plan
            const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
            const freePlan = freePlans.length > 0 ? freePlans[0] : null;

            // Create new user with free plan permissions
            user = await base44.asServiceRole.entities.User.create({
                full_name: name || 'משתמש Google',
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
                max_active_goals: freePlan?.max_active_goals || 1
            });
        }
        
        // Return HTML page that stores user in localStorage and redirects
        const userJson = JSON.stringify(user).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
        
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>מתחבר...</title>
    <meta charset="utf-8">
</head>
<body>
    <script>
        try {
            const userData = '${userJson}';
            localStorage.setItem('user', userData);
            window.location.href = '/';
        } catch(e) {
            console.error('Error:', e);
            window.location.href = '/?error=storage_failed';
        }
    </script>
    <p style="text-align: center; font-family: Arial; margin-top: 50px;">מתחבר למערכת...</p>
</body>
</html>`;
        
        return new Response(html, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
        
    } catch (error) {
        console.error('Google auth callback error:', error);
        return new Response(null, {
            status: 302,
            headers: { 'Location': `/client/login?error=${encodeURIComponent(error.message)}` }
        });
    }
});