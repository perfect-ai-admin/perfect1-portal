import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, Shield, Clock, ChevronDown, ChevronUp,
  Calculator, FileCheck, DollarSign, Headphones, Zap, UserCheck,
  AlertTriangle, Phone, MessageCircle, Star, TrendingUp, X, Award,
  Sparkles, Gift, Landmark, Receipt, HeartHandshake,
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { motion } from 'framer-motion';
import SafeCtaBar from '@/components/cro/SafeCtaBar';
import {
  trackLeadSubmit, trackPhoneClick, trackWhatsAppClick,
  trackFormView, trackCTAClick,
} from '@/components/tracking/EventTracker';

const BUSINESS_PHONE = '0502277087';
const BUSINESS_PHONE_DISPLAY = '050-227-7087';
const WHATSAPP_URL = 'https://wa.me/972502277087?text=היי, הגעתי מהדף רואה חשבון לעוסק פטור ואשמח לקבל הצעת מחיר';
const PAGE_SLUG = 'landing-accountant-osek-patur';

// ולידציית טלפון ישראלי
const isValidIsraeliPhone = (phone) => {
  const cleaned = String(phone).replace(/[-\s]/g, '');
  return /^0[2-9]\d{7,8}$/.test(cleaned);
};

// Avatar אמיתי עם ראשי תיבות וצבע — במקום אימוג'י
const TESTIMONIAL_AVATARS = [
  { initials: 'ר.ל', bg: 'bg-amber-500', name: 'רונית' },
  { initials: 'א.כ', bg: 'bg-teal-500', name: 'אורן' },
  { initials: 'ש.ד', bg: 'bg-purple-500', name: 'שירה' },
  { initials: 'י.מ', bg: 'bg-blue-500', name: 'יואב' },
];

