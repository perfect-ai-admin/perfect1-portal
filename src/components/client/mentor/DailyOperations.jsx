import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DAILY_AGENDA = [
  {
    time: '08:00-08:30',
    task: 'בדיקת הודעות ותיזמונים',
    icon: Mail,
    priority: 'medium',
    description: 'בדוק דוא"ל, WhatsApp, וקבעות מיפגשים חדשים',
    tips: ['תשובה מהירה = אמינות'],
    duration: '30 דק'
  },
  {
    time: '08:30-10:00',
    task: 'עבודה אמיתית (עבור לקוחות)',
    icon: TrendingUp,
    priority: 'critical',
    description: 'עבוד עם הלקוחות שלך - זה הכסף. אל תתפעל!',
    tips: ['בלוק זמן סגור - בלי הפרעות', 'סמוקים עבודה אמיתית על הכל'],
    duration: '90 דק'
  },
  {
    time: '10:00-10:15',
    task: 'הפסקה',
    icon: Clock,
    priority: 'low',
    description: 'נשימה, קפה, דקה של טיול',
    tips: [],
    duration: '15 דק'
  },
  {
    time: '10:15-12:00',
    task: 'מכירות וקשר עם לקוחות',
    icon: Phone,
    priority: 'critical',
    description: 'פנה לליידים חדשים, עד לשיחות מעקב - זו הגדילה!',
    tips: [
      'טבעת ≥3 משיחות חדשות',
      'בדוק עד עם לקוחות מעניינים',
      'קבע ≥2 מפגשים חדשים'
    ],
    duration: '105 דק'
  },
  {
    time: '12:00-13:00',
    task: 'הפסקת צהריים',
    icon: Clock,
    priority: 'low',
    description: 'אכל, תרגל, שנח',
    tips: [],
    duration: '60 דק'
  },
  {
    time: '13:00-14:30',
    task: 'עבודה קלה וניהול',
    icon: Calendar,
    priority: 'medium',
    description: 'חשבוניות, דיווחים, organization',
    tips: ['בצע את הדברים הקטנים שהצטברו'],
    duration: '90 דק'
  },
  {
    time: '14:30-15:00',
    task: 'סיכום יום ותכנון מחר',
    icon: CheckCircle,
    priority: 'medium',
    description: 'מה בוצע? מה לא? מה לעשות מחר?',
    tips: ['תיעד מה שעשית - זה מוטיבציה', 'תכנן את 3 משימות הגדולות למחר'],
    duration: '30 דק'
  }
];

export default function DailyOperations() {
  const [expandedTask, setExpandedTask] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-red-300 bg-red-50';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'critical':
        return '🔥 קריטי - תקדם כן!';
      case 'medium':
        return '⚡ חשוב';
      default:
        return '✅ זמן מת';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 border-2 border-purple-300">
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          סדר יום מוצע ליום עסק יעיל
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          זה הסדר שהמנטור ממליץ כדי להיות פרודוקטיבי: 
          בוקר = עבודה אמיתית + מכירות, אחר הצהריים = ניהול + סגירה.
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {DAILY_AGENDA.map((item, idx) => {
          const Icon = item.icon;
          const isExpanded = expandedTask === item.time;

          return (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${getPriorityColor(
                item.priority
              )} ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setExpandedTask(isExpanded ? null : item.time)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{item.time}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.duration}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-gray-800">{item.task}</h4>
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  </div>
                </div>
                <Badge className="ml-2 flex-shrink-0">
                  {getPriorityLabel(item.priority)}
                </Badge>
              </div>

              {isExpanded && item.tips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t-2 border-gray-200"
                >
                  <p className="text-xs font-bold text-gray-700 mb-2">💡 טיפים:</p>
                  <ul className="space-y-1">
                    {item.tips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="flex-shrink-0">→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          יעדים יומיים
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <p className="text-sm text-green-700 font-medium">יעד מכירות</p>
            <p className="text-2xl font-bold text-green-900 mt-2">≥3 שיחות</p>
            <p className="text-xs text-green-700 mt-1">טלפוני או וידאו</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <p className="text-sm text-blue-700 font-medium">יעד עבודה</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">4-5 שעות</p>
            <p className="text-xs text-blue-700 mt-1">עבודה אמיתית בלי הפרעות</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
            <p className="text-sm text-purple-700 font-medium">יעד ממיידים</p>
            <p className="text-2xl font-bold text-purple-900 mt-2">≥2 מפגשים</p>
            <p className="text-xs text-purple-700 mt-1">קבועים עם לקוחות</p>
          </div>
        </div>
      </div>

      {/* Weekly Challenge */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 border-2 border-orange-300">
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          אתגר השבוע
        </h3>
        <p className="text-sm text-gray-800 mb-4">
          עקוב אחרי סדר היום הזה כל יום וראה כמה זה משנה!
        </p>
        <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
          ✅ התחל בחתימה על הסדר יום
        </Button>
      </div>
    </div>
  );
}