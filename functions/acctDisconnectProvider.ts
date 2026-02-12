import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Unified provider disconnect function.
 * Disconnects the user's active accounting connection.
 * Does NOT delete data — only disables the connection.
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
      return Response.json({ error: 'לא מחובר למערכת חשבונות' }, { status: 400 });
    }

    const connection = connections[0];
    const provider = connection.provider;

    // Disable connection, clear session tokens but KEEP credentials for reconnect
    await base44.asServiceRole.entities.AccountingConnection.update(connection.id, {
      status: 'disabled',
      sid: null,
      sid_expires_at: null,
      access_token_ref: null,
      refresh_token_ref: null,
      token_expires_at: null,
      // NOTE: api_key_enc, api_secret_enc, password_enc, username, provider_account_id are KEPT
      // so the user can reconnect without re-entering credentials
    });

    // Audit log
    await base44.asServiceRole.entities.AccountingAuditLog.create({
      user_id: user.id,
      provider,
      action: 'provider.disconnect',
      success: true,
    });

    return Response.json({ success: true, message: `נותק מ-${provider}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});