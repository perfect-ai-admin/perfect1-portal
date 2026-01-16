import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function CheckoutSuccessPage() {
  useEffect(() => {
    // Auto-scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white" dir="rtl">
      {/* Success Container */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              הרכישה בוצעה בהצלחה!
            </h1>
            <p className="text-gray-600">
              קיבלת דף נחיתה ממותג עם דיזיין מקצועי
            </p>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg border border-gray-200 p-6 my-8 space-y-4"
          >
            <div className="text-right">
              <p className="text-sm text-gray-600">מספר הזמנה</p>
              <p className="font-mono font-bold text-gray-900 text-lg">#ORD-2024-001</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600">סך הכל:</span>
                <span className="text-2xl font-bold text-gray-900">99₪</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 text-right">
              <p className="text-sm text-gray-600 mb-2">קישור להורדה:</p>
              <p className="text-sm font-medium text-blue-600">
                דף הנחיתה שלך מוכן
              </p>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-8"
          >
            <Button className="w-full h-11 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Download className="w-4 h-4" />
              הורדת דף הנחיתה
            </Button>

            <Button variant="outline" className="w-full h-11 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              שלח לדוא״ל
            </Button>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 rounded-lg p-4 mb-8"
          >
            <p className="text-sm text-blue-900">
              <strong>💡 עצה:</strong> שמור את דף הנחיתה שלך בטחון בתיקייה בטוחה
            </p>
          </motion.div>

          {/* Return Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm"
          >
            <p className="text-gray-600 mb-3">
              רוצה ליצור עוד משהו?
            </p>
            <a
              href={createPageUrl('ClientDashboard')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              חזור לדוקומנטציה
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            צריך עזרה?
          </h2>
          <p className="text-gray-600 mb-4">
            אנחנו כאן כדי לתמוך בך בכל שלב
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              תמיכה דוא״ל
            </a>
            <span className="text-gray-400">•</span>
            <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}