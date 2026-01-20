import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UpgradePrompt({ feature, icon: Icon, description }) {
  const navigate = useNavigate();

  const featureNames = {
    finance: 'מודול פיננסים',
    marketing: 'מודול שיווק',
    mentor: 'מודול מנטור'
  };

  const featureDescriptions = {
    finance: 'נהל את הכספים שלך בצורה חכמה - חשבוניות, הוצאות, דוחות ועוד',
    marketing: 'בנה את המותג שלך ותקדם את העסק עם כלי שיווק מתקדמים',
    mentor: 'קבל ליווי אישי וייעוץ עסקי לקידום העסק שלך'
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <Lock className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-2">תכונה נעולה</h2>
              <p className="text-white/90 text-lg">{featureNames[feature]}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-gray-600 text-lg leading-relaxed">
                {description || featureDescriptions[feature]}
              </p>
            </div>

            {/* Features Preview */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-[#D4AF37] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">מה תקבל במסלול המתקדם?</h3>
                  <ul className="space-y-2 text-gray-700">
                    {feature === 'finance' && (
                      <>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#27AE60] rounded-full" />
                          ניהול חשבוניות והוצאות
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#27AE60] rounded-full" />
                          דוחות פיננסיים מתקדמים
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#27AE60] rounded-full" />
                          חיבור לבנקים ואוטומציה
                        </li>
                      </>
                    )}
                    {feature === 'marketing' && (
                      <>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#27AE60] rounded-full" />
                          יצירת קמפיינים שיווקיים
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#27AE60] rounded-full" />
                          בניית לוגו ומיתוג
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#27AE60] rounded-full" />
                          ניהול נוכחות דיגיטלית
                        </li>
                      </>
                    )}
                    {feature === 'mentor' && (
                      <>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#27AE60] rounded-full" />
                          ליווי אישי עם מנטור חכם
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#27AE60] rounded-full" />
                          ניהול מטרות והתקדמות
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#27AE60] rounded-full" />
                          כלי ייעוץ עסקי מתקדמים
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate(createPageUrl('PricingPerfectBizAI'))}
                className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] hover:from-[#2C5282] hover:to-[#1E3A5F] text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5 ml-2" />
                שדרג עכשיו וקבל גישה מלאה
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <p className="text-center text-sm text-gray-500">
                מחירים מיוחדים למשתמשים חדשים
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}