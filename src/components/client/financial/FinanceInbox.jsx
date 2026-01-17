import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function FinanceInbox({ data }) {
  // Empty initial data
  const inboxItems = [];

  if (inboxItems.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-green-900">אין משימות פתוחות כרגע</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-2.5 md:p-4 md:rounded-xl">
      <h3 className="text-xs md:text-base font-bold text-amber-900 uppercase tracking-wide flex items-center gap-2 px-1">
        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
        לטיפול עכשיו
      </h3>
      <div className="space-y-2 md:space-y-3">
        {inboxItems.slice(0, 5).map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border-2 border-amber-200 rounded-lg md:rounded-lg p-2.5 md:p-4 flex items-start gap-2 md:gap-3 hover:shadow-md transition-all group hover:border-amber-300"
          >
            {/* Icon */}
            <div className="text-lg md:text-2xl flex-shrink-0 mt-0.5">{item.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-base font-semibold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-600 mt-0.5 md:mt-1">{item.description}</p>
            </div>

            {/* Priority Tag */}
            <div className={`flex-shrink-0 ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'} px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs font-bold`}>
              {item.priority === 'high' ? 'חשוב' : 'רגיל'}
            </div>

            {/* Action */}
            <Button
              size="sm"
              onClick={() => console.log('Action:', item.id)}
              className="flex-shrink-0 h-6 px-2 text-xs md:text-sm md:h-8 md:px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
            >
              {item.action}
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