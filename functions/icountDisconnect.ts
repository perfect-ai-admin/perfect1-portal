import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

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
      return Response.json({ status: 'ok', message: 'לא נמצא חיבור' });
    }

    const conn = connections[0];

    // Try to logout from iCount session if we have sid
    if (conn.sid) {
      try {
        await fetch(`${ICOUNT_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid: conn.sid })
        });
      } catch (_) { /* ignore logout errors */ }
    }

    // Update connection to disabled
    await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
      status: 'disabled',
      sid: null,
      sid_expires_at: null,
      password_ref: null,
      last_error: null
    });

    // Audit log
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'icount.disconnect',
      success: true
    });

    return Response.json({ status: 'ok', message: 'התנתקת מ-iCount בהצלחה' });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});