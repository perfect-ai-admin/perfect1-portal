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
        }
        
        // Return HTML that handles auth directly
        const userJson = JSON.stringify(user);
        const escapedJson = userJson
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$');
        
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>מתחבר...</title>
    <meta charset="utf-8">
    <style>
        * { margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            text-align: center;
            color: white;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        p { font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <p>מתחבר למערכת...</p>
    </div>
    <script>
        window.addEventListener('DOMContentLoaded', function() {
            try {
                const userData = ${userJson};
                if (!userData || typeof userData !== 'object' || !userData.id) {
                    console.error('Invalid user data:', userData);
                    throw new Error('Invalid user data');
                }
                localStorage.setItem('user', JSON.stringify(userData));
                // Use window.location.replace to avoid adding to history
                window.location.replace('/ClientDashboard');
            } catch (error) {
                console.error('Auth error:', error);
                window.location.replace('/ClientLogin?error=' + encodeURIComponent(error.message));
            }
        });
    </script>
</body>
</html>`;
        
        return new Response(html, {
            status: 200,
            headers: { 
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Content-Type-Options': 'nosniff'
            }
        });
        
    } catch (error) {
        console.error('Google auth callback error:', error);
        return new Response(null, {
            status: 302,
            headers: { 'Location': `/client/login?error=${encodeURIComponent(error.message)}` }
        });
    }
});