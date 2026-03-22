import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const JWT_SECRET = Deno.env.get('JWT_SECRET');

async function verifyJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(atob(parts[1]));
        
        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        
        return payload;
    } catch {
        return null;
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Get token from cookie
        const cookies = req.headers.get('cookie') || '';
        const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('auth_token='));
        const token = tokenCookie?.split('=')[1];
        
        if (!token) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Verify JWT
        const payload = await verifyJWT(token);
        if (!payload || !payload.user_id) {
            return Response.json({ error: 'Invalid token' }, { status: 401 });
        }
        
        // Get user from DB
        const users = await base44.asServiceRole.entities.User.filter({ id: payload.user_id });
        
        if (users.length === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }
        
        const user = users[0];
        
        if (!user.is_active) {
            return Response.json({ error: 'User inactive' }, { status: 403 });
        }
        
        // Return user data (without sensitive info)
        return Response.json({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            google_picture: user.google_picture,
            role: user.role
        });
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});