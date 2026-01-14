import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ReviewScreen({ focus, onSave }) {
  const [whatWorked, setWhatWorked] = useState(focus?.week_review?.what_worked || '');
  const [whatDidntWork, setWhatDidntWork] = useState(focus?.week_review?.what_didnt_work || '');
  const [nextWeek, setNextWeek] = useState(focus?.week_review?.next_week_focus || '');

  const handleSave = () => {
    onSave({
      week_review: {
        what_worked: whatWorked,
        what_didnt_work: whatDidntWork,
        next_week_focus: nextWeek
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-4xl font-bold text-gray-900">סיכום שבוע</h2>
        <p className="text-lg text-gray-600">שלוש שאלות בלבד</p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {/* Q1 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <label>
            <p className="text-sm font-semibold text-green-900 mb-2">✨ מה עבד השבוע?</p>
            <Textarea
              placeholder="כתוב משהו שהצליח. אפילו קטן."
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              className="h-16"
            />
          </label>
        </div>

        {/* Q2 */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
          <label>
            <p className="text-sm font-semibold text-orange-900 mb-2">❌ מה לא עבד?</p>
            <Textarea
              placeholder="מה לא עלה לפי התוכנית. זה בסדר, זה למידה."
              value={whatDidntWork}
              onChange={(e) => setWhatDidntWork(e.target.value)}
              className="h-16"
            />
          </label>
        </div>

        {/* Q3 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
          <label>
            <p className="text-sm font-semibold text-blue-900 mb-2">🎯 הדבר האחד לשבוע הבא?</p>
            <Textarea
              placeholder="מה תרצה לשנות או לשפר בשבוע הקרוב?"
              value={nextWeek}
              onChange={(e) => setNextWeek(e.target.value)}
              className="h-16"
            />
          </label>
        </div>
      </div>

      {/* Message */}
      <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
        <p className="text-purple-900 text-sm">
          📊 <strong>אין ציונים.</strong> אין ביקורת. רק שיפור קטן כל שבוע.
        </p>
      </div>

      <Button onClick={handleSave} size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
        שמור סיכום
      </Button>
    </motion.div>
  );
}