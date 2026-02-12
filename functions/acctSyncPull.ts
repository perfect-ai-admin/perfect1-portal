import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

const DOC_TYPE_MAP = {
  305: 'invoice', 320: 'invoice_receipt', 400: 'receipt',
  10: 'quote', 330: 'credit_note', 300: 'invoice', 405: 'receipt', 100: 'quote',
};

async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(url, options);
    if (resp.status === 429) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt + 1) * 2000));
      continue;
    }
    return resp;
  }
  throw new Error('Rate limit exceeded from Morning API');
}

async function getMorningJWT(conn) {
  const tokenResp = await fetchWithRetry(`${MORNING_BASE}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: conn.api_key_enc, secret: conn.api_secret_enc }),
  });
  if (!tokenResp.ok) throw new Error('שגיאה בהתחברות ל-Morning');
  const { token } = await tokenResp.json();
  return token;
}

// Helper: process items with rate-limit-safe delays
async function safeUpsertBatch(base44, entityName, items, matchFields) {
  let count = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const filter = {};
    for (const f of matchFields) filter[f] = item[f];

    try {
      const existing = await base44.asServiceRole.entities[entityName].filter(filter);
      if (existing?.length > 0) {
        await base44.asServiceRole.entities[entityName].update(existing[0].id, item);
      } else {
        await base44.asServiceRole.entities[entityName].create(item);
      }
      count++;
    } catch (e) {
      // Rate limit from Base44 SDK - wait and retry once
      if (e.message?.includes('429') || e.message?.includes('Rate limit')) {
        console.log(`Rate limit hit at item ${i}, waiting 3s...`);
        await new Promise(r => setTimeout(r, 3000));
        try {
          const existing2 = await base44.asServiceRole.entities[entityName].filter(filter);
          if (existing2?.length > 0) {
            await base44.asServiceRole.entities[entityName].update(existing2[0].id, item);
          } else {
            await base44.asServiceRole.entities[entityName].create(item);
          }
          count++;
        } catch (e2) {
          console.log(`Failed to upsert item ${i} after retry: ${e2.message}`);
        }
      } else {
        console.log(`Error upserting item ${i}: ${e.message}`);
      }
    }

    // Small delay every 5 items to avoid rate limits
    if ((i + 1) % 5 === 0) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  return count;
}

async function morningSyncCustomers(base44, userId, jwt) {
  let page = 1;
  const allItems = [];
  while (true) {
    const resp = await fetchWithRetry(`${MORNING_BASE}/clients/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, pageSize: 100 }),
    });
    if (!resp.ok) break;
    const data = await resp.json();
    const items = data.items || [];
    if (!items.length) break;

    for (const c of items) {
      allItems.push({
        user_id: userId, provider: 'morning',
        provider_customer_id: String(c.id),
        name: c.name || c.companyName || 'ללא שם',
        contact_person: c.contactPerson || null,
        tax_id: c.taxId || null,
        email: Array.isArray(c.emails) && c.emails.length > 0 ? c.emails[0] : null,
        phone: c.phone || null, address: c.address || null,
        city: c.city || null, zip: c.zip || null,
        country: c.country || 'IL', is_active: c.active !== false,
        raw: c, synced_at: new Date().toISOString(),
      });
    }
    console.log(`Fetched ${items.length} customers (page ${page})`);
    if (items.length < 100) break;
    page++;
    if (page > 50) break;
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`Total customers fetched from Morning: ${allItems.length}, starting upsert...`);
  return await safeUpsertBatch(base44, 'AccountingCustomer', allItems, ['user_id', 'provider', 'provider_customer_id']);
}

