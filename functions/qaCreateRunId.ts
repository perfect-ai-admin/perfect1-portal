import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const runId = crypto.randomUUID().split('-')[0]; // short uuid segment

    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'qa.create_run_id',
      response_data: { runId },
      success: true
    });

    return Response.json({ runId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});