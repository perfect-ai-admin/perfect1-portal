import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

// Morning document types
const DOC_TYPES = {
  DEAL_INVOICE: 300,   // חשבון עסקה
  INVOICE: 305,        // חשבונית מס
  INVOICE_RECEIPT: 320, // חשבונית מס/קבלה
  CREDIT_NOTE: 330,    // זיכוי
  RECEIPT: 400,        // קבלה
  RECEIPT_ONLY: 405,   // קבלה בלבד
};

// Document status: 0=draft, 1=finalized, 2=opened, 3=cancelled
const CANCELLED_STATUS = 3;

const INCOME_TYPES = [DOC_TYPES.INVOICE, DOC_TYPES.INVOICE_RECEIPT, DOC_TYPES.DEAL_INVOICE];
const CREDIT_TYPES = [DOC_TYPES.CREDIT_NOTE];
const RECEIPT_TYPES = [DOC_TYPES.RECEIPT, DOC_TYPES.RECEIPT_ONLY];

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

/**
 * Morning document amount fields:
 * - amount: total including VAT (סכום כולל מע"מ)
 * - amountDueVat: amount before VAT on taxable portion (סכום חייב מע"מ לפני מע"מ)  
 * - amountExemptVat: amount exempt from VAT (סכום פטור ממע"מ)
 * - vat: VAT amount (סכום המע"מ)
 * - vatType: 0=standard, 1=exempt (osek patur), 2=non-profit
 * - status: 0=draft, 1=finalized, 2=opened, 3=cancelled
 */

function getDocBeforeVat(d) {
  // For most docs: amountDueVat + amountExemptVat = total before VAT
  // For receipts: these fields may be 0, so fallback to amount - vat
  const fromFields = (d.amountDueVat || 0) + (d.amountExemptVat || 0);
  if (fromFields > 0) return fromFields;
  return (d.amount || 0) - (d.vat || 0);
}

function buildIncomeReport(documents) {
  // Credit notes with status=3 (cancelled) in Morning actually represent real cancellations of invoices
  // They should be INCLUDED in reports. Only non-credit docs with status=3 are truly cancelled.
  const activeDocs = documents.filter(d => 
    d.status !== CANCELLED_STATUS || CREDIT_TYPES.includes(d.type)
  );

  const allDocs = activeDocs.map(d => {
    let _type;
    if (d.type === DOC_TYPES.CREDIT_NOTE) _type = 'credit_invoice';
    else if (d.type === DOC_TYPES.INVOICE) _type = 'invoice';
    else if (d.type === DOC_TYPES.INVOICE_RECEIPT) _type = 'invrec';
    else if (d.type === DOC_TYPES.DEAL_INVOICE) _type = 'deal_invoice';
    else if (d.type === DOC_TYPES.RECEIPT || d.type === DOC_TYPES.RECEIPT_ONLY) _type = 'receipt';
    else _type = `type_${d.type}`;

    return {
      dateissued: d.documentDate,
      _type,
      docnum: String(d.number || ''),
      client_name: d.client?.name || '',
      totalsum: getDocBeforeVat(d),
      totalvat: d.vat || 0,
      totalwithvat: d.amount || 0,
      pdf_url: d.url?.origin || d.url?.he || '',
    };
  });

  // Group by type
  const grouped = {};
  allDocs.forEach(doc => {
    if (!grouped[doc._type]) grouped[doc._type] = [];
    grouped[doc._type].push(doc);
  });

  return grouped;
}

function buildPnLReport(documents, expenses) {
  // Credit notes with status=3 represent real cancellations - include them
  const activeDocs = documents.filter(d => 
    d.status !== CANCELLED_STATUS || CREDIT_TYPES.includes(d.type)
  );
  
  // Income docs (invoices, invoice-receipts, deal invoices)
  const incomeDocs = activeDocs.filter(d => INCOME_TYPES.includes(d.type));
  const creditDocs = activeDocs.filter(d => CREDIT_TYPES.includes(d.type));

  // Taxable = amountDueVat, Exempt = amountExemptVat
  const taxableInvoices = activeDocs.filter(d => d.type === DOC_TYPES.INVOICE).reduce((s, d) => s + (d.amountDueVat || 0), 0);
  const taxableInvrecs = activeDocs.filter(d => d.type === DOC_TYPES.INVOICE_RECEIPT).reduce((s, d) => s + (d.amountDueVat || 0), 0);
  const taxableRefunds = activeDocs.filter(d => d.type === DOC_TYPES.CREDIT_NOTE).reduce((s, d) => s + (d.amountDueVat || 0), 0);
  
  const exemptInvoices = activeDocs.filter(d => d.type === DOC_TYPES.INVOICE).reduce((s, d) => s + (d.amountExemptVat || 0), 0);
  const exemptInvrecs = activeDocs.filter(d => d.type === DOC_TYPES.INVOICE_RECEIPT).reduce((s, d) => s + (d.amountExemptVat || 0), 0);
  const exemptRefunds = activeDocs.filter(d => d.type === DOC_TYPES.CREDIT_NOTE).reduce((s, d) => s + (d.amountExemptVat || 0), 0);

  const totalTaxable = taxableInvoices + taxableInvrecs - taxableRefunds;
  const totalExempt = exemptInvoices + exemptInvrecs - exemptRefunds;

  // Total income before VAT (include deal invoices)
  const dealInvoiceAmount = activeDocs.filter(d => d.type === DOC_TYPES.DEAL_INVOICE).reduce((s, d) => s + getDocBeforeVat(d), 0);
  const totalIncomeBeforeVat = totalTaxable + totalExempt + dealInvoiceAmount;

  // Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpensesVat = expenses.reduce((sum, e) => sum + (e.vat || 0), 0);
  const totalExpensesBeforeVat = totalExpenses - totalExpensesVat;

  // Get advance rates from business info
  const businessInfo = activeDocs[0]?.business || {};
  const advanceTaxRate = businessInfo.advanceTaxRate || 0;
  const deductionRate = businessInfo.deductionRate || 0;
  const totalDeductions = Math.round(totalIncomeBeforeVat * deductionRate / 100);
  const incomeTaxAdvances = Math.round(totalIncomeBeforeVat * advanceTaxRate / 100);

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
    total_income: totalIncomeBeforeVat,
    total_deductions: totalDeductions,
    income_tax_advances: incomeTaxAdvances,
    income_tax_advance_percent: advanceTaxRate,
    income_tax_payment: incomeTaxAdvances,
    net_profit: totalIncomeBeforeVat - totalExpensesBeforeVat,
    total_expenses: totalExpensesBeforeVat,
  };
}

