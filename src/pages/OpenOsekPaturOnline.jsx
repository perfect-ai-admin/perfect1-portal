import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Loader2, CheckCircle2, Shield, Clock, Upload, X, FileText, ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { invokeFunction, supabase } from '@/api/supabaseClient';

const STEPS = [
  { label: 'פרטים אישיים', num: 1 },
  { label: 'פרטי העסק', num: 2 },
  { label: 'העלאת מסמך', num: 3 },
  { label: 'תשלום', num: 4 },
];

const INCOME_OPTIONS = [
  { value: 'up-to-5000', label: 'עד 5,000 \u20AA' },
  { value: '5000-10000', label: '5,000\u201310,000 \u20AA' },
  { value: '10000-20000', label: '10,000\u201320,000 \u20AA' },
  { value: 'above-20000', label: 'מעל 20,000 \u20AA' },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function OpenOsekPaturOnline() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0); // 0=hero, 1-4=form steps, 5=thank-you
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  // Form data
  const [form, setForm] = useState({
    name: '',
    idNumber: '',
    email: '',
    businessName: '',
    income: '',
    file: null,
  });

  // URL params
  const phone = searchParams.get('phone') || '';
  const gclid = searchParams.get('gclid') || '';
  const utmSource = searchParams.get('utm_source') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const referrer = document.referrer || '';

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const goTo = (nextStep) => {
    setDir(nextStep > step ? 1 : -1);
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- Validations ----
  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'שדה חובה';
    if (!/^\d{9}$/.test(form.idNumber)) e.idNumber = 'נדרשות 9 ספרות';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'אימייל לא תקין';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.businessName.trim()) e.businessName = 'שדה חובה';
    if (!form.income) e.income = 'יש לבחור טווח הכנסה';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.file) e.file = 'יש להעלות צילום תעודת זהות';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---- File handling ----
  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'הקובץ גדול מ-5MB' }));
      return;
    }
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)) {
      setErrors(prev => ({ ...prev, file: 'נדרש קובץ JPG, PNG או PDF' }));
      return;
    }
    set('file', f);
  }, []);

  // ---- Submit ----
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Upload file to Supabase Storage
      let fileUrl = '';
      if (form.file) {
        const fileName = `${crypto.randomUUID()}_${form.file.name}`;
        const { error: uploadErr } = await supabase.storage.from('uploads').upload(fileName, form.file, {
          contentType: form.file.type,
        });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
          fileUrl = urlData.publicUrl;
        }
      }

      // Submit lead
      await invokeFunction('submitLeadToN8N', {
        name: form.name,
        phone,
        email: form.email,
        pageSlug: 'open-osek-patur-online',
        businessName: form.businessName,
        id_number: form.idNumber,
        income: form.income,
        file_url: fileUrl,
        gclid,
        utm_source: utmSource,
        utm_campaign: utmCampaign,
        referrer,
        landingUrl: window.location.href,
      });

      goTo(5);
    } catch {
      setErrors({ general: 'שגיאה בשליחה, נסו שוב' });
    } finally {
      setLoading(false);
    }
  };

  // ---- Confetti on thank-you ----
  useEffect(() => {
    if (step === 5) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

      // Tracking
      if (window.gtag) window.gtag('event', 'conversion', { send_to: 'AW-XXXXX/XXXXX', value: 299, currency: 'ILS' });
      if (window.fbq) window.fbq('track', 'Purchase', { value: 299, currency: 'ILS' });
      window.dataLayer?.push({ event: 'lead_submitted', value: 299 });
    }
  }, [step]);

  // ---- Progress ----
  const progressValue = step === 0 ? 0 : step >= 5 ? 100 : (step / 4) * 100;

  return (
    <>
      <Helmet>
        <title>פתיחת עוסק פטור אונליין | פרפקט וואן</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        {/* Progress bar - visible during form steps */}
        {step >= 1 && step <= 4 && (
          <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                {STEPS.map((s) => (
                  <span key={s.num} className={step >= s.num ? 'text-blue-600 font-semibold' : ''}>
                    {s.label}
                  </span>
                ))}
              </div>
              <Progress value={progressValue} className="h-2 [&>div]:bg-blue-600" />
            </div>
          </div>
        )}

        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="w-full max-w-md" ref={formRef}>
            <AnimatePresence mode="wait" custom={dir}>
              {/* ===== HERO (step 0) ===== */}
              {step === 0 && (
                <motion.div
                  key="hero"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="text-center space-y-6 pt-12"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    פתיחת עוסק פטור אונליין
                    <br />
                    <span className="text-blue-600">נשארו כמה פרטים קטנים</span>
                  </h1>
                  <p className="text-gray-600 text-lg">
                    זה לוקח פחות מ-2 דקות ואנחנו מתחילים לטפל עבורך מיד
                  </p>
                  <div className="flex justify-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> זמן מילוי: 2 דקות</span>
                    <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> פרטים מאובטחים</span>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => goTo(1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-blue-200 w-full sm:w-auto"
                  >
                    התחל עכשיו
                  </Button>
                </motion.div>
              )}

              {/* ===== STEP 1 — Personal details ===== */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <StepHeader title="פרטים אישיים" step={1} />

                  <FieldGroup label="שם מלא" error={errors.name}>
                    <Input
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="ישראל ישראלי"
                      className="h-12 rounded-xl text-right"
                    />
                  </FieldGroup>

                  <FieldGroup label="תעודת זהות" error={errors.idNumber}>
                    <Input
                      value={form.idNumber}
                      onChange={e => set('idNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder="9 ספרות"
                      inputMode="numeric"
                      maxLength={9}
                      className="h-12 rounded-xl text-right"
                    />
                  </FieldGroup>

                  <FieldGroup label="אימייל" error={errors.email}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="name@example.com"
                      className="h-12 rounded-xl text-left"
                      dir="ltr"
                    />
                  </FieldGroup>

                  <NavButtons onNext={() => validateStep1() && goTo(2)} />
                </motion.div>
              )}

              {/* ===== STEP 2 — Business details ===== */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <StepHeader title="פרטי העסק" step={2} />

                  <FieldGroup label="שם העסק" error={errors.businessName}>
                    <Input
                      value={form.businessName}
                      onChange={e => set('businessName', e.target.value)}
                      placeholder="שם העסק שלך"
                      className="h-12 rounded-xl text-right"
                    />
                  </FieldGroup>

                  <FieldGroup label="צפי הכנסה חודשי" error={errors.income}>
                    <Select value={form.income} onValueChange={v => set('income', v)}>
                      <SelectTrigger className="h-12 rounded-xl text-right">
                        <SelectValue placeholder="בחר טווח" />
                      </SelectTrigger>
                      <SelectContent>
                        {INCOME_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400 mt-1">רוב הלקוחות מתחילים עד 10,000 \u20AA</p>
                  </FieldGroup>

                  <NavButtons onBack={() => goTo(1)} onNext={() => validateStep2() && goTo(3)} />
                </motion.div>
              )}

              {/* ===== STEP 3 — Document upload ===== */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <StepHeader title="העלאת מסמך" step={3} />

                  <FieldGroup label="צילום תעודת זהות" error={errors.file}>
                    {!form.file ? (
                      <label
                        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition-colors bg-gray-50"
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleFileDrop}
                      >
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <span className="text-gray-600 font-medium">גרור קובץ לכאן או לחץ לבחירה</span>
                        <span className="text-xs text-gray-400 mt-1">JPG, PNG או PDF (עד 5MB)</span>
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileDrop} />
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                        <FileText className="w-6 h-6 text-green-600 shrink-0" />
                        <span className="text-sm text-green-800 flex-1 truncate">{form.file.name}</span>
                        <button onClick={() => set('file', null)} className="text-gray-400 hover:text-red-500">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">נדרש לצורך פתיחת התיק ברשויות</p>
                  </FieldGroup>

                  <NavButtons
                    onBack={() => goTo(2)}
                    onNext={() => validateStep3() && goTo(4)}
                    nextLabel="המשך לתשלום"
                  />
                </motion.div>
              )}

              {/* ===== STEP 4 — Payment ===== */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <StepHeader title="סיימנו — נשאר רק התשלום" step={4} />

                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">299 <span className="text-lg">\u20AA</span></div>
                      <p className="text-gray-500 mt-1">תשלום חד-פעמי</p>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      מיד לאחר התשלום נתחיל את פתיחת התיק עבורך
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> דוח שנתי</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> ליווי שוטף</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> אפליקציה להוצאת קבלות</li>
                    </ul>
                  </div>

                  {errors.general && <p className="text-red-500 text-sm text-center">{errors.general}</p>}

                  <NavButtons
                    onBack={() => goTo(3)}
                    onNext={handleSubmit}
                    nextLabel={loading ? '' : 'לתשלום מאובטח (299 \u20AA)'}
                    nextIcon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                    nextDisabled={loading}
                    nextClass="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                  />
                </motion.div>
              )}

              {/* ===== THANK YOU (step 5) ===== */}
              {step === 5 && (
                <motion.div
                  key="thankyou"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-6 pt-12"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">הבקשה התקבלה בהצלחה!</h2>
                  <p className="text-gray-600 text-lg">אנחנו מתחילים לעבוד על פתיחת העוסק שלך</p>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-blue-700 font-medium">נחזור אליך תוך 24 שעות עם עדכון</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

// ---- Sub-components ----

function StepHeader({ title, step }) {
  return (
    <div className="space-y-1 pb-2">
      <p className="text-xs text-blue-600 font-semibold">שלב {step} מתוך 4</p>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function FieldGroup({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = 'המשך',
  nextIcon,
  nextDisabled = false,
  nextClass = 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200',
}) {
  return (
    <div className="flex gap-3 pt-4">
      {onBack && (
        <Button variant="outline" onClick={onBack} className="rounded-xl h-12 px-4">
          <ChevronLeft className="w-4 h-4 ml-1" /> חזור
        </Button>
      )}
      <Button
        onClick={onNext}
        disabled={nextDisabled}
        className={`flex-1 h-12 rounded-xl text-white text-base font-semibold ${nextClass}`}
      >
        {nextIcon && <span className="ml-2">{nextIcon}</span>}
        {nextLabel}
      </Button>
    </div>
  );
}
