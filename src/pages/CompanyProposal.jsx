import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Building2, ShieldCheck, FileSignature, BadgeCheck, Receipt,
  CheckCircle2, Sparkles, ScrollText, Briefcase,
  Loader2, Phone, Mail, User, AlertCircle, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { invokeFunction } from '@/api/supabaseClient';

const SETUP_INCLUDES = [
  'הקמת חברה בע״מ ברשם החברות',
  'בדיקת זמינות שם החברה',
  'הכנת תקנון חברה',
  'אימות חתימות ע״י עורך דין',
  'פרוטוקול מורשה חתימה',
  'הכנת פרוטוקולים ומסמכי התאגדות',
  'פתיחת תיק במס הכנסה',
  'פתיחת תיק במע״מ',
  'פתיחת תיק בביטוח לאומי',
  'ליווי אישי עד השלמת ההקמה',
];

const MONTHLY_INCLUDES = [
  'הנהלת חשבונות שוטפת לחברה',
  'עד 3 תלושי שכר בחודש',
  'ליווי יועץ אישי',
  'מענה לשאלות מס לאורך הדרך',
  'מעקב אחר דיווחים שוטפים',
  'סדר ובקרה מול הרשויות',
];

const TRUST_BAR = [
  { icon: BadgeCheck, text: 'הקמה מסודרת' },
  { icon: ShieldCheck, text: 'ליווי מקצועי' },
  { icon: FileSignature, text: 'פתיחת תיקים ברשויות' },
  { icon: Sparkles, text: 'מענה לשאלות מס' },
];

