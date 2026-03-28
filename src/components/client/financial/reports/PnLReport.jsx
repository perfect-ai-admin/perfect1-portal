import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText, Percent } from 'lucide-react';

const fmt = (n) => `₪${Number(n || 0).toLocaleString('he-IL')}`;

export default function PnLReport({ data }) {
  const report = data?.income_tax_report;
  if (!report) return <p className="text-sm text-gray-500 text-center py-4">אין נתונים לתקופה זו</p>;

  const { taxable = {}, exempt = {}, total_taxable, total_exempt, total_income, total_deductions, income_tax_advances, income_tax_payment, income_tax_advance_percent } = report;

  const sections = [
    {
      title: 'הכנסות חייבות מע״מ',
      color: 'green',
      items: [
        { label: 'חשבוניות', value: taxable.invoices },
        { label: 'חשבוניות מס/קבלה', value: taxable.invrecs },
        { label: 'זיכויים', value: taxable.refunds, negative: true },
      ],
      total: total_taxable,
      totalLabel: 'סה״כ חייב',
    },
    {
      title: 'הכנסות פטורות מע״מ',
      color: 'blue',
      items: [
        { label: 'חשבוניות פטורות', value: exempt.exempt_invoices },
        { label: 'חשבוניות מס/קבלה פטורות', value: exempt.exempt_invrecs },
        { label: 'זיכויים פטורים', value: exempt.exempt_refunds, negative: true },
      ],
      total: total_exempt,
      totalLabel: 'סה״כ פטור',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={TrendingUp} label="סה״כ הכנסות" value={fmt(total_income)} color="green" />
        <SummaryCard icon={TrendingDown} label="סה״כ ניכויים" value={fmt(total_deductions)} color="red" />
        <SummaryCard icon={DollarSign} label="מקדמות מס הכנסה" value={fmt(income_tax_advances)} color="orange" />
        <SummaryCard icon={Percent} label="אחוז מקדמה" value={`${income_tax_advance_percent || 0}%`} color="purple" />
      </div>

      {/* Detailed Sections */}
      {sections.map(section => (
        <div key={section.title} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className={`px-4 py-2.5 bg-${section.color}-50 border-b border-${section.color}-100`}>
            <h4 className={`text-sm font-bold text-${section.color}-800`}>{section.title}</h4>
          </div>
          <div className="divide-y divide-gray-100">
            {section.items.map(item => (
              <div key={item.label} className="flex justify-between items-center px-4 py-2.5">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className={`text-sm font-medium ${item.negative && Number(item.value) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {item.negative && Number(item.value) > 0 ? '-' : ''}{fmt(item.value)}
                </span>
              </div>
            ))}
            <div className={`flex justify-between items-center px-4 py-3 bg-${section.color}-50`}>
              <span className={`text-sm font-bold text-${section.color}-800`}>{section.totalLabel}</span>
              <span className={`text-base font-bold text-${section.color}-800`}>{fmt(section.total)}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Bottom Line */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-xs">תשלום מס הכנסה לתקופה</p>
            <p className="text-2xl font-bold mt-1">{fmt(income_tax_payment)}</p>
          </div>
          <FileText className="w-10 h-10 text-blue-200 opacity-50" />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  return (
    <div className={`rounded-xl p-3 border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}