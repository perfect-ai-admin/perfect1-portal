import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, Shield, Clock, Users,
  ChevronLeft, ArrowLeft, FileCheck, Calculator, Zap,
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Track Event Helper ───
function trackEvent(eventName, params = {}) {
  // GA4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
  // GTM dataLayer
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...params });
  }
}

// ─── Quiz Steps (5 questions) ───
const STEPS = [
  {
    question: 'למי אתה מוכר בעיקר?',
    options: [
      { label: 'אנשים פרטיים', value: 'private', icon: '👤' },
      { label: 'עסקים וחברות', value: 'business', icon: '🏢' },
      { label: 'גם וגם', value: 'both', icon: '🤝' },
    ],
  },
  {
    question: 'כמה אתה צופה להרוויח בשנה הראשונה?',
    options: [
      { label: 'עד 120,000 ₪', value: 'low', icon: '💰' },
      { label: '120,000 – 200,000 ₪', value: 'mid', icon: '💵' },
      { label: 'מעל 200,000 ₪', value: 'high', icon: '🚀' },
      { label: 'לא יודע/ת עדיין', value: 'unknown', icon: '🤔' },
    ],
  },
  {
    question: 'האם יהיו לך הוצאות משמעותיות לעסק?',
    options: [
      { label: 'כן, הוצאות משמעותיות', value: 'yes', icon: '📊' },
      { label: 'מעט הוצאות', value: 'some', icon: '📋' },
      { label: 'כמעט בכלל לא', value: 'no', icon: '✅' },
    ],
  },
  {
    question: 'האם הלקוחות שלך צריכים חשבונית עם מע״מ?',
    options: [
      { label: 'כן, בטוח', value: 'yes', icon: '📄' },
      { label: 'לא', value: 'no', icon: '❌' },
      { label: 'לא בטוח', value: 'unknown', icon: '❓' },
    ],
  },
  {
    question: 'מתי אתה מתכנן לפתוח את העסק?',
    options: [
      { label: 'השבוע', value: 'this_week', icon: '⚡' },
      { label: 'החודש', value: 'this_month', icon: '📅' },
      { label: 'בקרוב', value: 'soon', icon: '🔜' },
      { label: 'רק בודק כרגע', value: 'exploring', icon: '🔍' },
    ],
  },
];

// ─── Result Logic ───
function getResult(answers) {
  let mursheScore = 0;

  // Q0: customer type
  if (answers[0] === 'business') mursheScore += 3;
  if (answers[0] === 'both') mursheScore += 1;

  // Q1: revenue
  if (answers[1] === 'high') mursheScore += 3;
  if (answers[1] === 'mid') mursheScore += 2;

  // Q2: expenses
  if (answers[2] === 'yes') mursheScore += 2;
  if (answers[2] === 'some') mursheScore += 1;

  // Q3: VAT invoice
  if (answers[3] === 'yes') mursheScore += 3;

  const isMurshe = mursheScore >= 4;

  if (isMurshe) {
    return {
      type: 'murshe',
      title: 'נראה שעוסק מורשה מתאים לך',
      reasons: [
        'ההכנסות שלך צפויות לעבור את תקרת עוסק פטור',
        'תוכל לקזז מע״מ על הוצאות העסק',
        'הלקוחות שלך יקבלו חשבונית מס מסודרת',
      ],
      taxNote: 'כעוסק מורשה תגבה מע״מ מהלקוחות ותוכל לקזז מע״מ על הוצאות — מה שיחסוך לך כסף.',
      nextStep: 'צריך לפתוח תיק במס הכנסה, במע״מ ובביטוח לאומי.',
    };
  }

  return {
    type: 'patur',
    title: 'נראה שעוסק פטור מתאים לך',
    reasons: [
      'ההכנסות שלך בטווח שמתאים לעוסק פטור',
      'לא צריך לגבות מע״מ — המחירים שלך תחרותיים יותר',
      'הנהלת חשבונות פשוטה יותר ופחות בירוקרטיה',
    ],
    taxNote: 'כעוסק פטור לא תגבה מע״מ, מה שהופך את המחירים שלך לאטרקטיביים יותר ללקוחות פרטיים.',
    nextStep: 'צריך לפתוח תיק במס הכנסה ובביטוח לאומי.',
  };
}

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