// ─── Urgency Bar — countdown לסוף החודש ───
const UrgencyBar = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const getEndOfMonth = () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    };

    const tick = () => {
      const diff = getEndOfMonth() - new Date();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-2 px-4 text-center text-sm font-medium sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Gift className="w-4 h-4" />
          <span className="font-bold">מבצע חודשי:</span>
          <span className="hidden sm:inline">חודש ראשון ב-</span>
          <span className="line-through opacity-60 mx-1">99 ₪</span>
          <span className="font-extrabold text-yellow-200">49 ₪</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs bg-black/20 rounded-full px-3 py-0.5">
          <Clock className="w-3 h-3" />
          <span>{pad(timeLeft.days)}:{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Savings Calculator ───
const SavingsCalculator = ({ onCTA }) => {
  const [revenue, setRevenue] = useState(120000);
  const [currentlyPaying, setCurrentlyPaying] = useState(200);
  const [showResult, setShowResult] = useState(false);

  // חישוב חיסכון משולב: מעבר לנו (49₪ חודש ראשון) + חיסכון ממוצע בניכויים
  const monthlySavingFromFees = Math.max(0, currentlyPaying - 99);
  const taxSavingEstimate = Math.round(revenue * 0.015); // כ-1.5% מהמחזור בממוצע
  const totalYearSaving = monthlySavingFromFees * 12 + taxSavingEstimate;

  const handleCalc = () => {
    setShowResult(true);
    trackCTAClick('savings-calculator', PAGE_SLUG);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 justify-center mb-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">כמה אתה יכול לחסוך בשנה?</h3>
      </div>
      <p className="text-sm text-gray-500 text-center mb-6">חישוב מהיר לפי מחזור העסק שלך</p>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">מחזור שנתי צפוי (₪)</label>
            <span className="text-lg font-bold text-teal-700">{revenue.toLocaleString('he-IL')} ₪</span>
          </div>
          <input
            type="range"
            min="30000"
            max="107692"
            step="5000"
            value={Math.min(revenue, 107692)}
            onChange={(e) => setRevenue(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>30,000</span>
            <span>107,692 (תקרת פטור)</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">כמה אתה משלם היום לרו"ח? (₪/חודש)</label>
            <span className="text-lg font-bold text-gray-700">{currentlyPaying} ₪</span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={currentlyPaying}
            onChange={(e) => setCurrentlyPaying(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 (אין)</span>
            <span>500 ₪</span>
          </div>
        </div>

        {!showResult ? (
          <Button
            onClick={handleCalc}
            className="w-full h-13 rounded-xl text-base bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg"
          >
            <Calculator className="w-5 h-5 ms-2" />
            חשבו לי את החיסכון
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-300 rounded-xl p-6 text-center"
          >
            <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">חיסכון משוער בשנה הראשונה</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-green-700 mb-1">
              עד {totalYearSaving.toLocaleString('he-IL')} ₪
            </p>
            <p className="text-xs text-gray-500 mb-4">
              (חיסכון בעמלה: {(monthlySavingFromFees * 12).toLocaleString('he-IL')} ₪ · חיסכון במס ממוצע: {taxSavingEstimate.toLocaleString('he-IL')} ₪)
            </p>
            <Button
              onClick={onCTA}
              className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow"
            >
              קבלו את ההצעה המדויקת →
            </Button>
            <p className="text-[11px] text-gray-400 mt-3">
              * הערכה בלבד. חישוב מדויק תלוי בפרטי העסק.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ─── Testimonials ───
const TESTIMONIALS = [
  {
    initials: 'ר.ל', bg: 'bg-amber-500', name: 'רונית ל.', role: 'מטפלת הוליסטית · תל אביב',
    saved: '1,840 ₪',
    quote: 'הייתי משלמת 220 ₪ לחודש לרו"ח שהתעלם ממני. עברתי אליהם, והם גילו לי ניכויים שלא ידעתי בכלל שמגיעים לי. חסכתי בשנה מעל 1,800 ₪.',
  },
  {
    initials: 'א.כ', bg: 'bg-teal-500', name: 'אורן כ.', role: 'מעצב גרפי · פרילנסר · חיפה',
    saved: '2,400 ₪',
    quote: 'פתחתי עוסק פטור לפני חודשיים בלי שמץ של מושג. הם ליוו אותי צעד אחר צעד, ענו על כל שאלה בוואטסאפ תוך דקות, וחסכו לי המון כאב ראש.',
  },
  {
    initials: 'ש.ד', bg: 'bg-purple-500', name: 'שירה ד.', role: 'מורה פרטית לאנגלית · באר שבע',
    saved: '1,200 ₪',
    quote: 'הסיוט של הדוח השנתי נגמר. הם פשוט דרשו לי 3 מסמכים בוואטסאפ והדוח היה מוכן תוך יומיים. המחיר הוגן והשירות מהיר.',
  },
];

const TestimonialCard = ({ t, i }) => (
  <FadeIn delay={i * 0.1}>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, j) => (
          <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-5 flex-grow">"{t.quote}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className={`w-11 h-11 rounded-full ${t.bg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {t.initials}
        </div>
        <div className="flex-grow min-w-0">
          <p className="font-bold text-gray-900 text-sm">{t.name}</p>
          <p className="text-gray-500 text-xs truncate">{t.role}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-2.5 py-1 shrink-0">
          <p className="text-[10px] text-green-700 leading-tight">חסכו</p>
          <p className="text-green-700 font-extrabold text-sm leading-tight">{t.saved}</p>
        </div>
      </div>
    </div>
  </FadeIn>
);

// ─── Floating WhatsApp Bubble ───
const FloatingWhatsApp = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('floating-bubble')}
      className="hidden md:flex fixed bottom-6 left-6 z-40 items-center gap-2 bg-[#25D366] hover:bg-[#1fb858] text-white font-bold px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105"
      aria-label="פתח שיחת WhatsApp"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm">שאלה? דברו איתנו</span>
    </a>
  );
};

// ─── Exit Intent Modal ───
const ExitIntentModal = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const handler = (e) => {
      if (e.clientY < 10 && !dismissed) {
        setOpen(true);
        setDismissed(true);
      }
    };
    document.addEventListener('mouseout', handler);
    // fallback למובייל — אחרי 30 שניות
    const mobileTimer = setTimeout(() => {
      if (!dismissed && window.innerWidth < 768) {
        setOpen(true);
        setDismissed(true);
      }
    }, 30000);
    return () => {
      document.removeEventListener('mouseout', handler);
      clearTimeout(mobileTimer);
    };
  }, [dismissed]);

  const handleGetGuide = async (e) => {
    e.preventDefault();
    if (!isValidIsraeliPhone(phone)) return;
    try {
      await invokeFunction('submitLeadToN8N', {
        name: 'מדריך PDF · ' + (email || 'no-email'),
        phone: phone.replace(/[-\s]/g, ''),
        pageSlug: PAGE_SLUG + '-exit-intent',
        businessName: 'Exit Intent · מדריך PDF',
      });
      trackLeadSubmit({ source_page: PAGE_SLUG + '-exit-intent', profession: 'osek_patur' });
      setSent(true);
      setTimeout(() => setOpen(false), 2500);
    } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative"
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
          aria-label="סגור"
        >
          <X className="w-5 h-5" />
        </button>

        {!sent ? (
          <>
            <div className="flex justify-center mb-3">
              <div className="bg-amber-100 p-3 rounded-full">
                <Gift className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 text-center mb-2">
              רגע! לפני שתלכו —
            </h3>
            <p className="text-gray-600 text-center mb-5 text-sm leading-relaxed">
              קבלו <span className="font-bold text-amber-600">מדריך PDF חינם:</span><br />
              "7 ניכויי המס שעוסק פטור שוכח — ואיך להחזיר אלפי שקלים"
            </p>
            <form onSubmit={handleGetGuide} className="space-y-3">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="טלפון (לשליחת המדריך ב-WhatsApp)"
                type="tel"
                required
                className="h-12 rounded-xl"
              />
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow"
              >
                שלחו לי את המדריך חינם
              </Button>
            </form>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              ללא ספאם · ללא התחייבות
            </p>
          </>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">מעולה!</h3>
            <p className="text-gray-600">המדריך בדרך אליך ב-WhatsApp תוך דקות.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const SocialProofAvatars = ({ tone = 'light' }) => {
  const textClass = tone === 'dark' ? 'text-white/60' : 'text-gray-500';
  const borderClass = tone === 'dark' ? 'border-white/40' : 'border-white';
  return (
    <div className={`flex items-center gap-3 ${textClass} text-sm justify-center md:justify-start`}>
      <div className="flex -space-x-2 rtl:space-x-reverse">
        {TESTIMONIAL_AVATARS.map((a, i) => (
          <div
            key={i}
            title={a.name}
            className={`w-8 h-8 rounded-full ${a.bg} border-2 ${borderClass} flex items-center justify-center text-[10px] font-bold text-white shadow`}
          >
            {a.initials}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-start leading-tight">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="font-semibold ms-1">4.9/5</span>
        </div>
        <span className="text-xs">מעל 2,400 עסקים שכבר חסכו איתנו</span>
      </div>
    </div>
  );
};

// ─── Fade-in on scroll ───
const FadeIn = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Lead Form Component ───
function LeadForm({ id, variant = 'hero', title, subtitle, ctaText = 'קבלו הצעת מחיר לניהול עוסק פטור' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    trackFormView(variant, PAGE_SLUG);
  }, [variant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const cleanName = form.name.trim();
    const cleanPhone = form.phone.replace(/[-\s]/g, '');

    if (!cleanName || cleanName.length < 2) {
      setError('נא למלא שם מלא');
      return;
    }
    if (!isValidIsraeliPhone(cleanPhone)) {
      setError('מספר טלפון לא תקין — פורמט: 050-1234567');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await invokeFunction('submitLeadToN8N', {
        name: cleanName,
        phone: cleanPhone,
        pageSlug: PAGE_SLUG,
        businessName: `דף נחיתה - ${PAGE_SLUG}`,
      });

      trackLeadSubmit({ source_page: PAGE_SLUG, profession: 'osek_patur' });
      navigate('/ThankYou', { state: { source: PAGE_SLUG, name: cleanName, fromForm: true } });
    } catch (err) {
      setError('שגיאה בשליחה, נסו שוב או התקשרו לוואטסאפ');
    } finally {
      setLoading(false);
    }
  };

  const isDark = variant === 'final';
  const isLight = variant === 'hero' || variant === 'mid';

  const wrapperClass = isDark
    ? 'bg-white/10 backdrop-blur-sm border border-white/20'
    : 'bg-white shadow-2xl border border-gray-100';

  const titleClass = isDark ? 'text-white' : 'text-gray-900';
  const subtitleClass = isDark ? 'text-white/70' : 'text-gray-500';
  const inputClass = isDark
    ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-green-400'
    : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500';
  const trustClass = isDark ? 'text-white/50' : 'text-gray-400';

  return (
    <div id={id} className={`rounded-2xl p-5 sm:p-7 ${wrapperClass}`}>
      {title && (
        <h3 className={`text-lg sm:text-xl font-bold mb-1 text-center ${titleClass}`}>
          {title}
        </h3>
      )}
      {subtitle && (
        <p className={`text-sm text-center mb-4 ${subtitleClass}`}>{subtitle}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <Input
          value={form.name}
          onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="שם מלא"
          required
          className={`h-11 sm:h-[52px] rounded-lg sm:rounded-xl text-sm sm:text-base ${inputClass}`}
        />
        <Input
          value={form.phone}
          onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
          placeholder="טלפון"
          type="tel"
          required
          className={`h-11 sm:h-[52px] rounded-lg sm:rounded-xl text-sm sm:text-base ${inputClass}`}
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 sm:h-14 rounded-lg sm:rounded-xl text-sm sm:text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : (
            <span className="hidden sm:inline">{ctaText}</span>
          )}
          {!loading && <span className="sm:hidden">בדוק עכשיו</span>}
        </Button>
      </form>

      {error && <p className="text-red-500 text-xs sm:text-sm text-center mt-2">{error}</p>}

      <div className={`flex items-center justify-center gap-1.5 text-[11px] mt-3 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
        <Shield className="w-3 h-3" />
        <span>תשובה ב-WhatsApp תוך 15 דקות · ללא התחייבות · ללא דיוור</span>
      </div>
    </div>
  );
}

// ─── FAQ Item ───
function FAQItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-right">
        <span className="font-medium text-gray-900 text-base">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0 mr-3" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 mr-3" />}
      </button>
      {open && <p className="pb-4 text-gray-600 text-sm leading-relaxed">{a}</p>}
    </div>
  );
}

// ─── Schema Data ───
const faqData = [
  {
    q: 'כמה עולה רואה חשבון לעוסק פטור?',
    a: 'העלות נעה בין 99-149 ₪ לחודש, תלוי בהיקף הפעילות ומספר העסקאות. ניתן לקבל הצעת מחיר מותאמת אישית.',
  },
  {
    q: 'האם עוסק פטור חייב רואה חשבון?',
    a: 'לא, אין חובה חוקית. אבל רואה חשבון יכול לחסוך לכם כסף, למנוע טעויות בדיווח ולוודא שאתם מנצלים את כל ההטבות שמגיעות לכם.',
  },
  {
    q: 'מה כולל שירות ניהול עוסק פטור?',
    a: 'השירות כולל הגשת דוח שנתי למס הכנסה, ליווי מול ביטוח לאומי, ייעוץ מס שוטף, בדיקת חובות והחזרי מס, וניהול קבלות.',
  },
  {
    q: 'כמה זמן לוקח להכין דוח שנתי?',
    a: 'דוח שנתי לעוסק פטור לוקח בדרך כלל כמה ימי עבודה. עם רואה חשבון מקצועי, התהליך פשוט ולא דורש מכם כמעט מאמץ.',
  },
  {
    q: 'האם ניתן לנהל עוסק פטור אונליין?',
    a: 'כן, רוב השירותים כיום מתבצעים אונליין — שליחת מסמכים, חתימה דיגיטלית, וקבלת ייעוץ בטלפון או בווידאו.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'רואה חשבון לעוסק פטור – כמה עולה ניהול עוסק פטור?',
  description: 'מחפשים רואה חשבון לעוסק פטור? בדיקה קצרה יכולה לחסוך מאות שקלים בשנה. קבלו הצעת מחיר לניהול עוסק פטור.',
  author: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.perfect1.co.il/accountant-osek-patur' },
  inLanguage: 'he',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'פרפקט וואן', item: 'https://www.perfect1.co.il' },
    { '@type': 'ListItem', position: 2, name: 'רואה חשבון לעוסק פטור', item: 'https://www.perfect1.co.il/accountant-osek-patur' },
  ],
};

// ─── Main Page ───
export default function AccountantLanding() {
  return (
    <>
      <div className="min-h-screen bg-white" dir="rtl">
        {/* ===== URGENCY BAR ===== */}
        <UrgencyBar />

        {/* SEO Head */}
        <Helmet>
          <title>רואה חשבון לעוסק פטור – כמה עולה ניהול עוסק פטור? | פרפקט וואן</title>
          <meta name="description" content="מחפשים רואה חשבון לעוסק פטור? בדיקה קצרה יכולה לחסוך מאות שקלים בשנה. קבלו הצעת מחיר לניהול עוסק פטור." />
          <meta name="keywords" content="רואה חשבון לעוסק פטור, כמה עולה רואה חשבון לעוסק פטור, ניהול עוסק פטור, עלות רואה חשבון לעוסק פטור" />
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href="https://www.perfect1.co.il/accountant-osek-patur" />
          <meta property="og:title" content="רואה חשבון לעוסק פטור – כמה עולה ניהול עוסק פטור? | פרפקט וואן" />
          <meta property="og:description" content="מחפשים רואה חשבון לעוסק פטור? בדיקה קצרה יכולה לחסוך מאות שקלים בשנה. קבלו הצעת מחיר לניהול עוסק פטור." />
          <meta property="og:type" content="article" />
          <meta property="og:url" content="https://www.perfect1.co.il/accountant-osek-patur" />
          <meta property="og:image" content="https://www.perfect1.co.il/og-image.png" />
          <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
          <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
          <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        </Helmet>

        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #152D4A 50%, #0F766E 100%)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 md:py-20">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Right: Text */}
              <div className="text-center md:text-right">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-5"
                >
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span className="text-white/80 text-sm">ניהול עוסק פטור מקצועי</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-5"
                >
                  <span className="text-white">רואה חשבון לעוסק פטור</span>
                  <br />
                  <span style={{ color: '#F59E0B' }}>כמה זה עולה לכם באמת?</span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <p className="text-lg md:text-xl text-white/90 mb-4 leading-relaxed max-w-lg mx-auto md:mx-0">
                    רואה חשבון החל מ-<span className="font-bold text-amber-300">99 ₪ לחודש</span> — חסוך עד <span className="font-bold text-amber-300">600 ₪ בשנה</span> על מיסים שלא ידעת שמגיעים לך.
                  </p>
                  <p className="text-base text-white/70 mb-6 max-w-lg mx-auto md:mx-0">
                    השאר פרטים · קבל הצעה מותאמת ב-WhatsApp תוך 15 דקות.
                  </p>
                </motion.div>

                {/* Quick contact — WhatsApp + phone */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-wrap gap-3 justify-center md:justify-start mb-6"
                >
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick('hero-accountant')}
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb858] text-white font-bold text-sm px-4 py-2.5 rounded-full shadow-lg transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    שלחו לנו WhatsApp
                  </a>
                  <a
                    href={`tel:${BUSINESS_PHONE}`}
                    onClick={() => trackPhoneClick('hero-accountant')}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-4 py-2.5 rounded-full border border-white/20 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    {BUSINESS_PHONE_DISPLAY}
                  </a>
                </motion.div>

                {/* Social proof — real avatars + rating */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="hidden md:flex"
                >
                  <SocialProofAvatars tone="dark" />
                </motion.div>
              </div>

              {/* Left: Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <LeadForm
                  id="hero-form"
                  variant="hero"
                  title="בדקו כמה תחסכו — בחינם"
                  subtitle="ממלא 30 שניות · תשובה מותאמת ב-WhatsApp"
                  ctaText="קבלו הצעת מחיר מותאמת"
                />

                {/* Trust badges - below form */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-wrap gap-x-5 gap-y-2 justify-center md:justify-start mt-6"
                >
                  {['בדיקה ללא התחייבות', 'מענה תוך דקות', 'הצעת מחיר חינם'].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>{text}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== TRUST AUTHORITIES BAR ===== */}
        <section className="py-6 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-center text-xs text-gray-400 uppercase tracking-wider mb-4 font-semibold">
              מייצגים את לקוחותינו מול כל הרשויות
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              {[
                { icon: Landmark, label: 'מס הכנסה' },
                { icon: Receipt, label: 'מע"מ' },
                { icon: Shield, label: 'ביטוח לאומי' },
                { icon: FileCheck, label: 'רשם החברות' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-500">
                  <item.icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SAVINGS CALCULATOR ===== */}
        <section className="py-14 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-5xl mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 rounded-full px-4 py-1.5 text-xs font-bold mb-3">
                  <Calculator className="w-3.5 h-3.5" />
                  מחשבון חיסכון אישי
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                  גלו תוך 10 שניות כמה כסף אתם משאירים על השולחן
                </h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                  בלי להשאיר פרטים — הזיזו את הסרגלים וקבלו הערכה מידית
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <SavingsCalculator
                onCTA={() => document.getElementById('mid-form')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </FadeIn>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ms-2 font-bold text-gray-900">4.9/5</span>
                  <span className="text-gray-500 text-sm">· מעל 320 ביקורות</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                  מה לקוחות מספרים אחרי שנה איתנו?
                </h2>
                <p className="text-gray-600">סיפורים אמיתיים של עצמאים שחסכו איתנו אלפי שקלים</p>
              </div>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={i} t={t} i={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICE SECTION ===== */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
                כמה עולה רואה חשבון לעוסק פטור?
              </h2>
              <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8 leading-relaxed">
                עלות רואה חשבון לעוסק פטור משתנה בהתאם להיקף הפעילות ומספר העסקאות.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 text-center">
                <p className="text-gray-500 text-sm mb-2">טווח מחירים מקובל</p>
                <p className="text-5xl sm:text-6xl font-extrabold mb-2" style={{ color: '#D97706' }}>
                  99–149 ₪
                </p>
                <p className="text-gray-500 text-base">לחודש</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3">מה כולל השירות?</h3>
                  <ul className="space-y-2">
                    {[
                      'הגשת דוח שנתי',
                      'ליווי מול מס הכנסה',
                      'ייעוץ מס שוטף',
                      'בדיקת חובות מס',
                      'ניהול קבלות',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 flex flex-col justify-center">
                  <p className="text-amber-800 font-medium text-base leading-relaxed mb-4">
                    המחיר הסופי תלוי במספר העסקאות, סוג הפעילות וצרכי העסק שלכם.
                  </p>
                  <Button
                    onClick={() => {
                      trackCTAClick('price-section-cta', 'accountant-osek-patur');
                      document.getElementById('mid-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="h-12 rounded-xl text-sm bg-green-500 hover:bg-green-600 text-white font-bold shadow"
                  >
                    בדקו כמה זה יעלה לכם
                  </Button>
                </div>
              </div>
            </FadeIn>

            {/* Lead form #2 */}
            <FadeIn delay={0.2}>
              <LeadForm
                id="mid-form"
                variant="mid"
                title="קבלו הצעת מחיר מותאמת לעסק שלכם"
                subtitle="ללא התחייבות · נחזור אליכם בהקדם"
                ctaText="קבלו הצעת מחיר עכשיו"
              />
            </FadeIn>
          </div>
        </section>

        {/* ===== IS IT REQUIRED ===== */}
        <section className="py-14 md:py-20">
          <div className="max-w-4xl mx-auto px-4">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">
                האם עוסק פטור חייב רואה חשבון?
              </h2>
              <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8 leading-relaxed">
                החוק לא מחייב, אבל רוב העצמאים משתמשים בשירות רואה חשבון כדי להימנע מטעויות מול:
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
                {['מס הכנסה', 'מע"מ', 'ביטוח לאומי'].map((item, i) => (
                  <div key={i} className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                    <span className="font-bold text-blue-800 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="flex items-start gap-3 bg-red-50 rounded-xl p-5 border border-red-100 max-w-2xl mx-auto mb-8">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="font-semibold text-red-700">שימו לב:</span> טעויות בדיווח עלולות לגרור קנסות ובעיות בעתיד.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <div className="text-center">
                <Button
                  onClick={() => {
                    trackCTAClick('required-section-cta', 'accountant-osek-patur');
                    document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-13 px-8 rounded-xl text-base bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg"
                >
                  קבלו בדיקה מהירה לניהול העסק
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== WHY USE ACCOUNTANT ===== */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                למה עצמאים עובדים עם רואה חשבון?
              </h2>
            </FadeIn>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
              {[
                {
                  icon: DollarSign,
                  title: 'חיסכון במס',
                  desc: 'ניצול מלא של הניכויים וההטבות המגיעים לכם',
                  color: 'text-green-600',
                  bg: 'bg-green-50',
                  border: 'border-green-100',
                },
                {
                  icon: FileCheck,
                  title: 'בדיקה מקצועית',
                  desc: 'בדיקה יסודית של הדוחות למניעת טעויות',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                  border: 'border-blue-100',
                },
                {
                  icon: Shield,
                  title: 'ליווי מול רשויות',
                  desc: 'ייצוג וליווי מול מס הכנסה, מע"מ וביטוח לאומי',
                  color: 'text-purple-600',
                  bg: 'bg-purple-50',
                  border: 'border-purple-100',
                },
                {
                  icon: Headphones,
                  title: 'שקט נפשי',
                  desc: 'ניהול מסודר ומקצועי של כל ענייני העסק',
                  color: 'text-amber-600',
                  bg: 'bg-amber-50',
                  border: 'border-amber-100',
                },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className={`rounded-2xl p-6 text-center shadow-sm border ${item.bg} ${item.border} h-full`}>
                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-4 border ${item.border}`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ===== GUARANTEE BADGE ===== */}
        <section className="py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <FadeIn>
              <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="shrink-0 relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow">
                      30 יום
                    </div>
                  </div>
                  <div className="flex-grow text-center sm:text-right">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2 flex items-center gap-2 justify-center sm:justify-start">
                      <HeartHandshake className="w-5 h-5 text-emerald-600" />
                      אחריות מלאה 30 יום — או החזר כספי
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      נותנים לכם חודש שלם לבחון את השירות. אם לא מרוצים מכל סיבה — מחזירים כל שקל ששולם, ללא שאלות, ללא בירוקרטיה.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== TRUST SECTION ===== */}
        <section className="py-14 md:py-20">
          <div className="max-w-4xl mx-auto px-4">
            <FadeIn>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: Shield, title: 'בדיקה ללא התחייבות', desc: 'חינם, בלי הפתעות' },
                  { icon: UserCheck, title: 'התאמה אישית', desc: 'פתרון שמתאים לעסק שלך' },
                  { icon: Zap, title: 'מענה מהיר', desc: 'חוזרים אליכם בהקדם' },
                  { icon: FileCheck, title: 'ליווי מקצועי', desc: 'מומחים שמכירים כל פרט' },
                ].map((item, i) => (
                  <FadeIn key={i} delay={i * 0.08}>
                    <div className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100 h-full">
                      <item.icon className="w-9 h-9 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-center text-gray-400 text-xs">
                כל הפרטים נשמרים בצורה מאובטחת ולא מועברים לגורם שלישי.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
                שאלות נפוצות
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                {faqData.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} defaultOpen={i === 0} />
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #152D4A 50%, #0F766E 100%)' }}>
          <div className="max-w-lg mx-auto px-4">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white text-center mb-3">
                רוצים לדעת כמה יעלה לכם רואה חשבון?
              </h2>
              <p className="text-white/80 text-center mb-8 text-lg">
                השאירו פרטים ונחזור אליכם עם הצעת מחיר לניהול עוסק פטור.
              </p>

              <LeadForm
                id="final-form"
                variant="final"
                title="השאירו פרטים — נחסוך לכם כסף"
                subtitle="תשובה ב-WhatsApp תוך 15 דקות · ללא התחייבות"
                ctaText="קבלו הצעת מחיר עכשיו"
              />

              {/* Social proof */}
              <div className="hidden sm:flex justify-center mt-6">
                <SocialProofAvatars tone="dark" />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== STICKY MOBILE CTA ===== */}
        <SafeCtaBar sourcePage="accountant-osek-patur" />

        {/* ===== FLOATING WHATSAPP (DESKTOP) ===== */}
        <FloatingWhatsApp />

        {/* ===== FOOTER ===== */}
        <footer className="bg-portal-navy text-white/60 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm space-y-3">
            <p>© {new Date().getFullYear()} פרפקט וואן — ליווי עסקי מקצועי</p>
            <div className="border-t border-white/10 pt-3 text-white/40 text-xs leading-relaxed max-w-2xl mx-auto">
              <p>האתר מופעל על ידי חברה פרטית. אינו אתר ממשלתי.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
