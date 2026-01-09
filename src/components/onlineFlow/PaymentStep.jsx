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

      {/* Order Summary - Minimal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gray-50 rounded-lg p-3 text-sm space-y-1 mb-3"
      >
        <div className="flex justify-between font-bold">
          <span>{selectedPlan.name}</span>
          <span className="text-[#27AE60]">₪{price}</span>
        </div>
        <p className="text-gray-600">{formData.fullName}</p>
      </motion.div>

      {/* Payment Methods - Simplified */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xs text-gray-600 text-center bg-blue-50 rounded-lg p-2 mb-2"
      >
        💳 כרטיס אשראי, ביט, Apple Pay, Google Pay
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

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 pt-2"
      >
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-1 h-10 font-bold rounded-lg bg-[#27AE60] hover:bg-[#229954] text-white text-sm flex items-center justify-center gap-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              שלם...
            </>
          ) : (
            `שלם ₪${price}`
          )}
        </Button>
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="px-3 h-10 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600 disabled:opacity-50"
        >
          חזור
        </button>
      </motion.div>
    </div>
  );
}