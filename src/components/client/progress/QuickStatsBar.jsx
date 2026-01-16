import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, FileText, AlertCircle } from 'lucide-react';

export default function QuickStatsBar({ stats }) {
  const items = [
    {
      label: 'הכנסות חודש זה',
      value: stats?.monthlyRevenue || '₪0',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'מטרות פעילות',
      value: stats?.activeGoals || '0',
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'חשבוניות ממתינות',
      value: stats?.pendingInvoices || '0',
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'פעולות דחופות',
      value: stats?.urgentActions || '0',
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-2.5 md:p-3 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-base md:text-lg font-black text-gray-900 leading-tight">{item.value}</p>
              <p className="text-[9px] md:text-xs leading-tight text-gray-600 font-semibold">{item.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}