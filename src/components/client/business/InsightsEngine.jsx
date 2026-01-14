import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function InsightsEngine({ clientData, period = 'month' }) {
  // Mock insights - replace with real AI-generated insights
  const insights = [
    {
      type: 'positive',
      title: 'צמיחה מרשימה!',
      description: 'ההכנסות שלך גדלו ב-28% לעומת החודש שעבר - המשך כך!',
      icon: TrendingUp,
      color: 'bg-green-50 border-green-200 text-green-900'
    },
    {
      type: 'warning',
      title: 'שים לב להוצאות',
      description: 'ההוצאות שלך עלו ב-15% - בדוק אם זה מוצדק לאור הצמיחה.',
      icon: AlertCircle,
      color: 'bg-orange-50 border-orange-200 text-orange-900'
    },
    {
      type: 'opportunity',
      title: 'הזדמנות: לקוח חוזר',
      description: 'לקוח "אבי כהן" רכש ממך 3 פעמים החודש - שקול להציע מחיר מועדפים.',
      icon: Sparkles,
      color: 'bg-blue-50 border-blue-200 text-blue-900'
    },
    {
      type: 'success',
      title: 'מטרה הושגה!',
      description: 'עברת את יעד ההכנסות החודשי - כל הכבוד! 🎉',
      icon: CheckCircle,
      color: 'bg-purple-50 border-purple-200 text-purple-900'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">תובנות חכמות</h3>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl border-2 p-4 ${insight.color}`}
          >
            <div className="flex items-start gap-3">
              <insight.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold mb-1">{insight.title}</h4>
                <p className="text-sm opacity-90 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-900">
          💡 <strong>טיפ:</strong> התובנות האלה מתעדכנות אוטומטית על סמך הנתונים העסקיים שלך. בדוק כאן בכל תחילת שבוע.
        </p>
      </div>
    </div>
  );
}