const ISRAELI_PHONE_RE = /^(?:\+?972|0)(5\d|7[2-9])\d{7}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function CompanyProposal() {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'שדה חובה';
    const phone = form.phone.replace(/[\s-()]/g, '');
    if (!phone) e.phone = 'שדה חובה';
    else if (!ISRAELI_PHONE_RE.test(phone)) e.phone = 'מספר טלפון ישראלי לא תקין';
    if (!form.email.trim()) e.email = 'שדה חובה';
    else if (!EMAIL_RE.test(form.email)) e.email = 'כתובת אימייל לא תקינה';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev?.preventDefault?.();
    if (submitting || submitted) return;
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await invokeFunction('approveCompanyProposal', {
        full_name: form.full_name.trim(),
        phone: form.phone.replace(/[\s-()]/g, ''),
        email: form.email.trim().toLowerCase(),
        approved_terms: true,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setServerError(err?.message || 'שגיאה לא צפויה — נסו שוב או צרו קשר טלפוני');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <ThankYou form={form} />;

  return (
    <>
      <Helmet>
        <title>הצעת מחיר להקמת חברה בע״מ | פרפקט וואן</title>
        <meta name="description" content="הצעת מחיר להקמת חברה בע״מ — 1,999 ₪ הקמה + 899 ₪ + מע״מ לחודש לניהול שוטף. ליווי מקצועי, פתיחת תיקים ברשויות." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="https://www.perfect1.co.il/company-proposal" />
      </Helmet>

      <div dir="rtl" className="min-h-screen bg-slate-50 pb-12" style={{ fontFamily: 'Heebo, system-ui, sans-serif' }}>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-[#0a1f3d] via-[#0f2a4a] to-[#163a6e]" />
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_25%_15%,white_1px,transparent_1px)]" style={{ backgroundSize: '22px 22px' }} />
          <div className="relative max-w-4xl mx-auto px-4 pt-14 pb-12 sm:pt-20 sm:pb-16 text-center">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-white/15 mb-5">
              <Building2 className="w-4 h-4 text-amber-400" />
              הצעת מחיר אישית
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
              הצעת מחיר להקמת חברה בע״מ
            </h1>
            <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto">
              הקמה מסודרת, ליווי מקצועי, פתיחת תיקים ברשויות — וכל האישורים הנדרשים.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 max-w-2xl mx-auto">
              {TRUST_BAR.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-white/70 text-xs sm:text-sm justify-center">
                  <t.icon className="w-4 h-4 text-amber-400/80 shrink-0" />
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="max-w-4xl mx-auto px-4 mt-6 sm:mt-8 space-y-5 sm:space-y-7">
          {/* ===== חבילות ===== */}
          <section className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            <PackageCard
              icon={Briefcase}
              tone="indigo"
              title="הקמת חברה בע״מ"
              priceMain="1,999"
              priceCurrency="₪"
              priceFootnote="תשלום חד־פעמי"
              items={SETUP_INCLUDES}
              badge="חבילה ראשונה"
            />
            <PackageCard
              icon={ScrollText}
              tone="sky"
              title="ניהול חודשי"
              priceMain="899"
              priceCurrency="₪ + מע״מ"
              priceFootnote="לחודש · התחייבות לשנה הראשונה"
              items={MONTHLY_INCLUDES}
              badge="חבילה שנייה"
            />
          </section>

          {/* ===== עלות נוספת ===== */}
          <section className="bg-white rounded-2xl border border-amber-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <h3 className="font-bold text-slate-900 text-lg">דוח שנתי לחברה</h3>
                  <span className="font-extrabold text-slate-900 text-lg whitespace-nowrap">4,000 ₪ + מע״מ</span>
                </div>
                <p className="text-amber-800 text-xs sm:text-sm mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  הדוח השנתי לחברה אינו כלול בניהול החודשי וישולם בנפרד אחת לשנה.
                </p>
              </div>
            </div>
          </section>

          {/* ===== סיכום כספי ===== */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-lg">סיכום ההצעה</h2>
            </div>
            <div className="p-5 sm:p-6 divide-y divide-slate-100">
              <SummaryLine label="הקמת חברה בע״מ" value="1,999 ₪" footnote="תשלום חד־פעמי" />
              <SummaryLine label="ניהול חודשי" value="899 ₪ + מע״מ / חודש" footnote="התחייבות לשנה ראשונה" />
              <SummaryLine label="דוח שנתי לחברה" value="4,000 ₪ + מע״מ" footnote="משולם בנפרד אחת לשנה" />
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-5 sm:px-6 py-3 text-xs text-slate-500 leading-relaxed">
              המחירים אינם כוללים אגרות ממשלתיות אלא אם צוין אחרת במפורש.
            </div>
          </section>

          {/* ===== טופס קליל ===== */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-gradient-to-bl from-emerald-600 to-emerald-700 text-white px-5 sm:px-7 py-5 text-center">
              <h2 className="font-extrabold text-xl sm:text-2xl">
                אשמח להתקדם — שלחו לי את הצעד הבא
              </h2>
              <p className="text-emerald-50/90 text-sm mt-1.5">
                השאירו שם, טלפון ומייל — ונשלח אליכם את הצעד הבא ישירות למייל.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-7 space-y-4">
              <Field label="שם מלא" error={errors.full_name} icon={User}>
                <Input
                  value={form.full_name}
                  onChange={(e) => set('full_name', e.target.value)}
                  placeholder="ישראל ישראלי"
                  className="h-12 text-base"
                  autoComplete="name"
                />
              </Field>

              <Field label="מספר טלפון" error={errors.phone} icon={Phone}>
                <Input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="050-0000000"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  className="h-12 text-base"
                />
              </Field>

              <Field label="כתובת מייל" error={errors.email} icon={Mail}>
                <Input
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  className="h-12 text-base"
                />
              </Field>

              {serverError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-14 text-base sm:text-lg font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg disabled:opacity-70 mt-2"
              >
                {submitting ? (
                  <><Loader2 className="ml-2 w-5 h-5 animate-spin" />שולח...</>
                ) : (
                  <>אשמח להתקדם — שלחו לי את הצעד הבא במייל<ArrowLeft className="mr-2 w-5 h-5" /></>
                )}
              </Button>

              <p className="text-center text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                שליחה מאובטחת · ללא חיוב בשלב זה
              </p>
            </form>
          </section>
        </main>
      </div>
    </>
  );
}

/* ============ COMPONENTS ============ */

function PackageCard({ icon: Icon, tone, title, priceMain, priceCurrency, priceFootnote, items, badge }) {
  const tones = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-100' },
    sky:    { bg: 'bg-sky-100',    text: 'text-sky-700',    border: 'border-sky-100' },
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`bg-white rounded-2xl border ${tones.border} shadow-sm overflow-hidden flex flex-col`}
    >
      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between gap-3">
        <div className={`w-11 h-11 rounded-xl ${tones.bg} ${tones.text} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[11px] font-semibold ${tones.text} ${tones.bg} px-2 py-1 rounded-full`}>{badge}</span>
      </div>
      <div className="px-5 sm:px-6 pb-5">
        <h3 className="font-bold text-slate-900 text-lg sm:text-xl">{title}</h3>
        <div className="mt-3 mb-1 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">{priceMain}</span>
          <span className="text-lg font-bold text-slate-700">{priceCurrency}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">{priceFootnote}</p>
      </div>
      <div className="border-t border-slate-100 px-5 sm:px-6 py-4 space-y-2 flex-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle2 className={`w-4 h-4 ${tones.text} shrink-0 mt-0.5`} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SummaryLine({ label, value, footnote }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div>
        <p className="font-medium text-slate-800">{label}</p>
        {footnote && <p className="text-xs text-slate-500 mt-0.5">{footnote}</p>}
      </div>
      <p className="font-bold text-slate-900 whitespace-nowrap">{value}</p>
    </div>
  );
}

function Field({ label, error, icon: Icon, children }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        {label}
      </label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

function ThankYou({ form }) {
  const firstName = (form.full_name || '').trim().split(/\s+/)[0] || '';
  return (
    <>
      <Helmet>
        <title>תודה! נשלח אליך מייל | פרפקט וואן</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-12" style={{ fontFamily: 'Heebo, system-ui, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-lg w-full bg-white rounded-2xl border border-emerald-100 shadow-lg p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            תודה{firstName ? ` ${firstName}` : ''} 🎉
          </h1>
          <p className="text-slate-600 leading-relaxed">
            קיבלנו את הפרטים — שלחנו אליך מייל עם הצעד הבא.
            <br />
            ניצור איתך קשר בקרוב.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-2 text-sm text-slate-500">
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-2 justify-center">
              <Mail className="w-4 h-4 text-slate-400" />
              <span dir="ltr">{form.email}</span>
            </div>
            {form.phone && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-2 justify-center">
                <Phone className="w-4 h-4 text-slate-400" />
                <span dir="ltr">{form.phone}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
