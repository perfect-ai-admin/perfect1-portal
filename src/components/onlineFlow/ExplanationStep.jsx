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



          {/* Trust Signal - Highlighted (after CTA) */}
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

          {/* CTA - Strong */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Button
              onClick={() => setShowForm(true)}
              className="w-full h-13 font-black text-base rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg"
            >
              יאללה, בואו נתחיל
            </Button>
          </motion.div>
        </>
      ) : (
        <QuickForm onSuccess={onNext} onBack={() => setShowForm(false)} />
      )}
    </div>
  );
}

function QuickForm({ onSuccess, onBack }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'שם חובה';
    if (!formData.phone.trim()) newErrors.phone = 'טלפון חובה';
    if (!formData.email.trim()) newErrors.email = 'אימייל חובה';
    
    if (Object.keys(newErrors).length === 0) {
      onSuccess(formData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-black text-[#1E3A5F] mb-0.5">
          מתחילים 🎯
        </h2>
        <p className="text-xs text-gray-600">פתיחת עוסק פטור אונליין</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Input
          placeholder="שם מלא"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className={`h-9 rounded-lg border-2 text-sm ${
            errors.fullName ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-0.5">{errors.fullName}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Input
          type="tel"
          placeholder="טלפון"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={`h-9 rounded-lg border-2 text-sm ${
            errors.phone ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Input
          type="email"
          placeholder="אימייל"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`h-9 rounded-lg border-2 text-sm ${
            errors.email ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="space-y-2 pt-1"
      >
        <Button
          type="submit"
          className="w-full h-11 font-black text-sm rounded-lg bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg"
        >
          המשך →
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-xs text-gray-600 font-medium"
        >
          ← חזור
        </button>
      </motion.div>
    </form>
  );
}