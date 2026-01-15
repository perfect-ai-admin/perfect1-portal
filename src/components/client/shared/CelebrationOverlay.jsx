import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CelebrationOverlay({ show, achievement, onClose, onShare }) {
  useEffect(() => {
    if (show) {
      // Confetti animation
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22C55E', '#3B82F6', '#F59E0B', '#EC4899']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22C55E', '#3B82F6', '#F59E0B', '#EC4899']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Trophy Animation */}
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 relative"
            >
              <Trophy className="w-12 h-12 text-white" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              כל הכבוד! 🎉
            </h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {achievement?.title || 'השגת milestone חדש!'}
              </h3>
              <p className="text-gray-700">
                {achievement?.description || 'התקדמת עוד צעד קדימה במסע העסקי שלך'}
              </p>
            </div>

            {/* Achievement Badge */}
            {achievement?.badge && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="mb-6"
              >
                <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4">
                  <div className="text-4xl">{achievement.badge}</div>
                </div>
                <p className="text-sm text-gray-600 mt-2 font-semibold">
                  {achievement.badgeTitle || 'תג חדש נפתח!'}
                </p>
              </motion.div>
            )}

            <div className="flex flex-col gap-3">
              {/* Share Button */}
              <Button
                onClick={onShare}
                variant="outline"
                className="w-full border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
              >
                <Share2 className="w-4 h-4 ml-2" />
                שתף את ההישג ברשתות חברתיות
              </Button>

              {/* Set Next Goal Prompt */}
              {achievement?.promptNextGoal && (
                <Button
                  onClick={() => {
                    onClose();
                    achievement.onSetNextGoal?.();
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  קבע את המטרה הבאה שלך 🎯
                </Button>
              )}

              {/* Close Button */}
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full"
              >
                סגור
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}