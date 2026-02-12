import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE = "https://api.icount.co.il/api/v3.php";

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

    const { provider, credentials, reconnect } = await req.json();
    if (!provider) {
      return Response.json({ error: 'חסר פרטי ספק' }, { status: 400 });
    }

    // Check for existing active connection
    const existing = await base44.entities.AccountingConnection.filter({
      user_id: user.id,
      status: 'connected'
    });
    if (existing?.length > 0) {
      const existingProvider = existing[0].provider;
      if (existingProvider === provider && !reconnect) {
        // Already connected to same provider, just return success
        return Response.json({ status: 'connected', message: `כבר מחובר ל-${provider}` });
      }
      if (existingProvider !== provider) {
        // Different provider - disable old connection first (don't block, just switch)
        for (const conn of existing) {
          await base44.asServiceRole.entities.AccountingConnection.update(conn.id, { status: 'disabled' });
        }
        console.log(`Disabled previous ${existingProvider} connection to switch to ${provider}`);
      }
    }

    // Check if reconnecting with saved credentials
    if (reconnect) {
      const savedConns = await base44.asServiceRole.entities.AccountingConnection.filter({
        user_id: user.id,
        provider,
      });
      if (savedConns?.length > 0) {
        const saved = savedConns[0];
        const hasSavedCreds = (provider === 'icount' && saved.username && saved.password_enc && saved.provider_account_id) ||
                              (provider === 'morning' && saved.api_key_enc && saved.api_secret_enc) ||
                              (provider === 'finbot' && saved.api_key_enc);
        
        if (hasSavedCreds) {
          // Re-test connection with saved credentials
          let testOk = false;
          let updateData = { status: 'connected', last_error: null };

          if (provider === 'icount') {
            const testResult = await testIcountConnection({ 
              cid: saved.provider_account_id, 
              username: saved.username, 
              password: saved.password_enc 
            });
            if (testResult.success) {
              updateData.sid = testResult.sid;
              updateData.sid_expires_at = new Date(Date.now() + 3600000).toISOString();
              testOk = true;
            } else {
              return Response.json({ error: testResult.error || 'פרטי ההתחברות השמורים כבר לא תקינים. יש להזין מחדש.', needs_credentials: true }, { status: 400 });
            }
          } else if (provider === 'morning') {
            try {
              const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";
              const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: saved.api_key_enc, secret: saved.api_secret_enc }),
              });
              testOk = tokenResp.ok;
              if (!testOk) {
                return Response.json({ error: 'פרטי ההתחברות השמורים כבר לא תקינים. יש להזין מחדש.', needs_credentials: true }, { status: 400 });
              }
            } catch (e) {
              return Response.json({ error: 'שגיאה בבדיקת חיבור: ' + e.message, needs_credentials: true }, { status: 400 });
            }
          } else if (provider === 'finbot') {
            testOk = true; // Finbot validates on first use
          }

          if (testOk) {
            await base44.asServiceRole.entities.AccountingConnection.update(saved.id, updateData);
            
            // Audit
            await base44.asServiceRole.entities.AccountingAuditLog.create({
              user_id: user.id, provider, action: 'provider.reconnect', success: true,
            });

            // Trigger sync
            const providerSyncMap = { icount: 'icountSyncPull', finbot: 'finbotSyncPull', morning: 'morningSyncPull' };
            const syncFnName = providerSyncMap[provider];
            if (syncFnName) {
              try { await base44.asServiceRole.functions.invoke(syncFnName, { resource: 'all' }); } catch (e) { console.log('Reconnect sync:', e.message); }
            }

            return Response.json({ status: 'connected', message: `מחובר מחדש ל-${provider}!`, reconnected: true });
          }
        }
      }
      // No saved credentials found
      return Response.json({ error: 'אין פרטי התחברות שמורים. יש להזין פרטים.', needs_credentials: true }, { status: 400 });
    }

    if (!credentials) {
      return Response.json({ error: 'חסרים פרטי התחברות' }, { status: 400 });
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
    } else if (provider === 'finbot') {
      // Finbot uses API key — validate by saving, real validation on first use
      if (!credentials.api_key?.trim()) {
        return Response.json({ error: 'חסר API Key' }, { status: 400 });
      }
      connectionData.strategy = 'api_key';
      connectionData.api_key_enc = credentials.api_key.trim();
      connectionData.status = 'connected';

      // Also update legacy FinbotConnection for backward compatibility
      try {
        const legacyConns = await base44.asServiceRole.entities.FinbotConnection.filter({ user_id: user.id });
        if (legacyConns?.length > 0) {
          await base44.asServiceRole.entities.FinbotConnection.update(legacyConns[0].id, {
            status: 'connected', strategy: 'apikey', api_key_ref: credentials.api_key.trim(), last_error: null
          });
        } else {
          await base44.asServiceRole.entities.FinbotConnection.create({
            user_id: user.id, strategy: 'apikey', status: 'connected', api_key_ref: credentials.api_key.trim()
          });
        }
      } catch (legacyErr) {
        console.log('Legacy FinbotConnection sync skipped:', legacyErr.message);
      }
    } else if (provider === 'morning') {
      // Morning uses API Key + Secret → JWT auth
      if (!credentials.api_key?.trim() || !credentials.api_secret?.trim()) {
        return Response.json({ error: 'חסרים API Key ו-API Secret' }, { status: 400 });
      }
      // Test connection directly via Morning API (avoid function invocation issues)
      try {
        const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";
        const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: credentials.api_key.trim(), secret: credentials.api_secret.trim() }),
        });
        
        if (!tokenResp.ok) {
          const errText = await tokenResp.text();
          let errMsg = 'פרטי התחברות לא נכונים ל-Morning';
          try { errMsg = JSON.parse(errText).errorMessage || errMsg; } catch(_) {}
          console.log('Morning token error:', tokenResp.status, errText);
          return Response.json({ error: errMsg }, { status: 400 });
        }
        
        const tokenData = await tokenResp.json();
        const jwt = tokenData.token;
        if (!jwt) {
          return Response.json({ error: 'לא התקבל טוקן מ-Morning' }, { status: 400 });
        }

        // Fetch business info
        let businessInfo = {};
        try {
          const bizResp = await fetch(`${MORNING_BASE}/businesses/me`, {
            headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
          });
          if (bizResp.ok) businessInfo = await bizResp.json();
        } catch(bizErr) {
          console.log('Morning businesses/me failed:', bizErr.message);
        }

        connectionData.strategy = 'api_key';
        connectionData.api_key_enc = credentials.api_key.trim();
        connectionData.api_secret_enc = credentials.api_secret.trim();
        connectionData.provider_account_id = businessInfo.id || null;
        connectionData.status = 'connected';
        connectionData.config = { 
          is_vat_exempt: businessInfo.taxType === 2,
          business_name: businessInfo.name || null,
          business_type: businessInfo.taxType || null,
        };
      } catch (testErr) {
        console.log('Morning connect error:', testErr.message);
        return Response.json({ error: testErr.message || 'שגיאה בבדיקת חיבור ל-Morning' }, { status: 400 });
      }
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

    // Run initial sync inline
    const providerSyncMap = {
      icount: 'icountSyncPull',
      finbot: 'finbotSyncPull',
      morning: 'morningSyncPull',
    };
    const syncFnName = providerSyncMap[provider];
    if (syncFnName) {
      try {
        await base44.asServiceRole.functions.invoke(syncFnName, {
          resource: 'all',
          fullSync: true,
        });
      } catch (syncErr) {
        console.log(`${provider} initial sync triggered (may run async):`, syncErr.message);
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

    const resp = await fetch(`${ICOUNT_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid, user: username, pass: password }),
    });
    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log('iCount login response is not JSON:', text.substring(0, 200));
      return { success: false, error: 'תשובה לא תקינה מ-iCount. ייתכן שכתובת ה-API השתנתה.' };
    }

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