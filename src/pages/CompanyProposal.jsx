import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Building2, ShieldCheck, FileSignature, BadgeCheck, Receipt,
  CheckCircle2, Sparkles, ScrollText, HelpCircle, Briefcase,
  Loader2, Phone, Mail, User, Hash, MessageSquare, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { invokeFunction } from '@/api/supabaseClient';

const PRICES = {
  setup: 1999,
  monthly: 899,
  annualReport: 4000,
};

const SETUP_INCLUDES = [
  'הקמת חברה בע״מ ברשם החברות',
  'טיפול בכל האישורים הנדרשים מול עורך דין',
  'הכנת פרוטוקולים ומסמכי חברה',
  'פתיחת תיק במס הכנסה',
  'פתיחת תיק במע״מ',
  'ליווי ראשוני עד השלמת ההקמה',
];

const MONTHLY_INCLUDES = [
  'הנהלת חשבונות שוטפת לחברה',
  'ליווי יועץ אישי',
  'מענה לשאלות מס לאורך הדרך',
  'מעקב אחר דיווחים שוטפים',
  'סדר ובקרה מול הרשויות',
];

const TRUST_BAR = [
  { icon: BadgeCheck, text: 'הקמה מסודרת' },
  { icon: ShieldCheck, text: 'ליווי מקצועי' },
  { icon: FileSignature, text: 'פתיחת תיקים ברשויות' },
  { icon: HelpCircle, text: 'מענה לשאלות מס' },
];

