import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Users, Clock } from 'lucide-react';

export default function ExplanationStep({ onNext }) {
  return (
    <div className="space-y-3 py-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-black text-[#1E3A5F] leading-tight mb-2">
          מתחילים פתיחת עוסק פטור אונליין
        </h2>
        <p className="text-sm text-gray-600 font-medium">
          תהליך מקוון • חתימה דיגיטלית • בלי ריצות
        </p>
      </motion.div>

      {/* Social Proof */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-[#3498DB]/20 rounded-xl p-3 flex items-center gap-3"
      >
        <div className="flex -space-x-1.5">
          {['👨‍💼', '👩‍💼', '👨‍🎨'].map((emoji, i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-white flex items-center justify-center border-2 border-[#3498DB]/20 text-sm">
              {emoji}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-black text-[#1E3A5F]">2000+ עצמאיים כבר התחילו</p>
        </div>
      </motion.div>

      {/* Key Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        {[
          { icon: Clock, title: 'בלי לצאת מהבית', desc: 'כל התהליך אונליין' },
          { icon: Users, title: 'עם ליווי מלא', desc: 'צוות מומחים בוואטסאפ' },
          { icon: Star, title: 'מוכל וברור', desc: 'אם"א + אפליקציה' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className="flex gap-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100"
          >
            <item.icon className="w-5 h-5 text-[#3498DB] flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900 text-xs">{item.title}</p>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA - Strong - Above Trust Signal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
      >
        <Button
          onClick={onNext}
          className="w-full h-13 font-black text-base rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg"
        >
          יאללה, בואו נתחיל
        </Button>
      </motion.div>

      {/* Trust Signal - After CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-[#27AE60] rounded-lg p-3 space-y-1 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-[#27AE60] font-black text-xs">
          <span>🔒 תהליך מאובטח</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-[#1E3A5F] font-bold text-xs">
          <span>✍️ חתימה דיגיטלית חוקית</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-[#27AE60] font-bold text-xs">
          <span>✔️ ללא התחייבות</span>
        </div>
      </motion.div>
    </div>
  );
}