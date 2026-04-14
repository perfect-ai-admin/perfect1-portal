import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2, Users, CreditCard, Shield, Clock,
  CheckCircle2, ChevronLeft, ChevronRight, Phone,
  Star, Zap, ArrowLeft, X, ShieldCheck, Plus, Minus,
  MessageCircle, BadgeCheck, Sparkles, ScrollText
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import CheckoutDialog from '@/components/checkout/CheckoutDialog';

const WHATSAPP_URL = 'https://wa.me/972502277087?text=' + encodeURIComponent('היי, אשמח לשמוע על פתיחת חברה בע"מ');
const PHONE_NUMBER = '050-227-7087';
const FORM_VERSION = 3; // bump to invalidate stale localStorage

// ============ UPSELL SERVICES ============
const UPSELL_SERVICES = [
  { id: 'protocol', name: 'פרוטוקול מורשה חתימה', price: 750, description: 'מסמך המגדיר מי מוסמך לחתום בשם החברה על מסמכים, הסכמים, כספים וכו׳.' },
  { id: 'bank-account', name: 'פתיחת חשבון בנק לחברה', price: 950, description: 'הכנת כל המסמכים לפתיחת חשבון בנק בסניף שתבחרו. כולל: אישור עו"ד, פרוטוקול זכויות חתימה, אישור להנפקת כרטיס אשראי ועוד.' },
  { id: 'tax-files', name: 'פתיחת תיקים ברשויות אונליין', price: 350, description: 'נפתח עבורך תיקים במע"מ/מס הכנסה/ביטוח לאומי אונליין ללא צורך בהגעה פיזית. כולל שעת ייעוץ חינם עם רו"ח.' },
  { id: 'website-terms', name: 'תקנון לאתר אינטרנט', price: 750, description: 'תקנון מותאם לאתר העסק, ערוך ע"י עורך דין.' },
];

// ============ WIZARD STEPS ============
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

function getDefaultForm() {
  return {
    _v: FORM_VERSION,
    companyNameHe1: '', companyNameHe2: '', companyNameHe3: '',
    companyNameEn: '',
    companyGoal: COMPANY_GOALS[0], companyGoalOther: '',
    registeredAddress: '',
    shareCount: '100', shareParValue: '1', articlesType: 'standard',
    shareholderCount: 1,
    shareholders: [{ ...EMPTY_PERSON }],
    shareDistribution: '',
    directorCount: 1,
    directors: [{ ...EMPTY_PERSON }],
    directorIsShareholder: [false],
    contactName: '', contactPhone: '', contactEmail: '',
    notes: '',
  };
}

