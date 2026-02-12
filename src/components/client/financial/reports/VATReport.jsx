import React from 'react';
import { Receipt, TrendingUp, TrendingDown, Calculator, Wallet } from 'lucide-react';

const fmt = (n) => `₪${Number(n || 0).toLocaleString('he-IL')}`;

export default function VATReport({ data }) {
  const report = data?.vat_report;
  if (!report) return <p className="text-sm text-gray-500 text-center py-4">אין נתונים לתקופה זו</p>;

  const { taxable = {}, exempt = {}, total_taxable, total_exempt, total_vat, total_expenses, total_permanent, vat_payment, vat_period } = report;

  const vatPeriodText = vat_period === 1 ? 'חד-חודשי' : vat_period === 2 ? 'דו-חודשי' : `תקופה ${vat_period}`;

  return (
    <div className="space-y-4">
      {/* VAT Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={TrendingUp} label="עסקאות חייבות" value={fmt(total_taxable)} color="green" />
        <SummaryCard icon={Receipt} label="עסקאות פטורות" value={fmt(total_exempt)} color="blue" />
        <SummaryCard icon={TrendingDown} label="תשומות (הוצאות)" value={fmt(total_expenses)} color="red" />
        <SummaryCard icon={Calculator} label="מע״מ עסקאות" value={fmt(total_vat)} color="purple" />
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-green-50 border-b border-green-100">
          <h4 className="text-sm font-bold text-green-800">עסקאות חייבות מע״מ</h4>
        </div>
        <div className="divide-y divide-gray-100">
          <Row label="חשבוניות" value={taxable.invoices} />
          <Row label="חשבוניות מס/קבלה" value={taxable.invrecs} />
          <Row label="זיכויים" value={taxable.refunds} negative />
          <TotalRow label="סה״כ חייב" value={total_taxable} color="green" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100">
          <h4 className="text-sm font-bold text-blue-800">עסקאות פטורות</h4>
        </div>
        <div className="divide-y divide-gray-100">
          <Row label="חשבוניות פטורות" value={exempt.exempt_invoices} />
          <Row label="חשבוניות מס/קבלה פטורות" value={exempt.exempt_invrecs} />
          <Row label="זיכויים פטורים" value={exempt.exempt_refunds} negative />
          <TotalRow label="סה״כ פטור" value={total_exempt} color="blue" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-red-50 border-b border-red-100">
          <h4 className="text-sm font-bold text-red-800">תשומות (ניכויים)</h4>
        </div>
        <div className="divide-y divide-gray-100">
          <Row label="תשומות שוטפות" value={total_expenses} />
          <Row label="תשומות קבועות (רכוש)" value={total_permanent} />
          <TotalRow label="סה״כ תשומות" value={(Number(total_expenses || 0) + Number(total_permanent || 0))} color="red" />
        </div>
      </div>

      {/* Bottom Line - VAT Payment */}
      <div className={`rounded-xl p-4 text-white ${Number(vat_payment) >= 0 ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs opacity-80">
              {Number(vat_payment) >= 0 ? 'מע״מ לתשלום' : 'מע״מ להחזר'} • דיווח {vatPeriodText}
            </p>
            <p className="text-2xl font-bold mt-1">{fmt(Math.abs(vat_payment))}</p>
          </div>
          <Wallet className="w-10 h-10 opacity-30" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, negative }) {
  const v = Number(value || 0);
  return (
    <div className="flex justify-between items-center px-4 py-2.5">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-medium ${negative && v > 0 ? 'text-red-600' : 'text-gray-900'}`}>
        {negative && v > 0 ? '-' : ''}{fmt(v)}
      </span>
    </div>
  );
}

function TotalRow({ label, value, color }) {
  return (
    <div className={`flex justify-between items-center px-4 py-3 bg-${color}-50`}>
      <span className={`text-sm font-bold text-${color}-800`}>{label}</span>
      <span className={`text-base font-bold text-${color}-800`}>{fmt(value)}</span>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-red-50 text-red-600 border-red-100',
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