import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function FinanceInbox({ data }) {
  // Mock inbox items - will be replaced with real data
  const inboxItems = [
    {
      id: 1,
      title: '3 הוצאות מחכות לסיווג',
      description: 'קלוטות אתמול בערב',
      priority: 'high',
      action: 'סווג',
      icon: '📊',
    },
    {
      id: 2,
      title: '2 מסמכים פתוחים ללא תשלום',
      description: 'יקבו קרוב לעשרת הימים',
      priority: 'high',
      action: 'צפה',
      icon: '💰',
    },
    {
      id: 3,
      title: 'מסמך אחד חסר פרטי לקוח',
      description: 'חשבונית #1234',
      priority: 'regular',
      action: 'השלם',
      icon: '👤',
    },
  ];

  if (inboxItems.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-green-900">אין משימות פתוחות כרגע</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">לטיפול עכשיו</h3>
      <div className="space-y-2">
        {inboxItems.slice(0, 5).map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3 hover:shadow-sm transition-shadow group"
          >
            {/* Icon */}
            <div className="text-lg flex-shrink-0 mt-0.5">{item.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              <p className="text-xs text-gray-600 truncate">{item.description}</p>
            </div>

            {/* Priority Tag */}
            <div className={`flex-shrink-0 ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'} px-2 py-1 rounded text-[10px] font-medium`}>
              {item.priority === 'high' ? 'חשוב' : 'רגיל'}
            </div>

            {/* Action */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => console.log('Action:', item.id)}
              className="flex-shrink-0 h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {item.action}
              <ChevronRight className="w-3 h-3 mr-1" />
            </Button>
          </motion.div>
        ))}
      </div>

      {inboxItems.length > 5 && (
        <button className="text-xs font-medium text-blue-600 hover:underline w-full text-center py-2">
          צפה בכל המשימות ({inboxItems.length})
        </button>
      )}
    </div>
  );
}