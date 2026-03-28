import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, FileText, Loader2 } from 'lucide-react';
import { formatCurrency } from './formatters';
import useActiveAccountingProvider from '../../hooks/useActiveAccountingProvider';
import { entities } from '@/api/supabaseClient';

const MONTH_NAMES = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const SHORT_MONTHS = ['ינו','פבר','מרץ','אפר','מאי','יוני','יולי','אוג','ספט','אוק','נוב','דצמ'];

export default function RevenueFromDocuments({ period }) {
  const { providerId, isConnected } = useActiveAccountingProvider();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['finbot-documents-revenue', providerId],
    queryFn: () => {
      if (!providerId) return [];
      return entities.FinbotDocument.filter({ provider: providerId }, '-created_date', 500);
    },
    enabled: !!providerId,
    staleTime: 60000,
  });

  const stats = useMemo(() => {
    if (!documents.length) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Count revenue documents (invoice, invoice_receipt, receipt)
    const revenueDocs = documents.filter(d => 
      ['invoice', 'invoice_receipt', 'receipt'].includes(d.type) && d.status !== 'cancelled'
    );

    // Group by month
    const monthlyMap = {};
    revenueDocs.forEach(doc => {
      if (!doc.issue_date) return;
      const date = new Date(doc.issue_date);
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { total: 0, subtotal: 0, vat: 0, count: 0, year: date.getFullYear(), month: date.getMonth() };
      }
      monthlyMap[key].total += Number(doc.total || 0);
      monthlyMap[key].subtotal += Number(doc.subtotal || 0);
      monthlyMap[key].vat += Number(doc.vat || 0);
      monthlyMap[key].count += 1;
    });

    // Current period totals
    const currentKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const currentMonthData = monthlyMap[currentKey] || { total: 0, subtotal: 0, vat: 0, count: 0 };

    // Previous month
    const prevDate = new Date(currentYear, currentMonth - 1, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth()).padStart(2, '0')}`;
    const prevMonthData = monthlyMap[prevKey] || { total: 0, subtotal: 0, vat: 0, count: 0 };

    // Calculate change
    const changePercent = prevMonthData.total > 0 
      ? ((currentMonthData.total - prevMonthData.total) / prevMonthData.total * 100).toFixed(1)
      : currentMonthData.total > 0 ? 100 : 0;

    // Build monthly chart data (last 6 months)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const data = monthlyMap[key] || { total: 0, subtotal: 0, count: 0 };
      chartData.push({
        period: SHORT_MONTHS[d.getMonth()],
        month: MONTH_NAMES[d.getMonth()],
        year: d.getFullYear(),
        value: data.subtotal,
        total: data.total,
        count: data.count,
      });
    }

    // Yearly total
    const yearTotal = Object.values(monthlyMap)
      .filter(m => m.year === currentYear)
      .reduce((sum, m) => sum + m.total, 0);

    const yearSubtotal = Object.values(monthlyMap)
      .filter(m => m.year === currentYear)
      .reduce((sum, m) => sum + m.subtotal, 0);

    const yearVat = Object.values(monthlyMap)
      .filter(m => m.year === currentYear)
      .reduce((sum, m) => sum + m.vat, 0);

    const yearDocCount = Object.values(monthlyMap)
      .filter(m => m.year === currentYear)
      .reduce((sum, m) => sum + m.count, 0);

    // Quarter
    const quarterStart = Math.floor(currentMonth / 3) * 3;
    const quarterTotal = Object.values(monthlyMap)
      .filter(m => m.year === currentYear && m.month >= quarterStart && m.month <= currentMonth)
      .reduce((sum, m) => sum + m.total, 0);

    return {
      currentMonth: currentMonthData,
      prevMonth: prevMonthData,
      changePercent: Number(changePercent),
      chartData,
      yearTotal,
      yearSubtotal,
      yearVat,
      yearDocCount,
      quarterTotal,
      totalDocs: revenueDocs.length,
    };
  }, [documents]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stats || stats.totalDocs === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">אין נתוני הכנסות עדיין</p>
        <p className="text-xs text-gray-400 mt-1">הפק חשבוניות מס/קבלה כדי לראות ריכוז הכנסות</p>
      </div>
    );
  }

  const trend = stats.changePercent > 0 ? 1 : stats.changePercent < 0 ? -1 : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-600 bg-green-50' : trend < 0 ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50';

  return (
    <div className="space-y-4">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">הכנסות החודש</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.currentMonth.total, false)}</p>
          <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${trendColor} px-2 py-0.5 rounded-full w-fit`}>
            <TrendIcon className="w-3 h-3" />
            <span>{stats.changePercent > 0 ? '+' : ''}{stats.changePercent}%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">הכנסות רבעון</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.quarterTotal, false)}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.yearDocCount} מסמכים השנה</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">הכנסות שנתי (לפני מע״מ)</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.yearSubtotal, false)}</p>
          <p className="text-xs text-gray-400 mt-1">מע״מ: {formatCurrency(stats.yearVat, false)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">סה״כ שנתי (כולל מע״מ)</p>
          <p className="text-xl font-bold text-blue-700">{formatCurrency(stats.yearTotal, false)}</p>
          <p className="text-xs text-gray-400 mt-1">חודש קודם: {formatCurrency(stats.prevMonth.total, false)}</p>
        </motion.div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h4 className="text-sm font-bold text-gray-800">ריכוז הכנסות חודשי</h4>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-600">חודש</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-600">מסמכים</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-600">לפני מע״מ</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-600">כולל מע״מ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.chartData.map((row, i) => (
                <tr key={i} className={`hover:bg-blue-50/30 transition-colors ${i === stats.chartData.length - 1 ? 'bg-blue-50/50 font-medium' : ''}`}>
                  <td className="px-4 py-2.5 text-gray-800">{row.month} {row.year}</td>
                  <td className="px-4 py-2.5 text-gray-600">{row.count}</td>
                  <td className="px-4 py-2.5 text-gray-800">{formatCurrency(row.value, false)}</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-900">{formatCurrency(row.total, false)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-blue-50 border-t-2 border-blue-200">
              <tr>
                <td className="px-4 py-2.5 font-bold text-blue-900">סה״כ 6 חודשים</td>
                <td className="px-4 py-2.5 font-bold text-blue-800">{stats.chartData.reduce((s, r) => s + r.count, 0)}</td>
                <td className="px-4 py-2.5 font-bold text-blue-800">{formatCurrency(stats.chartData.reduce((s, r) => s + r.value, 0), false)}</td>
                <td className="px-4 py-2.5 font-bold text-blue-900">{formatCurrency(stats.chartData.reduce((s, r) => s + r.total, 0), false)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {stats.chartData.map((row, i) => (
            <div key={i} className={`px-4 py-3 flex justify-between items-center ${i === stats.chartData.length - 1 ? 'bg-blue-50/50' : ''}`}>
              <div>
                <p className="text-sm font-medium text-gray-800">{row.month} {row.year}</p>
                <p className="text-xs text-gray-400">{row.count} מסמכים</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(row.total, false)}</p>
                <p className="text-xs text-gray-400">לפני מע״מ: {formatCurrency(row.value, false)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}