function buildVATReport(documents, expenses) {
  // Credit notes with status=3 represent real cancellations - include them
  const activeDocs = documents.filter(d => 
    d.status !== CANCELLED_STATUS || CREDIT_TYPES.includes(d.type)
  );
  
  // Taxable transactions use amountDueVat (before VAT amount on taxable portion)
  const taxableInvoices = activeDocs.filter(d => d.type === DOC_TYPES.INVOICE).reduce((s, d) => s + (d.amountDueVat || 0), 0);
  const taxableInvrecs = activeDocs.filter(d => d.type === DOC_TYPES.INVOICE_RECEIPT).reduce((s, d) => s + (d.amountDueVat || 0), 0);
  const taxableRefunds = activeDocs.filter(d => d.type === DOC_TYPES.CREDIT_NOTE).reduce((s, d) => s + (d.amountDueVat || 0), 0);
  
  // Exempt transactions use amountExemptVat
  const exemptInvoices = activeDocs.filter(d => d.type === DOC_TYPES.INVOICE).reduce((s, d) => s + (d.amountExemptVat || 0), 0);
  const exemptInvrecs = activeDocs.filter(d => d.type === DOC_TYPES.INVOICE_RECEIPT).reduce((s, d) => s + (d.amountExemptVat || 0), 0);
  const exemptRefunds = activeDocs.filter(d => d.type === DOC_TYPES.CREDIT_NOTE).reduce((s, d) => s + (d.amountExemptVat || 0), 0);

  const totalTaxable = taxableInvoices + taxableInvrecs - taxableRefunds;
  const totalExempt = exemptInvoices + exemptInvrecs - exemptRefunds;
  
  // Output VAT (מע"מ עסקאות)
  const outputVat = activeDocs
    .filter(d => !CREDIT_TYPES.includes(d.type))
    .reduce((sum, d) => sum + (d.vat || 0), 0);
  const creditVat = activeDocs
    .filter(d => CREDIT_TYPES.includes(d.type))
    .reduce((sum, d) => sum + (d.vat || 0), 0);
  const netOutputVat = outputVat - creditVat;

  // Input VAT from expenses (מע"מ תשומות)
  const inputVat = expenses.reduce((sum, e) => sum + (e.vat || 0), 0);
  
  // Expenses before VAT
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpensesBeforeVat = totalExpensesAmount - inputVat;

  const vatPayable = netOutputVat - inputVat;

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
    total_vat: netOutputVat,
    total_expenses: totalExpensesBeforeVat,
    total_permanent: 0,
    vat_payment: vatPayable,
    input_vat: inputVat,
    output_vat: netOutputVat,
    vat_period: 2,
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

    // Debug: log document type distribution and credit notes details
    const typeCounts = {};
    documents.forEach(d => { typeCounts[d.type] = (typeCounts[d.type] || 0) + 1; });
    console.log(`Morning reports: ${documents.length} docs, ${expenses.length} expenses for ${period_start} to ${period_end}`);
    console.log('Document type distribution:', JSON.stringify(typeCounts));
    
    // Log credit notes for debugging
    const creditNotes = documents.filter(d => d.type === DOC_TYPES.CREDIT_NOTE);
    if (creditNotes.length > 0) {
      console.log(`Credit notes (${creditNotes.length}):`);
      creditNotes.forEach(cn => {
        console.log(`  #${cn.number} | status:${cn.status} | amount:${cn.amount} | amountDueVat:${cn.amountDueVat} | amountExemptVat:${cn.amountExemptVat} | vat:${cn.vat} | client:${cn.client?.name}`);
      });
    }

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