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
    <div className="space-y-3 py-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#27AE60] mb-3"
        >
          <CheckCircle className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-3xl font-black text-[#1E3A5F] mb-1">
          ✅ בוצע!
        </h2>
        <p className="text-lg text-[#27AE60] font-bold">
          התשלום התקבל
        </p>
      </motion.div>

      {/* What Happens Next - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-blue-50 rounded-lg p-3 space-y-2 text-xs"
      >
        <p className="font-bold text-gray-800">מה הלאה:</p>
        <p className="text-gray-700">• בתוך שעות: בדיקת הפרטים</p>
        <p className="text-gray-700">• בתוך 24-48 שעות: פתיחת התיק</p>
        <p className="text-gray-700">• אישורים יגיעו למייל</p>
      </motion.div>

      {/* Contact Info - Minimal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-50 rounded-lg p-3 text-xs space-y-1"
      >
        <p className="font-bold text-gray-800">צור קשר:</p>
        <p className="text-gray-600">📞 0502277087</p>
        <p className="text-gray-600">📧 {formData.email}</p>
      </motion.div>

      {/* Close Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Button
          onClick={onClose}
          className="w-full h-10 font-bold rounded-lg bg-[#27AE60] hover:bg-[#229954] text-white text-sm"
        >
          ✓ סגור
        </Button>
      </motion.div>
    </div>
  );
}