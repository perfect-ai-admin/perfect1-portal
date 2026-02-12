import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

async function ensureSession(base44, conn) {
  const sidExpiry = conn.sid_expires_at ? new Date(conn.sid_expires_at) : null;
  if (conn.sid && sidExpiry && sidExpiry > new Date()) {
    return conn.sid;
  }

  const loginRes = await fetch(`${ICOUNT_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cid: conn.provider_account_id, user: conn.username, pass: conn.password_ref })
  });
  const loginData = await loginRes.json();
  if (!loginData.status) throw new Error(loginData.error_description || 'Login failed');

  await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
    sid: loginData.sid,
    sid_expires_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    status: 'connected',
    last_error: null
  });

  return loginData.sid;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Find ALL active iCount connections
    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      provider: 'icount',
      status: 'connected'
    });

    if (!connections?.length) {
      return Response.json({ status: 'ok', message: 'No active iCount connections', synced: 0 });
    }

    const results = [];

    for (const conn of connections) {
      const userId = conn.user_id;
      let sid;
      try {
        sid = await ensureSession(base44, conn);
      } catch (e) {
        results.push({ userId, error: e.message });
        continue;
      }

      let customersCount = 0;
      let documentsCount = 0;

      // Sync customers
      try {
        const custRes = await fetch(`${ICOUNT_BASE_URL}/client/get_list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid, list_type: 'array' })
        });
        const custData = await custRes.json();
        if (custData.status) {
          const clients = custData.clients || custData.client_list || [];
          for (const client of clients) {
            const clientId = String(client.client_id);
            const existing = await base44.asServiceRole.entities.FinbotCustomer.filter({
              user_id: userId, finbot_customer_id: clientId
            });
            const data = {
              user_id: userId, provider: 'icount', finbot_customer_id: clientId,
              name: client.client_name || '', id_number: client.vat_id || '',
              email: client.email || '', phone: client.phone || client.mobile || '',
              address: client.bus_street || '', city: client.bus_city || '',
              zip: client.bus_zip ? String(client.bus_zip) : '', notes: client.notes || '',
              raw: client, synced_at: new Date().toISOString()
            };
            if (existing?.length) {
              await base44.asServiceRole.entities.FinbotCustomer.update(existing[0].id, data);
            } else {
              await base44.asServiceRole.entities.FinbotCustomer.create(data);
            }
            customersCount++;
          }
        }
      } catch (_) { /* skip */ }

      // Sync documents (last 90 days for periodic sync)
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const docRes = await fetch(`${ICOUNT_BASE_URL}/doc/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid, start_date: startDate, end_date: endDate, detail_level: 2, max_results: 500, sort_order: 'DESC' })
        });
        const docData = await docRes.json();
        if (docData.status) {
          const docs = docData.results_list || [];
          for (const doc of docs) {
            const docId = `${doc.doctype}_${doc.docnum}`;
            const existing = await base44.asServiceRole.entities.FinbotDocument.filter({
              user_id: userId, finbot_document_id: docId
            });

            let ourType = 'receipt';
            if (doc.doctype === 'invrec') ourType = 'invoice_receipt';
            else if (doc.doctype === 'creditinv' || doc.doctype === 'credit_invoice') ourType = 'credit';
            else if (doc.doctype === 'invoice') ourType = 'invoice';

            let pdfUrl = null;
            try {
              const infoRes = await fetch(`${ICOUNT_BASE_URL}/doc/info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sid, doctype: doc.doctype, docnum: doc.docnum, get_pdf_link: true })
              });
              const infoData = await infoRes.json();
              pdfUrl = infoData.pdf_link || infoData.doc_url || null;
            } catch (_) { /* skip */ }

            const rawSubtotal = parseFloat(doc.totalsum || doc.total_sum || doc.total || 0);
            let rawVat = parseFloat(doc.totalvat || doc.total_vat || 0);
            let rawTotal = parseFloat(doc.totalwithvat || doc.total_with_vat || 0);
            if (!rawTotal && rawSubtotal) rawTotal = Math.round((rawSubtotal + rawVat) * 100) / 100;
            if (rawTotal && !rawVat && rawTotal > rawSubtotal) rawVat = Math.round((rawTotal - rawSubtotal) * 100) / 100;

            const data = {
              user_id: userId, provider: 'icount', finbot_document_id: docId,
              type: ourType, customer_finbot_id: doc.client_id ? String(doc.client_id) : '',
              customer_name: doc.client_name || '', issue_date: doc.dateissued || '',
              currency: doc.currency_code || 'ILS', subtotal: rawSubtotal, vat: rawVat,
              total: rawTotal || rawSubtotal,
              status: (doc.is_cancelled === 1 || doc.doc_status === 'cancelled') ? 'cancelled' : 'issued',
              pdf_url: pdfUrl, items: doc.items_list || [], raw: doc,
              synced_at: new Date().toISOString()
            };

            if (existing?.length) {
              await base44.asServiceRole.entities.FinbotDocument.update(existing[0].id, data);
            } else {
              await base44.asServiceRole.entities.FinbotDocument.create(data);
            }
            documentsCount++;
          }
        }
      } catch (_) { /* skip */ }

      // Update last_sync_at
      await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
        last_sync_at: new Date().toISOString()
      });

      results.push({ userId, customers: customersCount, documents: documentsCount });
    }

    return Response.json({ status: 'ok', results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});