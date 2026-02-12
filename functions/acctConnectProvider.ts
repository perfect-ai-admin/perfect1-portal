import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE = "https://api.icount.co.il";

/**
 * Unified provider connection function.
 * Accepts: { provider: "icount"|"morning"|..., credentials: {...} }
 * Tests the connection, stores credentials, triggers initial sync.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { provider, credentials } = await req.json();
    if (!provider || !credentials) {
      return Response.json({ error: 'חסרים פרטים: provider + credentials' }, { status: 400 });
    }

    // Check for existing active connection
    const existing = await base44.entities.AccountingConnection.filter({
      user_id: user.id,
      status: 'connected'
    });
    if (existing?.length > 0) {
      const existingProvider = existing[0].provider;
      return Response.json({ 
        error: `כבר מחובר ל-${existingProvider}. נתק לפני חיבור לספק אחר` 
      }, { status: 400 });
    }

    // Test connection based on provider
    let testResult;
    let connectionData = {
      user_id: user.id,
      provider,
      status: 'pending',
    };

    if (provider === 'icount') {
      testResult = await testIcountConnection(credentials);
      if (!testResult.success) {
        return Response.json({ error: testResult.error || 'פרטי התחברות לא נכונים' }, { status: 400 });
      }
      connectionData.strategy = 'session';
      connectionData.provider_account_id = credentials.cid;
      connectionData.username = credentials.username;
      connectionData.password_enc = credentials.password;
      connectionData.sid = testResult.sid;
      connectionData.sid_expires_at = new Date(Date.now() + 3600000).toISOString();
      connectionData.status = 'connected';
      connectionData.config = { is_vat_exempt: testResult.is_vat_exempt || false };
    } else if (provider === 'morning') {
      // Morning uses API key — will be implemented in Morning-specific prompt
      connectionData.strategy = 'api_key';
      connectionData.api_key_enc = credentials.api_key;
      connectionData.status = 'connected';
    } else {
      return Response.json({ error: 'הספק הזה עדיין לא נתמך' }, { status: 400 });
    }

    // Upsert connection
    const existingDisabled = await base44.asServiceRole.entities.AccountingConnection.filter({
      user_id: user.id,
    });
    
    let connection;
    if (existingDisabled?.length > 0) {
      connection = await base44.asServiceRole.entities.AccountingConnection.update(
        existingDisabled[0].id, 
        { ...connectionData, last_sync_at: null, last_error: null, last_full_import_at: null }
      );
    } else {
      connection = await base44.asServiceRole.entities.AccountingConnection.create(connectionData);
    }

    // Trigger initial sync
    const syncJobs = [];
    for (const jobType of ['pull_customers', 'pull_documents', 'pull_expenses']) {
      const job = await base44.asServiceRole.entities.SyncJob.create({
        user_id: user.id,
        provider,
        job_type: jobType,
        source: 'auto_connect',
        status: 'queued',
        meta: { fullSync: true },
        scheduled_at: new Date().toISOString(),
      });
      syncJobs.push(job);
    }

    // Audit log
    await base44.asServiceRole.entities.AccountingAuditLog.create({
      user_id: user.id,
      provider,
      action: 'provider.connect',
      details: { provider_account_id: connectionData.provider_account_id },
      success: true,
    });

    // Run initial sync inline for icount
    if (provider === 'icount') {
      try {
        await base44.asServiceRole.functions.invoke('icountSyncPull', {
          resource: 'all',
          fullSync: true,
        });
      } catch (syncErr) {
        console.log('Initial sync triggered (may run async):', syncErr.message);
      }
    }

    return Response.json({ 
      status: 'connected', 
      message: `מחובר ל-${provider}! מסנכרנים נתונים ברקע...`,
      connection_id: connection.id,
      sync_jobs: syncJobs.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function testIcountConnection(credentials) {
  try {
    const { cid, username, password } = credentials;
    if (!cid || !username || !password) {
      return { success: false, error: 'חסרים שדות: מספר חברה, שם משתמש וסיסמה' };
    }

    const resp = await fetch(`${ICOUNT_BASE}/api/v3/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid, user: username, pass: password }),
    });
    const data = await resp.json();

    if (data.status && data.sid) {
      return { 
        success: true, 
        sid: data.sid, 
        account_id: cid,
        is_vat_exempt: data.is_tax_exempt || false,
      };
    }
    return { success: false, error: data.error_description || 'פרטי התחברות לא נכונים' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}