// ============ MAIN PAGE ============
export default function OpenCompanyOnline() {
  const navigate = useNavigate();
  const wizardRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [selectedUpsells, setSelectedUpsells] = useState([]);
  const [showUpsellCheckout, setShowUpsellCheckout] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('openCompanyForm');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed._v === FORM_VERSION) return parsed;
      } catch {}
    }
    return getDefaultForm();
  });

  useEffect(() => {
    localStorage.setItem('openCompanyForm', JSON.stringify(form));
  }, [form]);

  // Scroll to top of wizard on step change
  useEffect(() => {
    if (started) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step, started]);

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
      } else if (!val) {
        directors[idx] = { ...EMPTY_PERSON };
      }
      return { ...prev, directorIsShareholder: flags, directors };
    });
  };

  // Sync director data from shareholders when entering directors step
  useEffect(() => {
    if (step === 3) {
      setForm(prev => {
        const directors = [...prev.directors];
        const flags = prev.directorIsShareholder || [];
        let changed = false;
        flags.forEach((isSh, i) => {
          if (isSh && prev.shareholders[i]) {
            const sh = prev.shareholders[i];
            if (directors[i]?.fullName !== sh.fullName || directors[i]?.idNumber !== sh.idNumber) {
              directors[i] = { ...sh };
              changed = true;
            }
          }
        });
        return changed ? { ...prev, directors } : prev;
      });
    }
    // Auto-fill contact info from first shareholder when entering contact step
    if (step === 4) {
      setForm(prev => {
        const sh0 = prev.shareholders[0];
        const updates = {};
        if (!prev.contactName && sh0?.fullName) updates.contactName = sh0.fullName;
        if (!prev.contactPhone && sh0?.phone) updates.contactPhone = sh0.phone;
        if (!prev.contactEmail && sh0?.email) updates.contactEmail = sh0.email;
        return Object.keys(updates).length ? { ...prev, ...updates } : prev;
      });
    }
  }, [step]);

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.companyNameHe1.trim()) e.companyNameHe1 = 'חובה';
      if (!form.companyNameEn.trim()) e.companyNameEn = 'חובה — נדרש לרשם';
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
        if (form.directorIsShareholder?.[i]) return;
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

  const toggleUpsell = (id) => setSelectedUpsells(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const upsellTotal = selectedUpsells.reduce((sum, id) => sum + (UPSELL_SERVICES.find(s => s.id === id)?.price || 0), 0);

  const handleUpsellPay = () => selectedUpsells.length > 0 && setShowUpsellCheckout(true);

  const handleUpsellSuccess = () => {
    setShowUpsellCheckout(false);
    navigate('/ThankYou', { state: { source: 'open-hevra-bam-upsell', name: form.contactName, fromForm: true } });
  };

  const handleSkipUpsell = () => {
    navigate('/ThankYou', { state: { source: 'open-hevra-bam-online', name: form.contactName, fromForm: true } });
  };

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
                  <a href={`tel:${PHONE_NUMBER}`} className="text-white/70 hover:text-white flex items-center gap-1"><Phone className="w-4 h-4" />{PHONE_NUMBER}</a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 flex items-center gap-1"><MessageCircle className="w-4 h-4" />WhatsApp</a>
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
                    <t.icon className="w-4 h-4 text-amber-400/70" /><span>{t.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative bg-white/5 border-t border-white/10 py-10">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-xl font-bold text-white text-center mb-6">מה כלול ב-450₪?</h2>
                <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {['בדיקת זמינות שם החברה','הכנת תקנון (מצוי או מותאם)','הגשה מקוונת לרשם החברות','מעקב סטטוס עד קבלת תעודה','אימות מסמכים ע"י עו"ד','תמיכה טלפונית לאורך התהליך'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /><span>{item}</span>
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { num: '1', title: 'ממלאים שאלון', desc: 'שמות, בעלי מניות, דירקטורים ופרטי קשר' },
                      { num: '2', title: 'משלמים אונליין', desc: '450₪ — אשראי, Bit או Google Pay' },
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
                  <Button onClick={() => { setStarted(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="h-13 px-10 text-lg font-bold rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white shadow-lg">
                    <ArrowLeft className="ml-2 w-5 h-5" />התחילו את התהליך עכשיו
                  </Button>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">שאלות נפוצות</h2>
                  <div className="space-y-3">
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
                          <ChevronLeft className="w-4 h-4 text-gray-400 group-open:rotate-[-90deg] transition-transform shrink-0 mr-2" />
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
          <div ref={wizardRef} className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pt-6 pb-24 px-4">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => step > 0 ? prev() : setStarted(false)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <ChevronRight className="w-4 h-4" />חזרה
                </button>
                <span className="text-xs text-gray-400 font-medium">450₪ · פתיחת חברה</span>
                <button onClick={() => setStarted(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-1 mb-2">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mb-5">שלב {step + 1} מתוך {STEPS.length}</p>

              {/* Step Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${STEPS[step].color}`}>
                  {React.createElement(STEPS[step].icon, { className: 'w-5 h-5' })}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{STEPS[step].title}</h2>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
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
                  <Button onClick={prev} variant="outline" className="h-12 px-5 rounded-xl text-base">
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
                    <>המשך<ChevronLeft className="mr-1 w-4 h-4" /></>
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />תשלום מאובטח · ללא התחייבות
              </p>
            </div>
          </div>
        )}

        {/* ===== UPSELL ===== */}
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
                      <label key={svc.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleUpsell(svc.id)} className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-gray-900">{svc.name}</span>
                            <span className="font-extrabold text-indigo-700 text-lg whitespace-nowrap">{svc.price}₪</span>
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
                  <Button onClick={handleUpsellPay} className="h-13 text-lg font-bold rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white shadow-lg">
                    <CreditCard className="ml-2 w-5 h-5" />שלמו {upsellTotal.toLocaleString()}₪
                  </Button>
                )}
                <Button onClick={handleSkipUpsell} variant="ghost" className="h-11 text-gray-500 hover:text-gray-700">
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
            description: `${form.companyNameHe1} / ${form.companyNameEn} · ${form.shareholderCount} בעלי מניות · ${form.directorCount} דירקטורים`,
            price: 450,
            product_type: 'one-time',
            product_id: 'open-hevra-bam',
            metadata: { companyNameHe: form.companyNameHe1, companyNameEn: form.companyNameEn, shareholders: form.shareholderCount, directors: form.directorCount },
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
            items: selectedUpsells.map(id => { const svc = UPSELL_SERVICES.find(s => s.id === id); return { name: svc.name, price: svc.price }; }),
          }}
          onPaymentSuccess={handleUpsellSuccess}
        />
      </div>
    </>
  );
}

// ============ SHARED COMPONENTS ============

function FieldError({ error }) {
  if (!error) return null;
  return <p className="text-red-500 text-xs mt-0.5 font-medium">{error}</p>;
}

function Hint({ text }) {
  return <p className="text-[11px] text-gray-400 mt-0.5">{text}</p>;
}

function FormField({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <FieldError error={error} />}
      {hint && <Hint text={hint} />}
    </div>
  );
}

function PersonCard({ title, person, listKey, index, setPerson, errors, nameErr, idErr, disabled }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
      <p className="text-sm font-bold text-gray-700">{title}</p>

      <FormField label="שם מלא (כמו בת.ז.)" required error={errors?.[nameErr]}>
        <Input value={person.fullName} onChange={e => setPerson(listKey, index, 'fullName', e.target.value)} placeholder="ישראל ישראלי" className="h-11" disabled={disabled} />
      </FormField>

      <FormField label="מספר תעודת זהות" required error={errors?.[idErr]}>
        <Input value={person.idNumber} onChange={e => setPerson(listKey, index, 'idNumber', e.target.value)} placeholder="000000000" className="h-11" dir="ltr" inputMode="numeric" disabled={disabled} />
      </FormField>

      <FormField label="תאריך לידה">
        <Input value={person.birthDate} onChange={e => setPerson(listKey, index, 'birthDate', e.target.value)} type="date" className="h-11" dir="ltr" disabled={disabled} />
      </FormField>

      <FormField label="כתובת מגורים">
        <Input value={person.address} onChange={e => setPerson(listKey, index, 'address', e.target.value)} placeholder="עיר, רחוב, מספר" className="h-11" disabled={disabled} />
      </FormField>

      {person.email !== undefined && !disabled && (
        <FormField label="אימייל">
          <Input value={person.email} onChange={e => setPerson(listKey, index, 'email', e.target.value)} placeholder="email@example.com" type="email" className="h-11" dir="ltr" />
        </FormField>
      )}

      {person.phone !== undefined && !disabled && (
        <FormField label="טלפון">
          <Input value={person.phone} onChange={e => setPerson(listKey, index, 'phone', e.target.value)} placeholder="050-0000000" type="tel" className="h-11" dir="ltr" inputMode="tel" />
        </FormField>
      )}
    </div>
  );
}

function CountSelector({ label, value, onChange, min = 1, max = 10 }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30">
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-xl font-bold text-gray-900 w-8 text-center">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============ STEP COMPONENTS ============

function StepCompanyNames({ form, set, errors }) {
  return (
    <>
      <FormField label="שם החברה בעברית" required error={errors.companyNameHe1} hint='חייב להסתיים ב-בע"מ. נבדוק זמינות ברשם.'>
        <Input value={form.companyNameHe1} onChange={e => set('companyNameHe1', e.target.value)} placeholder='לדוגמה: אביב טכנולוגיות בע"מ' className="h-11" />
      </FormField>

      <FormField label="שם חלופי שני" hint="למקרה שהשם הראשון תפוס">
        <Input value={form.companyNameHe2} onChange={e => set('companyNameHe2', e.target.value)} placeholder="שם חלופי בעברית" className="h-11" />
      </FormField>

      <FormField label="שם חלופי שלישי">
        <Input value={form.companyNameHe3} onChange={e => set('companyNameHe3', e.target.value)} placeholder="שם חלופי נוסף" className="h-11" />
      </FormField>

      <FormField label="שם החברה באנגלית" required error={errors.companyNameEn} hint="נדרש לרשם החברות. חייב להסתיים ב-Ltd.">
        <Input value={form.companyNameEn} onChange={e => set('companyNameEn', e.target.value)} placeholder="e.g. Aviv Technologies Ltd." className="h-11" dir="ltr" />
      </FormField>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">מטרת החברה</label>
        <div className="grid grid-cols-2 gap-2">
          {COMPANY_GOALS.map(g => (
            <button key={g} type="button" onClick={() => set('companyGoal', g)} className={`px-3 py-2.5 rounded-lg border text-sm text-right transition-all ${form.companyGoal === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {g}
            </button>
          ))}
        </div>
        {form.companyGoal === 'אחר' && (
          <Input value={form.companyGoalOther} onChange={e => set('companyGoalOther', e.target.value)} placeholder="פרט את מטרת החברה" className="h-11 mt-2" />
        )}
      </div>

      <FormField label="כתובת רשומה לחברה" hint="הכתובת לקבלת דואר רשמי מרשם החברות ומרשויות המס">
        <Input value={form.registeredAddress} onChange={e => set('registeredAddress', e.target.value)} placeholder="עיר, רחוב, מספר" className="h-11" />
      </FormField>
    </>
  );
}

function StepCapital({ form, set, errors }) {
  return (
    <>
      <p className="text-sm text-gray-500">הגדרת הון המניות הרשום וסוג התקנון. לא בטוחים? השאירו את ברירת המחדל.</p>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="כמות מניות" required error={errors.shareCount}>
          <Input value={form.shareCount} onChange={e => set('shareCount', e.target.value)} placeholder="100" type="number" min="1" className="h-11" dir="ltr" inputMode="numeric" />
        </FormField>
        <FormField label="ערך נקוב (₪)">
          <Input value={form.shareParValue} onChange={e => set('shareParValue', e.target.value)} placeholder="1" type="number" min="0.01" step="0.01" className="h-11" dir="ltr" inputMode="decimal" />
        </FormField>
      </div>
      <Hint text="ברירת מחדל: 100 מניות × 1₪. מתאים לרוב החברות." />

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">סוג תקנון</label>
        <div className="space-y-2">
          {[
            { value: 'standard', label: 'תקנון מצוי (ברירת מחדל)', desc: 'מתאים לחברת יחיד או שותפים שמסכימים על הכללים הסטנדרטיים' },
            { value: 'custom', label: 'תקנון מותאם אישית', desc: 'מומלץ כשיש שותפים — כולל מנגנוני הצבעה, העברת מניות ויציאה' },
          ].map(opt => (
            <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.articlesType === opt.value ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="articlesType" checked={form.articlesType === opt.value} onChange={() => set('articlesType', opt.value)} className="mt-0.5 w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
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

function StepShareholders({ form, setPerson, setCount, set, errors }) {
  return (
    <>
      <CountSelector label="מספר בעלי מניות" value={form.shareholderCount} onChange={n => setCount('shareholders', 'shareholderCount', n)} />

      {form.shareholders.slice(0, form.shareholderCount).map((sh, i) => (
        <PersonCard key={i} title={`בעל מניות ${i + 1}`} person={sh} listKey="shareholders" index={i} setPerson={setPerson} errors={errors} nameErr={`sh_name_${i}`} idErr={`sh_id_${i}`} />
      ))}

      {form.shareholderCount > 1 && (
        <FormField label="חלוקת מניות" hint="אם לא תמלאו — המניות יחולקו שווה בשווה">
          <Input value={form.shareDistribution} onChange={e => set('shareDistribution', e.target.value)} placeholder='לדוגמה: 50%-50% או 60%-20%-20%' className="h-11" />
        </FormField>
      )}
    </>
  );
}

function StepDirectors({ form, setPerson, setCount, setDirIsSh, errors }) {
  return (
    <>
      <p className="text-sm text-gray-500">חברה חייבת לפחות דירקטור אחד. הדירקטור חייב להיות בגיר (18+).</p>

      <CountSelector label="מספר דירקטורים" value={form.directorCount} onChange={n => setCount('directors', 'directorCount', n)} />

      {form.directors.slice(0, form.directorCount).map((dir, i) => {
        const isSh = form.directorIsShareholder?.[i] || false;
        const canLink = i < form.shareholderCount && form.shareholders[i]?.fullName;
        return (
          <div key={i}>
            {canLink !== undefined && i < form.shareholderCount && (
              <label className="flex items-center gap-2 p-2.5 mb-2 bg-indigo-50 rounded-lg border border-indigo-100 cursor-pointer">
                <input type="checkbox" checked={isSh} onChange={e => setDirIsSh(i, e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                <span className="text-sm text-indigo-800">
                  דירקטור {i + 1} = בעל מניות {i + 1}
                  {form.shareholders[i]?.fullName ? ` (${form.shareholders[i].fullName})` : ''}
                </span>
              </label>
            )}
            <PersonCard
              title={`דירקטור ${i + 1}${isSh ? ' (זהה לבעל מניות)' : ''}`}
              person={dir}
              listKey="directors"
              index={i}
              setPerson={setPerson}
              errors={errors}
              nameErr={`dir_name_${i}`}
              idErr={`dir_id_${i}`}
              disabled={isSh}
            />
          </div>
        );
      })}
    </>
  );
}

function StepContact({ form, set, errors }) {
  return (
    <>
      <p className="text-sm text-gray-500">ניצור אתכם קשר לאישור פרטים, חתימה על מסמכים ועדכוני סטטוס.</p>

      <FormField label="שם מלא" required error={errors.contactName}>
        <Input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="שם מלא" className="h-11" />
      </FormField>

      <FormField label="טלפון נייד" required error={errors.contactPhone}>
        <Input value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="050-0000000" type="tel" dir="ltr" inputMode="tel" className="h-11" />
      </FormField>

      <FormField label="אימייל">
        <Input value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="email@example.com" type="email" dir="ltr" className="h-11" />
      </FormField>

      <FormField label="הערות / בקשות מיוחדות">
        <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="לוח זמנים דחוף, הסכם מייסדים, שאלות מיוחדות..." className="min-h-[80px] resize-none" />
      </FormField>

      {/* Summary */}
      <div className="bg-indigo-50 rounded-xl p-4 space-y-2 text-sm">
        <p className="font-bold text-indigo-900 mb-2">סיכום לפני תשלום:</p>
        <SummaryRow label="חברה" value={`${form.companyNameHe1} / ${form.companyNameEn}`} />
        <SummaryRow label="מטרה" value={form.companyGoal === 'אחר' ? form.companyGoalOther : form.companyGoal} />
        <SummaryRow label="הון" value={`${form.shareCount} מניות × ${form.shareParValue}₪`} />
        <SummaryRow label="תקנון" value={form.articlesType === 'custom' ? 'מותאם אישית' : 'מצוי'} />
        <SummaryRow label="בעלי מניות" value={form.shareholders.slice(0, form.shareholderCount).map(s => s.fullName).filter(Boolean).join(', ') || '—'} />
        <SummaryRow label="דירקטורים" value={form.directors.slice(0, form.directorCount).map(d => d.fullName).filter(Boolean).join(', ') || '—'} />
        {form.shareDistribution && <SummaryRow label="חלוקת %" value={form.shareDistribution} />}
        {form.registeredAddress && <SummaryRow label="כתובת" value={form.registeredAddress} />}
      </div>
    </>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-indigo-600 font-medium whitespace-nowrap min-w-[70px]">{label}:</span>
      <span className="text-indigo-900">{value}</span>
    </div>
  );
}
