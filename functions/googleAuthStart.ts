import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const BASE_URL = Deno.env.get('BASE_URL');

Deno.serve(async (req) => {
    try {
        // Generate random state for CSRF protection
        const state = crypto.randomUUID();
        
        // Build Google OAuth URL
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: `${BASE_URL}/googleAuthCallback`,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'online',
            prompt: 'select_account',
            state: state
        });
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        
        // Return the URL to the client
        return Response.json({ 
            url: googleAuthUrl,
            state: state 
        });
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});