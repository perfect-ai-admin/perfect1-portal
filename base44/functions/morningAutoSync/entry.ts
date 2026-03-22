import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

const DOC_TYPE_MAP = {
  305: 'invoice', 320: 'invoice_receipt', 400: 'receipt',
  10: 'quote', 330: 'credit_note', 300: 'invoice', 405: 'receipt', 100: 'quote',
};

async function fetchWithRetry(url, options, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(url, options);
    if (resp.status === 429) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt + 1) * 2000));
      continue;
    }
    return resp;
  }
  throw new Error('Rate limit exceeded');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Find all active Morning connections
    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      provider: 'morning', status: 'connected',
    });

    if (!connections?.length) {
      return Response.json({ status: 'no_connections', message: 'אין חיבורי Morning פעילים' });
    }

    const allResults = [];

    for (const conn of connections) {
      const userId = conn.user_id;
      console.log(`Auto-syncing Morning for user ${userId}...`);

      try {
        // Get JWT
        const tokenResp = await fetchWithRetry(`${MORNING_BASE}/account/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: conn.api_key_enc, secret: conn.api_secret_enc }),
        });
        if (!tokenResp.ok) {
          console.log(`Token error for user ${userId}:`, tokenResp.status);
          allResults.push({ user_id: userId, error: 'token_failed' });
          continue;
        }
        const { token: jwt } = await tokenResp.json();

        // Determine watermark - only fetch items newer than last sync
        const watermark = conn.delta_watermark || conn.last_sync_at || null;
        const result = { user_id: userId, customers: 0, documents: 0 };

        // --- Sync new customers ---
        const custResp = await fetchWithRetry(`${MORNING_BASE}/clients/search`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: 1, pageSize: 50,
            ...(watermark ? { updatedFrom: watermark } : {}),
          }),
        });
        if (custResp.ok) {
          const custData = await custResp.json();
          const customers = custData.items || [];
          for (const c of customers) {
            const mapped = {
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
            };
            // Upsert
            const existing = await base44.asServiceRole.entities.AccountingCustomer.filter({
              user_id: userId, provider: 'morning', provider_customer_id: String(c.id),
            });
            if (existing?.length > 0) {
              await base44.asServiceRole.entities.AccountingCustomer.update(existing[0].id, mapped);
            } else {
              await base44.asServiceRole.entities.AccountingCustomer.create(mapped);
            }
            result.customers++;
          }
          console.log(`Synced ${result.customers} customers for user ${userId}`);
        }

        await new Promise(r => setTimeout(r, 500));

        // --- Sync new documents ---
        const docResp = await fetchWithRetry(`${MORNING_BASE}/documents/search`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: 1, pageSize: 50, sort: 'documentDate', sortType: 'desc',
            ...(watermark ? { createdFrom: watermark } : {}),
          }),
        });
        if (docResp.ok) {
          const docData = await docResp.json();
          const documents = docData.items || [];
          for (const d of documents) {
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

            const mapped = {
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
            };

            const existing = await base44.asServiceRole.entities.AccountingDocument.filter({
              user_id: userId, provider: 'morning', provider_document_id: String(d.id),
            });
            if (existing?.length > 0) {
              await base44.asServiceRole.entities.AccountingDocument.update(existing[0].id, mapped);
            } else {
              await base44.asServiceRole.entities.AccountingDocument.create(mapped);
            }
            result.documents++;
          }
          console.log(`Synced ${result.documents} documents for user ${userId}`);
        }

        // Update watermark
        const now = new Date().toISOString();
        await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
          last_sync_at: now,
          delta_watermark: now,
          last_poll_at: now,
          last_poll_status: 'success',
        });

        allResults.push(result);
      } catch (err) {
        console.log(`Error syncing user ${userId}:`, err.message);
        await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
          last_poll_at: new Date().toISOString(),
          last_poll_status: 'error',
          last_error: err.message,
          last_error_at: new Date().toISOString(),
        });
        allResults.push({ user_id: userId, error: err.message });
      }
    }

    return Response.json({ status: 'success', results: allResults });
  } catch (error) {
    console.log('morningAutoSync error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});