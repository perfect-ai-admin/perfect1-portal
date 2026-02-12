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
  return { sid: loginData.sid, cid: conn.provider_account_id, conn };
}

async function syncCustomers(base44, userId, sid) {
  const res = await fetch(`${ICOUNT_BASE_URL}/client/get_list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sid, list_type: 'array' })
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.error_description || 'שגיאה בשליפת לקוחות');

  const clients = data.clients || data.client_list || [];
  let syncedCount = 0;

  for (const client of clients) {
    const clientId = String(client.client_id);
    // Check if exists
    const existing = await base44.asServiceRole.entities.FinbotCustomer.filter({
      user_id: userId,
      finbot_customer_id: clientId
    });

    const customerData = {
      user_id: userId,
      provider: 'icount',
      finbot_customer_id: clientId,
      name: client.client_name || '',
      id_number: client.vat_id || '',
      email: client.email || '',
      phone: client.phone || client.mobile || '',
      address: client.bus_street || '',
      city: client.bus_city || '',
      zip: client.bus_zip ? String(client.bus_zip) : '',
      notes: client.notes || '',
      raw: client,
      synced_at: new Date().toISOString()
    };

    if (existing?.length) {
      await base44.asServiceRole.entities.FinbotCustomer.update(existing[0].id, customerData);
    } else {
      await base44.asServiceRole.entities.FinbotCustomer.create(customerData);
    }
    syncedCount++;
  }

  return syncedCount;
}

async function syncDocuments(base44, userId, sid) {
  // Get documents from last 12 months
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const res = await fetch(`${ICOUNT_BASE_URL}/doc/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sid,
      start_date: startDate,
      end_date: endDate,
      detail_level: 2,
      max_results: 1000,
      sort_order: 'DESC'
    })
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.error_description || 'שגיאה בשליפת מסמכים');

  const docs = data.results_list || [];
  let syncedCount = 0;

  for (const doc of docs) {
    const docId = `${doc.doctype}_${doc.docnum}`;
    const existing = await base44.asServiceRole.entities.FinbotDocument.filter({
      user_id: userId,
      finbot_document_id: docId
    });

    // Map iCount doctype to our type
    let ourType = 'receipt';
    if (doc.doctype === 'invrec') ourType = 'invoice_receipt';
    else if (doc.doctype === 'creditinv' || doc.doctype === 'credit_invoice') ourType = 'credit';
    else if (doc.doctype === 'invoice') ourType = 'invoice';
    else if (doc.doctype === 'receipt') ourType = 'receipt';

    // Get PDF link
    let pdfUrl = null;
    try {
      const infoRes = await fetch(`${ICOUNT_BASE_URL}/doc/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, doctype: doc.doctype, docnum: doc.docnum, get_pdf_link: true })
      });
      const infoData = await infoRes.json();
      pdfUrl = infoData.pdf_link || infoData.doc_url || null;
    } catch (_) { /* skip pdf */ }

    const docData = {
      user_id: userId,
      provider: 'icount',
      finbot_document_id: docId,
      type: ourType,
      customer_finbot_id: doc.client_id ? String(doc.client_id) : '',
      customer_name: doc.client_name || '',
      issue_date: doc.dateissued || '',
      currency: doc.currency_code || 'ILS',
      subtotal: parseFloat(doc.totalsum || doc.total_sum || doc.total || 0),
      vat: parseFloat(doc.totalvat || doc.total_vat || 0),
      total: parseFloat(doc.totalwithvat || doc.total_with_vat || doc.totalsum || doc.total_sum || doc.total || 0),
      status: (doc.is_cancelled === 1 || doc.doc_status === 'cancelled') ? 'cancelled' : 'issued',
      pdf_url: pdfUrl,
      items: doc.items_list || [],
      raw: doc,
      synced_at: new Date().toISOString()
    };

    if (existing?.length) {
      await base44.asServiceRole.entities.FinbotDocument.update(existing[0].id, docData);
    } else {
      await base44.asServiceRole.entities.FinbotDocument.create(docData);
    }
    syncedCount++;
  }

  return syncedCount;
}

async function syncExpenses(base44, userId, sid) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const res = await fetch(`${ICOUNT_BASE_URL}/expense/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sid,
      start_date: startDate,
      end_date: endDate,
      max_results: 500,
      sort_order: 'DESC'
    })
  });
  const data = await res.json();
  if (!data.status) {
    if (data.reason === 'no_results_found') return 0;
    throw new Error(data.error_description || 'שגיאה בשליפת הוצאות');
  }

  const expenses = data.results_list || [];
  let syncedCount = 0;

  for (const exp of expenses) {
    const expId = String(exp.expense_id);
    const existing = await base44.asServiceRole.entities.FinbotExpense.filter({
      user_id: userId,
      finbot_expense_id: expId
    });

    const expData = {
      user_id: userId,
      provider: 'icount',
      finbot_expense_id: expId,
      vendor: exp.supplier_name || '',
      category: exp.expense_type_name || '',
      date: exp.expense_date || '',
      amount: parseFloat(exp.expense_sum || 0),
      vat: parseFloat(exp.vat_sum || 0),
      payment_method: exp.expense_paid ? 'paid' : 'unpaid',
      raw: exp,
      synced_at: new Date().toISOString()
    };

    if (existing?.length) {
      await base44.asServiceRole.entities.FinbotExpense.update(existing[0].id, expData);
    } else {
      await base44.asServiceRole.entities.FinbotExpense.create(expData);
    }
    syncedCount++;
  }

  return syncedCount;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { resource } = body;

    if (!resource) return Response.json({ error: 'resource is required' }, { status: 400 });

    const { sid, conn } = await ensureSession(base44, user.id);

    // Create sync job
    const jobTypeMap = { customers: 'pull_customers', documents: 'pull_documents', expenses: 'pull_expenses' };
    const syncJob = await base44.asServiceRole.entities.FinbotSyncJob.create({
      user_id: user.id,
      job_type: jobTypeMap[resource] || resource,
      status: 'running',
      started_at: new Date().toISOString()
    });

    let syncedCount = 0;

    // Debug mode
    if (body.debug) {
      const debugRes = await fetch(`${ICOUNT_BASE_URL}/client/get_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, list_type: 'array' })
      });
      const debugData = await debugRes.json();
      return Response.json({ 
        debug: true, 
        icount_status: debugData.status,
        keys: Object.keys(debugData),
        client_list_length: Array.isArray(debugData.client_list) ? debugData.client_list.length : 'not_array',
        first_client: debugData.client_list?.[0] || null,
        raw_snippet: JSON.stringify(debugData).substring(0, 500)
      });
    }

    if (resource === 'customers') {
      syncedCount = await syncCustomers(base44, user.id, sid);
    } else if (resource === 'documents') {
      syncedCount = await syncDocuments(base44, user.id, sid);
    } else if (resource === 'expenses') {
      syncedCount = await syncExpenses(base44, user.id, sid);
    } else {
      return Response.json({ error: `Unknown resource: ${resource}` }, { status: 400 });
    }

    // Update sync job
    await base44.asServiceRole.entities.FinbotSyncJob.update(syncJob.id, {
      status: 'success',
      finished_at: new Date().toISOString()
    });

    // Update last_sync_at on connection
    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({ user_id: user.id, provider: 'icount' });
    if (connections?.length) {
      await base44.asServiceRole.entities.AccountingConnection.update(connections[0].id, {
        last_sync_at: new Date().toISOString()
      });
    }

    // Audit log
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: `icount.sync_${resource}`,
      entity_type: 'FinbotSyncJob',
      entity_id: syncJob.id,
      response_data: { synced_count: syncedCount },
      success: true
    });

    return Response.json({ status: 'success', synced_count: syncedCount, job_id: syncJob.id });

  } catch (error) {
    return Response.json({ error: error.message, status: 'error' }, { status: 500 });
  }
});