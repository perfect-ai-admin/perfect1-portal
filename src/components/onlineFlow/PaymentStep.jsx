import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PaymentStep({ formData, selectedPlan, onSuccess, onBack }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const planPrices = {
    basic: 199,
    premium: 299
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Create lead in database
      await base44.entities.Lead.create({
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        profession: formData.profession,
        category: 'osek_patur',
        source_page: `דף נחיתה - פתיחת עוסק פטור אונליין - ${selectedPlan.name}`,
        interaction_type: 'form',
        status: 'new',
        consent: true
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call success handler
      onSuccess();
    } catch (err) {
      console.error('Payment error:', err);
      setError('אירעה שגיאה בעיבוד התשלום. אנא נסה שוב.');
    } finally {
      setIsProcessing(false);
    }
  };

  const price = planPrices[selectedPlan.id];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black text-[#1E3A5F] mb-1">
          תשלום
        </h2>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-black text-[#1E3A5F] mb-1">
          סיום התשלום
        </h2>
        <p className="text-sm text-gray-600">כמעט סיימנו - אחרון צעד בלבד</p>
      </motion.div>

      {/* Order Summary - Clear */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 space-y-3 mb-3"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600">מסלול שנבחר:</p>
            <p className="text-xl font-black text-[#1E3A5F]">{selectedPlan.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">סה"כ:</p>
            <p className="text-3xl font-black text-[#27AE60]">₪{price}</p>
          </div>
        </div>
        <div className="border-t border-blue-200 pt-2">
          <p className="text-xs text-gray-600"><strong>{formData.fullName}</strong></p>
          <p className="text-xs text-gray-600">{formData.email}</p>
        </div>
      </motion.div>

      {/* Payment Security */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2 mb-3"
      >
        <p className="text-sm font-bold text-gray-800 text-center">💳 אפשרויות תשלום</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-center text-gray-700">
          <div>💳 כרטיס אשראי</div>
          <div>₪ ביט / פייבוקס</div>
          <div>🍎 Apple Pay</div>
          <div>🔵 Google Pay</div>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-green-200 text-xs text-green-700">
          🔒 <strong>תשלום מאובטח 100%</strong>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs"
        >
          {error}
        </motion.div>
      )}

      {/* Guarantee */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-xs text-center text-gray-600 bg-blue-50 rounded-lg p-2"
      >
        ✓ ללא התחייבות למרות התשלום • ניתן לביטול בתוך 7 ימים
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full h-14 font-black rounded-lg bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              מעבד תשלום...
            </>
          ) : (
            <>
              🔐 שלם בטוח ₪{price}
            </>
          )}
        </Button>
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="w-full px-3 h-10 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600 font-medium disabled:opacity-50 transition-colors"
        >
          ← חזור לפרטים
        </button>
      </motion.div>
    </div>
  );
}