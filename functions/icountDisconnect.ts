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

    // Delete all iCount documents for this user
    const deleteResults = { documents: 0, customers: 0, expenses: 0 };

    try {
      const docs = await base44.asServiceRole.entities.FinbotDocument.filter({ user_id: user.id, provider: 'icount' });
      for (const doc of docs) {
        await base44.asServiceRole.entities.FinbotDocument.delete(doc.id);
        deleteResults.documents++;
      }
    } catch (_) { /* ignore */ }

    // Delete all iCount customers for this user
    try {
      const custs = await base44.asServiceRole.entities.FinbotCustomer.filter({ user_id: user.id, provider: 'icount' });
      for (const cust of custs) {
        await base44.asServiceRole.entities.FinbotCustomer.delete(cust.id);
        deleteResults.customers++;
      }
    } catch (_) { /* ignore */ }

    // Delete all iCount expenses for this user
    try {
      const exps = await base44.asServiceRole.entities.FinbotExpense.filter({ user_id: user.id, provider: 'icount' });
      for (const exp of exps) {
        await base44.asServiceRole.entities.FinbotExpense.delete(exp.id);
        deleteResults.expenses++;
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