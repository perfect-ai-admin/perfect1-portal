import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LearnSection() {
  const [expandedTopic, setExpandedTopic] = useState(null);

  const learningPaths = {
    beginner: [
      {
        id: 'intro',
        title: 'שיווק לעצמאים 101',
        description: 'היסודות של שיווק לעסק קטן',
        duration: '15 דקות'
      },
      {
        id: 'setup',
        title: 'הגדרת Google Business',
        description: 'שלב אחר שלב לחיבור Google',
        duration: '8 דקות'
      }
    ],
    growing: [
      {
        id: 'social',
        title: 'רשתות חברתיות ביעילות',
        description: 'ניהול רשתות בלי לבזבז זמן',
        duration: '12 דקות'
      },
      {
        id: 'email',
        title: 'Email Marketing ברמה',
        description: 'שליחת מיילים שמביאים תוצאות',
        duration: '10 דקות'
      }
    ],
    advanced: [
      {
        id: 'roi',
        title: 'מדידת ROI מתקדמת',
        description: 'הבנת מדדים שמשנים החלטות',
        duration: '14 דקות'
      },
      {
        id: 'automation',
        title: 'אוטומציה בשיווק',
        description: 'כלים להגדלת שיווק בלי יותר עבודה',
        duration: '16 דקות'
      }
    ]
  };

  const LearningCard = ({ topic }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
      onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{topic.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">⏱️ {topic.duration}</span>
      </div>

      {expandedTopic === topic.id && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <p className="text-sm text-gray-600 mb-4">
            תיאור מורחב של התוכן... (טקסט מלא יוצג כאן)
          </p>
          <Button size="sm" className="gap-2">
            <Play className="w-3 h-3" />
            התחל ללמוד
          </Button>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">למידה מעשית</h3>
        <p className="text-sm text-gray-600 mb-6">תוכן לימודי שמניע פעולה</p>
      </div>

      {/* Beginner */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">👋 מתחיל</h4>
        <div className="space-y-3">
          {learningPaths.beginner.map(topic => (
            <LearningCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>

      {/* Growing */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">📈 צומח</h4>
        <div className="space-y-3">
          {learningPaths.growing.map(topic => (
            <LearningCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>

      {/* Advanced */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">⚡ מתקדם</h4>
        <div className="space-y-3">
          {learningPaths.advanced.map(topic => (
            <LearningCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}