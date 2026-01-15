import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MILESTONE_MESSAGES = {
  registration: {
    title: '🎉 ברכות! הגעת!',
    description: 'הרישום שלך הושלם בהצלחה. עכשיו בואו נתחיל לבנות את העסק שלך!',
    color: 'from-blue-500 to-blue-600'
  },
  first_invoice: {
    title: '💰 חשבונית ראשונה!',
    description: 'זה המיקום של אבן דרך אמיתית. אתה כבר בעסק!',
    color: 'from-green-500 to-green-600'
  },
  first_goal: {
    title: '🎯 מטרה ראשונה!',
    description: 'אתה מתוכננן כמו מנהל עסק אמיתי!',
    color: 'from-purple-500 to-purple-600'
  },
  first_sale: {
    title: '🚀 מכירה ראשונה!',
    description: 'הראשונה מתוך אלפים לבאים!',
    color: 'from-orange-500 to-orange-600'
  }
};

export default function MilestoneAnimation({ milestoneId, onComplete }) {
  const [showShare, setShowShare] = useState(false);
  const milestone = MILESTONE_MESSAGES[milestoneId] || MILESTONE_MESSAGES.registration;

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleShare = () => {
    const text = `${milestone.title} ${milestone.description}`;
    if (navigator.share) {
      navigator.share({
        title: 'Perfect One',
        text: text
      });
    } else {
      setShowShare(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
        onClick={onComplete}
      >
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className={`bg-gradient-to-r ${milestone.color} rounded-3xl p-8 max-w-sm shadow-2xl text-white relative`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-all"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            {milestone.title.split(' ')[0]}
          </motion.div>

          <h2 className="text-3xl font-bold mb-2">{milestone.title}</h2>
          <p className="text-white/90 mb-6">{milestone.description}</p>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                handleCelebrate();
              }}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              🎊 חגוג!
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-2"
            >
              <Share2 className="w-4 h-4" />
              שתף
            </Button>
          </div>

          {showShare && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white/10 rounded-lg"
            >
              <p className="text-sm mb-2">העתק ושתף:</p>
              <input
                type="text"
                defaultValue={`${milestone.title} ${milestone.description}`}
                className="w-full bg-white/20 text-white px-3 py-2 rounded text-sm"
                readOnly
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}