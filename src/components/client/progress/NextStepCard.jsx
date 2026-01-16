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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-xl p-4 md:p-6 text-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
      
      <div className="relative flex items-start gap-3 md:gap-4">
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-12 h-12 md:w-16 md:h-16 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border border-white/30"
        >
          <div className="w-6 h-6 md:w-10 md:h-10 text-white flex items-center justify-center">
            {step.icon}
          </div>
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-base md:text-xl font-bold leading-tight">השלב הבא שלך</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowWhy(!showWhy);
                if (onWhyClick && !showWhy) {
                  setTimeout(() => onWhyClick(), 100);
                }
              }}
              className="px-2.5 py-1.5 md:px-3 md:py-2 bg-white/90 backdrop-blur text-green-700 hover:bg-white rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 shadow-md font-bold"
            >
              <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">למה?</span>
            </motion.button>
          </div>
          
          <p className="text-sm md:text-lg mb-3 md:mb-4 leading-relaxed font-medium">{step.title}</p>
          
          {/* Desktop Why */}
          {showWhy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="hidden md:block bg-white/15 backdrop-blur-sm rounded-xl p-3.5 mb-3 border border-white/20"
            >
              <p className="text-sm leading-relaxed">{step.why}</p>
            </motion.div>
          )}

          {/* Mobile Reasons */}
          {showWhy && step.reasons && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="md:hidden space-y-2 mb-3"
            >
              {step.reasons.map((reason, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/15 backdrop-blur-sm rounded-lg p-2.5 border border-white/20"
                >
                  <h4 className="font-bold text-xs mb-1">{reason.title}</h4>
                  <p className="text-xs leading-snug opacity-95">{reason.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={step.action || onAction}
              className="bg-white text-green-700 hover:bg-gray-50 font-bold h-9 md:h-11 px-4 md:px-6 text-sm md:text-base w-full shadow-lg rounded-xl"
            >
              <span>בואו נתחיל</span>
              <motion.div
                animate={{ x: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 ml-2 rotate-180" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}