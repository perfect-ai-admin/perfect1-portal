import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star, Users, Clock } from 'lucide-react';

export default function ExplanationStep({ onNext }) {
  return (
    <div className="space-y-5 py-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black text-[#1E3A5F] leading-tight mb-2">
          פתח עוסק פטור בלי לצאת מהבית
        </h2>
        <p className="text-lg text-[#27AE60] font-bold">
          100% דיגיטלי • תוך 24-48 שעות • מלא ליווי
        </p>
      </motion.div>

      {/* Social Proof */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-[#27AE60]/20 rounded-xl p-4 flex items-center gap-4"
      >
        <div className="flex -space-x-2">
          {['👨‍💼', '👩‍💼', '👨‍🎨', '👩‍⚕️'].map((emoji, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-[#27AE60]/20">
              {emoji}
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-black text-[#1E3A5F]">2000+ עצמאיים כבר פתחו</p>
          <p className="text-xs text-gray-600">בתהליך מקוון זה בחודשים האחרונים</p>
        </div>
      </motion.div>

      {/* Key Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {[
          { icon: Clock, title: 'בלי לצאת מהבית', desc: 'כל התהליך אונליין - מהנייד שלך' },
          { icon: Users, title: 'עם ליווי מלא', desc: 'צוות מומחים בוואטסאפ 24/7' },
          { icon: Star, title: 'מוכל וברור', desc: 'אם"א רואה חשבון + אפליקציה ניהול' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.08 }}
            className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
          >
            <item.icon className="w-6 h-6 text-[#3498DB] flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900 text-sm">{item.title}</p>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Trust Signal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-gray-500 flex items-center justify-center gap-1"
      >
        🔒 תהליך מאובטח • חתימה דיגיטלית חוקית • ללא התחייבות
      </motion.div>

      {/* CTA - Strong */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55 }}
      >
        <Button
          onClick={onNext}
          className="w-full h-14 font-black text-lg rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg hover:shadow-xl transition-all"
        >
          בואו נתחיל ✨
        </Button>
      </motion.div>
    </div>
  );
}