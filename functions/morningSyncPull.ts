import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

/**
 * Morning (Green Invoice) — sync pull for customers, documents, expenses.
 * Input: { resource: "customers" | "documents" | "expenses" | "all" }
 */

// Document type mapping: Morning numeric → our string
const DOC_TYPE_MAP = {
  305: 'invoice',
  320: 'invoice_receipt',
  400: 'receipt',
  10:  'quote',
  330: 'credit_note',
  300: 'invoice',
  405: 'receipt',
  100: 'quote',
};

// Helper: fetch with retry on rate limit
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(url, options);
    if (resp.status === 429) {
      const waitSec = Math.pow(2, attempt + 1) * 2; // 4, 8, 16 seconds
      console.log(`Rate limited, waiting ${waitSec}s before retry ${attempt + 1}...`);
      await new Promise(r => setTimeout(r, waitSec * 1000));
      continue;
    }
    return resp;
  }
  throw new Error('Rate limit exceeded after retries');
}

async function getJWT(base44, userId) {
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
    user_id: userId, status: 'connected', provider: 'morning',
  });
  if (!connections?.length) throw new Error('אין חיבור פעיל ל-Morning');
  const conn = connections[0];
  
  const tokenResp = await fetchWithRetry(`${MORNING_BASE}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: conn.api_key_enc, secret: conn.api_secret_enc }),
  });
  
  if (!tokenResp.ok) {
    const errText = await tokenResp.text();
    console.log('Morning token error:', tokenResp.status, errText);
    throw new Error('שגיאה בהתחברות ל-Morning – בדוק את פרטי ה-API');
  }
  
  const { token } = await tokenResp.json();
  if (!token) throw new Error('לא התקבל טוקן מ-Morning');
  return { jwt: token, connection: conn };
}

// Batch upsert helper - collect items then upsert
async function batchUpsert(base44, entityName, items, matchFields) {
  let count = 0;
  // Process in small batches to avoid rate limits on base44 side
  for (const item of items) {
    const filter = {};
    for (const f of matchFields) {
      filter[f] = item[f];
    }
    const existing = await base44.asServiceRole.entities[entityName].filter(filter);
    if (existing?.length > 0) {
      await base44.asServiceRole.entities[entityName].update(existing[0].id, item);
    } else {
      await base44.asServiceRole.entities[entityName].create(item);
    }
    count++;
  }
  return count;
}

async function syncCustomers(base44, userId, jwt) {
  let page = 1;
  let allItems = [];
  const pageSize = 100;

  while (true) {
    const resp = await fetchWithRetry(`${MORNING_BASE}/clients/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, pageSize }),
    });
    
    if (!resp.ok) {
      console.log('Morning clients/search error:', resp.status, await resp.text().catch(() => ''));
      break;
    }
    
    const data = await resp.json();
    const items = data.items || [];
    if (!items.length) break;

    for (const c of items) {
      allItems.push({
        user_id: userId,
        provider: 'morning',
        provider_customer_id: String(c.id),
        name: c.name || c.companyName || 'ללא שם',
        contact_person: c.contactPerson || null,
        tax_id: c.taxId || null,
        email: Array.isArray(c.emails) && c.emails.length > 0 ? c.emails[0] : null,
        phone: c.phone || null,
        address: c.address || null,
        city: c.city || null,
        zip: c.zip || null,
        country: c.country || 'IL',
        is_active: c.active !== false,
        raw: c,
        synced_at: new Date().toISOString(),
      });
    }

    console.log(`Fetched ${items.length} customers (page ${page}), total so far: ${allItems.length}`);
    if (items.length < pageSize) break;
    page++;
    if (page > 100) break;
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`Upserting ${allItems.length} customers...`);
  return await batchUpsert(base44, 'AccountingCustomer', allItems, ['user_id', 'provider', 'provider_customer_id']);
}

