import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function RevenueLineChart({ data = [], period = 'month' }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <p className="text-gray-400 text-sm">אין נתונים להצגה</p>
      </div>
    );
  }

  const chartData = data;

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
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}