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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">{item.label}</p>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}