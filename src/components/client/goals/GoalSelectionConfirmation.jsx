import React from 'react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function GoalSelectionConfirmation({ onContinue }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm text-center"
    >
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        המטרה נבחרה בהצלחה!
      </h3>
      <p className="text-gray-600 mb-6 max-w-xs mx-auto">
        המנטור בונה עבורך תוכנית עבודה מותאמת אישית כדי שתוכל להתחיל להתקדם.
      </p>
      <Button 
        onClick={onContinue}
        className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl text-base"
      >
        מעולה, תודה
        <ArrowLeft className="w-4 h-4 mr-2" />
      </Button>
    </motion.div>
  );
}