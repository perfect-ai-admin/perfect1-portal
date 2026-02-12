import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

/**
 * Morning (Green Invoice) — create a document.
 * Input: { type, customer_id, items[], payment_method, notes, issue_date }
 * 
 * Doc type mapping (our type → Morning numeric type):
 *   invoice         → 305  (חשבונית מס)
 *   invoice_receipt → 320  (חשבונית מס / קבלה)
 *   receipt         → 400  (קבלה)
 *   quote           → 10   (הצעת מחיר)
 *   credit_note     → 330  (חשבונית זיכוי)
 */
const OUR_TO_MORNING_TYPE = {
  invoice: 305,
  invoice_receipt: 320,
  receipt: 400,
  quote: 10,
  credit_note: 330,
};

const MORNING_PAYMENT_MAP = {
  cash: 1,
  check: 2,
  credit_card: 3,
  bank_transfer: 4,
  paypal: 5,
  bit: 10,
  other: 0,
  none: -1,
};

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
  if (!tokenResp.ok) {
    console.log('Morning token error:', tokenResp.status, await tokenResp.text().catch(() => ''));
    throw new Error('שגיאה בהתחברות ל-Morning');
  }
  const { token } = await tokenResp.json();
  return { jwt: token, connection: conn };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, customer_id, items, payment_method, notes, issue_date } = body;

    if (!type || !items?.length) {
      return Response.json({ error: 'חסרים סוג מסמך ופריטים' }, { status: 400 });
    }

    const morningType = OUR_TO_MORNING_TYPE[type];
    if (!morningType) {
      return Response.json({ error: `סוג מסמך לא נתמך: ${type}` }, { status: 400 });
    }

    const { jwt, connection } = await getJWT(base44, user.id);

    // Determine VAT type based on business config
    // vatType: 0=default(based on business), 1=included, 2=exempt
    const vatType = connection.config?.is_vat_exempt ? 2 : 0;

    // Build income lines
    const income = items.map((item, idx) => ({
      catalogNum: item.catalogNum || '',
      description: item.description || `פריט ${idx + 1}`,
      quantity: item.quantity || 1,
      price: item.unit_price || item.price || 0,
      currency: 'ILS',
      vatType: vatType,
    }));

    // Build payment array (only for receipts and invoice_receipts)
    const payment = [];
    if (payment_method && payment_method !== 'none') {
      const pmType = MORNING_PAYMENT_MAP[payment_method] ?? 0;
      const totalAmount = income.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      payment.push({
        type: pmType,
        price: totalAmount,
        currency: 'ILS',
        date: issue_date || new Date().toISOString().split('T')[0],
      });
    }

    // Resolve customer: look up provider_customer_id
    let clientObj = undefined;
    if (customer_id) {
      const customers = await base44.asServiceRole.entities.AccountingCustomer.filter({
        user_id: user.id, provider: 'morning',
      });
      const match = customers?.find(c => c.id === customer_id || c.provider_customer_id === customer_id);
      if (match?.provider_customer_id) {
        clientObj = { id: match.provider_customer_id };
      }
    }

    // Build document payload per Morning API
    const docPayload = {
      type: morningType,
      ...(clientObj ? { client: clientObj } : {}),
      income,
      ...(payment.length > 0 ? { payment } : {}),
      remarks: notes || '',
      date: issue_date || new Date().toISOString().split('T')[0],
      lang: 'he',
      currency: 'ILS',
    };

    console.log('Morning create document payload:', JSON.stringify(docPayload).substring(0, 500));

    const createResp = await fetch(`${MORNING_BASE}/documents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(docPayload),
    });

    const resultText = await createResp.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch (_) {
      console.log('Morning create doc non-JSON response:', resultText.substring(0, 300));
      return Response.json({ error: 'תגובה לא תקינה מ-Morning' }, { status: 500 });
    }

    if (!createResp.ok) {
      console.log('Morning create doc error:', createResp.status, JSON.stringify(result));
      return Response.json({ 
        error: result.errorMessage || result.message || 'שגיאה ביצירת מסמך ב-Morning',
        details: result,
      }, { status: 400 });
    }

    // Save to our DB
    const subtotal = result.amount || income.reduce((s, i) => s + i.quantity * i.price, 0);
    const vatAmount = result.vat || 0;
    const total = result.totalAmount || (subtotal + vatAmount);

    let pdfUrl = null;
    if (result.url) {
      pdfUrl = result.url.origin || result.url.he || result.url.en || null;
    }

    const savedDoc = await base44.asServiceRole.entities.AccountingDocument.create({
      user_id: user.id,
      provider: 'morning',
      provider_document_id: String(result.id),
      doc_type: type,
      doc_number: result.number != null ? String(result.number) : null,
      status: result.status === 0 ? 'draft' : 'final',
      direction: 'outbound',
      customer_provider_id: clientObj?.id || null,
      customer_name: result.client?.name || null,
      currency: 'ILS',
      subtotal,
      vat_amount: vatAmount,
      total,
      amount_paid: result.totalPaid || 0,
      balance_due: Math.max(0, total - (result.totalPaid || 0)),
      issue_date: result.documentDate || issue_date,
      payment_method: payment_method || null,
      items: income.map(i => ({
        description: i.description,
        quantity: i.quantity,
        unit_price: i.price,
        line_total: i.quantity * i.price,
      })),
      notes: notes || null,
      pdf_url: pdfUrl,
      raw: result,
      synced_at: new Date().toISOString(),
    });

    // Audit
    await base44.asServiceRole.entities.AccountingAuditLog.create({
      user_id: user.id,
      provider: 'morning',
      action: 'document.create',
      entity_type: 'document',
      entity_id: savedDoc.id,
      details: { doc_type: type, morning_id: result.id, doc_number: result.number },
      success: true,
    });

    return Response.json({
      status: 'success',
      document: savedDoc,
      morning_doc_id: result.id,
      doc_number: result.number,
      pdf_url: pdfUrl,
    });
  } catch (error) {
    console.log('morningCreateDocument error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});