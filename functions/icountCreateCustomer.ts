import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

async function ensureSession(base44, userId) {
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({ user_id: userId, provider: 'icount' });
  if (!connections?.length) throw new Error('לא נמצא חיבור ל-iCount');
  const conn = connections[0];
  if (conn.status !== 'connected') throw new Error('החיבור ל-iCount אינו פעיל');

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
  if (!loginData.status) throw new Error(loginData.error_description || 'שגיאת התחברות');

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

    // Create customer in iCount
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

    const res = await fetch(`${ICOUNT_BASE_URL}/client/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    // Audit log
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'icount.create_customer',
      entity_type: 'AccountingCustomer',
      request_data: { name, id_number, email },
      response_data: data,
      success: !!data.status
    });

    if (!data.status) {
      // If customer already exists, try create_or_update
      if (data.reason === 'client_already_exists') {
        const upsertRes = await fetch(`${ICOUNT_BASE_URL}/client/create_or_update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const upsertData = await upsertRes.json();
        if (!upsertData.status) {
          return Response.json({ error: upsertData.error_description || 'שגיאה ביצירת לקוח ב-iCount' });
        }
        data.client_id = upsertData.client_id;
        data.status = true;
      } else {
        return Response.json({ error: data.error_description || 'שגיאה ביצירת לקוח ב-iCount' });
      }
    }

    // Save locally
    const localCustomer = await base44.asServiceRole.entities.FinbotCustomer.create({
      user_id: user.id,
      finbot_customer_id: String(data.client_id),
      name,
      id_number: id_number || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      city: city || '',
      zip: zip || '',
      notes: notes || '',
      raw: data,
      synced_at: new Date().toISOString()
    });

    return Response.json({ status: 'success', customer: localCustomer, provider_id: data.client_id });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});