import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || !user.is_admin) {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { user_id, updates } = await req.json();

        if (!user_id || !updates) {
            return Response.json({ error: 'Missing user_id or updates' }, { status: 400 });
        }

        // Update user with service role
        await base44.asServiceRole.entities.User.update(user_id, updates);

        // Log activity
        await base44.asServiceRole.entities.ActivityLog.create({
            user_id: user_id,
            activity_type: 'admin_action',
            description: `המנהל ${user.full_name} עדכן את המשתמש`,
            performed_by: user.id,
            details: updates
        });

        return Response.json({
            success: true,
            message: 'המשתמש עודכן בהצלחה'
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});