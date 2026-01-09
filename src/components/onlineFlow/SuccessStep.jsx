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
    <div className="space-y-4 py-6">
      {/* Success Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-[#27AE60] mb-4 shadow-lg"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        <h2 className="text-4xl font-black text-[#1E3A5F] mb-2">
          ✅ התשלום התקבל!
        </h2>
        <p className="text-lg text-[#27AE60] font-bold">
          אתה בדרך להתחיל להרוויח
        </p>
      </motion.div>

      {/* Timeline - What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 space-y-3"
      >
        <p className="text-sm font-black text-[#1E3A5F] text-center">📋 מה קורה עכשיו?</p>
        
        <div className="space-y-2">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3498DB] text-white flex items-center justify-center flex-shrink-0 text-sm font-black">1</div>
            <div>
              <p className="text-sm font-bold text-gray-800">בתוך שעות - בדיקה</p>
              <p className="text-xs text-gray-600">צוותנו בודק את הפרטים ויצור איתך קשר</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3498DB] text-white flex items-center justify-center flex-shrink-0 text-sm font-black">2</div>
            <div>
              <p className="text-sm font-bold text-gray-800">24-48 שעות - פתיחה</p>
              <p className="text-xs text-gray-600">תיק פתוח בממשלה - את מאובטח</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#27AE60] text-white flex items-center justify-center flex-shrink-0 text-sm font-black">3</div>
            <div>
              <p className="text-sm font-bold text-gray-800">קבלת אישורים</p>
              <p className="text-xs text-gray-600">אישורים ממס הכנסה למייל - מוכן להתחיל!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact & Support */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-purple-50 border border-purple-200 rounded-xl p-4"
      >
        <p className="text-sm font-black text-[#1E3A5F] mb-3">📞 צוות מומחים בשירותך</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">📱</span>
            <div>
              <p className="font-bold text-gray-800">WhatsApp & טלפון</p>
              <p className="text-xs text-gray-600">0502277087 - זמינים 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📧</span>
            <div>
              <p className="font-bold text-gray-800">אימייל</p>
              <p className="text-xs text-gray-600">{formData.email}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Close Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={onClose}
          className="w-full h-14 font-black text-lg rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg"
        >
          ✓ סגור - נדבר בקרוב
        </Button>
      </motion.div>
    </div>
  );
}