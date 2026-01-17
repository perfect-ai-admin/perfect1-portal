import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function BarChart({ data = [], dataKeys = [], colors = [], height = 300, valueFormatter }) {
  const defaultColors = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6'];
  const defaultKeys = dataKeys.length > 0 ? dataKeys : ['value1', 'value2'];

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200" style={{ height: `${height}px` }}>
        <p className="text-gray-400 text-sm">אין נתונים להצגה</p>
      </div>
    );
  }

  const chartData = data;
  const barColors = colors.length > 0 ? colors : defaultColors;

  const defaultFormatter = (value) => `₪${value.toLocaleString('he-IL')}`;
  const formatter = valueFormatter || defaultFormatter;

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            style={{ fontSize: '12px', direction: 'rtl' }}
          />
          <YAxis 
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatter}
          />
          <Tooltip 
            formatter={(value) => [formatter(value), '']}
            contentStyle={{ direction: 'rtl', borderRadius: '8px' }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ direction: 'rtl' }}
          />
          {defaultKeys.map((key, index) => (
            <Bar 
              key={key}
              dataKey={key} 
              fill={barColors[index % barColors.length]}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}