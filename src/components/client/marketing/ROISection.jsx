import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import BarChart from '../business/BarChart';

export default function ROISection() {
  const [timeRange, setTimeRange] = useState('month');

  const metrics = {
    month: {
      roi: 245,
      revenue: 8500,
      spent: 3200,
      channels: [
        { name: 'Google', roi: 320, cost: 1200 },
        { name: 'Facebook', roi: 215, cost: 800 },
        { name: 'Email', roi: 180, cost: 200 },
        { name: 'טלפון', roi: 400, cost: 0 }
      ]
    }
  };

  const data = metrics[timeRange];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Main KPI */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">ROI כולל</h3>
        </div>
        <div className="text-5xl font-bold text-green-600 mb-2">
          {data.roi}%
        </div>
        <p className="text-sm text-gray-600">
          הכנסה: ₪{data.revenue.toLocaleString()} | הוצאה: ₪{data.spent.toLocaleString()}
        </p>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">ROI לפי ערוץ</h3>
        <BarChart 
          data={data.channels}
          dataKeys={['roi', 'cost']}
          colors={['#22C55E', '#F59E0B']}
        />
      </div>

      {/* Channel Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">פירוט ערוצים</h3>
        <div className="space-y-3">
          {data.channels.map((channel, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div>
                <p className="font-medium text-gray-900">{channel.name}</p>
                <p className="text-sm text-gray-600">
                  הוצאה: ₪{channel.cost.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{channel.roi}%</p>
                <p className="text-xs text-gray-500">ROI</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>טיפ:</strong> ערוצים עם ROI גבוה זה המקום להשקיע יותר
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-400">
          * הנתונים המוצגים הם להמחשה בלבד ואינם משקפים נתונים אמיתיים
        </p>
      </div>
    </motion.div>
  );
}