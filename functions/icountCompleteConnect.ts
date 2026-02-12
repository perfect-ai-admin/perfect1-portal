import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { cid, username, password } = body;

    if (!cid || !username || !password) {
      return Response.json({ error: 'נדרשים מזהה חברה, שם משתמש וסיסמה' }, { status: 400 });
    }

    // Try to login to iCount to verify credentials
    const loginRes = await fetch(`${ICOUNT_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cid,
        user: username,
        pass: password,
        get_company_info: true
      })
    });

    const loginData = await loginRes.json();

    if (!loginData.status) {
      await base44.asServiceRole.entities.FinbotAuditLog.create({
        user_id: user.id,
        action: 'icount.connect_failed',
        request_data: { cid, username },
        response_data: loginData,
        success: false
      });
      return Response.json({
        status: 'error',
        message: loginData.error_description || 'שגיאה בהתחברות ל-iCount. בדוק את הפרטים.'
      });
    }

    const sid = loginData.sid;

    // Find or create connection
    const existing = await base44.asServiceRole.entities.AccountingConnection.filter({
      user_id: user.id,
      provider: 'icount'
    });

    const connectionData = {
      user_id: user.id,
      provider: 'icount',
      strategy: 'session',
      status: 'connected',
      provider_account_id: cid,
      sid,
      sid_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      username: username,
      password_ref: password,
      config: {
        company_name: loginData.company_info?.businessName || '',
        vat_id: loginData.company_info?.vat_id || '',
        is_tax_exempt: loginData.company_info?.is_tax_exempt || false,
        is_vat_exempt: loginData.company_info?.is_vat_exempt || false
      },
      last_error: null
    };

    if (existing && existing.length > 0) {
      await base44.asServiceRole.entities.AccountingConnection.update(existing[0].id, connectionData);
    } else {
      await base44.asServiceRole.entities.AccountingConnection.create(connectionData);
    }

    // Log success
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'icount.connect_success',
      request_data: { cid, username },
      response_data: { sid: '***', company: loginData.company_info?.businessName },
      success: true
    });

    // ===== INITIAL FULL SYNC =====
    // Sync all data immediately after connection
    const syncResults = { customers: 0, documents: 0, expenses: 0, errors: [] };

    // 1. Sync Customers
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
          const existingCust = await base44.asServiceRole.entities.FinbotCustomer.filter({
            user_id: user.id,
            finbot_customer_id: clientId
          });
          const customerData = {
            user_id: user.id,
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
          if (existingCust?.length) {
            await base44.asServiceRole.entities.FinbotCustomer.update(existingCust[0].id, customerData);
          } else {
            await base44.asServiceRole.entities.FinbotCustomer.create(customerData);
          }
          syncResults.customers++;
        }
      }
    } catch (e) {
      syncResults.errors.push(`customers: ${e.message}`);
    }

    // 2. Sync Documents (last 12 months for initial sync)
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const docRes = await fetch(`${ICOUNT_BASE_URL}/doc/search`, {
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
      const docData = await docRes.json();
      if (docData.status) {
        const docs = docData.results_list || [];
        for (const doc of docs) {
          const docId = `${doc.doctype}_${doc.docnum}`;
          const existingDoc = await base44.asServiceRole.entities.FinbotDocument.filter({
            user_id: user.id,
            finbot_document_id: docId
          });

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

          const docDataObj = {
            user_id: user.id,
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

          if (existingDoc?.length) {
            await base44.asServiceRole.entities.FinbotDocument.update(existingDoc[0].id, docDataObj);
          } else {
            await base44.asServiceRole.entities.FinbotDocument.create(docDataObj);
          }
          syncResults.documents++;
        }
      }
    } catch (e) {
      syncResults.errors.push(`documents: ${e.message}`);
    }

    // 3. Sync Expenses (last 12 months)
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const expRes = await fetch(`${ICOUNT_BASE_URL}/expense/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sid,
          start_date: startDate,
          end_date: endDate,
          max_results: 1000,
          sort_order: 'DESC'
        })
      });
      const expData = await expRes.json();
      if (expData.status) {
        const expenses = expData.results_list || [];
        for (const exp of expenses) {
          const expId = String(exp.expense_id);
          const existingExp = await base44.asServiceRole.entities.FinbotExpense.filter({
            user_id: user.id,
            finbot_expense_id: expId
          });
          const expDataObj = {
            user_id: user.id,
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
          if (existingExp?.length) {
            await base44.asServiceRole.entities.FinbotExpense.update(existingExp[0].id, expDataObj);
          } else {
            await base44.asServiceRole.entities.FinbotExpense.create(expDataObj);
          }
          syncResults.expenses++;
        }
      }
    } catch (e) {
      syncResults.errors.push(`expenses: ${e.message}`);
    }

    // Update connection with sync timestamp
    const connList = await base44.asServiceRole.entities.AccountingConnection.filter({ user_id: user.id, provider: 'icount' });
    if (connList?.length) {
      await base44.asServiceRole.entities.AccountingConnection.update(connList[0].id, {
        last_sync_at: new Date().toISOString()
      });
    }

    // Audit log for sync
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'icount.initial_sync',
      response_data: syncResults,
      success: syncResults.errors.length === 0
    });

    return Response.json({
      status: 'connected',
      message: `התחברת בהצלחה ל-iCount (${loginData.company_info?.businessName || cid})`,
      sync: {
        customers: syncResults.customers,
        documents: syncResults.documents,
        expenses: syncResults.expenses,
        errors: syncResults.errors
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});