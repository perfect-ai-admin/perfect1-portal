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
        
        // Create user object for client storage
        const fullName = name && name.trim() ? name : email.split('@')[0] || 'משתמש חדש';
        const user = {
            email,
            full_name: fullName,
            login_provider: 'google',
            status: 'active',
            last_login_at: new Date().toISOString(),
            phone: '',
            business_journey_completed: false
        };
        
        console.log('Preparing redirect with user data');
        
        const userJson = JSON.stringify(user);
        const encodedUser = btoa(userJson);
        const redirectUrl = `/ClientDashboard?authData=${encodedUser}`;
        
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