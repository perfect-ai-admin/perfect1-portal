import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  marketing: '#3B82F6',
  supplies: '#8B5CF6',
  software: '#EC4899',
  travel: '#F59E0B',
  other: '#6B7280'
};

export default function ExpenseDonutChart({ data = [] }) {
  const defaultData = [
    { name: 'שיווק', value: 3500, category: 'marketing' },
    { name: 'ציוד', value: 2800, category: 'supplies' },
    { name: 'תוכנות', value: 1200, category: 'software' },
    { name: 'נסיעות', value: 800, category: 'travel' },
    { name: 'אחר', value: 700, category: 'other' }
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.category] || COLORS.other} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `₪${value.toLocaleString('he-IL')}`}
            contentStyle={{ direction: 'rtl' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}