import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

/**
 * Morning (Green Invoice) — fetch financial reports.
 * Input: { report_type: "pnl"|"vat"|"income", period_start, period_end }
 * 
 * Morning doesn't have a direct "report" API, so we compute reports from document + expense data.
 */
async function getJWT(base44, userId) {
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
    user_id: userId, status: 'connected', provider: 'morning',
  });
  if (!connections?.length) throw new Error('אין חיבור פעיל ל-Morning');
  const conn = connections[0];
  
  const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: conn.api_key_enc, secret: conn.api_secret_enc }),
  });
  if (!tokenResp.ok) throw new Error('שגיאה בהתחברות ל-Morning');
  const { token } = await tokenResp.json();
  return token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { report_type, period_start, period_end } = await req.json();
    if (!report_type || !period_start || !period_end) {
      return Response.json({ error: 'חסרים סוג דוח ותקופה' }, { status: 400 });
    }

    const jwt = await getJWT(base44, user.id);

    // Fetch documents for period
    const docsResp = await fetch(`${MORNING_BASE}/documents/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromDate: period_start,
        toDate: period_end,
        pageSize: 500,
        page: 1,
      }),
    });
    const docsData = docsResp.ok ? await docsResp.json() : { items: [] };
    const documents = docsData.items || [];

    // Fetch expenses for period
    const expResp = await fetch(`${MORNING_BASE}/expenses/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromDate: period_start,
        toDate: period_end,
        pageSize: 500,
        page: 1,
      }),
    });
    const expData = expResp.ok ? await expResp.json() : { items: [] };
    const expenses = expData.items || [];

    let report = {};

    if (report_type === 'pnl') {
      // Profit & Loss
      const incomeTypes = [305, 320, 400, 300]; // invoices + receipts
      const creditTypes = [330]; // credit notes
      
      const income = documents
        .filter(d => incomeTypes.includes(d.type) && d.status !== 3)
        .reduce((sum, d) => sum + (d.amount || 0), 0);
      
      const credits = documents
        .filter(d => creditTypes.includes(d.type) && d.status !== 3)
        .reduce((sum, d) => sum + (d.amount || 0), 0);
      
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.totalAmount || e.amount || 0), 0);

      report = {
        title: 'דוח רווח והפסד',
        period: `${period_start} – ${period_end}`,
        rows: [
          { label: 'הכנסות', value: income - credits },
          { label: 'הוצאות', value: totalExpenses },
          { label: 'רווח נקי', value: (income - credits) - totalExpenses, isSummary: true },
        ],
        data: { income, credits, expenses: totalExpenses },
      };
    } else if (report_type === 'vat') {
      // VAT Report
      const outputVat = documents
        .filter(d => d.status !== 3)
        .reduce((sum, d) => sum + (d.vat || 0), 0);
      
      const inputVat = expenses.reduce((sum, e) => sum + (e.vat || 0), 0);
      
      const taxableIncome = documents
        .filter(d => [305, 320, 400, 300].includes(d.type) && d.status !== 3)
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      report = {
        title: 'דוח מע״מ',
        period: `${period_start} – ${period_end}`,
        rows: [
          { label: 'מע״מ עסקאות', value: outputVat },
          { label: 'מע״מ תשומות', value: inputVat },
          { label: 'מע״מ לתשלום', value: outputVat - inputVat, isSummary: true },
        ],
        data: { 
          output_vat: outputVat, 
          input_vat: inputVat, 
          vat_payable: outputVat - inputVat,
          taxable_income: taxableIncome,
          document_count: documents.length,
        },
      };
    } else if (report_type === 'income') {
      // Income summary
      const incomeByType = {};
      for (const d of documents.filter(d => d.status !== 3)) {
        const label = d.type === 305 ? 'חשבוניות מס' :
                      d.type === 320 ? 'חשבונית מס/קבלה' :
                      d.type === 400 ? 'קבלות' :
                      d.type === 330 ? 'זיכויים' : 'אחר';
        incomeByType[label] = (incomeByType[label] || 0) + (d.amount || 0);
      }

      const rows = Object.entries(incomeByType).map(([label, value]) => ({ label, value }));
      const total = rows.reduce((s, r) => s + r.value, 0);
      rows.push({ label: 'סה״כ', value: total, isSummary: true });

      report = {
        title: 'ריכוז הכנסות',
        period: `${period_start} – ${period_end}`,
        rows,
        data: incomeByType,
      };
    } else {
      return Response.json({ error: 'סוג דוח לא נתמך' }, { status: 400 });
    }

    // Audit
    await base44.asServiceRole.entities.AccountingAuditLog.create({
      user_id: user.id,
      provider: 'morning',
      action: 'report.generate',
      details: { report_type, period_start, period_end },
      success: true,
    });

    return Response.json({ status: 'success', report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});