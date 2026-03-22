import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

const OUR_TO_MORNING_TYPE = {
  invoice: 305,
  invoice_receipt: 320,
  receipt: 400,
  quote: 10,
  credit_note: 330,
};

const MORNING_PAYMENT_MAP = {
  cash: 1, check: 2, credit_card: 3, bank_transfer: 4, paypal: 5, bit: 10, other: 0, none: -1,
  tranzila: 3, // Tranzila = credit card
};

// ─── Helpers ───

async function fetchWithRetry(url, options, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(url, options);
    if (resp.status === 429) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt + 1) * 2000));
      continue;
    }
    return resp;
  }
  throw new Error('Morning API rate limit exceeded after retries');
}

function cleanString(s) {
  if (!s) return '';
  return s.replace(/\s+/g, ' ').trim();
}

function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildIdempotencyKey(paymentId, transactionId) {
  return `billing_${paymentId}_${transactionId || 'no_txn'}`;
}

// ─── Morning Auth ───

async function getMorningJWT(base44) {
  // Find the admin-level Morning connection (our business account)
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
    provider: 'morning', status: 'connected',
  });
  if (!connections?.length) throw new Error('NO_MORNING_CONNECTION');
  const conn = connections[0];

  const tokenResp = await fetchWithRetry(`${MORNING_BASE}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: conn.api_key_enc, secret: conn.api_secret_enc }),
  });
  if (!tokenResp.ok) {
    const errText = await tokenResp.text().catch(() => '');
    throw new Error(`MORNING_AUTH_FAILED: ${tokenResp.status} ${errText}`);
  }
  const { token } = await tokenResp.json();
  if (!token) throw new Error('MORNING_NO_TOKEN');
  return { jwt: token, connection: conn };
}

// ─── Customer Resolution ───

async function findOrCreateMorningCustomer(base44, jwt, customerData) {
  const { user_id, full_name, email, phone, tax_id, company_name, address, city, zip } = customerData;

  // 1. Check if we already have a Morning customer mapped for this user
  const existing = await base44.asServiceRole.entities.AccountingCustomer.filter({
    user_id, provider: 'morning',
  });
  if (existing?.length > 0) {
    console.log('[Invoice] Found existing Morning customer:', existing[0].provider_customer_id);
    return existing[0];
  }

  // 2. Search Morning by email
  if (isValidEmail(email)) {
    const searchResp = await fetchWithRetry(`${MORNING_BASE}/clients/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 1, pageSize: 5, email }),
    });
    if (searchResp.ok) {
      const data = await searchResp.json();
      if (data.items?.length > 0) {
        const morningCustomer = data.items[0];
        // Save mapping locally
        const saved = await base44.asServiceRole.entities.AccountingCustomer.create({
          user_id, provider: 'morning',
          provider_customer_id: String(morningCustomer.id),
          name: morningCustomer.name || full_name || 'לקוח',
          email: (Array.isArray(morningCustomer.emails) ? morningCustomer.emails[0] : null) || email,
          phone: morningCustomer.phone || phone || null,
          tax_id: morningCustomer.taxId || tax_id || null,
          is_active: true,
          raw: morningCustomer,
          synced_at: new Date().toISOString(),
        });
        console.log('[Invoice] Found Morning customer by email:', morningCustomer.id);
        return saved;
      }
    }
  }

  // 3. Create new customer in Morning
  const customerName = cleanString(full_name) || cleanString(company_name) || 'לקוח';
  if (!customerName || customerName === 'לקוח') {
    console.log('[Invoice] Warning: No valid customer name, using fallback');
  }

  const payload = { name: customerName, active: true };
  if (isValidEmail(email)) payload.emails = [email];
  if (phone) payload.phone = cleanString(phone);
  if (tax_id) payload.taxId = cleanString(tax_id);
  if (company_name) payload.companyName = cleanString(company_name);
  if (address) payload.address = cleanString(address);
  if (city) payload.city = cleanString(city);
  if (zip) payload.zip = cleanString(zip);

  const createResp = await fetchWithRetry(`${MORNING_BASE}/clients`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!createResp.ok) {
    const errText = await createResp.text().catch(() => '');
    throw new Error(`MORNING_CUSTOMER_CREATE_FAILED: ${createResp.status} ${errText}`);
  }

  const result = await createResp.json();
  const saved = await base44.asServiceRole.entities.AccountingCustomer.create({
    user_id, provider: 'morning',
    provider_customer_id: String(result.id),
    name: result.name || customerName,
    email: (Array.isArray(result.emails) ? result.emails[0] : null) || email || null,
    phone: result.phone || phone || null,
    tax_id: result.taxId || tax_id || null,
    is_active: true,
    raw: result,
    synced_at: new Date().toISOString(),
  });

  console.log('[Invoice] Created new Morning customer:', result.id);
  return saved;
}

