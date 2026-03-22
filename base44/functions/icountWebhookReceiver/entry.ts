import { createClient } from 'npm:@base44/sdk@0.8.6';

/**
 * iCount Webhook Receiver
 * Receives webhook events from iCount and syncs data in real-time.
 * Handles: doc_created, doc_updated, client_created, client_updated, expense_created, etc.
 * Authentication: shared secret in query param (?secret=...)
 */

const WEBHOOK_SECRET = Deno.env.get("ICOUNT_WEBHOOK_SECRET");
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
  if (!loginData.status) throw new Error('Session refresh failed');
  await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
    sid: loginData.sid,
    sid_expires_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    status: 'connected', last_error: null
  });
  return loginData.sid;
}

Deno.serve(async (req) => {
  try {
    // Validate webhook secret
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    
    if (WEBHOOK_SECRET && WEBHOOK_SECRET !== 'placeholder' && secret !== WEBHOOK_SECRET) {
      return Response.json({ error: 'Invalid webhook secret' }, { status: 403 });
    }

    const body = await req.json();
    const { action, cid, doctype, docnum, client_id, expense_id } = body;

    if (!action || !cid) {
      return Response.json({ error: 'Missing action or cid' }, { status: 400 });
    }

    // Webhook from iCount has no auth header - use service role directly
    const base44 = createClient({ appId: Deno.env.get("BASE44_APP_ID") });

    // Find connection by cid
    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      provider: 'icount',
      provider_account_id: String(cid)
    });

    if (!connections?.length) {
      return Response.json({ error: 'No connection found for this cid' }, { status: 404 });
    }

    const conn = connections[0];
    const userId = conn.user_id;
    let syncedItem = null;

    // Get session for API calls
    const sid = await ensureSession(base44, conn);

    // === REAL-TIME SYNC based on action ===

    // Document events
    if (action.startsWith('doc_') && doctype && docnum) {
      try {
        const infoRes = await fetch(`${ICOUNT_BASE_URL}/doc/info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid, doctype, docnum, detail_level: 2, get_pdf_link: true })
        });
        const infoData = await infoRes.json();
        
        if (infoData.status) {
          const doc = infoData;
          const docId = `${doctype}_${docnum}`;
          
          let ourType = 'receipt';
          if (doctype === 'invrec') ourType = 'invoice_receipt';
          else if (doctype === 'creditinv' || doctype === 'credit_invoice') ourType = 'credit';
          else if (doctype === 'invoice') ourType = 'invoice';
          else if (doctype === 'receipt') ourType = 'receipt';

          const docDataObj = {
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
            pdf_url: doc.pdf_link || doc.doc_url || null,
            items: doc.items_list || [],
            raw: doc,
            synced_at: new Date().toISOString()
          };

          const existing = await base44.asServiceRole.entities.FinbotDocument.filter({
            user_id: userId,
            finbot_document_id: docId
          });

          if (existing?.length) {
            await base44.asServiceRole.entities.FinbotDocument.update(existing[0].id, docDataObj);
            syncedItem = { type: 'document', action: 'updated', id: existing[0].id };
          } else {
            const created = await base44.asServiceRole.entities.FinbotDocument.create(docDataObj);
            syncedItem = { type: 'document', action: 'created', id: created.id };
          }
        }
      } catch (e) {
        console.error('Doc sync error:', e.message);
      }
    }

    // Client events
    if (action.startsWith('client_') && client_id) {
      try {
        const clientRes = await fetch(`${ICOUNT_BASE_URL}/client/get_info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid, client_id })
        });
        const clientData = await clientRes.json();
        
        if (clientData.status) {
          const client = clientData;
          const clientIdStr = String(client_id);
          
          const customerData = {
            user_id: userId,
            provider: 'icount',
            finbot_customer_id: clientIdStr,
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

          const existing = await base44.asServiceRole.entities.FinbotCustomer.filter({
            user_id: userId,
            finbot_customer_id: clientIdStr
          });

          if (existing?.length) {
            await base44.asServiceRole.entities.FinbotCustomer.update(existing[0].id, customerData);
            syncedItem = { type: 'customer', action: 'updated', id: existing[0].id };
          } else {
            const created = await base44.asServiceRole.entities.FinbotCustomer.create(customerData);
            syncedItem = { type: 'customer', action: 'created', id: created.id };
          }
        }
      } catch (e) {
        console.error('Client sync error:', e.message);
      }
    }

    // Expense events
    if (action.startsWith('expense_') && expense_id) {
      try {
        const expRes = await fetch(`${ICOUNT_BASE_URL}/expense/get_info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid, expense_id })
        });
        const expData = await expRes.json();
        
        if (expData.status) {
          const exp = expData;
          const expIdStr = String(expense_id);
          
          const expDataObj = {
            user_id: userId,
            provider: 'icount',
            finbot_expense_id: expIdStr,
            vendor: exp.supplier_name || '',
            category: exp.expense_type_name || '',
            date: exp.expense_date || '',
            amount: parseFloat(exp.expense_sum || 0),
            vat: parseFloat(exp.vat_sum || 0),
            payment_method: exp.expense_paid ? 'paid' : 'unpaid',
            raw: exp,
            synced_at: new Date().toISOString()
          };

          const existing = await base44.asServiceRole.entities.FinbotExpense.filter({
            user_id: userId,
            finbot_expense_id: expIdStr
          });

          if (existing?.length) {
            await base44.asServiceRole.entities.FinbotExpense.update(existing[0].id, expDataObj);
            syncedItem = { type: 'expense', action: 'updated', id: existing[0].id };
          } else {
            const created = await base44.asServiceRole.entities.FinbotExpense.create(expDataObj);
            syncedItem = { type: 'expense', action: 'created', id: created.id };
          }
        }
      } catch (e) {
        console.error('Expense sync error:', e.message);
      }
    }

    // Update last_sync_at on connection
    await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
      last_sync_at: new Date().toISOString()
    });

    // Audit log
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: userId,
      action: `icount.webhook.${action}`,
      request_data: body,
      response_data: syncedItem,
      success: true
    });

    return Response.json({ status: 'ok', synced: syncedItem });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});