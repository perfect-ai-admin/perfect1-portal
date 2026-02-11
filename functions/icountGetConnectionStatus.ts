import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      user_id: user.id,
      provider: 'icount'
    });

    if (!connections || connections.length === 0) {
      return Response.json({
        connected: false,
        status: 'disconnected',
        strategy: null,
        last_sync_at: null,
        last_error: null
      });
    }

    const conn = connections[0];
    return Response.json({
      connected: conn.status === 'connected',
      status: conn.status,
      strategy: conn.strategy,
      provider_account_id: conn.provider_account_id,
      company_name: conn.config?.company_name || null,
      last_sync_at: conn.last_sync_at,
      last_error: conn.last_error
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});