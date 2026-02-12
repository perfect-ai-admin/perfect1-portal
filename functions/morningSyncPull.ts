import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

/**
 * Morning (Green Invoice) — sync pull for customers, documents, expenses.
 * Input: { resource: "customers" | "documents" | "expenses" }
 */

// Document type mapping: Morning numeric → our string
const DOC_TYPE_MAP = {
  305: 'invoice',        // חשבונית מס
  320: 'invoice_receipt', // חשבונית מס / קבלה
  400: 'receipt',         // קבלה
  10:  'quote',           // הצעת מחיר
  330: 'credit_note',     // חשבונית זיכוי
  300: 'invoice',         // חשבון עסקה (mapped to invoice)
  405: 'receipt',         // קבלה על תרומה
};

const DOC_TYPE_LABELS = {
  305: 'חשבונית מס',
  320: 'חשבונית מס / קבלה',
  400: 'קבלה',
  10:  'הצעת מחיר',
  330: 'חשבונית זיכוי',
  300: 'חשבון עסקה',
  405: 'קבלה על תרומה',
};

async function getJWT(base44, userId) {
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
    user_id: userId, status: 'connected', provider: 'morning',
  });
  if (!connections?.length) throw new Error('אין חיבור פעיל ל-Morning');
  const conn = connections[0];
  
  // Get fresh JWT token
  const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: conn.api_key_enc, secret: conn.api_secret_enc }),
  });
  
  if (!tokenResp.ok) {
    const err = await tokenResp.json().catch(() => ({}));
    throw new Error(err.errorMessage || 'שגיאה בהתחברות ל-Morning');
  }
  
  const { token } = await tokenResp.json();
  return { jwt: token, connection: conn };
}

async function syncCustomers(base44, userId, jwt) {
  let page = 1;
  let totalSynced = 0;
  const pageSize = 50;

  while (true) {
    const resp = await fetch(`${MORNING_BASE}/clients/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, pageSize }),
    });
    if (!resp.ok) break;
    
    const data = await resp.json();
    const items = data.items || [];
    if (!items.length) break;

    for (const c of items) {
      const normalized = {
        user_id: userId,
        provider: 'morning',
        provider_customer_id: c.id,
        name: c.name || c.companyName || 'ללא שם',
        contact_person: c.contactPerson || null,
        tax_id: c.taxId || null,
        email: (c.emails && c.emails[0]) || null,
        phone: c.phone || null,
        address: c.address || null,
        city: c.city || null,
        zip: c.zip || null,
        country: c.country || 'IL',
        is_active: c.active !== false,
        raw: c,
        synced_at: new Date().toISOString(),
      };

      // Upsert: find existing by provider_customer_id
      const existing = await base44.asServiceRole.entities.AccountingCustomer.filter({
        user_id: userId, provider: 'morning', provider_customer_id: c.id,
      });
      
      if (existing?.length > 0) {
        await base44.asServiceRole.entities.AccountingCustomer.update(existing[0].id, normalized);
      } else {
        await base44.asServiceRole.entities.AccountingCustomer.create(normalized);
      }
      totalSynced++;
    }

    if (items.length < pageSize) break;
    page++;
    await new Promise(r => setTimeout(r, 300)); // rate limit
  }
  return totalSynced;
}

async function syncDocuments(base44, userId, jwt) {
  let page = 1;
  let totalSynced = 0;
  const pageSize = 50;

  while (true) {
    const resp = await fetch(`${MORNING_BASE}/documents/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        page, 
        pageSize,
        sort: 'documentDate',
        sortType: 'desc',
      }),
    });
    if (!resp.ok) break;
    
    const data = await resp.json();
    const items = data.items || [];
    if (!items.length) break;

    for (const d of items) {
      const docType = DOC_TYPE_MAP[d.type] || 'invoice';
      
      // Map status: 0=draft, 1=open(final), 2=closed(final), 3=cancelled
      let status = 'final';
      if (d.status === 0) status = 'draft';
      else if (d.status === 3) status = 'cancelled';

      // Calculate amounts
      const subtotal = d.amount || 0;
      const vatAmount = d.vat || 0;
      const total = d.totalAmount || (subtotal + vatAmount);

      // Map payment method
      let paymentMethod = null;
      if (d.payment && d.payment.length > 0) {
        const pmMap = { 0: 'other', 1: 'cash', 2: 'check', 3: 'credit_card', 4: 'bank_transfer', 5: 'paypal', 10: 'bit' };
        paymentMethod = pmMap[d.payment[0].type] || 'other';
      }

      const normalized = {
        user_id: userId,
        provider: 'morning',
        provider_document_id: d.id,
        doc_type: docType,
        doc_number: d.number ? String(d.number) : null,
        status,
        direction: 'inbound',
        customer_provider_id: d.client?.id || null,
        customer_name: d.client?.name || d.clientName || null,
        customer_tax_id: d.client?.taxId || null,
        currency: d.currency || 'ILS',
        subtotal,
        vat_rate: d.vatType === 0 ? 0 : 17,
        vat_amount: vatAmount,
        total,
        amount_paid: d.totalPaid || 0,
        balance_due: Math.max(0, total - (d.totalPaid || 0)),
        issue_date: d.documentDate || d.creationDate || null,
        due_date: d.dueDate || null,
        payment_date: d.paymentDate || null,
        payment_method: paymentMethod,
        items: (d.income || []).map(item => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.price || 0,
          line_total: (item.quantity || 1) * (item.price || 0),
        })),
        notes: d.footer || d.remarks || null,
        pdf_url: d.url?.origin || null,
        raw: d,
        synced_at: new Date().toISOString(),
      };

      const existing = await base44.asServiceRole.entities.AccountingDocument.filter({
        user_id: userId, provider: 'morning', provider_document_id: d.id,
      });
      
      if (existing?.length > 0) {
        await base44.asServiceRole.entities.AccountingDocument.update(existing[0].id, normalized);
      } else {
        await base44.asServiceRole.entities.AccountingDocument.create(normalized);
      }
      totalSynced++;
    }

    if (items.length < pageSize) break;
    page++;
    await new Promise(r => setTimeout(r, 300));
  }
  return totalSynced;
}

