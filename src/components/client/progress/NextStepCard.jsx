import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NextStepCard({ step, onAction }) {
  const [showWhy, setShowWhy] = React.useState(false);

  if (!step) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white text-center">
        <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-80" />
        <h2 className="text-3xl font-bold mb-3">כל הכבוד! 🎉</h2>
        <p className="text-xl opacity-90">השלמת את כל השלבים הבסיסיים</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-8 text-white"
    >
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
          {step.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-3xl font-bold">השלב הבא שלך</h2>
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">למה זה חשוב?</span>
            </button>
          </div>
          
          <p className="text-2xl mb-6 leading-relaxed font-medium">{step.title}</p>
          
          {showWhy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6"
            >
              <h3 className="font-bold text-lg mb-2">💡 למה זה חשוב</h3>
              <p className="text-base leading-relaxed opacity-90">
                {step.why}
              </p>
            </motion.div>
          )}

          <Button
            onClick={onAction}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold h-14 px-8 text-lg"
          >
            בוא נתחיל
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}