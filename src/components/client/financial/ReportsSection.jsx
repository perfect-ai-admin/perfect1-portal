import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, DollarSign, PieChart, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const REPORTS = [
  {
    id: 'income',
    title: 'דוח הכנסות',
    description: 'הכנסות לפי תקופה, לקוח או סוג שירות',
    icon: TrendingUp,
    color: 'from-green-500 to-green-600',
    available: true
  },
  {
    id: 'expense',
    title: 'דוח הוצאות',
    description: 'הוצאות לפי קטגוריה עם ניתוח מגמות',
    icon: DollarSign,
    color: 'from-blue-500 to-blue-600',
    available: true
  },
  {
    id: 'profit_loss',
    title: 'רווח והפסד',
    description: 'P&L חודשי עם השוואה שנה-על-שנה',
    icon: PieChart,
    color: 'from-purple-500 to-purple-600',
    available: true
  },
  {
    id: 'cash_flow',
    title: 'תזרים מזומנים',
    description: 'תחזית לעומת מצב בפועל',
    icon: TrendingUp,
    color: 'from-orange-500 to-orange-600',
    available: true
  },
  {
    id: 'vat_summary',
    title: 'סיכום מע"ם',
    description: 'מע"ם תשומות מול מע"ם עסקאות לתקופת דיווח',
    icon: FileText,
    color: 'from-red-500 to-red-600',
    available: true
  },
  {
    id: 'client_aging',
    title: 'התיישנות לקוחות',
    description: 'חשבוניות ממתינות לפי טווחי גיל',
    icon: Users,
    color: 'from-indigo-500 to-indigo-600',
    available: true
  }
];

export default function ReportsSection() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">דוחות כספיים</h3>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">חודש נוכחי</SelectItem>
            <SelectItem value="quarter">רבעון נוכחי</SelectItem>
            <SelectItem value="year">שנה נוכחית</SelectItem>
            <SelectItem value="custom">טווח מותאם</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setSelectedReport(report.id)}
            >
              <div className={`bg-gradient-to-r ${report.color} p-6 text-white`}>
                <Icon className="w-10 h-10 mb-3" />
                <h4 className="text-xl font-bold mb-2">{report.title}</h4>
                <p className="text-sm opacity-90">{report.description}</p>
              </div>
              <div className="p-4">
                <Button variant="ghost" className="w-full">
                  צפה בדוח
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}