// ─── Document Type Resolution ───

function resolveDocumentType(payment, connection) {
  // Default: invoice_receipt (חשבונית מס / קבלה) - most common for immediate payment
  // If the business is VAT exempt (osek patur), Morning handles VAT automatically
  const isVatExempt = connection?.config?.is_vat_exempt;

  // For immediate credit card payment: invoice_receipt
  if (payment.payment_method === 'tranzila' || payment.payment_method === 'credit_card') {
    return 'invoice_receipt';
  }

  // Default fallback
  return 'invoice_receipt';
}

// ─── Build Document Lines ───

// Morning vatType values:
// 0 = price is BEFORE VAT (Morning adds VAT on top)
// 1 = price is VAT-INCLUSIVE (Morning extracts VAT from the price)
// 2 = VAT exempt
//
// Our prices are always VAT-inclusive (what the customer paid), so we use vatType=1.

function buildDocumentItems(payment, isVatExempt) {
  const vatType = isVatExempt ? 2 : 1; // 1 = VAT inclusive, 2 = exempt
  const items = [];

  if (payment.items?.length > 0) {
    for (const item of payment.items) {
      items.push({
        description: item.title || item.description || item.product_name || 'שירות',
        quantity: item.quantity || 1,
        price: item.price || item.unit_price || 0,
        currency: 'ILS',
        vatType,
      });
    }
  } else {
    items.push({
      description: payment.product_name || 'שירות',
      quantity: 1,
      price: payment.amount || 0,
      currency: 'ILS',
      vatType,
    });
  }

  return items;
}