async function morningSyncDocuments(base44, userId, jwt) {
  let page = 1;
  const allItems = [];
  while (true) {
    const resp = await fetchWithRetry(`${MORNING_BASE}/documents/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, pageSize: 100, sort: 'documentDate', sortType: 'desc' }),
    });
    if (!resp.ok) break;
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
      if (d.url) pdfUrl = d.url.origin || d.url.he || d.url.en || null;

      allItems.push({
        user_id: userId, provider: 'morning',
        provider_document_id: String(d.id), doc_type: docType,
        doc_number: d.number != null ? String(d.number) : null,
        status, direction: 'outbound',
        customer_provider_id: d.client?.id ? String(d.client.id) : null,
        customer_name: d.client?.name || null,
        customer_tax_id: d.client?.taxId || null,
        currency: d.currency || 'ILS', subtotal, vat_amount: vatAmount, total,
        amount_paid: d.totalPaid || 0,
        balance_due: Math.max(0, total - (d.totalPaid || 0)),
        issue_date: d.documentDate || d.creationDate || null,
        due_date: d.dueDate || null, payment_date: d.paymentDate || null,
        payment_method: paymentMethod,
        items: Array.isArray(d.income) ? d.income.map(item => ({
          description: item.description || '', quantity: item.quantity || 1,
          unit_price: item.price || 0, line_total: (item.quantity || 1) * (item.price || 0),
        })) : [],
        notes: d.footer || d.remarks || null, pdf_url: pdfUrl,
        raw: d, synced_at: new Date().toISOString(),
      });
    }
    console.log(`Fetched ${items.length} documents (page ${page})`);
    if (items.length < 100) break;
    page++;
    if (page > 50) break;
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`Total documents fetched from Morning: ${allItems.length}, starting upsert...`);
  return await safeUpsertBatch(base44, 'AccountingDocument', allItems, ['user_id', 'provider', 'provider_document_id']);
}

async function morningSyncExpenses(base44, userId, jwt) {
  let page = 1;
  const allItems = [];
  while (true) {
    const resp = await fetchWithRetry(`${MORNING_BASE}/expenses/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, pageSize: 100 }),
    });
    if (!resp.ok) break;
    const data = await resp.json();
    const items = data.items || [];
    if (!items.length) break;

    for (const e of items) {
      allItems.push({
        user_id: userId, provider: 'morning',
        provider_expense_id: String(e.id),
        vendor: e.supplier?.name || e.description || null,
        category: e.accountingClassification || null,
        description: e.description || null,
        date: e.documentDate || e.date || null,
        amount: e.totalAmount || e.amount || 0,
        vat_amount: e.vat || 0,
        net_amount: (e.totalAmount || e.amount || 0) - (e.vat || 0),
        currency: e.currency || 'ILS',
        reference_number: e.number != null ? String(e.number) : null,
        raw: e, synced_at: new Date().toISOString(),
      });
    }
    console.log(`Fetched ${items.length} expenses (page ${page})`);
    if (items.length < 100) break;
    page++;
    if (page > 50) break;
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`Total expenses fetched from Morning: ${allItems.length}, starting upsert...`);
  return await safeUpsertBatch(base44, 'AccountingExpense', allItems, ['user_id', 'provider', 'provider_expense_id']);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { resource } = await req.json();
    if (!resource) return Response.json({ error: 'resource is required' }, { status: 400 });

    // Get active connection
    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      user_id: user.id, status: 'connected'
    });
    if (!connections?.length) {
      return Response.json({ error: 'אין חיבור פעיל למערכת חשבונות' }, { status: 400 });
    }
    const connection = connections[0];
    const provider = connection.provider;

    // For non-Morning providers, delegate to their specific sync function
    if (provider !== 'morning') {
      const providerSyncMap = {
        icount: 'icountSyncPull',
        finbot: 'finbotSyncPull',
      };
      const syncFn = providerSyncMap[provider];
      if (!syncFn) {
        return Response.json({ error: `סנכרון עדיין לא נתמך עבור ${provider}` }, { status: 400 });
      }

      // Delegate to provider-specific function
      console.log(`Delegating sync to ${syncFn} for provider ${provider}`);
      const resources = resource === 'all' ? ['customers', 'documents', 'expenses'] : [resource];
      const results = {};
      let totalCount = 0;

      for (const res of resources) {
        try {
          const syncRes = await base44.asServiceRole.functions.invoke(syncFn, { resource: res });
          const count = syncRes?.synced_count || 0;
          results[res] = count;
          totalCount += count;
          console.log(`${provider} synced ${count} ${res}`);
        } catch (e) {
          console.log(`${provider} sync ${res} error: ${e.message}`);
          results[res] = 0;
        }
      }

      return Response.json({ status: 'success', provider, synced_count: totalCount, results });
    }

    const jwt = await getMorningJWT(connection);
    const results = {};
    let totalCount = 0;

    const resources = resource === 'all' ? ['customers', 'documents', 'expenses'] : [resource];

    for (const res of resources) {
      let count = 0;
      if (res === 'customers') count = await morningSyncCustomers(base44, user.id, jwt);
      else if (res === 'documents') count = await morningSyncDocuments(base44, user.id, jwt);
      else if (res === 'expenses') count = await morningSyncExpenses(base44, user.id, jwt);
      results[res] = count;
      totalCount += count;
      console.log(`Synced ${count} ${res}`);
    }

    // Update connection
    await base44.asServiceRole.entities.AccountingConnection.update(connection.id, {
      last_sync_at: new Date().toISOString(),
      last_full_import_at: new Date().toISOString(),
      last_error: null,
    });

    // Audit
    await base44.asServiceRole.entities.AccountingAuditLog.create({
      user_id: user.id,
      provider,
      action: `sync.pull_${resource}`,
      details: { synced_count: totalCount, results },
      success: true,
    });

    return Response.json({ status: 'success', provider, synced_count: totalCount, results });
  } catch (error) {
    console.log('acctSyncPull error:', error.message);
    return Response.json({ error: error.message, status: 'error' }, { status: 500 });
  }
});