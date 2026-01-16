import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NextStepCard({ step, onAction, onWhyClick }) {
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
      className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-3 md:p-5 text-white"
    >
      <div className="flex items-start gap-2.5 md:gap-4">
        <div className="w-10 h-10 md:w-16 md:h-16 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <div className="w-5 h-5 md:w-10 md:h-10">
            {step.icon}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h2 className="text-sm md:text-lg font-bold leading-tight">השלב הבא שלך</h2>
            <button
              onClick={() => {
                setShowWhy(!showWhy);
                if (onWhyClick && !showWhy) {
                  setTimeout(() => onWhyClick(), 100);
                }
              }}
              className="px-2 py-1 md:px-3 md:py-1.5 bg-white border border-white/40 text-blue-600 hover:bg-white/95 rounded-md transition-all flex items-center gap-1 md:gap-2 flex-shrink-0 shadow-sm"
            >
              <HelpCircle className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-[10px] md:text-xs font-semibold">למה?</span>
            </button>
          </div>
          
          <p className="text-xs md:text-base mb-2.5 md:mb-3 leading-snug md:leading-relaxed font-medium">{step.title}</p>
          
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
              className="md:hidden space-y-1.5 mb-2.5"
            >
              {step.reasons.map((reason, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-md p-2">
                  <h4 className="font-semibold text-[10px] mb-0.5">{reason.title}</h4>
                  <p className="text-[10px] leading-snug opacity-90">{reason.description}</p>
                </div>
              ))}
            </motion.div>
          )}

          <Button
            onClick={step.action || onAction}
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold h-7 md:h-9 px-3 md:px-4 text-[11px] md:text-sm w-full"
          >
            בוא נתחיל
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 ml-1.5 md:ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}