import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VisionCard from '../business/VisionCard';
import MetricQuadrant from '../business/MetricQuadrant';
import ExpenseDonutChart from '../business/ExpenseDonutChart';
import RevenueLineChart from '../business/RevenueLineChart';
import ExportDialog from '../shared/ExportDialog';
import InsightsEngine from '../business/InsightsEngine';
import FocusDashboard from '../business/FocusDashboard';
import StateDataCollector from '../business/StateDataCollector';
import UnifiedRecommendationPanel from '../business/UnifiedRecommendationPanel';
import BusinessStateTimeline from '../business/BusinessStateTimeline';
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BusinessTab({ data }) {
  const [period, setPeriod] = useState('month');
  
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Vision Statement */}
      <VisionCard 
        vision={data.business_vision || ''}
        onSave={handleVisionSave}
      />

      {/* State Data Collector - Unified Panel */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">ההמלצה שלך</h2>
            <UnifiedRecommendationPanel businessState={data.business_state} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">עדכן מצב</h3>
            <StateDataCollector 
              businessState={data.business_state}
              onDataUpdate={(category, formData) => {
                // Backend integration point - כאן יתחבר ל-analyzeBusinessState function
                console.log('Data collected:', category, formData);
              }}
            />
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">נתונים כספיים</h2>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">חודש נוכחי</SelectItem>
              <SelectItem value="quarter">רבעון נוכחי</SelectItem>
              <SelectItem value="year">שנה נוכחית</SelectItem>
            </SelectContent>
          </Select>
          <ExportDialog data={revenueData} filename="business-data" />
        </div>
      </div>

      {/* Four Quadrants */}
      <div className="grid md:grid-cols-2 gap-6">
        <MetricQuadrant
          title="הכנסות"
          value="₪42,000"
          change="+15%"
          trend={15}
          chartData={revenueData}
          icon={TrendingUp}
        />
        <MetricQuadrant
          title="הוצאות"
          value="₪18,500"
          change="+5%"
          trend={5}
          chartData={revenueData}
          icon={DollarSign}
        />
        <MetricQuadrant
          title="רווח נקי"
          value="₪23,500"
          change="+28%"
          trend={28}
          chartData={revenueData}
          icon={PieChart}
        />
        <MetricQuadrant
          title="מדדי ביצוע"
          value="85%"
          change="+3%"
          trend={3}
          chartData={revenueData}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">מגמת הכנסות</h3>
          <RevenueLineChart data={revenueData} period={period} />
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">פילוח הוצאות</h3>
          <ExpenseDonutChart />
        </div>
      </div>

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

      {/* Additional Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">לקוח טוב ביותר</p>
          <p className="text-2xl font-bold text-blue-900 mb-1">אבי כהן</p>
          <p className="text-xs text-blue-600">₪8,500 החודש</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-purple-700 mb-1">מקור הכנסה עיקרי</p>
          <p className="text-2xl font-bold text-purple-900 mb-1">שירותי ייעוץ</p>
          <p className="text-xs text-purple-600">65% מההכנסות</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-700 mb-1">ממוצע לחשבונית</p>
          <p className="text-2xl font-bold text-green-900 mb-1">₪2,100</p>
          <p className="text-xs text-green-600">+12% מחודש שעבר</p>
        </div>
      </div>
    </motion.div>
  );
}