import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        const { email, role } = await req.json();

        await base44.users.inviteUser(email, role || 'user');

        return Response.json({ 
            success: true, 
            message: `User ${email} invited successfully as ${role || 'user'}` 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});