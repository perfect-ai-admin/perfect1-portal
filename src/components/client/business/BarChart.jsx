import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function BarChart({ data = [], dataKeys = [], colors = [], height = 300, valueFormatter }) {
  const defaultData = [
    { name: 'ינואר', value1: 8000, value2: 5000 },
    { name: 'פברואר', value1: 9500, value2: 6200 },
    { name: 'מרץ', value1: 12000, value2: 7500 },
    { name: 'אפריל', value1: 11000, value2: 8100 },
    { name: 'מאי', value1: 14000, value2: 9000 },
    { name: 'יוני', value1: 15500, value2: 10200 }
  ];

  const defaultColors = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6'];
  const defaultKeys = dataKeys.length > 0 ? dataKeys : ['value1', 'value2'];

  const chartData = data.length > 0 ? data : defaultData;
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