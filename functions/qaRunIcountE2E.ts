import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

async function ensureSession(base44, userId) {
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({ user_id: userId, provider: 'icount' });
  if (!connections?.length) throw new Error('No iCount connection');
  const conn = connections[0];
  if (conn.status !== 'connected') throw new Error('Connection not active');

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
  if (!loginData.status) throw new Error('Session refresh failed');

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
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const body = await req.json();
    const { runId, options } = body;
    if (!runId) return Response.json({ error: 'runId is required' }, { status: 400 });

    const skipReports = options?.skipReports || false;
    const skipExpenses = options?.skipExpenses || false;
    const steps = [];
    const warnings = [];
    const created = { customerId: null, documentIds: [] };

    const logStep = async (name, status, details) => {
      steps.push({ name, status, details, timestamp: new Date().toISOString() });
      await base44.asServiceRole.entities.FinbotAuditLog.create({
        user_id: user.id,
        action: `qa.${name}`,
        request_data: { runId },
        response_data: { status, details: typeof details === 'string' ? details : JSON.stringify(details) },
        success: status === 'pass'
      });
    };

    // ===== A) Preflight =====
    let sid;
    try {
      const session = await ensureSession(base44, user.id);
      sid = session.sid;
      await logStep('preflight', 'pass', `Connected: ${session.cid}`);
    } catch (e) {
      await logStep('preflight', 'fail', e.message);
      return Response.json({ ok: false, runId, steps, created, warnings });
    }

    // ===== B) Create Customer (Push) =====
    let customerProviderId = null;
    try {
      const custPayload = {
        sid,
        client_name: `QA Customer ${runId}`,
        phone: '0500000000',
        email: `qa+${runId}@example.com`,
        notes: `QA_RUN:${runId}`
      };
      const custRes = await fetch(`${ICOUNT_BASE_URL}/client/create_or_update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custPayload)
      });
      const custData = await custRes.json();

      if (custData.status && custData.client_id) {
        customerProviderId = String(custData.client_id);
        const localCust = await base44.asServiceRole.entities.FinbotCustomer.create({
          user_id: user.id, provider: 'icount',
          finbot_customer_id: customerProviderId,
          name: `QA Customer ${runId}`,
          phone: '0500000000', email: `qa+${runId}@example.com`,
          notes: `QA_RUN:${runId}`,
          synced_at: new Date().toISOString()
        });
        created.customerId = localCust.id;
        await logStep('create_customer', 'pass', `iCount ID: ${customerProviderId}, local: ${localCust.id}`);
      } else {
        await logStep('create_customer', 'fail', custData.error_description || 'No client_id returned');
      }
    } catch (e) {
      await logStep('create_customer', 'fail', e.message);
    }

    // Helper: create document in iCount
    const createDoc = async (stepName, type, icountDoctype, unitPrice) => {
      if (!customerProviderId) {
        await logStep(stepName, 'skipped', 'No customer');
        return;
      }
      try {
        const items = [{ description: `QA ${type} ${runId}`, unitprice: unitPrice, quantity: 1 }];
        const docPayload = {
          sid, doctype: icountDoctype,
          client_id: parseInt(customerProviderId),
          items,
          doc_date: new Date().toISOString().split('T')[0],
          comment: `QA_RUN:${runId}`
        };
        // Add payment for receipt/invrec
        if (['invrec', 'receipt'].includes(icountDoctype)) {
          docPayload.cash = { sum: unitPrice };
        }
        const res = await fetch(`${ICOUNT_BASE_URL}/doc/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docPayload)
        });
        const data = await res.json();
        if (data.status && data.docnum) {
          const docId = `${data.doctype || icountDoctype}_${data.docnum}`;
          const localDoc = await base44.asServiceRole.entities.FinbotDocument.create({
            user_id: user.id, provider: 'icount',
            finbot_document_id: docId, type,
            customer_finbot_id: customerProviderId,
            issue_date: new Date().toISOString().split('T')[0],
            currency: 'ILS', subtotal: unitPrice,
            total: unitPrice, status: 'issued',
            pdf_url: data.doc_url || '',
            items: [{ description: `QA ${type} ${runId}`, unit_price: unitPrice, quantity: 1 }],
            notes: `QA_RUN:${runId}`, raw: data,
            synced_at: new Date().toISOString()
          });
          created.documentIds.push(localDoc.id);
          await logStep(stepName, 'pass', `docnum: ${data.docnum}, local: ${localDoc.id}`);
        } else {
          await logStep(stepName, 'fail', data.error_description || data.reason || JSON.stringify(data));
        }
      } catch (e) {
        await logStep(stepName, 'fail', e.message);
      }
    };

    // ===== C) invoice_receipt =====
    await createDoc('create_document_invrec', 'invoice_receipt', 'invrec', 100);
    // ===== D) receipt =====
    await createDoc('create_document_receipt', 'receipt', 'receipt', 50);
    // ===== E) credit invoice =====
    await createDoc('create_document_credit', 'credit', 'credit_invoice', 30);

    // ===== F) Pull Sync - Customers =====
    try {
      const pullRes = await fetch(`${ICOUNT_BASE_URL}/client/get_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, list_type: 'array' })
      });
      const pullData = await pullRes.json();
      if (pullData.status) {
        const clients = pullData.clients || pullData.client_list || [];
        const qaFound = clients.some(c => c.client_name?.includes(runId) || c.notes?.includes(runId));
        await logStep('pull_customers', qaFound ? 'pass' : 'warn',
          `${clients.length} customers fetched. QA customer ${qaFound ? 'found' : 'not found'}`);
        if (!qaFound) warnings.push('QA customer not found in pull');
      } else {
        await logStep('pull_customers', 'fail', pullData.error_description || 'Pull failed');
      }
    } catch (e) {
      await logStep('pull_customers', 'fail', e.message);
    }

    // Pull Sync - Documents
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const pullRes = await fetch(`${ICOUNT_BASE_URL}/doc/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, start_date: startDate, end_date: endDate, max_results: 100, sort_order: 'DESC' })
      });
      const pullData = await pullRes.json();
      if (pullData.status) {
        const docs = pullData.results_list || [];
        await logStep('pull_documents', 'pass', `${docs.length} documents fetched`);
      } else {
        await logStep('pull_documents', 'fail', pullData.error_description || 'Pull failed');
      }
    } catch (e) {
      await logStep('pull_documents', 'fail', e.message);
    }

    // ===== G) Expenses Pull =====
    if (!skipExpenses) {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];
        const pullRes = await fetch(`${ICOUNT_BASE_URL}/expense/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid, start_date: startDate, end_date: endDate, max_results: 100 })
        });
        const pullData = await pullRes.json();
        if (pullData.status) {
          const exps = pullData.results_list || [];
          await logStep('pull_expenses', exps.length > 0 ? 'pass' : 'warn',
            exps.length > 0 ? `${exps.length} expenses` : 'NO_EXPENSES_FOUND');
          if (exps.length === 0) warnings.push('No expenses found');
        } else if (pullData.reason === 'no_results_found') {
          await logStep('pull_expenses', 'warn', 'NO_EXPENSES_FOUND');
          warnings.push('No expenses in iCount');
        } else {
          await logStep('pull_expenses', 'fail', pullData.error_description || 'Pull failed');
        }
      } catch (e) {
        await logStep('pull_expenses', 'fail', e.message);
      }
    } else {
      await logStep('pull_expenses', 'skipped', 'Skipped by user');
    }

    // ===== H) Reports =====
    if (!skipReports) {
      const REPORT_ENDPOINTS = {
        customers: '/client/get_list',
        pnl: '/reports/income_tax_report',
        vat: '/reports/vat_report'
      };
      const today = new Date().toISOString().split('T')[0];
      const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      for (const [rType, endpoint] of Object.entries(REPORT_ENDPOINTS)) {
        try {
          const payload = { sid };
          if (rType === 'customers') payload.list_type = 'array';
          else if (rType === 'vat' || rType === 'pnl') {
            payload.start_month = thirtyAgo.substring(0, 7);
            payload.end_month = today.substring(0, 7);
          }
          const res = await fetch(`${ICOUNT_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.status) {
            await logStep(`report_${rType}`, 'pass', `Report OK`);
          } else {
            await logStep(`report_${rType}`, 'warn', `SKIPPED: ${data.error_description || data.reason || 'unknown'}`);
            warnings.push(`Report ${rType}: ${data.error_description || data.reason}`);
          }
        } catch (e) {
          await logStep(`report_${rType}`, 'warn', `SKIPPED: ${e.message}`);
          warnings.push(`Report ${rType}: ${e.message}`);
        }
      }
    } else {
      await logStep('reports', 'skipped', 'Skipped by user');
    }

    // ===== I) Download PDF =====
    if (created.documentIds.length > 0) {
      try {
        const docs = await base44.asServiceRole.entities.FinbotDocument.filter({ id: created.documentIds[0] });
        const doc = docs?.[0];
        if (doc?.pdf_url) {
          await logStep('download_pdf', 'pass', `PDF: ${doc.pdf_url.substring(0, 60)}...`);
        } else if (doc?.finbot_document_id) {
          const [doctype, docnum] = doc.finbot_document_id.split('_');
          const infoRes = await fetch(`${ICOUNT_BASE_URL}/doc/info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sid, doctype, docnum: parseInt(docnum), get_pdf_link: true })
          });
          const infoData = await infoRes.json();
          if (infoData.pdf_link || infoData.doc_url) {
            await logStep('download_pdf', 'pass', `PDF: ${(infoData.pdf_link || infoData.doc_url).substring(0, 60)}...`);
          } else {
            await logStep('download_pdf', 'warn', 'PDF_NOT_AVAILABLE');
            warnings.push('No PDF link from iCount');
          }
        } else {
          await logStep('download_pdf', 'warn', 'PDF_NOT_AVAILABLE');
        }
      } catch (e) {
        await logStep('download_pdf', 'warn', `PDF error: ${e.message}`);
        warnings.push(`PDF: ${e.message}`);
      }
    } else {
      await logStep('download_pdf', 'skipped', 'No documents created');
    }

    const hasFail = steps.some(s => s.status === 'fail');
    return Response.json({ ok: !hasFail, runId, steps, created, warnings });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});