import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Users, Clock } from 'lucide-react';

export default function ExplanationStep({ onNext }) {
  return (
    <div className="space-y-3 h-full flex flex-col justify-between py-1">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-[#1E3A5F] leading-tight mb-1.5">
          מתחילים פתיחת עוסק פטור אונליין
        </h2>
        <p className="text-sm text-gray-600">
          תהליך מקוון • חתימה דיגיטלית • בלי ריצות
        </p>
      </motion.div>

      {/* Social Proof */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center gap-3"
      >
        <div className="flex -space-x-2">
          {['👨‍💼', '👩‍💼', '👨‍🎨'].map((emoji, i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-white flex items-center justify-center border-2 border-gray-200 text-sm">
              {emoji}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-700">2000+ עצמאיים כבר התחילו</p>
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
          { icon: Star, title: 'מוכן לדבור', desc: 'אם"א + אפליקציה' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className="flex gap-2.5 p-2.5 bg-white rounded-lg border border-gray-200"
          >
            <item.icon className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
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
          className="w-full h-11 font-semibold text-base rounded-lg bg-[#27AE60] hover:bg-[#229954] text-white shadow-md"
        >
          יאללה, בואו נתחיל
        </Button>
      </motion.div>

      {/* Trust Signal - After CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-green-50 border border-green-200 rounded-lg p-2.5 space-y-1"
      >
        <div className="flex items-center gap-2 text-[#27AE60] font-semibold text-xs">
          <span>🔒</span>
          <span>תהליך מאובטח</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 font-medium text-xs">
          <span>✍️</span>
          <span>חתימה דיגיטלית חוקית</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 font-medium text-xs">
          <span>✔️</span>
          <span>ללא התחייבות</span>
        </div>
      </motion.div>
    </div>
  );
}