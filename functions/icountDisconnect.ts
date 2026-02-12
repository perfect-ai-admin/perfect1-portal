import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      user_id: user.id,
      provider: 'icount'
    });

    if (!connections || connections.length === 0) {
      return Response.json({ status: 'ok', message: 'לא נמצא חיבור' });
    }

    const conn = connections[0];

    // Try to logout from iCount session if we have sid
    if (conn.sid) {
      try {
        await fetch(`${ICOUNT_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid: conn.sid })
        });
      } catch (_) { /* ignore logout errors */ }
    }

    // Delete ALL financial data for this user (both tagged and untagged)
    const deleteResults = { documents: 0, customers: 0, expenses: 0 };

    // Delete documents - both with provider=icount AND without provider (legacy)
    try {
      const docsIcount = await base44.asServiceRole.entities.FinbotDocument.filter({ user_id: user.id, provider: 'icount' });
      const docsNoProvider = await base44.asServiceRole.entities.FinbotDocument.filter({ user_id: user.id });
      const allDocIds = new Set();
      for (const doc of [...docsIcount, ...docsNoProvider]) {
        if (!allDocIds.has(doc.id)) {
          allDocIds.add(doc.id);
          await base44.asServiceRole.entities.FinbotDocument.delete(doc.id);
          deleteResults.documents++;
        }
      }
    } catch (_) { /* ignore */ }

    // Delete customers - both with provider=icount AND without provider (legacy)
    try {
      const custsIcount = await base44.asServiceRole.entities.FinbotCustomer.filter({ user_id: user.id, provider: 'icount' });
      const custsNoProvider = await base44.asServiceRole.entities.FinbotCustomer.filter({ user_id: user.id });
      const allCustIds = new Set();
      for (const cust of [...custsIcount, ...custsNoProvider]) {
        if (!allCustIds.has(cust.id)) {
          allCustIds.add(cust.id);
          await base44.asServiceRole.entities.FinbotCustomer.delete(cust.id);
          deleteResults.customers++;
        }
      }
    } catch (_) { /* ignore */ }

    // Delete expenses - both with provider=icount AND without provider (legacy)
    try {
      const expsIcount = await base44.asServiceRole.entities.FinbotExpense.filter({ user_id: user.id, provider: 'icount' });
      const expsNoProvider = await base44.asServiceRole.entities.FinbotExpense.filter({ user_id: user.id });
      const allExpIds = new Set();
      for (const exp of [...expsIcount, ...expsNoProvider]) {
        if (!allExpIds.has(exp.id)) {
          allExpIds.add(exp.id);
          await base44.asServiceRole.entities.FinbotExpense.delete(exp.id);
          deleteResults.expenses++;
        }
      }
    } catch (_) { /* ignore */ }

    // Update connection to disabled
    await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
      status: 'disabled',
      sid: null,
      sid_expires_at: null,
      password_ref: null,
      last_error: null
    });

    // Audit log
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'icount.disconnect',
      response_data: deleteResults,
      success: true
    });

    return Response.json({ 
      status: 'ok', 
      message: 'התנתקת מ-iCount בהצלחה',
      deleted: deleteResults
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});