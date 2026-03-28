import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock } from 'lucide-react';
import MentorHeader from './shared/MentorHeader';

const recommendedNow = [
  {
    id: 1,
    title: 'כיצד לכתוב תסריט שיחה קצר',
    time: '3 דק',
    why: 'קשור ישירות לבעיית הסגירה שלך'
  },
  {
    id: 2,
    title: 'כיצד להגדיל תקציב גוגל ללא הפסד',
    time: '5 דק',
    why: 'הוצאות גוגל שלך עלות ללא תוצאה'
  },
  {
    id: 3,
    title: 'טמפלט הודעת פולואפ יעילה',
    time: '2 דק',
    why: 'אתה צריך לשלוח פולואפים היום'
  }
];

const playbooks = [
  {
    category: 'גוגל',
    items: ['קמפיין ראשון', 'בחירת מילות מפתח', 'הוצאות שליליות']
  },
  {
    category: 'מכירות',
    items: ['תסריט שיחה', 'טיפול בהתנגדויות', 'פולואפ יעיל']
  },
  {
    category: 'מיתוג',
    items: ['לוגו במהירות', 'דף נחיתה', 'תמונות מקצועיות']
  },
  {
    category: 'ROI',
    items: ['חישוב ROAS', 'ניתוח קמפיין', 'תקציב מקסימלי']
  }
];

const templates = [
  { title: 'הודעות מוכנות', count: 8 },
  { title: 'תבניות דף נחיתה', count: 5 },
  { title: 'תבניות מצגת', count: 3 }
];

export default function Resources() {
  return (
    <div className="flex flex-col h-full bg-white">
      <MentorHeader 
        title="משאבים"
        subtitle="ידע קצר, ישים, כשצריך"
        icon={BookOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Recommended Now */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3">מומלץ עכשיו</h2>
          <div className="space-y-2">
            {recommendedNow.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm text-gray-900">{item.title}</h3>
                  <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{item.why}</p>
                <button className="text-xs text-blue-600 font-medium hover:underline">
                  פתח
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Playbooks */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3">תסריטים</h2>
          <div className="grid grid-cols-2 gap-2">
            {playbooks.map((playbook, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="text-right border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-all"
              >
                <p className="text-xs font-semibold text-gray-900 mb-2">{playbook.category}</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {playbook.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3">תבניות</h2>
          <div className="space-y-2">
            {templates.map((template, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="w-full text-right border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-all flex items-center justify-between"
              >
                <span className="text-xs text-gray-600">{template.count} תבניות</span>
                <span className="text-sm font-medium text-gray-900">{template.title}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}