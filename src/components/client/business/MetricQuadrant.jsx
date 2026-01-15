import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage, getTrendColor, getTrendColorClass, getTrendBgClass } from './formatters';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function MetricQuadrant({ title, value, change, trend, chartData, icon: Icon, isCurrency = false, isPercentage = false, compact = false }) {
  // Format value based on type
  const formattedValue = isCurrency 
    ? (typeof value === 'string' ? value : formatCurrency(value))
    : isPercentage 
      ? (typeof value === 'string' ? value : formatPercentage(value, 0))
      : value;
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-3 h-3" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-3 shadow border border-gray-100 hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-2">
          {Icon && (
            <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 truncate">{title}</p>
            <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">{formattedValue}</p>
            <div className={cn("flex items-center gap-1 text-xs font-medium mt-1", getTrendColorClass(trend))}>
              {getTrendIcon()}
              <span>{change}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }


  const tooltipTexts = {
    'הכנסות': 'סה"כ הכנסותיך מחודש קודם מכל המקורות',
    'הוצאות': 'כל הוצאותיך: שכרה, חשמל, חומרים וכו׳',
    'רווח נקי': 'הכנסות פחות הוצאות - מה שנשאר לך',
    'מדדי ביצוע': 'דירוג כללי של ביצועך העסקי'
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
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">{title}</p>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">{tooltipTexts[title] || 'עוד מידע'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formattedValue}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold", getTrendColorClass(trend), getTrendBgClass(trend))}>
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