// ─── Phases: 'hero' | 'quiz' | 'result' | 'form' ───
export default function PaturVsMursheQuiz() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('hero');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const result = phase === 'result' || phase === 'form' ? getResult(answers) : null;

  const progress = phase === 'hero' ? 0 : phase === 'quiz' ? ((step + 1) / STEPS.length) * 100 : 100;

  const startQuiz = useCallback(() => {
    trackEvent('quiz_start', { quiz: 'patur_vs_murshe' });
    setPhase('quiz');
  }, []);

  const handleAnswer = useCallback((value) => {
    setAnswers(prev => ({ ...prev, [step]: value }));
    if (step + 1 >= STEPS.length) {
      trackEvent('quiz_complete', { quiz: 'patur_vs_murshe' });
      setPhase('result');
    } else {
      setStep(s => s + 1);
    }
  }, [step]);

  const goBack = useCallback(() => {
    if (phase === 'form') {
      setPhase('result');
    } else if (phase === 'result') {
      setStep(STEPS.length - 1);
      setPhase('quiz');
    } else if (phase === 'quiz' && step > 0) {
      setStep(s => s - 1);
    } else if (phase === 'quiz' && step === 0) {
      setPhase('hero');
    }
  }, [phase, step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('נא למלא שם וטלפון'); return; }
    setLoading(true);
    setError('');

    try {
      trackEvent('lead_submit', {
        quiz: 'patur_vs_murshe',
        result_type: result?.type,
      });

      await invokeFunction('submitLeadToN8N', {
        name: form.name,
        phone: form.phone,

        pageSlug: 'landing-patur-vs-murshe-quiz',
        businessName: 'דף נחיתה - landing-patur-vs-murshe-quiz',
        quizResult: result?.type,
      });

      navigate('/ThankYou', { state: { source: 'landing-patur-vs-murshe-quiz', name: form.name, fromForm: true } });
    } catch (err) {
      setError('שגיאה בשליחה, נסו שוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #152D4A 50%, #0F766E 100%)' }}>
      <Helmet>
        <title>עוסק פטור או מורשה – בדיקה חכמה תוך 30 שניות</title>
        <meta name="description" content="בדקו תוך 30 שניות האם עוסק פטור או עוסק מורשה מתאים לכם. בדיקה חינם ללא התחייבות." />
        <meta name="keywords" content="עוסק פטור או מורשה, מה ההבדל בין עוסק פטור למורשה, מה עדיף עוסק פטור או מורשה, איך לבחור עוסק פטור או מורשה" />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.perfect1.co.il/patur-vs-murshe-quiz" />
        <meta property="og:title" content="עוסק פטור או מורשה – בדיקה חכמה תוך 30 שניות" />
        <meta property="og:description" content="בדקו תוך 30 שניות האם עוסק פטור או עוסק מורשה מתאים לכם." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://www.perfect1.co.il/patur-vs-murshe-quiz" />
        <meta property="og:image" content="https://www.perfect1.co.il/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <div className="max-w-xl mx-auto px-4 py-6 sm:py-10 flex flex-col min-h-screen">

        {/* ─── Progress Bar (visible during quiz) ─── */}
        {phase === 'quiz' && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-white/60 text-sm font-medium mb-2">
              <span>שאלה {step + 1} מתוך {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #22C55E, #16A34A)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* ─── Main Content Area ─── */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">

            {/* ═══════ HERO ═══════ */}
            {phase === 'hero' && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                  עוסק פטור או מורשה?
                  <br />
                  <span style={{ color: '#F59E0B' }}>בדוק תוך 30 שניות מה מתאים לך</span>
                </h1>

                <p className="text-white/80 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  רואה חשבון יבדוק עבורך את הנתונים ויגיד לך בדיוק איזה סוג עסק כדאי לפתוח.
                </p>

                {/* Trust Badges */}
                <div className="flex flex-col items-center gap-2 mb-8">
                  {[
                    'בדיקה חינם',
                    'ללא התחייבות',
                    'תשובה תוך דקות',
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={startQuiz}
                  className="w-full max-w-sm mx-auto h-16 rounded-2xl text-xl font-bold text-white shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                >
                  <Zap className="w-6 h-6 ml-2" />
                  התחל בדיקה
                </Button>

                <p className="text-white/40 text-xs mt-4">5 שאלות קצרות, פחות מ-30 שניות</p>

                {/* Social proof */}
                <div className="flex items-center gap-2 text-white/50 text-sm justify-center mt-8">
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs text-white/70">
                        {['👤', '👩', '👨', '👤'][i]}
                      </div>
                    ))}
                  </div>
                  <span>יותר מ-127 אנשים בדקו השבוע</span>
                </div>
              </motion.div>
            )}

            {/* ═══════ QUIZ ═══════ */}
            {phase === 'quiz' && (
              <motion.div
                key={`quiz-${step}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6">
                    {STEPS[step].question}
                  </h2>

                  <div className="space-y-3">
                    {STEPS[step].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt.value)}
                        className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 active:scale-[0.98] transition-all text-right flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{opt.icon}</span>
                          <span className="font-medium text-gray-800 group-hover:text-blue-700 text-base">
                            {opt.label}
                          </span>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </button>
                    ))}
                  </div>

                  {(step > 0 || phase === 'quiz') && step > 0 && (
                    <button
                      onClick={goBack}
                      className="mt-4 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                      חזרה
                    </button>
                  )}
                </div>

                {/* Below card hint */}
                <p className="text-white/40 text-xs text-center mt-4">
                  הבדיקה לוקחת פחות מדקה
                </p>
              </motion.div>
            )}

            {/* ═══════ RESULT ═══════ */}
            {phase === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                {/* Result Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 mb-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm text-green-600 font-medium mb-2">התוצאה שלך:</p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                      {result.title}
                    </h2>
                  </div>

                  {/* Why it fits */}
                  <div className="space-y-3 mb-6">
                    {result.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm leading-relaxed">{reason}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tax note */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">המשמעות מבחינת מסים</p>
                        <p className="text-sm text-blue-800 leading-relaxed">{result.taxNote}</p>
                      </div>
                    </div>
                  </div>

                  {/* Next step */}
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <FileCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900 mb-1">מה צריך לעשות עכשיו?</p>
                        <p className="text-sm text-amber-800 leading-relaxed">{result.nextStep}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── Lead Form Card ─── */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-green-200">
                  <div className="text-center mb-5">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
                      רוצה שרואה חשבון יפתח לך את התיק?
                    </h3>
                    <p className="text-gray-500 text-sm">
                      השאר פרטים ונחזור אליך לפתיחת תיק ברשויות.
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-5">
                    {[
                      'פתיחת תיק מול מס הכנסה, מע״מ וביטוח לאומי',
                      'טיפול מלא על ידי רואה חשבון',
                      'ליווי עד פתיחת העסק',
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="שם מלא"
                      required
                      className="h-14 rounded-xl text-base bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="טלפון"
                      type="tel"
                      required
                      className="h-14 rounded-xl text-base bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-16 rounded-2xl text-xl font-extrabold text-white shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all"
                      style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'כן, פתחו לי תיק'}
                    </Button>
                  </form>

                  {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

                  {/* Trust signals */}
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
                    {[
                      { icon: Shield, text: 'ללא התחייבות' },
                      { icon: Clock, text: 'תשובה תוך דקות' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <item.icon className="w-3.5 h-3.5 text-green-500" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Social proof trigger */}
                  <p className="text-center text-gray-400 text-xs mt-3">
                    יותר מ-127 אנשים בדקו השבוע איזה סוג עסק מתאים להם
                  </p>
                </div>

                <button
                  onClick={goBack}
                  className="mt-4 text-sm text-white/40 hover:text-white/60 flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                  חזרה לשאלון
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-white/30 text-xs mt-8 space-y-1">
          <p>&copy; {new Date().getFullYear()} פרפקט וואן — ליווי עסקי מקצועי</p>
          <p>האתר מופעל על ידי חברה פרטית. אינו אתר ממשלתי.</p>
        </footer>
      </div>
    </div>
  );
}
