// Migrated from Base44: acctConnectProvider
// Unified accounting provider connection (iCount, Morning, Finbot)

import { supabaseAdmin, getUser, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const ICOUNT_BASE = "https://api.icount.co.il/api/v3.php";
const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const { provider, credentials, reconnect } = await req.json();
    if (!provider) return errorResponse('חסר פרטי ספק', 400);

    // Check existing connections
    const { data: existing } = await supabaseAdmin
      .from('accounting_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'connected');

    if (existing?.length && existing[0].provider === provider && !reconnect) {
      return jsonResponse({ status: 'connected', message: `כבר מחובר ל-${provider}` });
    }

    // Disable other provider connections
    if (existing?.length && existing[0].provider !== provider) {
      for (const conn of existing) {
        await supabaseAdmin
          .from('accounting_connections')
          .update({ status: 'disabled' })
          .eq('id', conn.id);
      }
    }

    // Reconnect with saved credentials
    if (reconnect) {
      const { data: saved } = await supabaseAdmin
        .from('accounting_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .limit(1);

      if (saved?.length) {
        const conn = saved[0];
        let testOk = false;
        const updateData: any = { status: 'connected', last_error: null };

        if (provider === 'icount' && conn.username && conn.password_ref && conn.provider_account_id) {
          const result = await testIcountConnection({ cid: conn.provider_account_id, username: conn.username, password: conn.password_ref });
          if (result.success) {
            updateData.sid = result.sid;
            updateData.sid_expires_at = new Date(Date.now() + 3600000).toISOString();
            testOk = true;
          }
        } else if (provider === 'morning') {
          const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: conn.config?.api_key, secret: conn.config?.api_secret })
          });
          testOk = tokenResp.ok;
        } else if (provider === 'finbot') {
          testOk = true;
        }

        if (testOk) {
          await supabaseAdmin.from('accounting_connections').update(updateData).eq('id', conn.id);
          return jsonResponse({ status: 'connected', message: `מחובר מחדש ל-${provider}!`, reconnected: true });
        }
        return errorResponse('פרטי ההתחברות השמורים כבר לא תקינים', 400);
      }
      return errorResponse('אין פרטי התחברות שמורים', 400);
    }

    if (!credentials) return errorResponse('חסרים פרטי התחברות', 400);

    // Test and connect
    const connectionData: any = { user_id: user.id, provider, status: 'pending', config: {} };

    if (provider === 'icount') {
      const result = await testIcountConnection(credentials);
      if (!result.success) return errorResponse(result.error || 'פרטי התחברות לא נכונים', 400);
      connectionData.provider_account_id = credentials.cid;
      connectionData.username = credentials.username;
      connectionData.password_ref = credentials.password;
      connectionData.sid = result.sid;
      connectionData.sid_expires_at = new Date(Date.now() + 3600000).toISOString();
      connectionData.status = 'connected';
      connectionData.config = { is_vat_exempt: result.is_vat_exempt || false };
    } else if (provider === 'finbot') {
      if (!credentials.api_key?.trim()) return errorResponse('חסר API Key', 400);
      connectionData.config = { api_key: credentials.api_key.trim() };
      connectionData.status = 'connected';
    } else if (provider === 'morning') {
      if (!credentials.api_key?.trim() || !credentials.api_secret?.trim()) return errorResponse('חסרים API Key ו-API Secret', 400);
      const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: credentials.api_key.trim(), secret: credentials.api_secret.trim() })
      });
      if (!tokenResp.ok) return errorResponse('פרטי התחברות לא נכונים ל-Morning', 400);
      const tokenData = await tokenResp.json();
      if (!tokenData.token) return errorResponse('לא התקבל טוקן מ-Morning', 400);

      connectionData.config = { api_key: credentials.api_key.trim(), api_secret: credentials.api_secret.trim() };
      connectionData.status = 'connected';
    } else {
      return errorResponse('הספק הזה עדיין לא נתמך', 400);
    }

    // Upsert connection
    const { data: existingConn } = await supabaseAdmin
      .from('accounting_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .limit(1);

    let connection;
    if (existingConn?.length) {
      const { data } = await supabaseAdmin
        .from('accounting_connections')
        .update({ ...connectionData, last_error: null, updated_at: new Date().toISOString() })
        .eq('id', existingConn[0].id)
        .select()
        .single();
      connection = data;
    } else {
      const { data } = await supabaseAdmin
        .from('accounting_connections')
        .insert(connectionData)
        .select()
        .single();
      connection = data;
    }

    // Audit log
    await supabaseAdmin.from('activity_log').insert({
      user_id: user.id,
      action: 'provider.connect',
      entity_type: 'accounting_connection',
      entity_id: connection?.id,
      metadata: { provider, provider_account_id: connectionData.provider_account_id }
    });

    // Trigger sync via Edge Function
    const syncFn = { icount: 'icountSyncPull', finbot: 'finbotSyncPull', morning: 'morningSyncPull' }[provider];
    if (syncFn) {
      try {
        await supabaseAdmin.functions.invoke(syncFn, { body: { resource: 'all', fullSync: true } });
      } catch (e) { console.log(`${provider} sync triggered:`, (e as Error).message); }
    }

    return jsonResponse({
      status: 'connected',
      message: `מחובר ל-${provider}! מסנכרנים נתונים ברקע...`,
      connection_id: connection?.id
    });
  } catch (error) {
    return errorResponse((error as Error).message);
  }
});

async function testIcountConnection(credentials: any) {
  try {
    const { cid, username, password } = credentials;
    if (!cid || !username || !password) return { success: false, error: 'חסרים שדות' };

    const resp = await fetch(`${ICOUNT_BASE}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid, user: username, pass: password })
    });
    const data = await resp.json();

    if (data.status && data.sid) {
      return { success: true, sid: data.sid, is_vat_exempt: data.is_tax_exempt || false };
    }
    return { success: false, error: data.error_description || 'פרטי התחברות לא נכונים' };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
