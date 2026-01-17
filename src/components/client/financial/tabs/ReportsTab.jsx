import React, { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ReportsTab({ data }) {
  const [selectedDateRange, setSelectedDateRange] = useState('month');

  const reports = [
    {
      id: 1,
      name: 'דוח הכנסות והוצאות',
      description: 'סיכום הכנסות, הוצאות ורווח נקי',
      icon: '📊',
    },
    {
      id: 2,
      name: 'דוח מע"מ',
      description: 'דוח מע"מ להגשה',
      icon: '🧾',
    },
    {
      id: 3,
      name: 'דוח פקדונות',
      description: 'פקדונות לנציגות',
      icon: '💰',
    },
    {
      id: 4,
      name: 'דוח לקוחות',
      description: 'יתרות לקוחות ויתרה פתוחה',
      icon: '👥',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-4">
        <h2 className="text-lg font-bold text-purple-900">דוחות</h2>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
        >
          <option value="month">חודש נוכחי</option>
          <option value="quarter">רבעון נוכחי</option>
          <option value="year">שנה נוכחית</option>
          <option value="custom">בחר תאריכים</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border-2 border-purple-200 rounded-lg p-4 hover:shadow-lg hover:border-purple-300 transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl">{report.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{report.name}</p>
                <p className="text-xs text-gray-600 mt-1">{report.description}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t-2 border-purple-100">
              <Button
                size="sm"
                className="flex-1 gap-2 h-9 text-xs border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold"
                variant="outline"
                onClick={() => console.log('View report:', report.id)}
              >
                <FileText className="w-3 h-3" />
                צפייה
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-2 h-9 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                onClick={() => console.log('Download PDF:', report.id)}
              >
                <Download className="w-3 h-3" />
                PDF
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-2 h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                onClick={() => console.log('Download CSV:', report.id)}
              >
                <Download className="w-3 h-3" />
                CSV
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Summary (for current month) */}
      {selectedDateRange === 'month' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3"
        >
          <h3 className="font-semibold text-gray-900 text-sm">סיכום חודשי</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">הכנסות</p>
              <p className="text-lg font-bold text-gray-900">₪0</p>
              <p className="text-xs text-gray-400 mt-1">-</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">הוצאות</p>
              <p className="text-lg font-bold text-gray-900">₪0</p>
              <p className="text-xs text-gray-400 mt-1">-</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">רווח נקי</p>
              <p className="text-lg font-bold text-green-600">₪0</p>
              <p className="text-xs text-gray-400 mt-1">-</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">פתוח מלקוחות</p>
              <p className="text-lg font-bold text-orange-600">₪0</p>
              <p className="text-xs text-gray-400 mt-1">0 מסמכים</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}