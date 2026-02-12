import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Unified connection status function.
 * Returns the user's active accounting connection status with sync counts.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const connections = await base44.entities.AccountingConnection.filter({
      user_id: user.id,
      status: 'connected'
    });

    if (!connections?.length) {
      return Response.json({ connected: false });
    }

    const connection = connections[0];
    const provider = connection.provider;

    // Get sync counts
    const [customers, documents, expenses] = await Promise.all([
      base44.entities.AccountingCustomer.filter({ user_id: user.id, provider }),
      base44.entities.AccountingDocument.filter({ user_id: user.id, provider }),
      base44.entities.AccountingExpense.filter({ user_id: user.id, provider }),
    ]);

    return Response.json({
      connected: true,
      provider,
      status: connection.status,
      provider_account_id: connection.provider_account_id,
      last_sync_at: connection.last_sync_at,
      last_error: connection.last_error,
      inbound_sync_enabled: connection.inbound_sync_enabled,
      config: connection.config,
      sync_counts: {
        customers: customers?.length || 0,
        documents: documents?.length || 0,
        expenses: expenses?.length || 0,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});