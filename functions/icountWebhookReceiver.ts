import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * iCount Webhook Receiver
 * Receives webhook events from iCount and enqueues sync jobs.
 * 
 * iCount webhooks support: doc created, doc updated, client updated, expense created, etc.
 * Each webhook sends a JSON payload to this endpoint.
 * 
 * Authentication: Uses a shared secret in query param (?secret=...)
 * or ICOUNT_WEBHOOK_SECRET env var for validation.
 */

const WEBHOOK_SECRET = Deno.env.get("ICOUNT_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  try {
    // Validate webhook secret
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    
    if (WEBHOOK_SECRET && WEBHOOK_SECRET !== 'placeholder' && secret !== WEBHOOK_SECRET) {
      return Response.json({ error: 'Invalid webhook secret' }, { status: 403 });
    }

    const body = await req.json();
    
    // iCount webhook payload typically includes:
    // { action, cid, doctype, docnum, client_id, expense_id, ... }
    const { action, cid } = body;

    if (!action || !cid) {
      return Response.json({ error: 'Missing action or cid' }, { status: 400 });
    }

    // Use service role since this is a webhook (no user auth)
    const base44 = createClientFromRequest(req);

    // Find connection by cid (provider_account_id)
    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      provider: 'icount',
      provider_account_id: cid
    });

    if (!connections?.length) {
      return Response.json({ error: 'No connection found for this cid' }, { status: 404 });
    }

    const conn = connections[0];

    // Determine sync resource based on action
    let jobType = null;
    if (action.startsWith('doc_')) jobType = 'pull_documents';
    else if (action.startsWith('client_')) jobType = 'pull_customers';
    else if (action.startsWith('expense_')) jobType = 'pull_expenses';

    if (jobType) {
      await base44.asServiceRole.entities.FinbotSyncJob.create({
        user_id: conn.user_id,
        job_type: jobType,
        status: 'queued',
        scheduled_at: new Date().toISOString()
      });
    }

    // Audit log
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: conn.user_id,
      action: `icount.webhook.${action}`,
      request_data: body,
      success: true
    });

    return Response.json({ status: 'ok', job_type: jobType });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});