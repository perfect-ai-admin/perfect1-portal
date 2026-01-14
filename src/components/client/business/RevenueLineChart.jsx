import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function RevenueLineChart({ data = [], period = 'month' }) {
  const defaultData = [
    { period: 'ינואר', value: 8000, previous: 7200 },
    { period: 'פברואר', value: 9500, previous: 8100 },
    { period: 'מרץ', value: 12000, previous: 9800 },
    { period: 'אפריל', value: 11000, previous: 10500 },
    { period: 'מאי', value: 14000, previous: 11200 },
    { period: 'יוני', value: 15500, previous: 13000 }
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="period" 
            stroke="#6B7280"
            style={{ fontSize: '12px', direction: 'rtl' }}
          />
          <YAxis 
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `₪${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip 
            formatter={(value) => [`₪${value.toLocaleString('he-IL')}`, 'הכנסות']}
            contentStyle={{ direction: 'rtl', borderRadius: '8px' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#22C55E" 
            strokeWidth={3}
            fill="url(#colorRevenue)"
          />
          <Line 
            type="monotone" 
            dataKey="previous" 
            stroke="#9CA3AF" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}