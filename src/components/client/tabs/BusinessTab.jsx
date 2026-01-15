import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VisionCard from '../business/VisionCard';
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
import { TrendingUp, DollarSign, PieChart, Download, BarChart3 } from 'lucide-react';
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
  
  // Mock data - replace with real data
  const revenueData = [
    { month: 'ינואר', value: 8000 },
    { month: 'פברואר', value: 9500 },
    { month: 'מרץ', value: 12000 },
    { month: 'אפריל', value: 11000 },
    { month: 'מאי', value: 14000 },
    { month: 'יוני', value: 15500 }
  ];

  const handleVisionSave = async (newVision) => {
    // Save vision to database
    console.log('Saving vision:', newVision);
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      // Prepare export data
      const exportData = {
        period,
        revenue: revenueData,
        metrics: {
          totalRevenue: 42000,
          totalExpenses: 18500,
          netProfit: 23500,
          performance: 85
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




      {/* Controls */}
      <div className="flex items-center justify-between">
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

      {/* KPI Row - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricQuadrant
          title="הכנסות"
          value={42000}
          change="+15%"
          trend={15}
          chartData={revenueData}
          icon={TrendingUp}
          isCurrency={true}
          compact={true}
        />
        <MetricQuadrant
          title="הוצאות"
          value={18500}
          change="+5%"
          trend={5}
          chartData={revenueData}
          icon={DollarSign}
          isCurrency={true}
          compact={true}
        />
        <MetricQuadrant
          title="רווח נקי"
          value={23500}
          change="+28%"
          trend={28}
          chartData={revenueData}
          icon={PieChart}
          isCurrency={true}
          compact={true}
        />
        <MetricQuadrant
          title="ביצוע"
          value={85}
          change="+3%"
          trend={3}
          chartData={revenueData}
          icon={BarChart3}
          isPercentage={true}
          compact={true}
        />
      </div>

      {/* Charts Section - Compact */}
      <div className="space-y-4">
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">מגמת הכנסות</h3>
            <RevenueLineChart data={revenueData} period={period} />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">פילוח הוצאות</h3>
            <ExpenseDonutChart />
          </div>
        </div>
      </div>

      {/* Additional Insights - Collapsible on Mobile */}
      <CollapsibleSection title="ניתוח מפורט" defaultOpen={false}>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">השוואת הכנסות והוצאות</h3>
            <BarChart 
              data={revenueData.map(item => ({
                name: item.month,
                הכנסות: item.value,
                הוצאות: Math.round(item.value * 0.4)
              }))}
              dataKeys={['הכנסות', 'הוצאות']}
              colors={['#22C55E', '#EF4444']}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">תעדוף פעילות</h3>
            <div className="flex items-center justify-center">
              <HeatmapCalendar 
                data={Array.from({length: 85}, (_, i) => ({
                  date: new Date(new Date().setDate(new Date().getDate() - (84 - i))).toISOString().split('T')[0],
                  value: Math.floor(Math.random() * 5)
                }))}
                cellSize={12}
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
      <InsightsEngine clientData={data} period={period} />


    </motion.div>
  );
}