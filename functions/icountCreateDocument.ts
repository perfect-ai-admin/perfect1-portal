import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

// iCount document type mapping
const DOC_TYPE_MAP = {
  'receipt': 'receipt',
  'invoice_receipt': 'invoice_receipt',
  'invoice': 'invoice',
  'credit': 'credit_invoice',
  'tax-receipt': 'invoice_receipt',  // alias from UI
  'draft': 'order'
};

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
    const { type, customer_id, customer_provider_id, issue_date, currency, items, notes } = body;

    if (!type) return Response.json({ error: 'סוג מסמך הוא שדה חובה' }, { status: 400 });
    if (!items || !items.length) return Response.json({ error: 'נדרש לפחות פריט אחד' }, { status: 400 });

    const { sid } = await ensureSession(base44, user.id);

    const icountDoctype = DOC_TYPE_MAP[type] || type;

    // Build items for iCount
    const icountItems = items.map(item => ({
      description: item.description || '',
      unitprice: item.unit_price || 0,
      quantity: item.quantity || 1,
      ...(item.vat_rate !== undefined && { vat_rate: item.vat_rate })
    }));

    // Build payload
    const payload = {
      sid,
      doctype: icountDoctype,
      items: icountItems,
      ...(issue_date && { doc_date: issue_date }),
      ...(currency && currency !== 'ILS' && { currency_code: currency }),
      ...(notes && { comment: notes })
    };

    // Customer identification
    if (customer_provider_id) {
      payload.client_id = parseInt(customer_provider_id);
    } else if (customer_id) {
      // Lookup local customer to get provider ID
      const customers = await base44.asServiceRole.entities.FinbotCustomer.filter({ id: customer_id });
      if (customers?.length && customers[0].finbot_customer_id) {
        payload.client_id = parseInt(customers[0].finbot_customer_id);
      }
    }

    // Create document in iCount
    const res = await fetch(`${ICOUNT_BASE_URL}/doc/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    // Audit log
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'icount.create_document',
      entity_type: 'FinbotDocument',
      request_data: { type, customer_provider_id, items_count: items.length },
      response_data: data,
      success: !!data.status
    });

    if (!data.status) {
      return Response.json({ error: data.error_description || 'שגיאה ביצירת מסמך ב-iCount' });
    }

    // Get PDF link
    let pdfUrl = null;
    if (data.doctype && data.docnum) {
      try {
        const infoRes = await fetch(`${ICOUNT_BASE_URL}/doc/info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid, doctype: data.doctype, docnum: data.docnum, get_pdf_link: true })
        });
        const infoData = await infoRes.json();
        if (infoData.pdf_link) pdfUrl = infoData.pdf_link;
      } catch (_) { /* ignore */ }
    }

    // Calculate totals from response
    const subtotal = data.total_sum || items.reduce((sum, i) => sum + (i.unit_price || 0) * (i.quantity || 1), 0);
    const vat = data.total_vat || 0;
    const total = data.total_with_vat || subtotal + vat;

    // Save locally
    const localDoc = await base44.asServiceRole.entities.FinbotDocument.create({
      user_id: user.id,
      finbot_document_id: data.docnum ? `${data.doctype}_${data.docnum}` : '',
      type: type === 'tax-receipt' ? 'invoice_receipt' : type,
      customer_finbot_id: String(payload.client_id || ''),
      issue_date: issue_date || new Date().toISOString().split('T')[0],
      currency: currency || 'ILS',
      subtotal,
      vat,
      total,
      status: 'issued',
      pdf_url: pdfUrl,
      items,
      notes: notes || '',
      raw: data,
      synced_at: new Date().toISOString()
    });

    return Response.json({
      status: 'success',
      document: localDoc,
      doctype: data.doctype,
      docnum: data.docnum,
      pdf_url: pdfUrl
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});