import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function SuccessStep({ formData, selectedPlan, onClose }) {
  const handleCopyPhone = () => {
    navigator.clipboard.writeText('0502277087');
    toast.success('מספר הטלפון הועתק');
  };

  return (
    <div className="space-y-6 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-[#27AE60] mb-6"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-4xl font-black text-[#1E3A5F] mb-2">
          ✅ תודה!
        </h2>
        <p className="text-2xl text-[#27AE60] font-bold mb-4">
          התשלום התקבל בהצלחה
        </p>
      </motion.div>

      {/* What Happens Next */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">📋 מה קורה עכשיו?</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#3498DB] text-white flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-bold text-gray-800">תוך כמה שעות</h4>
              <p className="text-gray-600 text-sm">צוותנו יבדוק את הפרטים שלך ויצור איתך קשר</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#3498DB] text-white flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-bold text-gray-800">תוך 24-48 שעות</h4>
              <p className="text-gray-600 text-sm">פתיחת התיק במס הכנסה, מע"מ וביטוח לאומי</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#3498DB] text-white flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-bold text-gray-800">קבלת אישורים</h4>
              <p className="text-gray-600 text-sm">האישורים יגיעו למייל שלך - אתה מוכן להתחיל להרוויח</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">📞 צריך משהו?</h3>
        <p className="text-gray-700 mb-4">
          תיהנה מתמיכה מלאה בוואטסאפ וטלפון לאורך כל התהליך
        </p>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>טלפון:</strong> 0502277087
          </p>
          <p className="text-sm text-gray-600">
            <strong>וואטסאפ:</strong> זה עתה נישלח אליך קישור
          </p>
          <p className="text-sm text-gray-600">
            <strong>אימייל:</strong> {formData.email}
          </p>
        </div>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-[#1E3A5F] mb-4">📧 סיכום ההזמנה</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">שירות:</span>
            <span className="font-bold text-gray-800">{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">שם:</span>
            <span className="font-bold text-gray-800">{formData.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">טלפון:</span>
            <span className="font-bold text-gray-800">{formData.phone}</span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="font-bold text-gray-800">סה"כ:</span>
            <span className="font-black text-[#27AE60] text-lg">
              ₪{selectedPlan.id === 'basic' ? '199' : '299'}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          אישור התשלום נשלח למייל שלך
        </p>
      </motion.div>

      {/* Close Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={onClose}
          className="w-full h-14 font-bold rounded-lg bg-[#27AE60] hover:bg-[#229954] text-white text-lg"
        >
          ✓ סגור
        </Button>
      </motion.div>
    </div>
  );
}