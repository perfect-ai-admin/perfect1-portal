/**
 * iCount Session Helper
 * Ensures we have a valid iCount session (sid).
 * If sid expired, re-login using stored credentials.
 * 
 * This is a utility function called by other iCount functions.
 * It receives base44 (service role) and user, returns { sid, cid, connection }.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

async function ensureIcountSession(base44, userId) {
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
    user_id: userId,
    provider: 'icount'
  });

  if (!connections || connections.length === 0) {
    throw new Error('לא נמצא חיבור ל-iCount. התחבר תחילה.');
  }

  const conn = connections[0];
  if (conn.status !== 'connected') {
    throw new Error('החיבור ל-iCount אינו פעיל. התחבר מחדש.');
  }

  // Check if session is still valid (less than 25 min old)
  const sidExpiry = conn.sid_expires_at ? new Date(conn.sid_expires_at) : null;
  const now = new Date();

  if (conn.sid && sidExpiry && sidExpiry > now) {
    // Session still valid
    return { sid: conn.sid, cid: conn.provider_account_id, connection: conn };
  }

  // Need to re-login
  if (!conn.provider_account_id || !conn.username || !conn.password_ref) {
    throw new Error('חסרים פרטי התחברות ל-iCount. התחבר מחדש.');
  }

  const loginRes = await fetch(`${ICOUNT_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cid: conn.provider_account_id,
      user: conn.username,
      pass: conn.password_ref
    })
  });

  const loginData = await loginRes.json();
  if (!loginData.status) {
    await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
      status: 'error',
      last_error: loginData.error_description || 'שגיאת התחברות ל-iCount'
    });
    throw new Error(loginData.error_description || 'שגיאת התחברות ל-iCount');
  }

  // Update session
  await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
    sid: loginData.sid,
    sid_expires_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    status: 'connected',
    last_error: null
  });

  return {
    sid: loginData.sid,
    cid: conn.provider_account_id,
    connection: { ...conn, sid: loginData.sid }
  };
}

// This function can also be invoked directly to test connection health
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await ensureIcountSession(base44, user.id);
    return Response.json({ status: 'ok', cid: session.cid, has_sid: !!session.sid });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});