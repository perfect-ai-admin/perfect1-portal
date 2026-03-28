import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useActiveAccountingProvider from './useActiveAccountingProvider';
import { entities } from '@/api/supabaseClient';

const SHORT_MONTHS = ['ינו','פבר','מרץ','אפר','מאי','יוני','יולי','אוג','ספט','אוק','נוב','דצמ'];
const FULL_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

export default function useRevenueFromDocuments() {
  const { providerId, isConnected } = useActiveAccountingProvider();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['finbot-documents-revenue', providerId || 'none'],
    queryFn: () => {
      return entities.FinbotDocument.filter({ provider: providerId }, '-created_date', 500);
    },
    enabled: !!providerId && isConnected,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Revenue docs: invoice + invoice_receipt + receipt, not cancelled
    const revenueDocs = documents.filter(d =>
      ['invoice', 'invoice_receipt', 'receipt'].includes(d.type) && d.status !== 'cancelled'
    );

    // Expense docs (if any)
    const expenseDocs = documents.filter(d =>
      d.type === 'expense' && d.status !== 'cancelled'
    );

    const hasData = revenueDocs.length > 0;

    // Group by month
    const monthlyRevenue = {};
    revenueDocs.forEach(doc => {
      if (!doc.issue_date) return;
      const date = new Date(doc.issue_date);
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      if (!monthlyRevenue[key]) {
        monthlyRevenue[key] = { total: 0, subtotal: 0, vat: 0, count: 0, year: date.getFullYear(), month: date.getMonth() };
      }
      monthlyRevenue[key].total += Number(doc.total || 0);
      monthlyRevenue[key].subtotal += Number(doc.subtotal || 0);
      monthlyRevenue[key].vat += Number(doc.vat || 0);
      monthlyRevenue[key].count += 1;
    });

    // Current month
    const currentKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const currentMonthData = monthlyRevenue[currentKey] || { total: 0, subtotal: 0, vat: 0, count: 0 };

    // Previous month
    const prevDate = new Date(currentYear, currentMonth - 1, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth()).padStart(2, '0')}`;
    const prevMonthData = monthlyRevenue[prevKey] || { total: 0, subtotal: 0, vat: 0, count: 0 };

    // Change %
    const revenueChangePercent = prevMonthData.total > 0
      ? ((currentMonthData.total - prevMonthData.total) / prevMonthData.total * 100)
      : currentMonthData.total > 0 ? 100 : 0;

    // Year totals
    const yearRevenue = Object.values(monthlyRevenue)
      .filter(m => m.year === currentYear)
      .reduce((sum, m) => sum + m.total, 0);

    const yearSubtotal = Object.values(monthlyRevenue)
      .filter(m => m.year === currentYear)
      .reduce((sum, m) => sum + m.subtotal, 0);

    // Quarter
    const quarterStart = Math.floor(currentMonth / 3) * 3;
    const quarterRevenue = Object.values(monthlyRevenue)
      .filter(m => m.year === currentYear && m.month >= quarterStart && m.month <= currentMonth)
      .reduce((sum, m) => sum + m.total, 0);

    // Chart data - last 6 months
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const data = monthlyRevenue[key] || { total: 0, subtotal: 0, count: 0 };
      chartData.push({
        period: SHORT_MONTHS[d.getMonth()],
        month: FULL_MONTHS[d.getMonth()],
        name: SHORT_MONTHS[d.getMonth()],
        year: d.getFullYear(),
        value: data.subtotal,
        total: data.total,
        count: data.count,
      });
    }

    // Total expenses (placeholder - from FinbotExpense if available)
    const totalExpenses = 0; // Will be enhanced later

    return {
      hasData,
      isLoading,
      currentMonth: currentMonthData,
      prevMonth: prevMonthData,
      revenueChangePercent: Number(revenueChangePercent.toFixed(1)),
      totalRevenue: currentMonthData.total,
      totalSubtotal: currentMonthData.subtotal,
      yearRevenue,
      yearSubtotal,
      quarterRevenue,
      totalExpenses,
      netProfit: currentMonthData.total - totalExpenses,
      chartData,
      totalDocs: revenueDocs.length,
      monthlyRevenue,
    };
  }, [documents]);

  return stats;
}