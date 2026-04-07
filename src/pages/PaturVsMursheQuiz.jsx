import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { HelmetProvider } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, Shield, Clock, Users,
  ChevronLeft, ArrowLeft,
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Quiz Steps ───
const STEPS = [
  {
    question: 'כמה אתם מתכננים להרוויח בשנה?',
    options: [
      { label: 'עד 120,000 ₪', value: 'low' },
      { label: '120,000 – 300,000 ₪', value: 'mid' },
      { label: 'מעל 300,000 ₪', value: 'high' },
    ],
  },
  {
    question: 'האם יש לכם הרבה הוצאות בעסק?',
    options: [
      { label: 'כן, הוצאות משמעותיות', value: 'yes' },
      { label: 'לא, הוצאות מינימליות', value: 'no' },
      { label: 'עדיין לא יודע/ת', value: 'unknown' },
    ],
  },
  {
    question: 'למי אתם מתכננים לתת שירות?',
    options: [
      { label: 'אנשים פרטיים', value: 'private' },
      { label: 'חברות ועסקים', value: 'business' },
      { label: 'גם וגם', value: 'both' },
    ],
  },
];

// ─── Schema ───
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'מה עדיף עוסק פטור או מורשה?', acceptedAnswer: { '@type': 'Answer', text: 'תלוי בסוג העסק, מחזור ההכנסות והצרכים שלך. עוסק פטור מתאים למחזור נמוך, עוסק מורשה למחזור גבוה.' } },
    { '@type': 'Question', name: 'איך לבחור בין עוסק פטור לעוסק מורשה?', acceptedAnswer: { '@type': 'Answer', text: 'השיקולים העיקריים הם: גובה ההכנסות הצפוי, כמות ההוצאות, וסוג הלקוחות. בדיקה קצרה יכולה לעזור להבין מה מתאים.' } },
  ],
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'עוסק פטור או מורשה – בדיקה חכמה תוך 30 שניות',
  description: 'בדקו תוך 30 שניות האם עוסק פטור או עוסק מורשה מתאים לכם. בדיקה חינם ללא התחייבות.',
  author: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.perfect1.co.il/patur-vs-murshe-quiz' },
  inLanguage: 'he',
};

export default function PaturVsMursheQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0-2 = quiz, 3 = form
  const [answers, setAnswers] = useState({});
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = STEPS.length + 1; // quiz steps + form
  const progress = ((step + 1) / totalSteps) * 100;

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [step]: value }));
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('נא למלא שם וטלפון'); return; }
    setLoading(true);
    setError('');

    try {
      await invokeFunction('submitLeadToN8N', {
        name: form.name,
        phone: form.phone,
        pageSlug: 'landing-patur-vs-murshe-quiz',
        businessName: 'דף נחיתה - landing-patur-vs-murshe-quiz',
      });

      navigate('/ThankYou', { state: { source: 'landing-patur-vs-murshe-quiz', name: form.name } });
    } catch (err) {
      setError('שגיאה בשליחה, נסו שוב');
    } finally {
      setLoading(false);
    }
  };

  const isQuiz = step < STEPS.length;
  const isForm = step === STEPS.length;

  return (
    <HelmetProvider>
      <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #152D4A 50%, #0F766E 100%)' }}>
        <Helmet>
          <title>עוסק פטור או מורשה – בדיקה חכמה תוך 30 שניות</title>
          <meta name="description" content="בדקו תוך 30 שניות האם עוסק פטור או עוסק מורשה מתאים לכם. בדיקה חינם ללא התחייבות." />
          <meta name="keywords" content="עוסק פטור או מורשה, מה ההבדל בין עוסק פטור למורשה, מה עדיף עוסק פטור או מורשה, איך לבחור עוסק פטור או מורשה" />
          <link rel="canonical" href="https://www.perfect1.co.il/patur-vs-murshe-quiz" />
          <meta property="og:title" content="עוסק פטור או מורשה – בדיקה חכמה תוך 30 שניות" />
          <meta property="og:description" content="בדקו תוך 30 שניות האם עוסק פטור או עוסק מורשה מתאים לכם." />
          <meta property="og:type" content="article" />
          <meta property="og:url" content="https://www.perfect1.co.il/patur-vs-murshe-quiz" />
          <meta property="og:image" content="https://www.perfect1.co.il/og-image.png" />
          <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
          <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        </Helmet>

        <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 md:py-16 flex flex-col min-h-screen justify-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
              עוסק פטור או מורשה
              <br />
              <span style={{ color: '#F59E0B' }}>מה באמת מתאים לך?</span>
            </h1>
            <p className="text-white/70 text-sm sm:text-base">
              הבדיקה לוקחת פחות מ-30 שניות
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-white/50 text-xs mb-2">
              <span>שלב {Math.min(step + 1, totalSteps)} מתוך {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Quiz Steps */}
              {isQuiz && (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6">
                    {STEPS[step].question}
                  </h2>

                  <div className="space-y-3">
                    {STEPS[step].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt.value)}
                        className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-right flex items-center justify-between group"
                      >
                        <span className="font-medium text-gray-800 group-hover:text-blue-700 text-base">
                          {opt.label}
                        </span>
                        <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </button>
                    ))}
                  </div>

                  {step > 0 && (
                    <button
                      onClick={() => setStep(s => s - 1)}
                      className="mt-4 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                      חזרה
                    </button>
                  )}
                </motion.div>
              )}

              {/* Form Step */}
              {isForm && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      קבלו המלצה איזה סוג עסק מתאים לכם
                    </h2>
                    <p className="text-gray-500 text-sm">
                      השאירו פרטים ונחזור עם תשובה ברורה
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="שם מלא"
                      required
                      className="h-13 rounded-xl text-base bg-gray-50 border-gray-200 focus:border-blue-500"
                    />
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="טלפון"
                      type="tel"
                      required
                      className="h-13 rounded-xl text-base bg-gray-50 border-gray-200 focus:border-blue-500"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-xl text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'קבלו תשובה עכשיו'}
                    </Button>
                  </form>

                  {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                  {/* Trust signals */}
                  <div className="flex flex-col gap-2 mt-4">
                    {[
                      { icon: Shield, text: 'בדיקה ללא התחייבות' },
                      { icon: Clock, text: 'תשובה תוך דקות' },
                      { icon: Users, text: 'מעל 5,000 עצמאים נעזרו בשירות' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-400 text-xs">
                        <item.icon className="w-3.5 h-3.5 text-green-500" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="mt-4 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    חזרה
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Social proof below card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-white/50 text-sm justify-center mt-6"
          >
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs text-white/70">
                  {['👤', '👩', '👨', '👤'][i]}
                </div>
              ))}
            </div>
            <span>+5,000 עצמאים כבר קיבלו אצלנו הכוונה</span>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-white/30 text-xs px-4 space-y-2">
          <p>© {new Date().getFullYear()} פרפקט וואן — ליווי עסקי מקצועי</p>
          <p>האתר מופעל על ידי חברה פרטית. אינו אתר ממשלתי.</p>
        </footer>
      </div>
    </HelmetProvider>
  );
}