// ─── Main Function ───

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.json();
    const { payment_id, trigger_source } = body;

    // Allow both webhook (service role) and admin calls
    // For admin retry: verify admin role
    if (trigger_source === 'admin_retry') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    if (!payment_id) {
      return Response.json({ error: 'Missing payment_id' }, { status: 400 });
    }

    console.log(`[Invoice] Starting for payment: ${payment_id}, trigger: ${trigger_source || 'auto'}`);

    // ─── Step 1: Load payment ───
    const payments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
    if (!payments?.length) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }
    const payment = payments[0];

    // Validate payment is completed
    if (payment.status !== 'completed') {
      console.log(`[Invoice] Payment ${payment_id} status is ${payment.status}, skipping`);
      return Response.json({ status: 'skipped', reason: 'payment_not_completed' });
    }

    // ─── Step 2: Idempotency check ───
    const idempotencyKey = buildIdempotencyKey(payment_id, payment.transaction_id);

    const existingDocs = await base44.asServiceRole.entities.BillingDocument.filter({
      payment_id,
    });

    // Check if already issued OR currently processing (race condition guard)
    const alreadyIssued = existingDocs?.find(d => d.issue_status === 'issued');
    if (alreadyIssued) {
      console.log(`[Invoice] Already issued for payment ${payment_id}`);
      return Response.json({
        status: 'already_processed',
        billing_document_id: alreadyIssued.id,
        document_number: alreadyIssued.document_number,
      });
    }

    // Race condition: if another instance is already processing, wait briefly then recheck
    const currentlyProcessing = existingDocs?.find(d => d.issue_status === 'processing');
    if (currentlyProcessing) {
      // Check if it's been processing for more than 2 minutes (stale lock)
      const processingAge = Date.now() - new Date(currentlyProcessing.updated_date).getTime();
      if (processingAge < 120000) { // less than 2 minutes
        console.log(`[Invoice] Another instance is processing for payment ${payment_id}, skipping`);
        return Response.json({
          status: 'already_processing',
          billing_document_id: currentlyProcessing.id,
        });
      }
      // If stale, treat as failed so we can retry
      console.log(`[Invoice] Stale processing record found (${Math.round(processingAge/1000)}s), treating as failed`);
    }

    // If there's a failed or stale processing attempt, we'll retry (update existing record)
    const failedDoc = existingDocs?.find(d => d.issue_status === 'failed') || currentlyProcessing;

    // ─── Step 3: Get Morning connection ───
    let jwt, connection;
    try {
      const morningAuth = await getMorningJWT(base44);
      jwt = morningAuth.jwt;
      connection = morningAuth.connection;
    } catch (err) {
      const errorMsg = err.message;
      console.error('[Invoice] Morning auth failed:', errorMsg);

      // Create or update billing doc with error
      const errorData = {
        user_id: payment.user_id,
        payment_id,
        transaction_id: payment.transaction_id || '',
        document_type: 'invoice_receipt',
        amount_total: payment.amount || 0,
        currency: 'ILS',
        product_name: payment.product_name || '',
        issue_status: 'failed',
        error_code: 'MORNING_AUTH',
        error_message: errorMsg,
        idempotency_key: idempotencyKey,
        retry_count: (failedDoc?.retry_count || 0) + (failedDoc ? 1 : 0),
      };

      if (failedDoc) {
        await base44.asServiceRole.entities.BillingDocument.update(failedDoc.id, errorData);
      } else {
        await base44.asServiceRole.entities.BillingDocument.create(errorData);
      }

      return Response.json({ status: 'failed', error: errorMsg });
    }

    // ─── Step 4: Create billing document record (processing) ───
    let billingDoc;
    const billingData = {
      user_id: payment.user_id,
      payment_id,
      transaction_id: payment.transaction_id || '',
      document_type: resolveDocumentType(payment, connection),
      amount_total: payment.amount || 0,
      currency: 'ILS',
      product_name: payment.product_name || '',
      payment_method: payment.payment_method || 'credit_card',
      issue_status: 'processing',
      idempotency_key: idempotencyKey,
      retry_count: (failedDoc?.retry_count || 0) + (failedDoc ? 1 : 0),
    };

    if (failedDoc) {
      await base44.asServiceRole.entities.BillingDocument.update(failedDoc.id, billingData);
      billingDoc = { ...failedDoc, ...billingData };
    } else {
      billingDoc = await base44.asServiceRole.entities.BillingDocument.create(billingData);
    }
    const billingDocId = failedDoc?.id || billingDoc.id;

    // ─── Step 5: Resolve or create customer ───
    let morningCustomer;
    try {
      // Get user info - User entity only has id, email, full_name, role + custom fields
      let userInfo = {};
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: payment.user_id });
        userInfo = users?.[0] || {};
      } catch (userErr) {
        console.log('[Invoice] Could not fetch user info:', userErr.message);
      }

      // Merge data from multiple sources: User entity, Payment metadata, Payment fields
      const meta = payment.metadata || {};
      const customerData = {
        user_id: payment.user_id,
        full_name: userInfo.full_name || meta.user_name || meta.full_name || meta.customer_name || payment.product_name || '',
        email: userInfo.email || meta.user_email || meta.email || '',
        phone: meta.phone || meta.user_phone || '',
        tax_id: meta.tax_id || meta.id_number || '',
        company_name: meta.company_name || meta.business_name || '',
        address: meta.address || '',
        city: meta.city || '',
        zip: meta.zip || meta.zip_code || '',
      };

      console.log('[Invoice] Customer data resolved:', JSON.stringify({
        full_name: customerData.full_name,
        email: customerData.email,
        phone: customerData.phone,
      }));

      morningCustomer = await findOrCreateMorningCustomer(base44, jwt, customerData);

      await base44.asServiceRole.entities.BillingDocument.update(billingDocId, {
        morning_customer_id: morningCustomer.provider_customer_id,
        customer_name: morningCustomer.name || '',
        customer_email: morningCustomer.email || userInfo.email || '',
        customer_phone: morningCustomer.phone || '',
        customer_tax_id: morningCustomer.tax_id || '',
      });
    } catch (err) {
      console.error('[Invoice] Customer resolution failed:', err.message);
      await base44.asServiceRole.entities.BillingDocument.update(billingDocId, {
        issue_status: 'failed',
        error_code: 'CUSTOMER_FAILED',
        error_message: err.message,
      });
      return Response.json({ status: 'failed', error: err.message });
    }

    // ─── Step 6: Build and send document to Morning ───
    const docType = resolveDocumentType(payment, connection);
    const morningType = OUR_TO_MORNING_TYPE[docType];
    const isVatExempt = connection?.config?.is_vat_exempt;
    const vatType = isVatExempt ? 2 : 0;
    const income = buildDocumentItems(payment, vatType);

    // Payment line uses the actual amount paid (VAT-inclusive)
    const amountPaid = payment.amount || 0;

    // Build payment array (required for invoice_receipt and receipt)
    const paymentArr = [];
    if (docType === 'invoice_receipt' || docType === 'receipt') {
      paymentArr.push({
        type: MORNING_PAYMENT_MAP[payment.payment_method] || 3, // default credit card
        price: amountPaid,
        currency: 'ILS',
        date: new Date().toISOString().split('T')[0],
      });
    }

    const docPayload = {
      type: morningType,
      client: { id: morningCustomer.provider_customer_id },
      income,
      ...(paymentArr.length > 0 ? { payment: paymentArr } : {}),
      remarks: '',
      date: new Date().toISOString().split('T')[0],
      lang: 'he',
      currency: 'ILS',
    };

    console.log('[Invoice] Creating Morning document:', JSON.stringify(docPayload).substring(0, 500));

    await base44.asServiceRole.entities.BillingDocument.update(billingDocId, {
      raw_request: docPayload,
      items: income.map(i => ({
        description: i.description,
        quantity: i.quantity || 1,
        unit_price: i.price,
        line_total: (i.quantity || 1) * i.price,
      })),
    });

    const createResp = await fetchWithRetry(`${MORNING_BASE}/documents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(docPayload),
    });

    const resultText = await createResp.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch (_) {
      console.error('[Invoice] Non-JSON response from Morning:', resultText.substring(0, 300));
      await base44.asServiceRole.entities.BillingDocument.update(billingDocId, {
        issue_status: 'failed',
        error_code: 'MORNING_BAD_RESPONSE',
        error_message: resultText.substring(0, 500),
      });
      return Response.json({ status: 'failed', error: 'Morning returned non-JSON response' });
    }

    if (!createResp.ok) {
      console.error('[Invoice] Morning document create error:', createResp.status, JSON.stringify(result));
      await base44.asServiceRole.entities.BillingDocument.update(billingDocId, {
        issue_status: 'failed',
        error_code: `MORNING_${createResp.status}`,
        error_message: result.errorMessage || result.message || JSON.stringify(result),
        raw_response: result,
      });
      return Response.json({ status: 'failed', error: result.errorMessage || 'Morning document creation failed' });
    }

    // ─── Step 7: Document issued successfully ───
    const pdfUrl = result.url?.origin || result.url?.he || result.url?.en || null;
    const subtotal = result.amount || totalAmount;
    const vatAmount = result.vat || 0;
    const total = result.totalAmount || (subtotal + vatAmount);

    await base44.asServiceRole.entities.BillingDocument.update(billingDocId, {
      morning_document_id: String(result.id),
      document_number: result.number != null ? String(result.number) : null,
      issue_status: 'issued',
      issued_at: new Date().toISOString(),
      pdf_url: pdfUrl,
      amount_before_vat: subtotal,
      vat_amount: vatAmount,
      amount_total: total,
      raw_response: result,
      error_code: null,
      error_message: null,
    });

    console.log(`[Invoice] Document issued: #${result.number}, Morning ID: ${result.id}`);

    // ─── Step 8: Send email ───
    const customerEmail = morningCustomer.email || payment.metadata?.user_email;
    if (isValidEmail(customerEmail) && pdfUrl) {
      try {
        await base44.asServiceRole.entities.BillingDocument.update(billingDocId, {
          send_status: 'sending',
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customerEmail,
          subject: `חשבונית מס/קבלה מספר ${result.number || ''} – Perfect One`,
          body: `
            <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:linear-gradient(135deg,#1E3A5F,#2C5282);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
                <h2 style="color:white;margin:0;">חשבונית מס / קבלה</h2>
              </div>
              <div style="background:white;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                <p style="color:#374151;font-size:15px;">שלום ${morningCustomer.name || ''},</p>
                <p style="color:#374151;font-size:15px;">תודה על הרכישה! מצורפת חשבונית מס/קבלה עבור התשלום שלך.</p>
                <table style="width:100%;margin:16px 0;border-collapse:collapse;">
                  <tr><td style="padding:8px 0;color:#6b7280;">מספר מסמך:</td><td style="padding:8px 0;font-weight:bold;">${result.number || '-'}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280;">סכום:</td><td style="padding:8px 0;font-weight:bold;">₪${total?.toFixed(2) || payment.amount}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280;">תאריך:</td><td style="padding:8px 0;">${new Date().toLocaleDateString('he-IL')}</td></tr>
                </table>
                <div style="text-align:center;margin:20px 0;">
                  <a href="${pdfUrl}" style="display:inline-block;background:#1E3A5F;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">צפה בחשבונית</a>
                </div>
                <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Perfect One – ניהול עסקי חכם</p>
              </div>
            </div>
          `,
        });

        await base44.asServiceRole.entities.BillingDocument.update(billingDocId, {
          send_status: 'sent',
          sent_to_email: customerEmail,
          sent_at: new Date().toISOString(),
        });
        console.log(`[Invoice] Email sent to ${customerEmail}`);
      } catch (emailErr) {
        console.error('[Invoice] Email send failed:', emailErr.message);
        await base44.asServiceRole.entities.BillingDocument.update(billingDocId, {
          send_status: 'failed',
          sent_to_email: customerEmail,
          error_message: `Document issued but email failed: ${emailErr.message}`,
        });
      }
    } else {
      console.log('[Invoice] No valid email or PDF URL, skipping email');
      await base44.asServiceRole.entities.BillingDocument.update(billingDocId, {
        send_status: 'not_sent',
        error_message: !isValidEmail(customerEmail) ? 'No valid email' : 'No PDF URL',
      });
    }

    // ─── Step 9: Audit log ───
    await base44.asServiceRole.entities.AccountingAuditLog.create({
      user_id: payment.user_id,
      provider: 'morning',
      action: 'billing.auto_invoice',
      entity_type: 'BillingDocument',
      entity_id: billingDocId,
      details: {
        payment_id,
        transaction_id: payment.transaction_id,
        morning_document_id: String(result.id),
        document_number: String(result.number),
        amount: total,
        trigger_source: trigger_source || 'auto',
      },
      success: true,
    });

    return Response.json({
      status: 'success',
      billing_document_id: billingDocId,
      morning_document_id: String(result.id),
      document_number: String(result.number),
      pdf_url: pdfUrl,
      send_status: isValidEmail(customerEmail) && pdfUrl ? 'sent' : 'not_sent',
    });

  } catch (error) {
    console.error('[Invoice] Unexpected error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});