import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const body = await req.json();
    const { runId } = body;
    if (!runId) return Response.json({ error: 'runId is required' }, { status: 400 });

    const tag = `QA_RUN:${runId}`;
    let deletedCustomers = 0;
    let deletedDocuments = 0;

    // Clean up local FinbotCustomer records with QA tag
    const customers = await base44.asServiceRole.entities.FinbotCustomer.filter({ user_id: user.id, provider: 'icount' });
    for (const c of customers) {
      if (c.notes?.includes(tag) || c.name?.includes(runId)) {
        await base44.asServiceRole.entities.FinbotCustomer.delete(c.id);
        deletedCustomers++;
      }
    }

    // Clean up local FinbotDocument records with QA tag
    const documents = await base44.asServiceRole.entities.FinbotDocument.filter({ user_id: user.id, provider: 'icount' });
    for (const d of documents) {
      if (d.notes?.includes(tag)) {
        await base44.asServiceRole.entities.FinbotDocument.delete(d.id);
        deletedDocuments++;
      }
    }

    // Log cleanup
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'qa.cleanup',
      request_data: { runId },
      response_data: { deletedCustomers, deletedDocuments },
      success: true
    });

    return Response.json({ ok: true, deletedCounts: { customers: deletedCustomers, documents: deletedDocuments } });

  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});