async function syncDocuments(base44, userId, jwt) {
  let page = 1;
  let allItems = [];
  const pageSize = 100;

  while (true) {
    const resp = await fetchWithRetry(`${MORNING_BASE}/documents/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, pageSize, sort: 'documentDate', sortType: 'desc' }),
    });
    
    if (!resp.ok) {
      console.log('Morning documents/search error:', resp.status, await resp.text().catch(() => ''));
      break;
    }
    
    const data = await resp.json();
    const items = data.items || [];
    if (!items.length) break;

    for (const d of items) {
      const docType = DOC_TYPE_MAP[d.type] || 'invoice';
      let status = 'final';
      if (d.status === 0) status = 'draft';
      else if (d.status === 3) status = 'cancelled';

      const subtotal = d.amount || 0;
      const vatAmount = d.vat || 0;
      const total = d.totalAmount || (subtotal + vatAmount);

      let paymentMethod = null;
      if (Array.isArray(d.payment) && d.payment.length > 0) {
        const pmMap = { 0: 'other', 1: 'cash', 2: 'check', 3: 'credit_card', 4: 'bank_transfer', 5: 'paypal', 10: 'bit' };
        paymentMethod = pmMap[d.payment[0].type] || 'other';
      }

      let pdfUrl = null;
      if (d.url) {
        pdfUrl = d.url.origin || d.url.he || d.url.en || null;
      }

      allItems.push({
        user_id: userId,
        provider: 'morning',
        provider_document_id: String(d.id),
        doc_type: docType,
        doc_number: d.number != null ? String(d.number) : null,
        status,
        direction: 'outbound',
        customer_provider_id: d.client?.id ? String(d.client.id) : null,
        customer_name: d.client?.name || null,
        customer_tax_id: d.client?.taxId || null,
        currency: d.currency || 'ILS',
        subtotal,
        vat_rate: d.vatType === 2 ? 0 : 17,
        vat_amount: vatAmount,
        total,
        amount_paid: d.totalPaid || 0,
        balance_due: Math.max(0, total - (d.totalPaid || 0)),
        issue_date: d.documentDate || d.creationDate || null,
        due_date: d.dueDate || null,
        payment_date: d.paymentDate || null,
        payment_method: paymentMethod,
        items: Array.isArray(d.income) ? d.income.map(item => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.price || 0,
          line_total: (item.quantity || 1) * (item.price || 0),
        })) : [],
        notes: d.footer || d.remarks || null,
        pdf_url: pdfUrl,
        raw: d,
        synced_at: new Date().toISOString(),
      });
    }

    console.log(`Fetched ${items.length} documents (page ${page}), total so far: ${allItems.length}`);
    if (items.length < pageSize) break;
    page++;
    if (page > 100) break;
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`Upserting ${allItems.length} documents...`);
  return await batchUpsert(base44, 'AccountingDocument', allItems, ['user_id', 'provider', 'provider_document_id']);
}

async function syncExpenses(base44, userId, jwt) {
  let page = 1;
  let allItems = [];
  const pageSize = 100;

  while (true) {
    const resp = await fetchWithRetry(`${MORNING_BASE}/expenses/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, pageSize }),
    });
    
    if (!resp.ok) {
      console.log('Morning expenses/search error:', resp.status, await resp.text().catch(() => ''));
      break;
    }
    
    const data = await resp.json();
    const items = data.items || [];
    if (!items.length) break;

    for (const e of items) {
      allItems.push({
        user_id: userId,
        provider: 'morning',
        provider_expense_id: String(e.id),
        vendor: e.supplier?.name || e.description || null,
        category: e.accountingClassification || null,
        description: e.description || null,
        date: e.documentDate || e.date || null,
        amount: e.totalAmount || e.amount || 0,
        vat_amount: e.vat || 0,
        net_amount: (e.totalAmount || e.amount || 0) - (e.vat || 0),
        currency: e.currency || 'ILS',
        payment_method: null,
        reference_number: e.number != null ? String(e.number) : null,
        raw: e,
        synced_at: new Date().toISOString(),
      });
    }

    console.log(`Fetched ${items.length} expenses (page ${page}), total so far: ${allItems.length}`);
    if (items.length < pageSize) break;
    page++;
    if (page > 100) break;
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`Upserting ${allItems.length} expenses...`);
  return await batchUpsert(base44, 'AccountingExpense', allItems, ['user_id', 'provider', 'provider_expense_id']);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const resource = body.resource;
    if (!resource) return Response.json({ error: 'resource is required' }, { status: 400 });

    const { jwt, connection } = await getJWT(base44, user.id);

    let synced_count = 0;
    const results = {};

    if (resource === 'customers' || resource === 'all') {
      const count = await syncCustomers(base44, user.id, jwt);
      synced_count += count;
      results.customers = count;
      console.log(`Morning synced ${count} customers`);
    }
    if (resource === 'documents' || resource === 'all') {
      const count = await syncDocuments(base44, user.id, jwt);
      synced_count += count;
      results.documents = count;
      console.log(`Morning synced ${count} documents`);
    }
    if (resource === 'expenses' || resource === 'all') {
      const count = await syncExpenses(base44, user.id, jwt);
      synced_count += count;
      results.expenses = count;
      console.log(`Morning synced ${count} expenses`);
    }

    // Update connection last_sync_at
    await base44.asServiceRole.entities.AccountingConnection.update(connection.id, {
      last_sync_at: new Date().toISOString(),
      last_error: null,
      last_full_import_at: new Date().toISOString(),
    });

    // Audit
    await base44.asServiceRole.entities.AccountingAuditLog.create({
      user_id: user.id,
      provider: 'morning',
      action: `sync.pull_${resource}`,
      details: { synced_count, results },
      success: true,
    });

    return Response.json({ status: 'success', synced_count, results });
  } catch (error) {
    console.log('morningSyncPull error:', error.message);
    return Response.json({ error: error.message, status: 'error' }, { status: 500 });
  }
});