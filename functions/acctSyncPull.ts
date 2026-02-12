import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Unified sync-pull function.
 * Reads the user's active AccountingConnection, then delegates to the correct provider sync.
 * Input: { resource: "customers" | "documents" | "expenses" | "all" }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { resource } = await req.json();
    if (!resource) return Response.json({ error: 'resource is required' }, { status: 400 });

    // Get active connection
    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      user_id: user.id, status: 'connected'
    });
    if (!connections?.length) {
      return Response.json({ error: 'אין חיבור פעיל למערכת חשבונות' }, { status: 400 });
    }
    const connection = connections[0];
    const provider = connection.provider;

    // Delegate to provider-specific sync function
    const providerSyncMap = {
      icount: 'icountSyncPull',
      finbot: 'finbotSyncPull',
      morning: 'morningSyncPull',
    };

    const syncFn = providerSyncMap[provider];
    if (!syncFn) {
      return Response.json({ error: `סנכרון עדיין לא נתמך עבור ${provider}` }, { status: 400 });
    }

    // If "all", sync customers, documents, expenses sequentially
    if (resource === 'all') {
      const results = {};
      for (const res of ['customers', 'documents', 'expenses']) {
        try {
          const r = await base44.functions.invoke(syncFn, { resource: res });
          results[res] = r?.data?.synced_count || r?.synced_count || 0;
        } catch (e) {
          console.log(`Sync ${res} error:`, e.message);
          results[res] = 0;
        }
      }
      // Update last_sync_at
      await base44.asServiceRole.entities.AccountingConnection.update(connection.id, {
        last_sync_at: new Date().toISOString()
      });
      return Response.json({ status: 'success', provider, results });
    }

    // Single resource sync
    const result = await base44.functions.invoke(syncFn, { resource });

    // Update last_sync_at
    await base44.asServiceRole.entities.AccountingConnection.update(connection.id, {
      last_sync_at: new Date().toISOString()
    });

    return Response.json({
      status: 'success',
      provider,
      synced_count: result?.synced_count || 0,
      job_id: result?.job_id,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'error' }, { status: 500 });
  }
});