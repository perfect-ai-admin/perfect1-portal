import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage, getTrendColor, getTrendColorClass } from '../utils/formatters';

export default function MetricQuadrant({ title, value, change, trend, chartData, icon: Icon, isCurrency = false, isPercentage = false }) {
  // Format value based on type
  const formattedValue = isCurrency 
    ? (typeof value === 'string' ? value : formatCurrency(value))
    : isPercentage 
      ? (typeof value === 'string' ? value : formatPercentage(value, 0))
      : value;
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return 'text-green-600 bg-green-50';
    if (trend < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };



  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{formattedValue}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold", getTrendColor() + ' bg-opacity-20')}>
          {getTrendIcon()}
          <span>{change}</span>
        </div>
      </div>

      {/* Mini Chart */}
      {chartData && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={chartData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={getTrendColor(trend)} 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}