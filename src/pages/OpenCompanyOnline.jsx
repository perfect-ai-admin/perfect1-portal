import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2, Users, FileText, CreditCard, Shield, Clock,
  CheckCircle2, ChevronLeft, ChevronRight, Loader2, Phone,
  Star, Zap, ArrowLeft, X, Check, ShieldCheck, Plus, Minus,
  MessageCircle, BadgeCheck, Sparkles, Globe, UserPlus, ScrollText
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import CheckoutDialog from '@/components/checkout/CheckoutDialog';

const WHATSAPP_URL = 'https://wa.me/972502277087?text=' + encodeURIComponent('היי, אשמח לשמוע על פתיחת חברה בע"מ');
const PHONE_NUMBER = '050-227-7087';

// ============ UPSELL SERVICES ============
const UPSELL_SERVICES = [
  {
    id: 'protocol',
    name: 'פרוטוקול מורשה חתימה',
    price: 750,
    description: 'מסמך המגדיר מי מוסמך לחתום בשם החברה על מסמכים, הסכמים, כספים וכו׳.',
  },
  {
    id: 'bank-account',
    name: 'פתיחת חשבון בנק לחברה',
    price: 950,
    description: 'הכנת כל המסמכים לפתיחת חשבון בנק בסניף שתבחרו. כולל: אישור עו"ד לפתיחת חשבון, פרוטוקול זכויות חתימה, אישור עו"ד להנפקת כרטיס אשראי ועוד.',
  },
  {
    id: 'tax-files',
    name: 'פתיחת תיקים ברשויות אונליין',
    price: 350,
    description: 'נפתח עבורך תיקים במע"מ/מס הכנסה/ביטוח לאומי אונליין ללא צורך בהגעה פיזית למשרדי הרשויות. כולל שעת ייעוץ חינם עם רו"ח.',
  },
  {
    id: 'website-terms',
    name: 'תקנון לאתר אינטרנט',
    price: 750,
    description: 'תקנון מותאם לאתר העסק, ערוך ע"י עורך דין מצוות לגלי.',
  },
];

// ============ WIZARD STEPS CONFIG ============
const STEPS = [
  { id: 'company', icon: Building2, title: 'שמות ומטרות החברה', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'capital', icon: ScrollText, title: 'הון מניות ותקנון', color: 'bg-violet-100 text-violet-600' },
  { id: 'shareholders', icon: Users, title: 'בעלי מניות', color: 'bg-blue-100 text-blue-600' },
  { id: 'directors', icon: BadgeCheck, title: 'דירקטורים', color: 'bg-purple-100 text-purple-600' },
  { id: 'contact', icon: Phone, title: 'פרטי קשר וסיום', color: 'bg-green-100 text-green-600' },
];

const COMPANY_GOALS = [
  'לעסוק בכל עיסוק חוקי',
  'שירותי ייעוץ',
  'מסחר ויבוא',
  'טכנולוגיה ופיתוח תוכנה',
  'נדל"ן והשקעות',
  'ייצור',
  'מזון ומסעדנות',
  'אחר',
];

const EMPTY_PERSON = { fullName: '', idNumber: '', birthDate: '', address: '', email: '', phone: '' };

