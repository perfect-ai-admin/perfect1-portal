import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { user_id, updates } = await req.json();

    if (!user_id || !updates) {
      return Response.json({ error: 'Missing user_id or updates' }, { status: 400 });
    }

    // Update user using service role
    await base44.asServiceRole.entities.User.update(user_id, updates);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});