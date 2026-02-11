import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

// iCount document type mapping
const DOC_TYPE_MAP = {
  'receipt': 'receipt',
  'invoice_receipt': 'invrec',
  'invoice': 'invoice',
  'credit': 'creditinv',
  'tax-receipt': 'invrec',
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

// Map UI payment type to iCount cc_type / pay_type
const PAYMENT_TYPE_MAP = {
  'cash': 1,
  'cheque': 2,
  'credit_card': 3,
  'bank_transfer': 4,
  'paypal': 11,
  'bit': 10,
  'paybox': 10,
  'other': 0
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, customer_id, customer_provider_id, issue_date, currency, items, notes, payment, payment_type } = body;

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

    // Determine if business is VAT exempt (osek patur)
    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({ user_id: user.id, provider: 'icount', status: 'connected' });
    const connConfig = connections?.[0]?.config || {};
    const isVatExempt = !!(connConfig.is_tax_exempt || connConfig.is_vat_exempt);
    const vatMultiplier = isVatExempt ? 1 : 1.17;

    // Add payment info (required by iCount for receipt/invrec)
    const subtotalCalc = items.reduce((sum, i) => sum + (i.unit_price || 0) * (i.quantity || 1), 0);
    const totalWithVat = Math.round(subtotalCalc * vatMultiplier * 100) / 100;
    
    const paymentSource = (payment && payment.length > 0) ? payment[0] : null;
    const payTypeKey = paymentSource?.type || payment_type || 'cash';
    const payType = PAYMENT_TYPE_MAP[payTypeKey] || 1;
    // If explicit payment amount provided, use as-is (already includes VAT if relevant)
    const paySum = paymentSource?.price ? Number(paymentSource.price) : totalWithVat;

    // Customer identification
    if (customer_provider_id) {
      payload.client_id = parseInt(customer_provider_id);
    } else if (customer_id) {
      try {
        const customer = await base44.asServiceRole.entities.FinbotCustomer.get(customer_id);
        if (customer?.finbot_customer_id) {
          payload.client_id = parseInt(customer.finbot_customer_id);
        }
      } catch (_) {
        // Fallback: try filter by finbot_customer_id directly
        const customers = await base44.asServiceRole.entities.FinbotCustomer.filter({ finbot_customer_id: customer_id });
        if (customers?.length && customers[0].finbot_customer_id) {
          payload.client_id = parseInt(customers[0].finbot_customer_id);
        }
      }
    }

    // For invrec (invoice+receipt) and receipt, payment info is required by iCount
    const needsPayment = ['invrec', 'receipt'].includes(icountDoctype);
    
    // If needsPayment but no payment data provided, auto-generate default cash payment
    const effectivePayment = (payment && payment.length > 0) ? payment : (needsPayment ? [{ date: issue_date || new Date().toISOString().split('T')[0], type: 'cash', price: totalWithVat }] : []);
    const hasPayment = effectivePayment.length > 0;

    // Build JSON payload for iCount
    const jsonPayload = {
      sid: payload.sid,
      doctype: icountDoctype,
      items: icountItems,
    };
    
    if (payload.doc_date) jsonPayload.doc_date = payload.doc_date;
    if (payload.currency_code) jsonPayload.currency_code = payload.currency_code;
    if (payload.comment) jsonPayload.comment = payload.comment;
    if (payload.client_id) jsonPayload.client_id = payload.client_id;

    // Payment - add to JSON payload using multipart for payment arrays
    // iCount requires payment info via form-data, not JSON for nested arrays
    let useFormData = false;
    let paymentFields = {};
    
    if (hasPayment) {
      useFormData = true;
      const effPaySource = effectivePayment[0];
      const effPayTypeKey = effPaySource?.type || payment_type || 'cash';
      const effPayType = PAYMENT_TYPE_MAP[effPayTypeKey] || 1;
      const effPaySum = effPaySource?.price ? Number(effPaySource.price) : totalWithVat;
      
      if (effPayType === 3) {
        paymentFields = { 'cc_payment[0][sum]': effPaySum, 'cc_payment[0][cc_type]': '3' };
      } else if (effPayType === 2) {
        paymentFields = { 'cheque_payment[0][sum]': effPaySum, 'cheque_payment[0][date]': effPaySource?.date || issue_date };
      } else if (effPayType === 4) {
        paymentFields = { 'bank_transfer_payment[0][sum]': effPaySum, 'bank_transfer_payment[0][date]': effPaySource?.date || issue_date };
      } else {
        paymentFields = { 'cash_payment[0][sum]': effPaySum };
      }
    }

    // Build multipart form-data (iCount requires form-data for nested arrays like payment)
    const boundary = '----iCountBoundary' + Date.now();
    let mpBody = '';
    
    function addField(name, value) {
      mpBody += `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
    }

    // Add all JSON fields as form fields
    addField('sid', jsonPayload.sid);
    addField('doctype', jsonPayload.doctype);
    if (jsonPayload.doc_date) addField('doc_date', jsonPayload.doc_date);
    if (jsonPayload.currency_code) addField('currency_code', jsonPayload.currency_code);
    if (jsonPayload.comment) addField('comment', jsonPayload.comment);
    if (jsonPayload.client_id) addField('client_id', jsonPayload.client_id);
    
    // Items as form-data arrays
    jsonPayload.items.forEach((item, i) => {
      addField(`items[${i}][description]`, item.description);
      addField(`items[${i}][unitprice]`, item.unitprice);
      addField(`items[${i}][quantity]`, item.quantity);
      if (item.vat_rate !== undefined) addField(`items[${i}][vat_rate]`, item.vat_rate);
    });
    
    // Payment fields
    for (const [key, value] of Object.entries(paymentFields)) {
      addField(key, value);
    }
    
    mpBody += `--${boundary}--\r\n`;

    console.log('iCount form-data payload:', mpBody.substring(0, 1000));

    // Create document in iCount
    const res = await fetch(`${ICOUNT_BASE_URL}/doc/create`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: mpBody
    });

    const data = await res.json();
    console.log('iCount response:', JSON.stringify(data));

    // Audit log
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'icount.create_document',
      entity_type: 'FinbotDocument',
      request_data: { type, doctype: icountDoctype, customer_provider_id, items_count: items.length },
      response_data: data,
      success: !!data.status
    });

    if (!data.status) {
      const errMsg = data.error_description || data.reason || JSON.stringify(data.errors || {});
      return Response.json({ error: errMsg || 'שגיאה ביצירת מסמך ב-iCount', icount_response: data });
    }

    // Get PDF link
    let pdfUrl = null;
    if (data.doc_url) {
      pdfUrl = data.doc_url;
    } else if (data.doctype && data.docnum) {
      try {
        const infoRes = await fetch(`${ICOUNT_BASE_URL}/doc/info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid, doctype: data.doctype, docnum: data.docnum, get_pdf_link: true })
        });
        const infoData = await infoRes.json();
        if (infoData.pdf_link) pdfUrl = infoData.pdf_link;
        if (infoData.doc_url) pdfUrl = infoData.doc_url;
      } catch (_) { /* ignore */ }
    }

    // Calculate totals from response
    const subtotal = data.total_sum || items.reduce((sum, i) => sum + (i.unit_price || 0) * (i.quantity || 1), 0);
    const vat = data.total_vat || 0;
    const total = data.total_with_vat || subtotal + vat;

    // Find customer name
    let customerName = '';
    if (customer_id) {
      const customers = await base44.asServiceRole.entities.FinbotCustomer.filter({ id: customer_id });
      if (customers?.length) customerName = customers[0].name;
    }

    // Save locally
    const localDoc = await base44.asServiceRole.entities.FinbotDocument.create({
      user_id: user.id,
      finbot_document_id: data.docnum ? `${data.doctype}_${data.docnum}` : '',
      type: type === 'tax-receipt' ? 'invoice_receipt' : type,
      customer_finbot_id: String(payload.client_id || ''),
      customer_name: customerName,
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
    console.error('icountCreateDocument error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});