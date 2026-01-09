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
        <h2 className="text-3xl font-black text-[#1E3A5F] mb-2">
          סיום התשלום
        </h2>
        <p className="text-gray-600 text-lg">
          בחר אמצעי תשלום נוח לך
        </p>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">סיכום הזמנה</h3>
        
        <div className="space-y-3 mb-4 pb-4 border-b border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">{selectedPlan.name}</span>
            <span className="font-bold text-[#27AE60]">₪{price}</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="text-gray-600"><strong>לפרטיך:</strong></p>
            <p className="text-gray-600">שם: {formData.fullName}</p>
            <p className="text-gray-600">טלפון: {formData.phone}</p>
            <p className="text-gray-600">אימייל: {formData.email}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-[#1E3A5F]">סה"כ לתשלום:</span>
          <span className="text-3xl font-black text-[#27AE60]">₪{price}</span>
        </div>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="text-lg font-bold text-[#1E3A5F]">אמצעי תשלום:</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '💳', name: 'כרטיס אשראי' },
            { icon: '📱', name: 'Apple Pay' },
            { icon: '🔵', name: 'Google Pay' },
            { icon: '⚡', name: 'ביט' }
          ].map((method, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#3498DB] hover:bg-blue-50 transition-all flex flex-col items-center gap-2 font-bold text-gray-700"
            >
              <span className="text-2xl">{method.icon}</span>
              <span className="text-sm">{method.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 text-center"
      >
        🔒 התשלום מאובטח לחלוטין. כל הנתונים מוצפנים.
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex gap-3 pt-4"
      >
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-1 h-14 font-bold rounded-lg bg-[#27AE60] hover:bg-[#229954] text-white text-lg flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              מעבד תשלום...
            </>
          ) : (
            `שלם ₪${price}`
          )}
        </Button>
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 text-gray-600 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}