const ISRAELI_PHONE_RE = /^(?:\+?972|0)(5\d|7[2-9])\d{7}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function CompanyProposal() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    requested_company_name: '',
    id_number: '',
    notes: '',
    approved_terms: false,
  });
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
    if (!form.approved_terms) e.approved_terms = 'יש לאשר את תנאי השירות';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev?.preventDefault?.();
    if (submitting || submitted) return;
    setServerError('');
    if (!validate()) {
      const first = document.querySelector('[data-error="true"]');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    try {
      await invokeFunction('approveCompanyProposal', {
        full_name: form.full_name.trim(),
        phone: form.phone.replace(/[\s-()]/g, ''),
        email: form.email.trim().toLowerCase(),
        requested_company_name: form.requested_company_name.trim() || null,
        id_number: form.id_number.trim() || null,
        notes: form.notes.trim() || null,
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

  const monthlyAnnualWithVat = useMemo(() => Math.round(PRICES.monthly * 12 * 1.18), []);

  if (submitted) return <ThankYou form={form} />;

  return (
    <>
      <Helmet>
        <title>הצעת מחיר להקמת חברה בע״מ | פרפקט וואן</title>
        <meta name="description" content="הצעת מחיר דיגיטלית להקמת חברה בע״מ — 1,999 ₪ הקמה + 899 ₪ + מע״מ לחודש לניהול שוטף. אישור דיגיטלי, ליווי מקצועי, פתיחת תיקים ברשויות." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="https://www.perfect1.co.il/company-proposal" />
      </Helmet>

      <div dir="rtl" className="min-h-screen bg-slate-50 pb-32 sm:pb-12">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-[#0a1f3d] via-[#0f2a4a] to-[#163a6e]" />
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_25%_15%,white_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-white/15 mb-6">
              <Building2 className="w-4 h-4 text-amber-400" />
              הצעת מחיר דיגיטלית · אישור מקוון
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              הצעת מחיר להקמת חברה בע״מ
            </h1>
            <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto mb-6">
              הקמת חברה בצורה מסודרת, כולל ליווי מקצועי, פתיחת תיקים ברשויות וכל האישורים הנדרשים.
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 rounded-full px-4 py-2 text-sm">
              <ShieldCheck className="w-4 h-4" />
              כולל ליווי יועץ ומענה לכל שאלה מיסויית לאורך הדרך
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 max-w-2xl mx-auto">
              {TRUST_BAR.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-white/70 text-xs sm:text-sm justify-center">
                  <t.icon className="w-4 h-4 text-amber-400/80 shrink-0" />
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="max-w-4xl mx-auto px-4 -mt-8 sm:-mt-10 space-y-6 sm:space-y-8">
          {/* ===== חבילות ===== */}
          <section className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            <PackageCard
              icon={Briefcase}
              tone="indigo"
              title="הקמת חברה בע״מ"
              priceLabel={<>1,999 <span className="text-2xl">₪</span></>}
              priceFootnote="תשלום חד־פעמי"
              items={SETUP_INCLUDES}
              badge="חבילה ראשונה"
            />
            <PackageCard
              icon={ScrollText}
              tone="blue"
              title="ניהול חודשי"
              priceLabel={<>899 <span className="text-2xl">₪</span></>}
              priceFootnote="+ מע״מ לחודש · התחייבות לשנה הראשונה"
              items={MONTHLY_INCLUDES}
              badge="חבילה שנייה"
            />
          </section>

          {/* ===== עלות נוספת ===== */}
          <section className="bg-white rounded-2xl border border-amber-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">דוח שנתי לחברה</h3>
                <p className="text-slate-600 text-sm mt-0.5">
                  <strong className="text-slate-900">4,000 ₪ + מע״מ</strong> · משולם פעם בשנה.
                </p>
                <p className="text-amber-800 text-xs sm:text-sm mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  הדוח השנתי לחברה אינו כלול בניהול החודשי וישולם בנפרד.
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
              <SummaryLine label="ניהול חודשי" value="899 ₪ + מע״מ / חודש" footnote={`כ־${monthlyAnnualWithVat.toLocaleString('he-IL')} ₪ לשנה הראשונה`} />
              <SummaryLine label="תקופת ניהול" value="שנה ראשונה" />
              <SummaryLine label="דוח שנתי לחברה" value="4,000 ₪ + מע״מ" footnote="משולם בנפרד אחת לשנה" />
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-5 sm:px-6 py-3 text-xs text-slate-500">
              המחירים אינם כוללים אגרות ממשלתיות, אלא אם צוין אחרת במפורש.
            </div>
          </section>

          {/* ===== טופס אישור ===== */}
          <form onSubmit={handleSubmit} noValidate>
            <section className="bg-white rounded-2xl border-2 border-indigo-100 shadow-md overflow-hidden">
              <div className="bg-gradient-to-bl from-indigo-700 to-indigo-900 text-white px-5 sm:px-7 py-5">
                <h2 className="font-extrabold text-xl sm:text-2xl flex items-center gap-2">
                  <FileSignature className="w-6 h-6" />
                  אישור הצעת המחיר
                </h2>
                <p className="text-indigo-100/90 text-sm mt-2 leading-relaxed">
                  בלחיצה על אישור ההצעה אני מאשר/ת שקראתי את פרטי השירות, המחירים והתנאים,
                  ואני מעוניין/ת להתחיל בתהליך הקמת החברה והניהול החודשי.
                </p>
              </div>

              <div className="p-5 sm:p-7 space-y-4">
                <Field label="שם מלא" required error={errors.full_name} icon={User}>
                  <Input
                    value={form.full_name}
                    onChange={(e) => set('full_name', e.target.value)}
                    placeholder="ישראל ישראלי"
                    className="h-12 text-base"
                    autoComplete="name"
                    data-error={!!errors.full_name}
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="מספר טלפון" required error={errors.phone} icon={Phone}>
                    <Input
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="050-0000000"
                      type="tel"
                      dir="ltr"
                      inputMode="tel"
                      autoComplete="tel"
                      className="h-12 text-base"
                      data-error={!!errors.phone}
                    />
                  </Field>

                  <Field label="כתובת מייל" required error={errors.email} icon={Mail}>
                    <Input
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="email@example.com"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      className="h-12 text-base"
                      data-error={!!errors.email}
                    />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="שם החברה המבוקש" hint="אופציונלי" icon={Building2}>
                    <Input
                      value={form.requested_company_name}
                      onChange={(e) => set('requested_company_name', e.target.value)}
                      placeholder='לדוגמה: אביב טכנולוגיות בע"מ'
                      className="h-12 text-base"
                    />
                  </Field>

                  <Field label="תעודת זהות" hint="אופציונלי" icon={Hash}>
                    <Input
                      value={form.id_number}
                      onChange={(e) => set('id_number', e.target.value)}
                      placeholder="000000000"
                      className="h-12 text-base"
                      dir="ltr"
                      inputMode="numeric"
                    />
                  </Field>
                </div>

                <Field label="הערות" hint="אופציונלי" icon={MessageSquare}>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="לוח זמנים מועדף, שותפים, תחום פעילות, שאלות לדיון..."
                    className="min-h-[88px] resize-none text-base"
                  />
                </Field>

                {/* Checkbox */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.approved_terms
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : errors.approved_terms
                        ? 'border-red-300 bg-red-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                  }`}
                  data-error={!!errors.approved_terms}
                >
                  <input
                    type="checkbox"
                    checked={form.approved_terms}
                    onChange={(e) => set('approved_terms', e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-800 leading-relaxed">
                    אני מאשר/ת את הצעת המחיר ואת תנאי השירות.
                  </span>
                </label>
                {errors.approved_terms && (
                  <p className="text-red-600 text-xs font-medium -mt-2">{errors.approved_terms}</p>
                )}

                {/* Legal note */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[12.5px] text-slate-600 leading-relaxed">
                  ידוע לי כי אישור הצעה זו מהווה אישור להתחלת תהליך התקשרות לקבלת שירותי הקמת חברה
                  בע״מ וניהול חודשי. המחירים המפורטים בהצעה אינם כוללים מע״מ כאשר צוין &laquo;+ מע״מ&raquo;,
                  ואינם כוללים אגרות ממשלתיות או תשלומי צד ג׳ אלא אם צוין אחרת במפורש.
                </div>

                {serverError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Desktop submit */}
                <div className="hidden sm:block pt-2">
                  <SubmitButton submitting={submitting} />
                  <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    אישור דיגיטלי מאובטח · ללא חיוב בשלב זה
                  </p>
                </div>
              </div>
            </section>

            {/* ===== CTA סופי ===== */}
            <section className="hidden sm:block text-center mt-10 mb-2">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                מוכן להקים את החברה בצורה מסודרת?
              </h2>
              <p className="text-slate-600">אשר את ההצעה ונחזור אליך להמשך התהליך.</p>
            </section>

            {/* Mobile sticky submit */}
            <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(15,42,74,0.25)]">
              <SubmitButton submitting={submitting} />
            </div>
          </form>
        </main>
      </div>
    </>
  );
}

/* ============ COMPONENTS ============ */

function PackageCard({ icon: Icon, tone, title, priceLabel, priceFootnote, items, badge }) {
  const tones = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', accent: 'bg-indigo-700', border: 'border-indigo-100' },
    blue:   { bg: 'bg-sky-100',    text: 'text-sky-700',    accent: 'bg-sky-700',    border: 'border-sky-100' },
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`bg-white rounded-2xl border ${tones.border} shadow-sm overflow-hidden`}
    >
      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between gap-3">
        <div className={`w-11 h-11 rounded-xl ${tones.bg} ${tones.text} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[11px] font-semibold ${tones.text} ${tones.bg} px-2 py-1 rounded-full`}>{badge}</span>
      </div>
      <div className="px-5 sm:px-6 pb-5">
        <h3 className="font-bold text-slate-900 text-lg sm:text-xl">{title}</h3>
        <div className="mt-3 mb-1 flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">{priceLabel}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">{priceFootnote}</p>
      </div>
      <div className="border-t border-slate-100 px-5 sm:px-6 py-4 space-y-2">
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

function Field({ label, required, hint, error, icon: Icon, children }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
        {hint && <span className="text-slate-400 font-normal mr-1">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

function SubmitButton({ submitting }) {
  return (
    <Button
      type="submit"
      disabled={submitting}
      className="w-full h-14 text-base sm:text-lg font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg disabled:opacity-70"
    >
      {submitting ? (
        <><Loader2 className="ml-2 w-5 h-5 animate-spin" />שולח...</>
      ) : (
        <><CheckCircle2 className="ml-2 w-5 h-5" />מאשר/ת את ההצעה ומתחילים</>
      )}
    </Button>
  );
}

function ThankYou({ form }) {
  const firstName = (form.full_name || '').trim().split(/\s+/)[0] || '';
  return (
    <>
      <Helmet>
        <title>ההצעה אושרה בהצלחה | פרפקט וואן</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-12">
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
            כיף{firstName ? `, ${firstName}` : ''} — ההצעה אושרה בהצלחה ✅
          </h1>
          <p className="text-slate-600 leading-relaxed">
            שלחנו אליך מייל עם פרטי ההצעה.
            <br />
            ניצור איתך קשר להמשך פתיחת החברה.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-2 text-sm text-slate-500">
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-2 justify-center">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{form.email}</span>
            </div>
            {form.phone && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-2 justify-center">
                <Phone className="w-4 h-4 text-slate-400" />
                <span dir="ltr">{form.phone}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-6">סטטוס: proposal_approved</p>
        </motion.div>
      </div>
    </>
  );
}
