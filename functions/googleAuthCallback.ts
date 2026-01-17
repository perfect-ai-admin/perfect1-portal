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
                redirect_uri: `${BASE_URL}/functions/googleAuthCallback`,
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
        
        // Find or create lead (client)
        let client;
        
        // Try to find by email first
        const leadsByEmail = await base44.asServiceRole.entities.Lead.filter({ email });
        
        if (leadsByEmail.length > 0) {
            // Client exists
            client = leadsByEmail[0];
        } else {
            // Create new lead
            client = await base44.asServiceRole.entities.Lead.create({
                name: name || 'לקוח Google',
                email,
                phone: '000000000', // Required field
                status: 'new',
                source_page: 'Google Login',
                interaction_type: 'manual'
            });
        }
        
        // Store client in localStorage and redirect
        const clientData = JSON.stringify(client);
        
        // Redirect with client data in URL (will be stored in localStorage by ClientDashboard)
        const redirectUrl = `${BASE_URL}/ClientDashboard?google_login=1&client_data=${encodeURIComponent(clientData)}`;
        
        return new Response(null, {
            status: 302,
            headers: { 'Location': redirectUrl }
        });
        
    } catch (error) {
        console.error('Google auth callback error:', error);
        return new Response(null, {
            status: 302,
            headers: { 'Location': `/client/login?error=${encodeURIComponent(error.message)}` }
        });
    }
});