// ============ MAIN PAGE ============
export default function OpenCompanyOnline() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [selectedUpsells, setSelectedUpsells] = useState([]);
  const [showUpsellCheckout, setShowUpsellCheckout] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('openCompanyForm');
    if (saved) try { return JSON.parse(saved); } catch {}
    return {
      // Step 1 — company names & goals
      companyNameHe1: '',
      companyNameHe2: '',
      companyNameHe3: '',
      companyNameEn: '',
      companyGoal: COMPANY_GOALS[0],
      companyGoalOther: '',
      registeredAddress: '',
      // Step 2 — capital & articles
      shareCount: '100',
      shareParValue: '1',
      articlesType: 'standard',
      // Step 3 — shareholders
      shareholderCount: 1,
      shareholders: [{ ...EMPTY_PERSON }],
      shareDistribution: '',
      // Step 4 — directors
      directorCount: 1,
      directors: [{ ...EMPTY_PERSON }],
      directorIsShareholder: [true],
      // Step 5 — contact + notes
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      notes: '',
    };
  });

  useEffect(() => {
    localStorage.setItem('openCompanyForm', JSON.stringify(form));
  }, [form]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const setPerson = (list, idx, key, val) => {
    setForm(prev => {
      const arr = [...prev[list]];
      arr[idx] = { ...arr[idx], [key]: val };
      return { ...prev, [list]: arr };
    });
  };

  const setPersonCount = (list, countKey, count) => {
    const n = Math.max(1, Math.min(10, count));
    setForm(prev => {
      const arr = [...prev[list]];
      while (arr.length < n) arr.push({ ...EMPTY_PERSON });
      const update = { [list]: arr.slice(0, n), [countKey]: n };
      // grow directorIsShareholder array if directors
      if (list === 'directors') {
        const flags = [...(prev.directorIsShareholder || [])];
        while (flags.length < n) flags.push(false);
        update.directorIsShareholder = flags.slice(0, n);
      }
      return { ...prev, ...update };
    });
  };

  const setDirectorIsShareholder = (idx, val) => {
    setForm(prev => {
      const flags = [...(prev.directorIsShareholder || [])];
      flags[idx] = val;
      const directors = [...prev.directors];
      if (val && prev.shareholders[idx]) {
        directors[idx] = { ...prev.shareholders[idx] };
      }
      return { ...prev, directorIsShareholder: flags, directors };
    });
  };

  // Validation per step
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.companyNameHe1.trim()) e.companyNameHe1 = 'חובה לבחור שם אחד לפחות';
      if (!form.companyNameEn.trim()) e.companyNameEn = 'חובה — נדרש לרשם החברות';
    }
    if (step === 1) {
      if (!form.shareCount || Number(form.shareCount) < 1) e.shareCount = 'מינימום 1';
    }
    if (step === 2) {
      form.shareholders.slice(0, form.shareholderCount).forEach((s, i) => {
        if (!s.fullName.trim()) e[`sh_name_${i}`] = 'חובה';
        if (!s.idNumber.trim()) e[`sh_id_${i}`] = 'חובה';
      });
    }
    if (step === 3) {
      form.directors.slice(0, form.directorCount).forEach((d, i) => {
        if (form.directorIsShareholder[i]) return; // filled from shareholder
        if (!d.fullName.trim()) e[`dir_name_${i}`] = 'חובה';
        if (!d.idNumber.trim()) e[`dir_id_${i}`] = 'חובה';
      });
    }
    if (step === 4) {
      if (!form.contactName.trim()) e.contactName = 'חובה';
      if (!form.contactPhone.trim()) e.contactPhone = 'חובה';
      const ph = form.contactPhone.replace(/[-\s]/g, '');
      if (ph && !/^0\d{8,9}$/.test(ph)) e.contactPhone = 'מספר לא תקין';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      submitLead();
      setShowCheckout(true);
    }
  };

  const prev = () => step > 0 && setStep(s => s - 1);

  const submitLead = async () => {
    try {
      await invokeFunction('submitLeadToN8N', {
        name: form.contactName,
        phone: form.contactPhone,
        email: form.contactEmail,
        pageSlug: 'open-hevra-bam-online',
        businessName: form.companyNameHe1,
        notes: `חברה: ${form.companyNameHe1} / ${form.companyNameEn}, ${form.shareholderCount} בעלי מניות, ${form.directorCount} דירקטורים, מטרה: ${form.companyGoal}, תקנון: ${form.articlesType}, הון: ${form.shareCount} מניות. הערות: ${form.notes}`,
      });
    } catch {}
  };

  const handlePaymentSuccess = async () => {
    setShowCheckout(false);
    setShowUpsell(true);
    localStorage.removeItem('openCompanyForm');
  };

  const toggleUpsell = (id) => {
    setSelectedUpsells(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const upsellTotal = selectedUpsells.reduce((sum, id) => {
    const svc = UPSELL_SERVICES.find(s => s.id === id);
    return sum + (svc?.price || 0);
  }, 0);

  const handleUpsellPay = () => {
    if (selectedUpsells.length === 0) return;
    setShowUpsellCheckout(true);
  };

  const handleUpsellSuccess = () => {
    setShowUpsellCheckout(false);
    navigate('/ThankYou', { state: { source: 'open-hevra-bam-upsell', name: form.contactName, fromForm: true } });
  };

  const handleSkipUpsell = () => {
    navigate('/ThankYou', { state: { source: 'open-hevra-bam-online', name: form.contactName, fromForm: true } });
  };

  // ============ RENDER ============
  return (
    <>
      <Helmet>
        <title>פתיחת חברה בע"מ אונליין — 450₪ | פרפקט וואן</title>
        <meta name="description" content="פתחו חברה בע״מ אונליין ב-450₪ בלבד. מלאו שאלון קצר, שלמו אונליין, ואנחנו מטפלים בכל השאר. רו״ח + עו״ד." />
        <link rel="canonical" href="https://www.perfect1.co.il/open-hevra-bam-online" />
      </Helmet>

      <div className="min-h-screen bg-white" dir="rtl">
        {/* ===== HERO ===== */}
        {!started && !showUpsell && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-bl from-indigo-950 via-indigo-900 to-indigo-800" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-[length:24px_24px]" />

            <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
                  <Zap className="w-4 h-4 text-amber-400" />
                  תהליך מקוון — ללא הגעה למשרד
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center leading-tight mb-4">
                פתיחת חברה בע"מ
                <br />
                <span className="text-amber-400">אונליין ב-450₪</span>
              </h1>

              <p className="text-lg sm:text-xl text-white/70 text-center max-w-2xl mx-auto mb-8">
                מלאו שאלון מלא (5 דקות), שלמו אונליין — ואנחנו מטפלים ברישום ברשם החברות.
                <br className="hidden sm:block" />
                תעודת התאגדות תוך 7 ימי עסקים.
              </p>

              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={() => setStarted(true)}
                  className="h-14 sm:h-16 px-10 sm:px-14 text-lg sm:text-xl font-extrabold rounded-2xl bg-amber-500 hover:bg-amber-400 text-indigo-950 shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all"
                >
                  <Sparkles className="ml-2 w-5 h-5" />
                  התחילו עכשיו
                </Button>

                <div className="flex items-center gap-4 text-white/50 text-sm">
                  <span>או:</span>
                  <a href={`tel:${PHONE_NUMBER}`} className="text-white/70 hover:text-white flex items-center gap-1">
                    <Phone className="w-4 h-4" />{PHONE_NUMBER}
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />WhatsApp
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
                {[
                  { icon: Shield, text: 'תשלום מאובטח' },
                  { icon: Clock, text: '7 ימי עסקים' },
                  { icon: BadgeCheck, text: 'רו"ח + עו"ד' },
                  { icon: Star, text: '1,200+ חברות' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/60 text-sm justify-center">
                    <t.icon className="w-4 h-4 text-amber-400/70" />
                    <span>{t.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's included */}
            <div className="relative bg-white/5 border-t border-white/10 py-10">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-xl font-bold text-white text-center mb-6">מה כלול ב-450₪?</h2>
                <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {[
                    'בדיקת זמינות שם החברה',
                    'הכנת תקנון (מצוי או מותאם)',
                    'הגשה מקוונת לרשם החברות',
                    'מעקב סטטוס עד קבלת תעודה',
                    'אימות מסמכים ע"י עו"ד',
                    'תמיכה טלפונית לאורך התהליך',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SEO Content */}
            <div className="bg-white py-12 sm:py-16">
              <div className="max-w-3xl mx-auto px-4 space-y-8 text-gray-700 leading-relaxed">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">למה לפתוח חברה בע"מ?</h2>
                  <p>חברה בערבון מוגבל (בע"מ) מספקת הגנה משפטית לבעלים — מסך התאגדות מפריד בין הרכוש הפרטי שלכם לחובות החברה. בנוסף, מס חברות (23%) נמוך יותר ממס שולי על עצמאים, ומבנה של חברה מאפשר גיוס משקיעים בצורה מסודרת.</p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">איך התהליך עובד?</h2>
                  <div className="grid sm:grid-cols-4 gap-4">
                    {[
                      { num: '1', title: 'ממלאים שאלון', desc: 'שמות, בעלי מניות, דירקטורים ופרטי קשר' },
                      { num: '2', title: 'משלמים אונליין', desc: '450₪ בלבד — אשראי, Bit או Google Pay' },
                      { num: '3', title: 'אנחנו מטפלים', desc: 'הכנת מסמכים, אימות והגשה לרשם' },
                      { num: '4', title: 'מקבלים תעודה', desc: 'תעודת התאגדות תוך 7 ימי עסקים' },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mx-auto mb-2">{s.num}</div>
                        <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button
                    onClick={() => { setStarted(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="h-13 px-10 text-lg font-bold rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white shadow-lg"
                  >
                    <ArrowLeft className="ml-2 w-5 h-5" />
                    התחילו את התהליך עכשיו
                  </Button>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">שאלות נפוצות</h2>
                  <div className="space-y-4">
                    {[
                      { q: 'כמה זמן לוקח לקבל תעודת התאגדות?', a: 'בהגשה מקוונת — 3 עד 7 ימי עסקים מרגע הגשת כל המסמכים התקינים לרשם החברות.' },
                      { q: 'האם אפשר להקים חברה עם בעל מניות אחד?', a: 'כן, חוק החברות מאפשר הקמת "חברת יחיד" עם בעל מניות ודירקטור אחד.' },
                      { q: 'מה לא כלול ב-450₪?', a: 'אגרת רשם החברות (כ-2,145₪ בהגשה מקוונת) משולמת ישירות לרשם. אנחנו מטפלים בכל השאר.' },
                      { q: 'האם אני חייב עורך דין?', a: 'אימות חתימות חייב להתבצע ע"י עו"ד — זה כלול בשירות שלנו.' },
                      { q: 'למה צריך שם באנגלית?', a: 'רשם החברות דורש שם חברה באנגלית לצד השם בעברית. השם באנגלית מופיע בתעודת ההתאגדות ובמסמכים רשמיים.' },
                    ].map((faq, i) => (
                      <details key={i} className="group bg-gray-50 rounded-xl px-5 py-4">
                        <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                          {faq.q}
                          <ChevronLeft className="w-4 h-4 text-gray-400 group-open:rotate-[-90deg] transition-transform" />
                        </summary>
                        <p className="mt-2 text-sm text-gray-600">{faq.a}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== WIZARD ===== */}
        {started && !showUpsell && (
          <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pt-6 pb-20 px-4">
            <div className="max-w-lg mx-auto">
              {/* Back / Close */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => step > 0 ? prev() : setStarted(false)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <ChevronRight className="w-4 h-4" />חזרה
                </button>
                <button onClick={() => setStarted(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-1 mb-6">
                {STEPS.map((s, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                ))}
              </div>

              {/* Step Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${STEPS[step].color}`}>
                  {React.createElement(STEPS[step].icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <p className="text-xs text-gray-500">שלב {step + 1} מתוך {STEPS.length}</p>
                  <h2 className="text-lg font-bold text-gray-900">{STEPS[step].title}</h2>
                </div>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4"
                >
                  {step === 0 && <StepCompanyNames form={form} set={set} errors={errors} />}
                  {step === 1 && <StepCapital form={form} set={set} errors={errors} />}
                  {step === 2 && <StepShareholders form={form} setPerson={setPerson} setCount={setPersonCount} set={set} errors={errors} />}
                  {step === 3 && <StepDirectors form={form} setPerson={setPerson} setCount={setPersonCount} setDirIsSh={setDirectorIsShareholder} errors={errors} />}
                  {step === 4 && <StepContact form={form} set={set} errors={errors} />}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <Button onClick={prev} variant="outline" className="flex-1 h-12 rounded-xl text-base">
                    <ChevronRight className="ml-1 w-4 h-4" />הקודם
                  </Button>
                )}
                <Button
                  onClick={next}
                  className={`flex-1 h-12 rounded-xl text-base font-bold shadow-md ${
                    step === STEPS.length - 1
                      ? 'bg-amber-500 hover:bg-amber-400 text-indigo-950'
                      : 'bg-indigo-700 hover:bg-indigo-600 text-white'
                  }`}
                >
                  {step === STEPS.length - 1 ? (
                    <><CreditCard className="ml-2 w-4 h-4" />לתשלום — 450₪</>
                  ) : (
                    <>הבא<ChevronLeft className="mr-1 w-4 h-4" /></>
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />תשלום מאובטח · 450₪ בלבד · ללא התחייבות
              </p>
            </div>
          </div>
        )}

        {/* ===== UPSELL PAGE ===== */}
        {showUpsell && (
          <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-10 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">התשלום בוצע בהצלחה!</h1>
                <p className="text-gray-500">הצוות שלנו יתחיל לטפל ברישום החברה תוך יום עסקים.</p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-indigo-100 p-5 sm:p-6 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-bold text-gray-900">שירותים משלימים במידת הצורך</h2>
                </div>
                <p className="text-sm text-gray-500 mb-5">10% הנחה לרוכשים את החבילה המלאה — קוד קופון: <strong>TEN</strong></p>

                <div className="space-y-3">
                  {UPSELL_SERVICES.map((svc) => {
                    const selected = selectedUpsells.includes(svc.id);
                    return (
                      <label
                        key={svc.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selected ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleUpsell(svc.id)}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{svc.name}</span>
                            <span className="font-extrabold text-indigo-700 text-lg">{svc.price}₪</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{svc.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {selectedUpsells.length > 0 && (
                  <div className="mt-5 pt-4 border-t flex items-center justify-between">
                    <span className="font-bold text-gray-900">סה"כ שירותים נוספים</span>
                    <span className="text-2xl font-extrabold text-indigo-700">{upsellTotal.toLocaleString()}₪</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {selectedUpsells.length > 0 && (
                  <Button
                    onClick={handleUpsellPay}
                    className="h-13 text-lg font-bold rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white shadow-lg"
                  >
                    <CreditCard className="ml-2 w-5 h-5" />
                    שלמו {upsellTotal.toLocaleString()}₪ על שירותים נוספים
                  </Button>
                )}
                <Button
                  onClick={handleSkipUpsell}
                  variant="ghost"
                  className="h-11 text-gray-500 hover:text-gray-700"
                >
                  לא תודה, המשיכו עם פתיחת החברה בלבד
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== CHECKOUT DIALOGS ===== */}
        <CheckoutDialog
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          product={{
            name: 'פתיחת חברה בע"מ אונליין',
            description: `חברה: ${form.companyNameHe1} / ${form.companyNameEn} · ${form.shareholderCount} בעלי מניות · ${form.directorCount} דירקטורים`,
            price: 450,
            product_type: 'one-time',
            product_id: 'open-hevra-bam',
            metadata: {
              companyNameHe: form.companyNameHe1,
              companyNameEn: form.companyNameEn,
              shareholders: form.shareholderCount,
              directors: form.directorCount,
            },
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />

        <CheckoutDialog
          open={showUpsellCheckout}
          onClose={() => setShowUpsellCheckout(false)}
          product={{
            name: 'שירותים משלימים לחברה בע"מ',
            description: selectedUpsells.map(id => UPSELL_SERVICES.find(s => s.id === id)?.name).join(', '),
            price: upsellTotal,
            product_type: 'one-time',
            product_id: 'hevra-bam-upsell',
            items: selectedUpsells.map(id => {
              const svc = UPSELL_SERVICES.find(s => s.id === id);
              return { name: svc.name, price: svc.price };
            }),
          }}
          onPaymentSuccess={handleUpsellSuccess}
        />
      </div>
    </>
  );
}

// ============ STEP COMPONENTS ============

function FieldError({ error }) {
  if (!error) return null;
  return <p className="text-red-500 text-xs mt-0.5">{error}</p>;
}

function Hint({ text }) {
  return <p className="text-xs text-gray-400 mt-0.5">{text}</p>;
}

// ---- Step 1: Company Names & Goals ----
function StepCompanyNames({ form, set, errors }) {
  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">שם החברה בעברית (ראשון) *</label>
        <Input value={form.companyNameHe1} onChange={e => set('companyNameHe1', e.target.value)} placeholder='לדוגמה: אביב טכנולוגיות בע"מ' className="h-11" />
        <FieldError error={errors.companyNameHe1} />
        <Hint text='חייב להסתיים ב-בע"מ. נבדוק זמינות ברשם.' />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">שם חלופי שני</label>
        <Input value={form.companyNameHe2} onChange={e => set('companyNameHe2', e.target.value)} placeholder="למקרה שהשם הראשון תפוס" className="h-11" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">שם חלופי שלישי</label>
        <Input value={form.companyNameHe3} onChange={e => set('companyNameHe3', e.target.value)} placeholder="למקרה שגם השני תפוס" className="h-11" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">שם החברה באנגלית *</label>
        <Input value={form.companyNameEn} onChange={e => set('companyNameEn', e.target.value)} placeholder='e.g. Aviv Technologies Ltd.' className="h-11" dir="ltr" />
        <FieldError error={errors.companyNameEn} />
        <Hint text="נדרש לרשם החברות. חייב להסתיים ב-Ltd." />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">מטרת החברה</label>
        <div className="grid grid-cols-2 gap-2">
          {COMPANY_GOALS.map(g => (
            <button
              key={g}
              onClick={() => set('companyGoal', g)}
              className={`px-3 py-2 rounded-lg border text-sm text-right transition-all ${
                form.companyGoal === g
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        {form.companyGoal === 'אחר' && (
          <Input value={form.companyGoalOther} onChange={e => set('companyGoalOther', e.target.value)} placeholder="פרט מטרה" className="h-11 mt-2" />
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">כתובת רשומה לחברה</label>
        <Input value={form.registeredAddress} onChange={e => set('registeredAddress', e.target.value)} placeholder="עיר, רחוב, מספר" className="h-11" />
        <Hint text="הכתובת לקבלת דואר רשמי מרשם החברות ומרשויות המס" />
      </div>
    </>
  );
}

// ---- Step 2: Share Capital & Articles ----
function StepCapital({ form, set, errors }) {
  return (
    <>
      <p className="text-sm text-gray-500">הגדרת הון המניות הרשום וסוג התקנון. אם לא בטוחים — השאירו את ברירת המחדל.</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">כמות מניות רשומות *</label>
          <Input value={form.shareCount} onChange={e => set('shareCount', e.target.value)} placeholder="100" type="number" min="1" className="h-11" dir="ltr" />
          <FieldError error={errors.shareCount} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">ערך נקוב למניה (₪)</label>
          <Input value={form.shareParValue} onChange={e => set('shareParValue', e.target.value)} placeholder="1" type="number" min="0.01" step="0.01" className="h-11" dir="ltr" />
        </div>
      </div>
      <Hint text="ברירת מחדל: 100 מניות רגילות בנות 1₪ כל אחת. מתאים לרוב החברות." />

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">סוג תקנון</label>
        <div className="space-y-2">
          {[
            { value: 'standard', label: 'תקנון מצוי (ברירת מחדל)', desc: 'מתאים לחברת יחיד או שותפים שמסכימים על הכללים הסטנדרטיים' },
            { value: 'custom', label: 'תקנון מותאם אישית', desc: 'מומלץ כשיש שותפים — כולל מנגנוני הצבעה, העברת מניות ויציאה' },
          ].map(opt => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                form.articlesType === opt.value
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="articlesType"
                checked={form.articlesType === opt.value}
                onChange={() => set('articlesType', opt.value)}
                className="mt-0.5 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {form.articlesType === 'custom' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <strong>שימו לב:</strong> תקנון מותאם כלול בשירות ללא עלות נוספת. עו"ד מצוות שלנו יכין אותו בהתאם לצרכים שלכם.
        </div>
      )}
    </>
  );
}

// ---- Step 3: Shareholders ----
function StepShareholders({ form, setPerson, setCount, set, errors }) {
  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">מספר בעלי מניות</label>
        <div className="flex items-center gap-3">
          <button onClick={() => setCount('shareholders', 'shareholderCount', form.shareholderCount - 1)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xl font-bold text-gray-900 w-8 text-center">{form.shareholderCount}</span>
          <button onClick={() => setCount('shareholders', 'shareholderCount', form.shareholderCount + 1)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {form.shareholders.slice(0, form.shareholderCount).map((sh, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-2">
          <p className="text-sm font-bold text-gray-700">בעל מניות {i + 1}</p>
          <Input value={sh.fullName} onChange={e => setPerson('shareholders', i, 'fullName', e.target.value)} placeholder="שם מלא (כמו בת.ז.) *" className="h-10" />
          <FieldError error={errors[`sh_name_${i}`]} />
          <Input value={sh.idNumber} onChange={e => setPerson('shareholders', i, 'idNumber', e.target.value)} placeholder="מספר ת.ז. *" className="h-10" dir="ltr" />
          <FieldError error={errors[`sh_id_${i}`]} />
          <Input value={sh.birthDate} onChange={e => setPerson('shareholders', i, 'birthDate', e.target.value)} placeholder="תאריך לידה" type="date" className="h-10" dir="ltr" />
          <Input value={sh.address} onChange={e => setPerson('shareholders', i, 'address', e.target.value)} placeholder="כתובת מגורים" className="h-10" />
          <Input value={sh.email} onChange={e => setPerson('shareholders', i, 'email', e.target.value)} placeholder="אימייל" type="email" className="h-10" dir="ltr" />
          <Input value={sh.phone} onChange={e => setPerson('shareholders', i, 'phone', e.target.value)} placeholder="טלפון" type="tel" className="h-10" dir="ltr" />
        </div>
      ))}

      {form.shareholderCount > 1 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">חלוקת מניות</label>
          <Input value={form.shareDistribution} onChange={e => set('shareDistribution', e.target.value)} placeholder='לדוגמה: "50%-50%" או "60%-20%-20%"' className="h-11" />
          <Hint text="אם לא תמלאו — המניות יחולקו שווה בשווה" />
        </div>
      )}
    </>
  );
}

// ---- Step 4: Directors ----
function StepDirectors({ form, setPerson, setCount, setDirIsSh, errors }) {
  return (
    <>
      <p className="text-sm text-gray-500">חברה חייבת לפחות דירקטור אחד. הדירקטור חייב להיות אדם בגיר (18+).</p>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">מספר דירקטורים</label>
        <div className="flex items-center gap-3">
          <button onClick={() => setCount('directors', 'directorCount', form.directorCount - 1)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xl font-bold text-gray-900 w-8 text-center">{form.directorCount}</span>
          <button onClick={() => setCount('directors', 'directorCount', form.directorCount + 1)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {form.directors.slice(0, form.directorCount).map((dir, i) => {
        const isSh = form.directorIsShareholder?.[i] || false;
        const canLinkShareholder = i < form.shareholderCount;
        return (
          <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-2">
            <p className="text-sm font-bold text-gray-700">דירקטור {i + 1}</p>

            {canLinkShareholder && (
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSh}
                  onChange={e => setDirIsSh(i, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-xs text-gray-600">זהה לבעל מניות {i + 1} ({form.shareholders[i]?.fullName || '—'})</span>
              </label>
            )}

            <Input
              value={dir.fullName}
              onChange={e => setPerson('directors', i, 'fullName', e.target.value)}
              placeholder="שם מלא (כמו בת.ז.) *"
              className="h-10"
              disabled={isSh}
            />
            <FieldError error={errors[`dir_name_${i}`]} />
            <Input
              value={dir.idNumber}
              onChange={e => setPerson('directors', i, 'idNumber', e.target.value)}
              placeholder="מספר ת.ז. *"
              className="h-10"
              dir="ltr"
              disabled={isSh}
            />
            <FieldError error={errors[`dir_id_${i}`]} />
            <Input
              value={dir.birthDate}
              onChange={e => setPerson('directors', i, 'birthDate', e.target.value)}
              placeholder="תאריך לידה"
              type="date"
              className="h-10"
              dir="ltr"
              disabled={isSh}
            />
            <Input
              value={dir.address}
              onChange={e => setPerson('directors', i, 'address', e.target.value)}
              placeholder="כתובת מגורים"
              className="h-10"
              disabled={isSh}
            />
          </div>
        );
      })}
    </>
  );
}

// ---- Step 5: Contact & Notes ----
function StepContact({ form, set, errors }) {
  return (
    <>
      <p className="text-sm text-gray-500">פרטי איש הקשר לתיאום — ניצור אתכם קשר לאישור פרטים, חתימה על מסמכים ועדכוני סטטוס.</p>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">שם מלא *</label>
        <Input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="שם מלא" className="h-11" />
        <FieldError error={errors.contactName} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">טלפון נייד *</label>
        <Input value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="050-0000000" type="tel" dir="ltr" className="h-11" />
        <FieldError error={errors.contactPhone} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">אימייל</label>
        <Input value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="email@example.com" type="email" dir="ltr" className="h-11" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">הערות / בקשות מיוחדות</label>
        <Textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="פרטים נוספים שחשוב לנו לדעת — למשל: לוח זמנים דחוף, צורך בהסכם מייסדים, שאלות מיוחדות..."
          className="min-h-[80px] resize-none"
        />
      </div>

      {/* Summary */}
      <div className="bg-indigo-50 rounded-xl p-4 space-y-1.5 text-sm">
        <p className="font-bold text-indigo-900 mb-2">סיכום הפרטים:</p>
        <SummaryRow label="שם החברה" value={`${form.companyNameHe1} / ${form.companyNameEn}`} />
        <SummaryRow label="מטרה" value={form.companyGoal === 'אחר' ? form.companyGoalOther : form.companyGoal} />
        <SummaryRow label="הון מניות" value={`${form.shareCount} מניות × ${form.shareParValue}₪`} />
        <SummaryRow label="תקנון" value={form.articlesType === 'custom' ? 'מותאם אישית' : 'מצוי (ברירת מחדל)'} />
        <SummaryRow label="בעלי מניות" value={form.shareholders.slice(0, form.shareholderCount).map(s => s.fullName).filter(Boolean).join(', ') || '—'} />
        <SummaryRow label="דירקטורים" value={form.directors.slice(0, form.directorCount).map(d => d.fullName).filter(Boolean).join(', ') || '—'} />
        {form.shareDistribution && <SummaryRow label="חלוקת מניות" value={form.shareDistribution} />}
      </div>
    </>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-indigo-600 font-medium whitespace-nowrap">{label}:</span>
      <span className="text-indigo-900">{value}</span>
    </div>
  );
}
