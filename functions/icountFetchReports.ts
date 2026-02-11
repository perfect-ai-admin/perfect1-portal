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
  return { sid: loginData.sid, cid: conn.provider_account_id, conn: { ...conn, sid: loginData.sid } };
}

// Report type to iCount endpoint mapping
const REPORT_ENDPOINTS = {
  'pnl': '/reports/income_tax_report',       // profit & loss / income tax
  'vat': '/reports/vat_report',               // VAT report
  'income': '/reports/income_report',         // Income report
  'summary': '/reports/summary_report',       // Summary report
  'full': '/reports/full_report',             // Full detailed report
  'customers': '/client/get_list'             // Customer list (acts as report)
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { report_type, period_start, period_end } = body;

    if (!report_type) return Response.json({ error: 'סוג דוח הוא שדה חובה' }, { status: 400 });

    const { sid } = await ensureSession(base44, user.id);

    // Create report run record
    const reportRun = await base44.asServiceRole.entities.FinbotReportRun.create({
      user_id: user.id,
      report_type,
      period_start: period_start || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      period_end: period_end || new Date().toISOString().split('T')[0],
      status: 'running'
    });

    const endpoint = REPORT_ENDPOINTS[report_type] || REPORT_ENDPOINTS['summary'];

    // Build request based on report type
    let payload = { sid };

    if (report_type === 'vat' || report_type === 'pnl') {
      // These use start_month / end_month (YYYY-MM format)
      if (period_start) payload.start_month = period_start.substring(0, 7);
      if (period_end) payload.end_month = period_end.substring(0, 7);
    } else if (report_type === 'customers') {
      payload.list_type = 'array';
    } else {
      // income, summary, full use start_date / end_date
      if (period_start) payload.start_date = period_start;
      if (period_end) payload.end_date = period_end;
    }

    const res = await fetch(`${ICOUNT_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    // Audit log
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: `icount.report_${report_type}`,
      entity_type: 'FinbotReportRun',
      entity_id: reportRun.id,
      response_data: { status: data.status, reason: data.reason },
      success: !!data.status
    });

    if (!data.status) {
      await base44.asServiceRole.entities.FinbotReportRun.update(reportRun.id, {
        status: 'error',
        last_error: data.error_description || 'שגיאה בהפקת דוח'
      });
      return Response.json({ error: data.error_description || 'שגיאה בהפקת דוח מ-iCount' });
    }

    // Save result
    await base44.asServiceRole.entities.FinbotReportRun.update(reportRun.id, {
      status: 'success',
      result: data
    });

    return Response.json({ status: 'success', report_run_id: reportRun.id, data });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});