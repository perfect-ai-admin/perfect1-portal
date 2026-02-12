import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = "https://api.icount.co.il/api/v3.php";

async function ensureSession(base44, userId) {
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({ user_id: userId, provider: 'icount', status: 'connected' });
  if (!connections?.length) throw new Error('לא נמצא חיבור פעיל ל-iCount');
  const conn = connections[0];

  const sidExpiry = conn.sid_expires_at ? new Date(conn.sid_expires_at) : null;
  if (conn.sid && sidExpiry && sidExpiry > new Date()) {
    return { sid: conn.sid, cid: conn.provider_account_id, conn };
  }

  const loginRes = await fetch(`${ICOUNT_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cid: conn.provider_account_id, user: conn.username, pass: conn.password_ref })
  });
  const loginData = await loginRes.json();
  if (!loginData.status) throw new Error(loginData.error_description || 'שגיאת התחברות ל-iCount');

  await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
    sid: loginData.sid, sid_expires_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    status: 'connected', last_error: null
  });
  return { sid: loginData.sid, cid: conn.provider_account_id, conn: { ...conn, sid: loginData.sid } };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, id_number, email, phone, address, city, zip, notes } = body;

    if (!name) return Response.json({ error: 'שם לקוח הוא שדה חובה' }, { status: 400 });

    const { sid } = await ensureSession(base44, user.id);

    const payload = {
      sid,
      client_name: name,
      ...(id_number && { vat_id: id_number }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { bus_street: address }),
      ...(city && { bus_city: city }),
      ...(zip && { bus_zip: zip }),
      ...(notes && { notes })
    };

    // Try create_or_update directly (handles both new and existing)
    const res = await fetch(`${ICOUNT_BASE_URL}/client/create_or_update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!data.status) {
      return Response.json({ error: data.error_description || 'שגיאה ביצירת לקוח ב-iCount' }, { status: 400 });
    }

    // Save locally
    const localCustomer = await base44.asServiceRole.entities.FinbotCustomer.create({
      user_id: user.id,
      provider: 'icount',
      finbot_customer_id: String(data.client_id),
      name,
      id_number: id_number || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      city: city || '',
      zip: zip || '',
      notes: notes || '',
      synced_at: new Date().toISOString()
    });

    return Response.json({ status: 'success', customer: localCustomer, provider_id: data.client_id });

  } catch (error) {
    console.error('icountCreateCustomer error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});