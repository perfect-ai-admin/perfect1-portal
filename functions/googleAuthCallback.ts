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
                redirect_uri: `${BASE_URL}/googleAuthCallback`,
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
        
        // First try to find by google_sub
        const usersBySub = await base44.asServiceRole.entities.User.filter({ google_sub });
        
        if (usersBySub.length > 0) {
            // User exists with this google account
            user = usersBySub[0];
            await base44.asServiceRole.entities.User.update(user.id, {
                last_login_at: new Date().toISOString(),
                google_picture: picture,
                full_name: name || user.full_name
            });
        } else {
            // Try to find by email
            const usersByEmail = await base44.asServiceRole.entities.User.filter({ email });
            
            if (usersByEmail.length > 0) {
                // Link existing email account to Google
                user = usersByEmail[0];
                await base44.asServiceRole.entities.User.update(user.id, {
                    google_sub,
                    auth_provider: 'google',
                    google_picture: picture,
                    last_login_at: new Date().toISOString(),
                    full_name: name || user.full_name
                });
            } else {
                // Create new user
                user = await base44.asServiceRole.entities.User.create({
                    email,
                    full_name: name,
                    google_sub,
                    google_picture: picture,
                    auth_provider: 'google',
                    is_active: true,
                    last_login_at: new Date().toISOString(),
                    role: 'user'
                });
            }
        }
        
        // Create JWT session
        const jwtPayload = {
            user_id: user.id,
            email: user.email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
        };
        
        const token = await createJWT(jwtPayload);
        
        // Set session cookie and redirect to dashboard
        const headers = new Headers({
            'Location': '/client/dashboard',
            'Set-Cookie': `auth_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`
        });
        
        return new Response(null, {
            status: 302,
            headers: headers
        });
        
    } catch (error) {
        console.error('Google auth callback error:', error);
        return new Response(null, {
            status: 302,
            headers: { 'Location': `/client/login?error=${encodeURIComponent(error.message)}` }
        });
    }
});