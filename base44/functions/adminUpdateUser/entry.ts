import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { user_id, updates, delete_goal_id } = await req.json();

    // Handle goal deletion from admin
    if (delete_goal_id) {
      if (!user_id) {
        return Response.json({ error: 'Missing user_id' }, { status: 400 });
      }
      await base44.asServiceRole.entities.UserGoal.delete(delete_goal_id);
      return Response.json({ success: true, deleted_goal: delete_goal_id });
    }

    if (!user_id || !updates) {
      return Response.json({ error: 'Missing user_id or updates' }, { status: 400 });
    }

    // Sync role with is_admin
    if (typeof updates.is_admin === 'boolean') {
        updates.role = updates.is_admin ? 'admin' : 'user';
    }

    // Update user using service role
    await base44.asServiceRole.entities.User.update(user_id, updates);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});