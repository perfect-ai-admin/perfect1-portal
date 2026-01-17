import React, { useState } from 'react';
import { motion } from 'framer-motion';

import MetricQuadrant from '../business/MetricQuadrant';
import ExpenseDonutChart from '../business/ExpenseDonutChart';
import RevenueLineChart from '../business/RevenueLineChart';
import BarChart from '../business/BarChart';
import HeatmapCalendar from '../business/HeatmapCalendar';
import Sparkline from '../business/Sparkline';
import ExportDialog from '../shared/ExportDialog';
import InsightsEngine from '../business/InsightsEngine';
import FocusDashboard from '../business/FocusDashboard';
import StateDataCollector from '../business/StateDataCollector';
import UnifiedRecommendationPanel from '../business/UnifiedRecommendationPanel';
import BusinessStateTimeline from '../business/BusinessStateTimeline';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import MetricTooltip from '@/components/common/MetricTooltip';
import { TrendingUp, DollarSign, PieChart, Download, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '../business/formatters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BusinessTab({ data }) {
  const [period, setPeriod] = useState('month');
  const [isExporting, setIsExporting] = useState(false);
  
  // Check if we have real data (mock check for now)
  const hasRealData = false; // This would normally check data.revenue_metrics?.length > 0

  // Beautiful Demo Data
  const demoRevenueData = [
    { period: 'ינו', value: 12000, previous: 10000 },
    { period: 'פבר', value: 18000, previous: 12000 },
    { period: 'מרץ', value: 15000, previous: 18000 },
    { period: 'אפר', value: 22000, previous: 15000 },
    { period: 'מאי', value: 28000, previous: 22000 },
    { period: 'יוני', value: 32000, previous: 28000 },
  ];

  const demoExpenseData = [
    { name: 'שיווק ומיתוג', value: 8500, category: 'marketing' },
    { name: 'תוכנות ותשתיות', value: 3200, category: 'software' },
    { name: 'ציוד משרדי', value: 1500, category: 'supplies' },
    { name: 'נסיעות', value: 1200, category: 'travel' },
    { name: 'אחר', value: 800, category: 'other' }
  ];

  const demoHeatmapData = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
      date: d.toISOString().split('T')[0],
      value: Math.random() > 0.6 ? Math.floor(Math.random() * 10) : 0
    };
  });

  const revenueData = hasRealData ? [] : demoRevenueData;
  const expenseData = hasRealData ? [] : demoExpenseData;
  const heatmapData = hasRealData ? [] : demoHeatmapData;

  // Calculate Demo Totals
  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.value, 0);
  const totalExpenses = expenseData.reduce((acc, curr) => acc + curr.value, 0);
  const netProfit = totalRevenue - totalExpenses;
  const performance = 85; // Mock percentage



  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      // Prepare export data
      const exportData = {
        period,
        revenue: revenueData,
        metrics: {
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          performance: 0
        },
        vision: data.business_vision,
        businessState: data.business_state
      };

      if (format === 'pdf') {
        // Generate PDF
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('דוח עסקי', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`תקופה: ${period === 'month' ? 'חודש נוכחי' : period === 'quarter' ? 'רבעון נוכחי' : 'שנה נוכחית'}`, 20, 35);
        doc.text(`תאריך: ${new Date().toLocaleDateString('he-IL')}`, 20, 42);
        
        doc.setFont('helvetica', 'bold');
        doc.text('סיכום פיננסי:', 20, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(`הכנסות: ${formatCurrency(exportData.metrics.totalRevenue)}`, 20, 65);
        doc.text(`הוצאות: ${formatCurrency(exportData.metrics.totalExpenses)}`, 20, 72);
        doc.text(`רווח נקי: ${formatCurrency(exportData.metrics.netProfit)}`, 20, 79);
        
        doc.save('business-report.pdf');
      } else if (format === 'csv') {
        // Generate CSV
        const csvRows = [
          ['חודש', 'הכנסות'],
          ...revenueData.map(item => [item.month, item.value])
        ];
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'business-data.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >




      {/* Demo Mode Banner */}
      {!hasRealData && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-4 shadow-sm"
        >
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900 text-sm">המערכת במצב הדגמה</h3>
            <p className="text-xs text-indigo-700 mt-1">
              כך יראו הנתונים שלך כשתתחיל לעבוד. כל הגרפים והמדדים יוצגו בזמן אמת ברגע שתזין נתונים אמיתיים.
            </p>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-lg font-bold text-gray-900">סקירת ביצועים</h2>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">חודש נוכחי</SelectItem>
              <SelectItem value="quarter">רבעון נוכחי</SelectItem>
              <SelectItem value="year">שנה נוכחית</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="gap-1"
            aria-label="ייצא דוח כ-PDF"
          >
            <Download className="w-3 h-3" aria-hidden="true" />
            <span className="hidden md:inline">PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="gap-1"
            aria-label="ייצא נתונים כ-CSV"
          >
            <Download className="w-3 h-3" aria-hidden="true" />
            <span className="hidden md:inline">CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Stack - Mobile Optimized */}
      <div className="hidden md:grid md:grid-cols-4 gap-3">
        <MetricQuadrant
          title="הכנסות"
          value={totalRevenue}
          change="+12%"
          trend={1}
          chartData={revenueData}
          icon={TrendingUp}
          isCurrency={true}
          compact={true}
        />
        <MetricQuadrant
          title="הוצאות"
          value={totalExpenses}
          change="-5%"
          trend={-1}
          chartData={revenueData}
          icon={DollarSign}
          isCurrency={true}
          compact={true}
        />
        <MetricQuadrant
          title="רווח נקי"
          value={netProfit}
          change="+24%"
          trend={1}
          chartData={revenueData}
          icon={PieChart}
          isCurrency={true}
          compact={true}
        />
        <MetricQuadrant
          title="ביצוע"
          value={performance}
          change="+2%"
          trend={1}
          chartData={revenueData}
          icon={BarChart3}
          isPercentage={true}
          compact={true}
        />
      </div>

      {/* KPI List - Mobile */}
      <div className="md:hidden space-y-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium">הכנסות</p>
            <p className="text-lg font-bold text-gray-900">₪0</p>
          </div>
          <p className="text-xs text-gray-400 font-semibold">-</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium">הוצאות</p>
            <p className="text-lg font-bold text-gray-900">₪0</p>
          </div>
          <p className="text-xs text-gray-400 font-semibold">-</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium">רווח נקי</p>
            <p className="text-lg font-bold text-gray-900">₪0</p>
          </div>
          <p className="text-xs text-gray-400 font-semibold">-</p>
        </div>
      </div>

      {/* Charts Section - Mobile Optimized */}
      <div className="space-y-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3 relative overflow-hidden">
          {!hasRealData && (
            <div className="absolute top-3 left-3 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium z-10">
              נתונים לדוגמה
            </div>
          )}
          <h3 className="text-sm font-bold text-gray-900 mb-2">מגמת הכנסות</h3>
          <RevenueLineChart data={revenueData} period={period} />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 relative overflow-hidden">
          {!hasRealData && (
            <div className="absolute top-3 left-3 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium z-10">
              נתונים לדוגמה
            </div>
          )}
          <h3 className="text-sm font-bold text-gray-900 mb-2">פילוח הוצאות</h3>
          <ExpenseDonutChart data={expenseData} />
        </div>
      </div>

      {/* Additional Insights - Collapsible on Mobile */}
      <CollapsibleSection title="ניתוח מפורט" defaultOpen={false}>
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
          <div className="bg-white rounded-lg shadow p-3 md:p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2 md:mb-3">השוואת הכנסות והוצאות</h3>
            <BarChart 
              data={revenueData.map(item => ({
                name: item.month,
                הכנסות: item.value,
                הוצאות: Math.round(item.value * 0.4)
              }))}
              dataKeys={['הכנסות', 'הוצאות']}
              colors={['#22C55E', '#EF4444']}
              height={220}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-3 md:p-4 relative">
            {!hasRealData && (
              <div className="absolute top-3 left-3 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium z-10">
                נתונים לדוגמה
              </div>
            )}
            <h3 className="text-sm font-bold text-gray-900 mb-2 md:mb-3">תעדוף פעילות</h3>
            <div className="flex items-center justify-center overflow-x-auto">
              <HeatmapCalendar 
                data={heatmapData}
                cellSize={8}
                cellGap={1}
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Focus Dashboard */}
      {data.business_state?.focus_state && (
        <FocusDashboard focusState={data.business_state.focus_state} />
      )}

      {/* Business State Timeline */}
      {data.business_state?.decision_log && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">היסטוריית החלטות</h3>
          <BusinessStateTimeline decisionLog={data.business_state.decision_log} />
        </div>
      )}

      {/* AI-Powered Insights */}
      <CollapsibleSection title="תובנות חכמות" icon={Sparkles} defaultOpen={false}>
        <InsightsEngine clientData={data} period={period} />
      </CollapsibleSection>


    </motion.div>
  );
}