async function syncExpenses(base44, userId, jwt) {
  let page = 1;
  let totalSynced = 0;
  const pageSize = 50;

  while (true) {
    const resp = await fetch(`${MORNING_BASE}/expenses/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, pageSize }),
    });
    if (!resp.ok) break;
    
    const data = await resp.json();
    const items = data.items || [];
    if (!items.length) break;

    for (const e of items) {
      const normalized = {
        user_id: userId,
        provider: 'morning',
        provider_expense_id: e.id,
        vendor: e.supplier?.name || e.description || null,
        category: e.accountingClassification || null,
        description: e.description || null,
        date: e.documentDate || e.date || null,
        amount: e.totalAmount || e.amount || 0,
        vat_amount: e.vat || 0,
        net_amount: (e.totalAmount || e.amount || 0) - (e.vat || 0),
        currency: e.currency || 'ILS',
        payment_method: null,
        reference_number: e.number ? String(e.number) : null,
        raw: e,
        synced_at: new Date().toISOString(),
      };

      const existing = await base44.asServiceRole.entities.AccountingExpense.filter({
        user_id: userId, provider: 'morning', provider_expense_id: e.id,
      });
      
      if (existing?.length > 0) {
        await base44.asServiceRole.entities.AccountingExpense.update(existing[0].id, normalized);
      } else {
        await base44.asServiceRole.entities.AccountingExpense.create(normalized);
      }
      totalSynced++;
    }

    if (items.length < pageSize) break;
    page++;
    await new Promise(r => setTimeout(r, 300));
  }
  return totalSynced;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { resource } = await req.json();
    if (!resource) return Response.json({ error: 'resource is required' }, { status: 400 });

    const { jwt, connection } = await getJWT(base44, user.id);

    let synced_count = 0;

    if (resource === 'customers' || resource === 'all') {
      synced_count += await syncCustomers(base44, user.id, jwt);
    }
    if (resource === 'documents' || resource === 'all') {
      synced_count += await syncDocuments(base44, user.id, jwt);
    }
    if (resource === 'expenses' || resource === 'all') {
      synced_count += await syncExpenses(base44, user.id, jwt);
    }

    // Update connection last_sync_at
    await base44.asServiceRole.entities.AccountingConnection.update(connection.id, {
      last_sync_at: new Date().toISOString(),
      last_error: null,
    });

    // Audit
    await base44.asServiceRole.entities.AccountingAuditLog.create({
      user_id: user.id,
      provider: 'morning',
      action: `sync.pull_${resource}`,
      details: { synced_count },
      success: true,
    });

    return Response.json({ status: 'success', synced_count });
  } catch (error) {
    return Response.json({ error: error.message, status: 'error' }, { status: 500 });
  }
});