import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, ChevronDown, ChevronUp, Eye, TrendingUp, Target, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ContextPanel({ clientData }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const contextCategories = [
    {
      id: 'financial',
      label: 'נתונים כספיים',
      icon: TrendingUp,
      items: [
        { key: 'הכנסות חודשיות', value: '₪12,500' },
        { key: 'הוצאות חודשיות', value: '₪5,200' },
        { key: 'רווח נקי', value: '₪7,300' },
        { key: 'חשבוניות ממתינות', value: '3 (₪4,500)' }
      ]
    },
    {
      id: 'goals',
      label: 'מטרות אישיות',
      icon: Target,
      items: [
        { key: 'מטרות פעילות', value: '2' },
        { key: 'במסלול להשגה', value: '1' },
        { key: 'צריכות תשומת לב', value: '1' }
      ]
    },
    {
      id: 'milestones',
      label: 'אבני דרך',
      icon: Calendar,
      items: [
        { key: 'אבני דרך שהושגו', value: '3 / 6' },
        { key: 'שלב נוכחי', value: 'חשבונית ראשונה' }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-600" />
          <div className="text-right">
            <h3 className="font-bold text-gray-900">המידע שהמנטור רואה</h3>
            <p className="text-xs text-gray-600">המנטור משתמש בנתונים אלה לייעוץ מדויק</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 space-y-4"
          >
            {contextCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <category.icon className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-gray-900 text-sm">{category.label}</h4>
                </div>
                <div className="space-y-2">
                  {category.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.key}</span>
                      <Badge variant="secondary" className="font-mono">
                        {item.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p className="text-xs text-blue-900 flex items-start gap-2">
                <Eye className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>המנטור מעודכן בזמן אמת בכל שינוי בנתונים שלך ומשתמש בהם לייעוץ מותאם אישית.</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}