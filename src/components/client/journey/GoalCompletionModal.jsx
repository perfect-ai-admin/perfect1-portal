import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Sparkles, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GoalCompletionModal({ 
  goalName, 
  pointsEarned = 100,
  nextGoalName = null,
  onContinue,
  onLater 
}) {
  useEffect(() => {
    // Trigger confetti
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 }
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Celebration Header */}
        <div className="bg-gradient-to-br from-[#27AE60] to-[#2ECC71] px-8 pt-8 pb-6 text-center relative overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-4 right-4 text-6xl"
          >
            ✨
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-black text-white mb-2"
          >
            🎉 כל הכבוד! 🎉
          </motion.h2>
          
          <p className="text-white/90 font-bold">סיימת את המטרה שלך</p>
        </div>

        {/* Content */}
        <div className="px-8 py-8 space-y-6">
          
          {/* Completed Goal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-green-50 rounded-2xl p-6 border-2 border-[#27AE60]"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-8 h-8 text-[#27AE60] flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1">סיימת את:</p>
                <p className="font-bold text-[#1E3A5F] break-words">{goalName}</p>
              </div>
            </div>
          </motion.div>

          {/* Points Earned */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-4xl font-black text-[#D4AF37]">
                +{pointsEarned}
              </span>
              <Star className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <p className="text-sm text-gray-600">נקודות!</p>
          </motion.div>

          {/* Next Goal */}
          {nextGoalName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-50 rounded-2xl p-6 border-2 border-[#1E3A5F]/20"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-[#1E3A5F] flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 font-bold mb-1">המטרה הבאה:</p>
                  <p className="text-[#1E3A5F] font-bold break-words">{nextGoalName}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 pt-4"
          >
            <Button
              onClick={onContinue}
              className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg"
            >
              <ArrowLeft className="ml-2 w-5 h-5" />
              {nextGoalName ? 'המשך למטרה הבאה' : 'חזור לדאשבורד'}
            </Button>
            
            <Button
              onClick={onLater}
              variant="ghost"
              className="w-full h-12 text-base font-bold text-gray-700 hover:bg-gray-100"
            >
              אחר כך
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}