import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Users, Clock } from 'lucide-react';

export default function ExplanationStep({ onNext }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-3 py-4">
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

      {!showForm ? (
        <>
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

          {/* Trust Signal - Highlighted */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-[#27AE60] rounded-lg p-3 text-center"
          >
            <p className="text-sm font-black text-[#1E3A5F]">🔒 תהליך מאובטח</p>
            <p className="text-xs text-gray-700 mt-1.5">חתימה דיגיטלית חוקית • ללא התחייבות</p>
          </motion.div>

          {/* CTA - Strong */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
          >
            <Button
              onClick={() => setShowForm(true)}
              className="w-full h-13 font-black text-base rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg"
            >
              בואו נתחיל 🚀
            </Button>
          </motion.div>
        </>
      ) : (
        <QuickForm onSuccess={onNext} onBack={() => setShowForm(false)} />
      )}
    </div>
  );
}