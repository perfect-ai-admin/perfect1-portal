import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Handle CORS preflight if needed, though SDK handles it usually.
        // Get payload
        const payload = await req.json().catch(() => ({}));
        const { bypassCode, phone } = payload;
        
        // Check authentication - must be admin
        const user = await base44.auth.me().catch(() => null);
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - admin only' }, { status: 403 });
        }

        // Fetch all users using service role
        const users = await base44.asServiceRole.entities.User.list();
        
        return Response.json({ users });

    } catch (error) {
        console.error('Error listing users:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});