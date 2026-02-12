import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

// Morning document types
const DOC_TYPES = {
  INVOICE: 305,
  INVOICE_RECEIPT: 320,
  RECEIPT: 400,
  CREDIT_NOTE: 330,
  DEAL_INVOICE: 300,
  RECEIPT_ONLY: 405,
};

const INCOME_TYPES = [DOC_TYPES.INVOICE, DOC_TYPES.INVOICE_RECEIPT, DOC_TYPES.RECEIPT, DOC_TYPES.DEAL_INVOICE];
const CREDIT_TYPES = [DOC_TYPES.CREDIT_NOTE];

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
  return { token, config: conn.config || {} };
}

async function fetchAllPages(jwt, endpoint, filters) {
  const allItems = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const resp = await fetch(`${MORNING_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...filters, page, pageSize }),
    });
    if (!resp.ok) {
      if (resp.status === 429) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      console.log(`Morning ${endpoint} error:`, resp.status);
      break;
    }
    const data = await resp.json();
    const items = data.items || [];
    allItems.push(...items);
    if (items.length < pageSize) break;
    page++;
    if (page > 20) break;
    await new Promise(r => setTimeout(r, 200));
  }
  return allItems;
}

function buildIncomeReport(documents) {
  const TYPE_LABELS = {
    305: 'חשבונית מס',
    320: 'חשבונית מס/קבלה',
    400: 'קבלה',
    330: 'זיכוי',
    300: 'חשבון עסקה',
    405: 'קבלה',
  };

  // Convert Morning docs to a unified format for IncomeReport component
  const allDocs = documents
    .filter(d => d.status !== 3) // not cancelled
    .map(d => ({
      dateissued: d.documentDate,
      _type: d.type === 330 ? 'credit_invoice' : d.type === 305 ? 'invoice' : d.type === 320 ? 'invrec' : 'receipt',
      docnum: String(d.number || ''),
      client_name: d.client?.name || '',
      totalsum: d.amountExcludeVat || d.amountDueVat || d.amount || 0,
      totalvat: d.vat || 0,
      totalwithvat: d.amount || 0,
      pdf_url: d.url?.origin || d.url?.he || '',
    }));

  // Group by type for the income_report structure
  const grouped = {};
  allDocs.forEach(doc => {
    if (!grouped[doc._type]) grouped[doc._type] = [];
    grouped[doc._type].push(doc);
  });

  return grouped;
}

function buildPnLReport(documents, expenses) {
  const activeDocs = documents.filter(d => d.status !== 3);
  
  const income = activeDocs
    .filter(d => INCOME_TYPES.includes(d.type))
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const credits = activeDocs
    .filter(d => CREDIT_TYPES.includes(d.type))
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.totalAmount || e.amount || 0), 0);
  const totalExpensesVat = expenses.reduce((sum, e) => sum + (e.vat || 0), 0);

  // Calculate taxable vs exempt
  const taxableInvoices = activeDocs.filter(d => d.type === 305 && d.vatType === 0).reduce((s, d) => s + (d.amount || 0), 0);
  const taxableInvrecs = activeDocs.filter(d => d.type === 320 && d.vatType === 0).reduce((s, d) => s + (d.amount || 0), 0);
  const taxableRefunds = activeDocs.filter(d => d.type === 330 && d.vatType === 0).reduce((s, d) => s + (d.amount || 0), 0);
  
  const exemptInvoices = activeDocs.filter(d => d.type === 305 && d.vatType !== 0).reduce((s, d) => s + (d.amount || 0), 0);
  const exemptInvrecs = activeDocs.filter(d => d.type === 320 && d.vatType !== 0).reduce((s, d) => s + (d.amount || 0), 0);
  const exemptRefunds = activeDocs.filter(d => d.type === 330 && d.vatType !== 0).reduce((s, d) => s + (d.amount || 0), 0);

  const totalTaxable = taxableInvoices + taxableInvrecs - taxableRefunds;
  const totalExempt = exemptInvoices + exemptInvrecs - exemptRefunds;
  const totalIncome = income - credits;

  // Get advance rates from business info if available
  const businessInfo = activeDocs[0]?.business || {};
  const advanceTaxRate = businessInfo.advanceTaxRate || 0;
  const deductionRate = businessInfo.deductionRate || 0;
  const totalDeductions = Math.round(totalIncome * deductionRate / 100);
  const incomeTaxAdvances = Math.round(totalIncome * advanceTaxRate / 100);

  return {
    taxable: {
      invoices: taxableInvoices,
      invrecs: taxableInvrecs,
      refunds: taxableRefunds,
    },
    exempt: {
      exempt_invoices: exemptInvoices,
      exempt_invrecs: exemptInvrecs,
      exempt_refunds: exemptRefunds,
    },
    total_taxable: totalTaxable,
    total_exempt: totalExempt,
    total_income: totalIncome,
    total_deductions: totalDeductions,
    income_tax_advances: incomeTaxAdvances,
    income_tax_advance_percent: advanceTaxRate,
    income_tax_payment: incomeTaxAdvances,
    net_profit: totalIncome - totalExpenses,
    total_expenses: totalExpenses,
  };
}

function buildVATReport(documents, expenses) {
  const activeDocs = documents.filter(d => d.status !== 3);
  
  const taxableInvoices = activeDocs.filter(d => d.type === 305 && d.vatType === 0).reduce((s, d) => s + (d.amountDueVat || d.amount || 0), 0);
  const taxableInvrecs = activeDocs.filter(d => d.type === 320 && d.vatType === 0).reduce((s, d) => s + (d.amountDueVat || d.amount || 0), 0);
  const taxableRefunds = activeDocs.filter(d => d.type === 330 && d.vatType === 0).reduce((s, d) => s + (d.amountDueVat || d.amount || 0), 0);
  
  const exemptInvoices = activeDocs.filter(d => d.type === 305 && d.vatType !== 0).reduce((s, d) => s + (d.amount || 0), 0);
  const exemptInvrecs = activeDocs.filter(d => d.type === 320 && d.vatType !== 0).reduce((s, d) => s + (d.amount || 0), 0);
  const exemptRefunds = activeDocs.filter(d => d.type === 330 && d.vatType !== 0).reduce((s, d) => s + (d.amount || 0), 0);

  const totalTaxable = taxableInvoices + taxableInvrecs - taxableRefunds;
  const totalExempt = exemptInvoices + exemptInvrecs - exemptRefunds;
  
  const outputVat = activeDocs.reduce((sum, d) => sum + (d.vat || 0), 0);
  const inputVat = expenses.reduce((sum, e) => sum + (e.vat || 0), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.totalAmount || e.amount || 0), 0);
  const vatPayable = outputVat - inputVat;

  return {
    taxable: {
      invoices: taxableInvoices,
      invrecs: taxableInvrecs,
      refunds: taxableRefunds,
    },
    exempt: {
      exempt_invoices: exemptInvoices,
      exempt_invrecs: exemptInvrecs,
      exempt_refunds: exemptRefunds,
    },
    total_taxable: totalTaxable,
    total_exempt: totalExempt,
    total_vat: outputVat,
    total_expenses: totalExpenses,
    total_permanent: 0,
    vat_payment: vatPayable,
    input_vat: inputVat,
    output_vat: outputVat,
    vat_period: 2, // default bi-monthly
  };
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

    const { token: jwt, config } = await getJWT(base44, user.id);

    // Fetch documents for period
    const documents = await fetchAllPages(jwt, 'documents/search', {
      fromDate: period_start,
      toDate: period_end,
    });

    // Fetch expenses for period
    const expenses = await fetchAllPages(jwt, 'expenses/search', {
      fromDate: period_start,
      toDate: period_end,
    });

    console.log(`Morning reports: ${documents.length} docs, ${expenses.length} expenses for ${period_start} to ${period_end}`);

    let data = {};

    if (report_type === 'income') {
      data = { 
        status: true, 
        income_report: buildIncomeReport(documents) 
      };
    } else if (report_type === 'pnl') {
      data = { 
        status: true, 
        income_tax_report: buildPnLReport(documents, expenses) 
      };
    } else if (report_type === 'vat') {
      data = { 
        status: true, 
        vat_report: buildVATReport(documents, expenses) 
      };
    } else {
      return Response.json({ error: 'סוג דוח לא נתמך' }, { status: 400 });
    }

    // Audit
    await base44.asServiceRole.entities.AccountingAuditLog.create({
      user_id: user.id,
      provider: 'morning',
      action: 'report.generate',
      details: { report_type, period_start, period_end, doc_count: documents.length, expense_count: expenses.length },
      success: true,
    });

    return Response.json({ data });
  } catch (error) {
    console.log('morningFetchReports error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});