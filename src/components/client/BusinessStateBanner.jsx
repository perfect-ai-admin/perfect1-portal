import React, { useState } from 'react';
import { AlertCircle, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BusinessStateBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white border-t-4 border-blue-500 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" dir="rtl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">מצב עסקי</h3>
                <p className="text-sm text-gray-600">הצג כעת</p>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-gray-100 rounded transition-all"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">אתגר משמעותי</p>
                <p className="text-sm text-yellow-800 mt-1">הוסף לדירוג</p>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-2">הפעלת הבאה שוק</p>
                <p className="text-sm text-blue-800">התחל בערוץ שיווק אחד (פייסבוק או Google) למשך 30 יום. אתה בתחילת דרך וצריך ללמוד מה עובד לפני שמרחיבים.</p>
              </div>
            </div>
          </div>

          {/* What Not To Do */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-900 mb-3">מה לא שנעשה:</p>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>אתר חדש - זה יבוא אחרי שיש ביקוש</span>
              </li>
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>העלאת מחירים - קודם תדע מה השוק מוכן לשלם</span>
              </li>
              <li className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>קורסים נוספים - תתמקד בביצוע לא בלמידה</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}