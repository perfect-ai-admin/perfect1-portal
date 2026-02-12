import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

/**
 * Morning (Green Invoice) — create a customer (client).
 * Input: { name, id_number, email, phone, address, city, zip, notes }
 */
async function getJWT(base44, userId) {
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
    user_id: userId, status: 'connected', provider: 'morning',
  });
  if (!connections?.length) throw new Error('אין חיבור פעיל ל-Morning');
  const conn = connections[0];
  
  const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: conn.api_key_enc, secret: conn.api_secret_enc }),
  });
  if (!tokenResp.ok) throw new Error('שגיאה בהתחברות ל-Morning');
  const { token } = await tokenResp.json();
  return token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, id_number, email, phone, address, city, zip, notes } = await req.json();
    if (!name) return Response.json({ error: 'שם הלקוח חובה' }, { status: 400 });

    const jwt = await getJWT(base44, user.id);

    // Build client payload for Morning API
    const clientPayload = {
      name,
      ...(id_number ? { taxId: id_number } : {}),
      ...(email ? { emails: [email] } : {}),
      ...(phone ? { phone } : {}),
      ...(address ? { address } : {}),
      ...(city ? { city } : {}),
      ...(zip ? { zip } : {}),
      active: true,
    };

    const resp = await fetch(`${MORNING_BASE}/clients`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(clientPayload),
    });

    const result = await resp.json();

    if (!resp.ok) {
      return Response.json({ 
        error: result.errorMessage || 'שגיאה ביצירת לקוח ב-Morning' 
      }, { status: 400 });
    }

    // Save to our DB
    const saved = await base44.asServiceRole.entities.AccountingCustomer.create({
      user_id: user.id,
      provider: 'morning',
      provider_customer_id: result.id,
      name: result.name || name,
      tax_id: result.taxId || id_number || null,
      email: (result.emails && result.emails[0]) || email || null,
      phone: result.phone || phone || null,
      address: result.address || address || null,
      city: result.city || city || null,
      zip: result.zip || zip || null,
      notes: notes || null,
      is_active: true,
      raw: result,
      synced_at: new Date().toISOString(),
    });

    // Audit
    await base44.asServiceRole.entities.AccountingAuditLog.create({
      user_id: user.id,
      provider: 'morning',
      action: 'customer.create',
      entity_type: 'customer',
      entity_id: saved.id,
      details: { morning_id: result.id, name },
      success: true,
    });

    return Response.json({ status: 'success', customer: saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});