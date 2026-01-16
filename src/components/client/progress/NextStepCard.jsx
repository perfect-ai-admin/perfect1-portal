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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-5 text-white"
    >
      <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          {step.icon}
        </div>
        <div className="flex-1 w-full">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-base md:text-lg font-bold">השלב הבא שלך</h2>
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="px-2.5 py-1.5 md:px-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center gap-1.5 md:gap-2 flex-shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-xs font-medium">למה?</span>
            </button>
          </div>
          
          <p className="text-sm md:text-base mb-3 leading-relaxed font-medium">{step.title}</p>
          
          {/* Desktop Why */}
          {showWhy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="hidden md:block bg-white/10 backdrop-blur rounded-lg p-3 mb-3"
            >
              <p className="text-sm leading-relaxed opacity-90">{step.why}</p>
            </motion.div>
          )}

          {/* Mobile Reasons */}
          {showWhy && step.reasons && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden space-y-2 mb-3"
            >
              {step.reasons.map((reason, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-2.5">
                  <h4 className="font-semibold text-xs mb-1">{reason.title}</h4>
                  <p className="text-xs leading-relaxed opacity-90">{reason.description}</p>
                </div>
              ))}
            </motion.div>
          )}

          <Button
            onClick={step.action || onAction}
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm w-full md:w-auto"
          >
            בוא נתחיל
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}