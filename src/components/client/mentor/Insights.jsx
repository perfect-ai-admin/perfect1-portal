import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock Data
const REVENUE_DATA = [
  { name: 'ינו', income: 4000, expenses: 2400 },
  { name: 'פבר', income: 3000, expenses: 1398 },
  { name: 'מרץ', income: 9800, expenses: 2000 },
  { name: 'אפר', income: 3908, expenses: 2780 },
  { name: 'מאי', income: 4800, expenses: 1890 },
  { name: 'יוני', income: 3800, expenses: 2390 },
  { name: 'יולי', income: 12500, expenses: 3490 },
];

const METRICS = [
  { 
    id: 'revenue', 
    label: 'הכנסות החודש', 
    value: '₪12,500', 
    trend: '+12%', 
    isPositive: true,
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  { 
    id: 'leads', 
    label: 'לידים חדשים', 
    value: '24', 
    trend: '+4', 
    isPositive: true,
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  { 
    id: 'expenses', 
    label: 'הוצאות', 
    value: '₪3,490', 
    trend: '-2%', 
    isPositive: false, // For expenses, down is good, but let's keep logic simple
    icon: TrendingDown,
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  },
  { 
    id: 'profit', 
    label: 'רווח נקי', 
    value: '₪9,010', 
    trend: '+15%', 
    isPositive: true,
    icon: Activity,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  }
];

export default function Insights() {
  const [period, setPeriod] = useState('month');

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">תמונת מצב עסקית</h2>
          <p className="text-gray-500">כל המספרים שלך במקום אחד</p>
        </div>
        <div className="bg-gray-100 p-1 rounded-lg flex text-sm">
          <button 
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 rounded-md transition-all ${period === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            שבוע
          </button>
          <button 
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded-md transition-all ${period === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            חודש
          </button>
          <button 
            onClick={() => setPeriod('year')}
            className={`px-3 py-1 rounded-md transition-all ${period === 'year' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            שנה
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRICS.map((metric) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-xl ${metric.bg}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <Badge variant={metric.isPositive ? 'success' : 'secondary'} className={`flex items-center gap-1 ${metric.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {metric.trend}
                {metric.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </Badge>
            </div>
            <div className="mt-2">
              <span className="text-gray-500 text-xs font-medium block mb-1">{metric.label}</span>
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Main Chart */}
        <Card className="md:col-span-2 p-6 border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              מגמת הכנסות והוצאות
            </h3>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  name="הכנסות"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorExpenses)" 
                  name="הוצאות"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Insights / Goals */}
        <div className="space-y-6 flex flex-col">
          {/* Goals Widget */}
          <Card className="p-6 border-gray-100 shadow-sm bg-indigo-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-indigo-200">
                <Target className="w-5 h-5" />
                <span>יעד חודשי</span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold">₪15,000</span>
                <span className="text-sm text-indigo-300 mb-1">/ ₪12,500</span>
              </div>
              <div className="w-full bg-indigo-800 rounded-full h-2 mb-4">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
              <p className="text-xs text-indigo-200">
                חסר עוד ₪2,500 כדי לעמוד ביעד. זה בערך 2 עסקאות נוספות.
              </p>
            </div>
          </Card>

          {/* AI Alert */}
          <Card className="p-6 border-gray-100 shadow-sm bg-orange-50 border-orange-100 flex-1">
            <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              תובנת מנטור
            </h3>
            <p className="text-sm text-orange-800 leading-relaxed">
              "שמתי לב שההוצאות על שיווק עלו ב-20% החודש, אבל כמות הלידים נשארה זהה. כדאי לבדוק את הקמפיין האחרון בפייסבוק."
            </p>
            <Button variant="outline" className="mt-4 w-full bg-white border-orange-200 text-orange-900 hover:bg-orange-100">
              בדוק קמפיינים
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}