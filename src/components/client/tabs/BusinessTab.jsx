import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VisionCard from '../business/VisionCard';
import MetricQuadrant from '../business/MetricQuadrant';
import { TrendingUp, DollarSign, PieChart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            ייצוא
          </Button>
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

      {/* Key Insights */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">תובנות מרכזיות</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <InsightCard
            label="לקוח טוב ביותר"
            value="אבי כהן"
            detail="₪8,500 החודש"
            color="bg-blue-50 text-blue-700"
          />
          <InsightCard
            label="מקור הכנסה עיקרי"
            value="שירותי ייעוץ"
            detail="65% מהכנסות"
            color="bg-purple-50 text-purple-700"
          />
          <InsightCard
            label="ממוצע לחשבונית"
            value="₪2,100"
            detail="+12% מחודש שעבר"
            color="bg-green-50 text-green-700"
          />
        </div>
      </div>
    </motion.div>
  );
}

function InsightCard({ label, value, detail, color }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-sm opacity-75 mb-1">{label}</p>
      <p className="text-xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-75">{detail}</p>
    </div>
  );
}