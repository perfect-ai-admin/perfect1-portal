import React, { useState } from 'react';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fmt = (n) => `₪${Number(n || 0).toLocaleString('he-IL')}`;

const DOC_TYPE_LABELS = {
  invoice: 'חשבונית מס',
  invrec: 'חשבונית מס/קבלה',
  receipt: 'קבלה',
  credit_invoice: 'זיכוי',
  creditinv: 'זיכוי',
  deal_invoice: 'חשבון עסקה',
};

export default function IncomeReport({ data }) {
  const report = data?.income_report;
  if (!report) return <p className="text-sm text-gray-500 text-center py-4">אין נתונים לתקופה זו</p>;

  // Collect all document types
  const allDocs = [];
  for (const [docType, docs] of Object.entries(report)) {
    if (Array.isArray(docs)) {
      docs.forEach(doc => allDocs.push({ ...doc, _type: docType }));
    }
  }

  // Sort by date descending
  allDocs.sort((a, b) => (b.dateissued || '').localeCompare(a.dateissued || ''));

  // Calculate totals
  const totalIncome = allDocs.reduce((sum, d) => {
    const v = parseFloat(d.totalsum || d.total || 0);
    return d._type === 'credit_invoice' || d._type === 'creditinv' ? sum - v : sum + v;
  }, 0);
  const totalVat = allDocs.reduce((sum, d) => sum + parseFloat(d.totalvat || 0), 0);
  const totalWithVat = allDocs.reduce((sum, d) => {
    const v = parseFloat(d.totalwithvat || d.total || 0);
    return d._type === 'credit_invoice' || d._type === 'creditinv' ? sum - v : sum + v;
  }, 0);

  // Group by month
  const byMonth = {};
  allDocs.forEach(doc => {
    const month = (doc.dateissued || '').substring(0, 7);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(doc);
  });
  const months = Object.keys(byMonth).sort().reverse();

  const exportCSV = () => {
    const headers = ['תאריך', 'סוג', 'מספר', 'לקוח', 'סכום', 'מע״מ', 'סה״כ'];
    const rows = allDocs.map(d => [
      d.dateissued, DOC_TYPE_LABELS[d._type] || d._type, d.docnum || d.invoicenumber,
      d.client_name || d.clientname, d.totalsum, d.totalvat, d.totalwithvat || d.total
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c ?? ''}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `income_report.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
          <p className="text-xs text-green-600 font-medium">הכנסות (לפני מע״מ)</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
          <p className="text-xs text-purple-600 font-medium">מע״מ</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{fmt(totalVat)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-xs text-blue-600 font-medium">סה״כ כולל מע״מ</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{fmt(totalWithVat)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{allDocs.length} מסמכים</p>
        <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={exportCSV}>
          <Download className="w-3 h-3" /> ייצוא CSV
        </Button>
      </div>

      {/* By Month */}
      {months.map(month => (
        <MonthSection key={month} month={month} docs={byMonth[month]} />
      ))}
    </div>
  );
}

function MonthSection({ month, docs }) {
  const [expanded, setExpanded] = useState(false);
  const monthTotal = docs.reduce((s, d) => s + parseFloat(d.totalwithvat || d.total || 0), 0);
  const monthLabel = new Date(month + '-01').toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-bold text-gray-800">{monthLabel}</span>
          <span className="text-xs text-gray-400">({docs.length} מסמכים)</span>
        </div>
        <span className="text-sm font-bold text-green-700">{fmt(monthTotal)}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">תאריך</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">סוג</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">מספר</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">לקוח</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">סכום</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">מע״מ</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">סה״כ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {docs.map((doc, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{doc.dateissued ? new Date(doc.dateissued).toLocaleDateString('he-IL') : '-'}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-medium">
                        {DOC_TYPE_LABELS[doc._type] || doc._type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{doc.docnum || doc.invoicenumber || '-'}</td>
                    <td className="px-4 py-2 text-gray-800 font-medium">{doc.client_name || doc.clientname || '-'}</td>
                    <td className="px-4 py-2 text-gray-600">{fmt(doc.totalsum)}</td>
                    <td className="px-4 py-2 text-gray-600">{fmt(doc.totalvat)}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{fmt(doc.totalwithvat || doc.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {docs.map((doc, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{doc.client_name || doc.clientname || '-'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                        {DOC_TYPE_LABELS[doc._type] || doc._type}
                      </span>
                      <span className="text-xs text-gray-400">#{doc.docnum || doc.invoicenumber}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{doc.dateissued ? new Date(doc.dateissued).toLocaleDateString('he-IL') : ''}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">{fmt(doc.totalwithvat || doc.total)}</p>
                    {parseFloat(doc.totalvat || 0) > 0 && (
                      <p className="text-xs text-gray-400">מע״מ: {fmt(doc.totalvat)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}