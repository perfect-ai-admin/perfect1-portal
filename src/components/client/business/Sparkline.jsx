import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function Sparkline({ 
  data = [], 
  color = '#22C55E',
  showTrend = true,
  height = 40,
  width = 120,
  className = ''
}) {
  const defaultData = [
    { value: 45 },
    { value: 52 },
    { value: 48 },
    { value: 61 },
    { value: 58 },
    { value: 67 },
    { value: 73 }
  ];

  const chartData = data.length > 0 ? data : defaultData;
  
  // Calculate trend
  const firstValue = chartData[0]?.value || 0;
  const lastValue = chartData[chartData.length - 1]?.value || 0;
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';
  const trendPercent = firstValue > 0 ? ((lastValue - firstValue) / firstValue * 100).toFixed(1) : 0;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {showTrend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          {Math.abs(trendPercent)}%
        </div>
      )}
    </div>
  );
}