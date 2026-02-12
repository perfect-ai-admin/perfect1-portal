import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Check ICOUNT_BASE_URL secret
    const icountUrl = Deno.env.get("ICOUNT_BASE_URL");
    if (!icountUrl) {
      return Response.json({ ok: false, reason: "MISSING_ICOUNT_BASE_URL", details: "ICOUNT_BASE_URL not configured in secrets" });
    }

    // Check AccountingConnection for this user
    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      user_id: user.id,
      provider: 'icount'
    });

    if (!connections || connections.length === 0) {
      return Response.json({ ok: false, reason: "NOT_CONNECTED", details: "No iCount connection found for this user" });
    }

    const conn = connections[0];
    if (conn.status !== 'connected') {
      return Response.json({ ok: false, reason: "NOT_CONNECTED_STATUS", status: conn.status, details: `Connection status is '${conn.status}', expected 'connected'` });
    }

    // Log preflight check
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'qa.preflight',
      entity_type: 'AccountingConnection',
      entity_id: conn.id,
      response_data: { status: conn.status, provider_account_id: conn.provider_account_id },
      success: true
    });

    return Response.json({
      ok: true,
      connection_id: conn.id,
      provider_account_id: conn.provider_account_id,
      last_sync_at: conn.last_sync_at
    });

  } catch (error) {
    return Response.json({ ok: false, reason: "ERROR", details: error.message }, { status: 500 });
  }
});