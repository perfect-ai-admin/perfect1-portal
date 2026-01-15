import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ChevronDown } from 'lucide-react';
import MentorHeader from './shared/MentorHeader';
import ActionChip from './shared/ActionChip';
import { Button } from '@/components/ui/button';

const objections = [
  {
    id: 1,
    title: 'זה יקר',
    response: 'אני מבין שהמחיר גבוה. בואו נראה מה בדיוק צריך.',
    nextQuestion: 'מה התקציב שלך?',
    closePhrase: 'אם נמצא דרך לחסוך בהוצאות אחרות, זה יהפוך לפתור, נכון?'
  },
  {
    id: 2,
    title: 'צריך לחשוב',
    response: 'בטוח, זה החלטה חשובה. בואו נוודא שאתה יודע הכל.',
    nextQuestion: 'מה עוד אתה צריך לדעת?',
    closePhrase: 'אם כל הנתונים יהיו ברורים, אתה מוכן להחליט בשבוע?'
  },
  {
    id: 3,
    title: 'לא עכשיו',
    response: 'הבנתי. מתי זה יהיה הזמן הנכון?',
    nextQuestion: 'מה צריך להשתנות?',
    closePhrase: 'בואו נקבע תזכורת ל-{תאריך}. זה בסדר?'
  },
  {
    id: 4,
    title: 'משווה מתחרה',
    response: 'סדר. הם גם טובים. מה ההבדל שחשוב לך?',
    nextQuestion: 'מה המחיר שלהם?',
    closePhrase: 'אנחנו מציעים X. האם ההבדל בשווי שווה לנו?'
  }
];

export default function Sales() {
  const [expandedObjection, setExpandedObjection] = useState(null);

  return (
    <div className="flex flex-col h-full bg-white">
      <MentorHeader 
        title="מכירות"
        subtitle="החודש: 12 שיחות / 3 סגירות | נקודת חולשה: פולואפ"
        icon={TrendingUp}
      />

      {/* Main Fix */}
      <div className="border-b border-gray-100 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4"
        >
          <h3 className="font-bold text-gray-900 mb-2">הבעיה: אתה מסביר לפני שאתה שואל</h3>
          <p className="text-sm text-gray-700 mb-3">תיקון: שאל 2 שאלות פתיחה בהתחלה</p>
          
          <div className="bg-white rounded p-3 mb-3 text-xs text-gray-900 border border-blue-100">
            <p className="font-mono">
              "היי, כמה עסקאות אתה מטפל בחודש?" <br/>
              [חכה לתשובה] <br/>
              "ומה הבעיה הגדולה ביותר שאתה מתמודד איתה?"
            </p>
          </div>

          <ActionChip label="העתק לווצאפ" variant="success" />
        </motion.div>
      </div>

      {/* Objections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-xs text-gray-600 font-medium mb-3">התנגדויות נפוצות:</p>
        {objections.map((obj, idx) => (
          <motion.div
            key={obj.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <button
              onClick={() => setExpandedObjection(expandedObjection === obj.id ? null : obj.id)}
              className="w-full text-right p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all flex items-center justify-between"
            >
              <span className="font-medium text-sm text-gray-900">{obj.title}</span>
              <motion.div
                animate={{ rotate: expandedObjection === obj.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.div>
            </button>

            {expandedObjection === obj.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 bg-white border border-gray-100 rounded-lg p-3 space-y-2"
              >
                <div>
                  <p className="text-xs text-gray-600">תגובה קצרה:</p>
                  <p className="text-sm text-gray-900">{obj.response}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">שאלה אחת:</p>
                  <p className="text-sm text-gray-900">{obj.nextQuestion}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">משפט סגירה:</p>
                  <p className="text-sm text-gray-900 font-medium">{obj.closePhrase}</p>
                </div>
                <Button size="sm" variant="outline" className="w-full text-xs h-7">
                  העתק לווצאפ
                </Button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}