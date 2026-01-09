import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export default function ExplanationStep({ onNext }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-black text-[#1E3A5F] mb-2">
          פתיחת עוסק פטור אונליין – איך זה עובד?
        </h2>
        <p className="text-gray-600 text-lg">
          תהליך דיגיטלי מלא, בלי צורך להגיע לשום מקום
        </p>
      </motion.div>

      {/* What IS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-green-50 border-r-4 border-[#27AE60] rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-[#27AE60] mb-4">✓ מה זה הוא:</h3>
        <ul className="space-y-3">
          {[
            'תהליך דיגיטלי מלא',
            'בלי פגישה פיזית',
            'בלי שיחות טלפון',
            'בלי ניירת ידנית'
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-gray-800">
              <Check className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* What ISN'T */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-red-50 border-r-4 border-red-400 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-red-600 mb-4">✗ מה זה לא:</h3>
        <ul className="space-y-3">
          {[
            'אין פגישה פיזית',
            'אין צורך להגיע למשרד',
            'אין צורך להתעסק בטפסים',
            'אין הממתנות ובירוקרטיה'
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-gray-800">
              <X className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border-r-4 border-[#3498DB] rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">⏱️ זמן טיפול:</h3>
        <p className="text-lg font-bold text-[#27AE60]">עד 48 שעות</p>
        <p className="text-gray-600 mt-2">פתיחת התיק מתבצעת תוך עד 48 שעות עסקים</p>
      </motion.div>

      {/* Responsibility */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 border-r-4 border-purple-400 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">🛡️ אחריות:</h3>
        <ul className="space-y-2 text-gray-800">
          <li className="font-medium">✓ אחריות מלאה על פתיחת התיק</li>
          <li className="font-medium">✓ בדיקה לפני שליחה לרשויות</li>
          <li className="font-medium">✓ ולידציה של כל הפרטים</li>
        </ul>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg p-4"
      >
        <p>
          משך הטיפול עשוי להשתנות בהתאם לאישורי הרשויות. השירות כולל פתיחת תיק בלבד ואינו כולל טיפול שוטף לאחר מכן, אלא אם נבחר אחרת.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={onNext}
          className="w-full h-14 text-lg font-bold rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg"
        >
          להמשיך לפתיחה אונליין
        </Button>
      </motion.div>
    </div>
  );
}