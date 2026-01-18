import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const BASE_URL = Deno.env.get('BASE_URL');

Deno.serve(async (req) => {
    try {
        const body = await req.json();
        const code = body.code;
        
        if (!code) {
            console.error('Missing code');
            return Response.json({ error: 'Missing authorization code' }, { status: 400 });
        }
        
        console.log('Exchanging Google code for tokens...');
        
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
            console.error('Token exchange failed:', tokenResponse.status, errorData);
            return Response.json({ error: 'Token exchange failed', details: errorData }, { status: 400 });
        }
        
        const tokens = await tokenResponse.json();
        console.log('Tokens received successfully');
        
        if (!tokens.id_token) {
            console.error('No id_token in response');
            return Response.json({ error: 'No id_token in response' }, { status: 400 });
        }
        
        // Decode id_token
        const idTokenParts = tokens.id_token.split('.');
        const payload = JSON.parse(atob(idTokenParts[1]));
        
        const { email, name } = payload;
        
        if (!email) {
            console.error('No email in token');
            return Response.json({ error: 'No email in token' }, { status: 400 });
        }
        
        console.log('Email from Google:', email);
        
        // Create user object
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
        
        console.log('User prepared successfully');
        
        return Response.json({ user });
        
    } catch (error) {
        console.error('Google auth callback error:', error.message, error.stack);
        return Response.json({ error: error.message }, { status: 500 });
    }
});