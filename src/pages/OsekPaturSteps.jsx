import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Loader2, Phone, Shield, Clock, Users, Star,
  CheckCircle2, ChevronDown, ChevronUp, AlertTriangle,
  FileText, Zap, HelpCircle, X,
  UserCheck, BadgeCheck, Lightbulb, MessageCircle, Sparkles
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';

const WHATSAPP_URL = 'https://wa.me/972502277087?text=' + encodeURIComponent('היי, אשמח לשאול על פתיחת עוסק פטור');
const PHONE_NUMBER = '050-227-7087';

// ============================
// Lead Form (used in modal + inline)
// ============================
function LeadForm({ variant = 'inline', ctaText = 'פתחו לי את העוסק עכשיו', darkBg = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setError('נא למלא שם וטלפון'); return; }
    const phoneClean = form.phone.replace(/[-\s]/g, '');
    if (!/^0\d{8,9}$/.test(phoneClean)) { setError('מספר טלפון לא תקין'); return; }

    setLoading(true);
    setError('');

    try {
      await invokeFunction('submitLeadToN8N', {
        name: form.name,
        phone: form.phone,
        pageSlug: `steps-osek-patur-${variant}`,
        businessName: 'שלבי פתיחת עוסק פטור',
      });
      navigate('/ThankYou', { state: { source: `steps-osek-patur-${variant}`, name: form.name, fromForm: true } });
    } catch {
      setError('שגיאה בשליחה, נסו שוב');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = darkBg
    ? 'h-[56px] rounded-xl text-[16px] border-2 border-white/30 bg-white text-portal-navy text-right font-medium placeholder:text-gray-400'
    : 'h-[56px] rounded-xl text-[16px] border-2 border-gray-200 bg-white focus:border-green-600 text-right font-medium placeholder:text-gray-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="שם מלא"
        required
        className={inputClass}
      />
      <Input
        value={form.phone}
        onChange={(e) => set('phone', e.target.value)}
        placeholder="טלפון נייד"
        type="tel"
        required
        dir="ltr"
        className={inputClass}
      />
      {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl font-extrabold shadow-lg transition-all active:scale-[0.98] bg-green-600 hover:bg-green-700 text-white"
        style={{ height: '60px', fontSize: '17px' }}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <><CheckCircle2 className="ml-2 h-5 w-5" />{ctaText}</>
        )}
      </Button>
      <p className={`text-xs text-center ${darkBg ? 'text-white/70' : 'text-gray-500'}`}>
        ✓ ייעוץ חינם · ✓ ללא התחייבות · ✓ חזרה תוך 15 דקות
      </p>
    </form>
  );
}

// ============================
// FAQ Item
// ============================
function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 px-4 text-right hover:bg-gray-50 transition-colors min-h-[60px]"
        aria-expanded={isOpen}
      >
        <span className="text-[16px] md:text-lg font-semibold text-portal-navy pl-4 leading-snug">{question}</span>
        {isOpen
          ? <ChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {isOpen && (
        <div className="pb-5 px-4 text-gray-700 leading-[1.7] text-[15px] md:text-base">
          {answer}
        </div>
      )}
    </div>
  );
}

// ============================
// Section Wrapper
// ============================
function Section({ children, className = '', id }) {
  return (
    <section id={id} className={`py-12 md:py-20 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  );
}

// ============================
// WhatsApp CTA button (reusable)
// ============================
function WhatsAppButton({ label = 'יש לי שאלה — וואטסאפ', variant = 'secondary', className = '' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold transition-all active:scale-[0.98] w-full';
  const sizes = 'h-[56px] text-[16px] px-6';
  const styles = variant === 'primary'
    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
    : 'bg-white text-green-700 border-2 border-green-600 hover:bg-green-50';
  return (
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`${base} ${sizes} ${styles} ${className}`}>
      <MessageCircle className="w-5 h-5" />
      {label}
    </a>
  );
}

// ============================
// Main Page
// ============================
export default function OsekPaturSteps() {
  const [openFaq, setOpenFaq] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  // Show sticky bar after scrolling 400px
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 400;
      const finalCta = document.getElementById('final-cta');
      const finalCtaRect = finalCta?.getBoundingClientRect();
      const nearFinalCta = finalCtaRect && finalCtaRect.top < window.innerHeight + 200;
      setShowSticky(scrolled && !nearFinalCta);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openLeadModal = () => setModalOpen(true);

  const faqs = [
    {
      question: 'כמה עולה הליווי שלכם לפתיחת עוסק פטור?',
      answer: 'הייעוץ הראשוני חינם לגמרי וללא התחייבות. נבדוק יחד מה מתאים לכם, נציג את האופציות, ורק אם תבחרו לקבל ליווי מלא — נסביר בדיוק מה העלות ומה כלול. אין הפתעות ואין דמי רישום.',
    },
    {
      question: 'כמה זמן לוקח לפתוח עוסק פטור איתכם?',
      answer: 'עם ליווי מקצועי — בין שעה ליום עסקים אחד. רוב הרישומים מאושרים אצל מס הכנסה ומע"מ באותו יום שבו שולחים את הבקשה. תוך 24 שעות מקבלים אישור סופי.',
    },
    {
      question: 'אני יכול לפתוח לבד חינם — למה שאעבוד איתכם?',
      answer: 'בהחלט אפשר לפתוח לבד. אבל 1 מכל 3 עוסקים שפותחים לבד עושים טעות בבחירת קוד ענף, בדיווח לביטוח לאומי, או בבחירת הסטטוס — טעות שעלולה לעלות אלפי שקלים לתקן. אנחנו מוודאים שהכל מדויק מההתחלה.',
    },
    {
      question: 'אני לא מוכן עכשיו — אפשר רק לשאול שאלה?',
      answer: 'לגמרי. אפשר לדבר איתנו בוואטסאפ ללא התחייבות. נענה על כל שאלה, נסביר מה שצריך, ואם תרצו — תתקדמו. אם לא — שיהיה לכם יום נעים ובהצלחה.',
    },
    {
      question: 'מה ההבדל בין עוסק פטור לעוסק מורשה?',
      answer: 'עוסק פטור מתאים להכנסות עד כ-120,000 ₪ בשנה ולא גובה מע"מ מלקוחות. עוסק מורשה מתאים להכנסות גבוהות יותר וחייב לגבות מע"מ, להגיש דוחות תקופתיים ולנהל ספרים מסודרים. אם אתם בתחילת הדרך — כמעט תמיד כדאי להתחיל כעוסק פטור.',
    },
    {
      question: 'האם עוסק פטור משלם ביטוח לאומי?',
      answer: 'כן. עוסק פטור הוא עצמאי לכל דבר ומשלם דמי ביטוח לאומי לפי הכנסתו. יש לפתוח תיק בביטוח לאומי תוך שבוע מפתיחת העסק — וזה בדיוק אחד מהדברים שאנחנו דואגים לו כשאתם איתנו.',
    },
    {
      question: 'מה קורה אם אני חורג מתקרת ההכנסות?',
      answer: 'כשהמחזור עובר את תקרת הפטור (~120,000 ₪), חובה לעבור לעוסק מורשה תוך 30 יום. התהליך פשוט יחסית וגם בזה נעזור לכם כשהעסק יגדל.',
    },
    {
      question: 'מה קורה אחרי שהשארתי פרטים?',
      answer: 'רו״ח ממשרדנו יתקשר אליכם תוך 15 דקות (בשעות הפעילות). השיחה חינמית, ללא התחייבות. אם נמצא שזה מתאים לכם — נתאם את המשך התהליך. אם לא — נכוון אתכם לאן לפנות.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'רישום במס הכנסה ומע"מ',
      body: 'פותחים תיק עצמאי במס הכנסה ותיק במע"מ כעוסק פטור. ניתן לעשות אונליין דרך שע"מ או בסניף. אנחנו מגישים את הטפסים עבורכם בצורה מדויקת.',
      icon: FileText,
    },
    {
      num: '02',
      title: 'רישום בביטוח לאומי',
      body: 'תוך שבוע מפתיחת העסק חובה לפתוח תיק בביטוח לאומי ולהסדיר את תשלומי הדמים. שלב שרבים שוכחים — ואצלנו הוא נעשה אוטומטית.',
      icon: Shield,
    },
    {
      num: '03',
      title: 'הכנת העסק לפעולה',
      body: 'חשבון בנק עסקי (מומלץ), הפקת קבלות, מערכת ניהול קבלות ודוחות. נדריך אתכם איך לנהל נכון את השנה הראשונה שלכם כעוסק פטור.',
      icon: BadgeCheck,
    },
  ];

  const mustHave = [
    'תעודת זהות',
    'מספר חשבון בנק',
    'כתובת עסק (יכולה להיות הבית)',
    'תיאור קצר של פעילות העסק',
    'קוד ענף מתאים (אנחנו עוזרים לבחור)',
    'טופס 5329 (ממלאים ביחד)',
  ];

  const mistakes = [
    { title: 'לא לדווח לביטוח לאומי', desc: 'פותחים תיק במע"מ אבל שוכחים לעדכן את ביטוח לאומי — ונצברים קנסות מיותרים.' },
    { title: 'לא לשמור קבלות מההתחלה', desc: 'ללא קבלות אי אפשר לנכות הוצאות — משלמים יותר מס בסוף השנה ללא סיבה.' },
    { title: 'לחצות את התקרה בלי לדעת', desc: 'אנשים לא עוקבים אחרי המחזור השנתי ועוברים את תקרת הפטור מבלי להבחין.' },
    { title: 'לבחור קוד ענף שגוי', desc: 'קוד ענף לא מדויק יוצר בעיות בדיווחים שנתיים וגוררת ביקורות.' },
    { title: 'לערבב חשבון עסקי ופרטי', desc: 'ערבוב כספים מסבך את הניהול ואת הדיווח לרשויות — לפעמים בלתי הפיך.' },
  ];

  const withUs = [
    { label: 'ייעוץ ראשון חינם', detail: 'בודקים אם עוסק פטור מתאים' },
    { label: 'ליווי רו״ח מוסמך', detail: 'מקצועי ואישי, לא מוקד' },
    { label: 'רישום ב-3 רשויות', detail: 'מס הכנסה, מע״מ וביטוח לאומי' },
    { label: 'בחירת קוד ענף נכון', detail: 'חוסך תקלות בעתיד' },
    { label: 'מענה ב-WhatsApp', detail: 'גם אחרי הפתיחה' },
    { label: 'ללא התחייבות', detail: 'תשלום רק אם תבחרו להתקדם' },
  ];

  const withoutUs = [
    'תורים ארוכים במשרדי רשויות',
    'טעויות ברישום שקשה לתקן',
    'שוכחים שלבים קריטיים (ביטוח לאומי)',
    'ספק וחוסר ודאות לגבי קוד הענף',
    'קנסות ועיכובים מיותרים',
    'אף אחד לא זמין כשיש שאלה',
  ];

  return (
    <div dir="rtl" className="bg-white min-h-screen font-sans">
      <Helmet>
        <title>פתיחת עוסק פטור — ליווי מקצועי ב-24 שעות | פרפקט וואן</title>
        {/* Paid landing — fully blocked from all search engines */}
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Helmet>

      {/* ====================================================== */}
      {/* ===== HERO — Dual CTA (no form above the fold) ===== */}
      {/* ====================================================== */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #0F4C75 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #16A34A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #14B8A6 0%, transparent 50%)' }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-20 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/50 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-4 h-4 text-green-300" />
            <span className="text-green-200 text-[13px] font-bold">מעל 5,000 עצמאים | פתיחה תוך 24 שעות</span>
          </div>

          {/* H1 */}
          <h1 className="text-[30px] sm:text-[38px] md:text-5xl font-extrabold text-white leading-[1.15] mb-4">
            איך פותחים עוסק פטור —<br />
            <span className="text-green-400">מדריך 2026 + ליווי מלא</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/85 text-[16px] sm:text-lg md:text-xl leading-relaxed mb-6 max-w-2xl mx-auto">
            כל מה שצריך לדעת על פתיחת תיק במס הכנסה, מע״מ וביטוח לאומי — וגם רו״ח שעושה את כל העבודה בשבילכם, תוך יום עסקים.
          </p>

          {/* Answer block (value for ad landing, not SEO) */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-5 mb-7 text-right max-w-2xl mx-auto">
            <p className="text-white/90 text-[15px] md:text-base leading-[1.7]">
              <strong className="text-green-300">בקצרה:</strong> פתיחת עוסק פטור חינמית ונעשית אונליין תוך 10-15 דקות. דרושים ת.ז., כתובת עסק, והערכת הכנסות שנתית עד 120,000 ₪. השלבים: רישום במס הכנסה, רישום במע״מ כפטור, ופתיחת תיק בביטוח לאומי תוך שבוע.
            </p>
          </div>

          {/* Dual CTA */}
          <div className="flex flex-col gap-3 max-w-md mx-auto mb-6">
            <Button
              onClick={openLeadModal}
              className="w-full rounded-2xl font-extrabold bg-green-600 hover:bg-green-700 text-white shadow-xl transition-all active:scale-[0.98]"
              style={{ height: '60px', fontSize: '18px' }}
            >
              <CheckCircle2 className="ml-2 h-5 w-5" />
              פתחו לי עוסק פטור עכשיו
            </Button>
            <WhatsAppButton label="יש לי שאלה — וואטסאפ" variant="secondary" className="!text-white !bg-transparent !border-white hover:!bg-white/10" />
          </div>

          {/* Mini trust */}
          <div className="flex items-center justify-center gap-4 text-white/70 text-[13px]">
            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.9/5</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 5,000+ עצמאים</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 24 שעות</span>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* ===== TRUST BAR ===== */}
      {/* ====================================================== */}
      <section className="bg-green-50 border-y border-green-100 py-6 md:py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            {[
              { icon: Users, value: '5,000+', label: 'עצמאים שפתחנו' },
              { icon: Star, value: '4.9/5', label: 'דירוג ביקורות' },
              { icon: BadgeCheck, value: 'רו״ח', label: 'מוסמך ומפוקח' },
              { icon: Clock, value: '24 שעות', label: 'לפתיחה מלאה' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                <div className="font-extrabold text-portal-navy text-[17px] md:text-xl">{value}</div>
                <div className="text-gray-600 text-[12px] md:text-[13px]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* ===== 3 STEPS ===== */}
      {/* ====================================================== */}
      <Section id="steps" className="bg-white">
        <div className="text-center mb-8">
          <h2 className="text-[26px] md:text-4xl font-extrabold text-portal-navy mb-2">3 שלבים לפתיחת עוסק פטור</h2>
          <p className="text-gray-600 text-[15px] md:text-base">מה צריך לעשות — ואיך אנחנו עושים את זה עבורכם</p>
        </div>

        <div className="space-y-4">
          {steps.map(({ num, title, body, icon: Icon }) => (
            <div key={num} className="bg-white rounded-2xl p-5 md:p-7 border border-gray-200 shadow-sm flex gap-4 items-start hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-white font-extrabold text-xl md:text-2xl">{num}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <h3 className="font-bold text-portal-navy text-[18px] md:text-xl">{title}</h3>
                </div>
                <p className="text-gray-700 leading-[1.7] text-[15px] md:text-base">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Soft micro-CTA — not a form, just a link */}
        <div className="mt-8 text-center bg-green-50 rounded-2xl p-5 md:p-6 border border-green-100">
          <p className="text-portal-navy text-[15px] md:text-base mb-3">
            <strong>לא רוצים להתעסק עם זה לבד?</strong>
            <br />
            רו״ח עושה את כל 3 השלבים במקומכם — אתם רק שולחים פרטים וזהו.
          </p>
          <button
            onClick={openLeadModal}
            className="inline-flex items-center gap-2 text-green-700 font-bold text-[15px] md:text-base hover:underline"
          >
            <CheckCircle2 className="w-5 h-5" />
            כן, אני רוצה שתפתחו בשבילי
          </button>
        </div>
      </Section>

      {/* ====================================================== */}
      {/* ===== CHECKLIST — מה צריך להכין ===== */}
      {/* ====================================================== */}
      <Section className="bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-7">
            <h2 className="text-[26px] md:text-4xl font-extrabold text-portal-navy mb-2">מה צריך להכין לפני שמתחילים</h2>
            <p className="text-gray-600 text-[15px]">6 פריטים פשוטים — אין צורך במסמכים מסובכים</p>
          </div>
          <div className="bg-white rounded-2xl p-5 md:p-7 border border-gray-200 shadow-sm">
            <ul className="space-y-4">
              {mustHave.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-800 text-[16px] md:text-lg">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-5 border-t border-gray-200 bg-yellow-50 -mx-5 md:-mx-7 -mb-5 md:-mb-7 p-5 md:p-6 rounded-b-2xl">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-800 text-[14px] md:text-[15px] leading-[1.7]">
                  <strong className="text-portal-navy">טיפ חשוב:</strong> בחירת קוד הענף היא ההחלטה הכי חשובה בשלב הרישום. קוד שגוי יוצר בעיות בדיווחים ובביקורות. כשאתם איתנו — אנחנו בוחרים את הקוד המדויק ביחד איתכם.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ====================================================== */}
      {/* ===== 5 MISTAKES — FOMO block ===== */}
      {/* ====================================================== */}
      <Section className="bg-red-50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-1.5 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-[13px] font-bold">חשוב לדעת</span>
          </div>
          <h2 className="text-[26px] md:text-4xl font-extrabold text-portal-navy mb-2">5 טעויות שעולות לאנשים אלפי שקלים</h2>
          <p className="text-gray-700 text-[15px] md:text-base">כל אחת מהן מונעת בקלות — אם יודעים עליה מראש</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {mistakes.map(({ title, desc }, i) => (
            <div key={title} className="bg-white rounded-2xl p-5 md:p-6 border-2 border-red-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-extrabold">#{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-bold text-portal-navy mb-1.5 text-[16px] md:text-lg">{title}</h3>
                  <p className="text-gray-700 text-[14px] md:text-[15px] leading-[1.7]">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FORM #1 — after FOMO, highest converting placement */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-green-100 shadow-xl max-w-xl mx-auto">
          <div className="text-center mb-5">
            <h3 className="text-[22px] md:text-3xl font-extrabold text-portal-navy mb-2">לא רוצים לטעות? אנחנו נפתח עבורכם.</h3>
            <p className="text-gray-700 text-[15px] md:text-base leading-relaxed">
              רו״ח מוסמך מטפל בכל 3 השלבים. ייעוץ חינם, תשלום רק אחרי אישור התאמה.
            </p>
          </div>
          <LeadForm variant="post-mistakes" ctaText="פתחו לי את העוסק עכשיו" />
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-center text-gray-500 text-[13px] mb-3">או בוחרים לשאול קודם:</p>
            <WhatsAppButton label="שלח לנו הודעה בוואטסאפ" variant="secondary" />
          </div>
        </div>
      </Section>

      {/* ====================================================== */}
      {/* ===== COMPARISON — לבד vs איתנו ===== */}
      {/* ====================================================== */}
      <Section className="bg-white">
        <div className="text-center mb-8">
          <h2 className="text-[26px] md:text-4xl font-extrabold text-portal-navy mb-2">לפתוח לבד או עם ליווי?</h2>
          <p className="text-gray-600 text-[15px] md:text-base">השוואה כנה — תחליטו בעצמכם</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* לבד */}
          <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="font-bold text-gray-700 text-[18px] md:text-xl">פתיחה לבד</h3>
            </div>
            <ul className="space-y-3.5">
              {withoutUs.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-[14px] md:text-[15px] leading-[1.6]">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-gray-200 text-center">
              <div className="text-[13px] text-gray-500 mb-1">עלות</div>
              <div className="text-[22px] font-extrabold text-gray-700">חינם</div>
              <div className="text-[12px] text-red-500 mt-1">+ הסיכון שלכם</div>
            </div>
          </div>

          {/* איתנו */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-300 shadow-lg relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="bg-green-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                מומלץ ⭐
              </div>
            </div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-green-200">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-green-800 text-[18px] md:text-xl">עם פרפקט וואן</h3>
            </div>
            <ul className="space-y-3.5">
              {withUs.map(({ label, detail }, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-semibold text-[14px] md:text-[15px] leading-[1.5] block">{label}</span>
                    <span className="text-gray-600 text-[12px] md:text-[13px]">{detail}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-green-200 text-center">
              <div className="text-[13px] text-green-700 mb-1">ייעוץ ראשוני</div>
              <div className="text-[22px] font-extrabold text-green-800">חינם</div>
              <div className="text-[12px] text-green-600 mt-1">ללא התחייבות</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ====================================================== */}
      {/* ===== REVIEWS ===== */}
      {/* ====================================================== */}
      <Section className="bg-slate-50">
        <div className="text-center mb-8">
          <h2 className="text-[26px] md:text-4xl font-extrabold text-portal-navy mb-2">מה לקוחות אומרים עלינו</h2>
          <div className="flex items-center justify-center gap-2 text-[15px]">
            <div className="flex">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
            </div>
            <span className="text-gray-600">4.9/5 מ-150 ביקורות</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'יעל כ.', role: 'מאמנת כושר', text: 'פתחו לי תוך יום אחד, הסבירו הכל בגובה העיניים, ואני עד היום מתייעצת איתם בוואטסאפ על שאלות קטנות. חוויה נפלאה.', rating: 5 },
            { name: 'דניאל ר.', role: 'מעצב גרפי', text: 'התלבטתי אם לעשות לבד. טוב שלא — הם חסכו לי קוד ענף לא נכון שהיה עולה לי המון בקנסות. שווה כל שקל.', rating: 5 },
            { name: 'מיכל ס.', role: 'יועצת עצמאית', text: 'חיפשתי מישהו אמין שלא ידחוף לי שירותים שאני לא צריכה. פרפקט וואן בדיוק זה. ייעוץ חינם אמיתי, בלי לחץ.', rating: 5 },
          ].map((review, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-[14px] md:text-[15px] leading-[1.7] mb-4 italic">"{review.text}"</p>
              <div className="pt-3 border-t border-gray-100">
                <div className="font-bold text-portal-navy text-[14px]">{review.name}</div>
                <div className="text-gray-500 text-[12px]">{review.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ====================================================== */}
      {/* ===== FAQ ===== */}
      {/* ====================================================== */}
      <Section className="bg-white">
        <div className="text-center mb-8">
          <h2 className="text-[26px] md:text-4xl font-extrabold text-portal-navy mb-2">שאלות נפוצות</h2>
          <p className="text-gray-600 text-[15px]">תשובות ישירות לכל מה שעלול לעלות לכם לראש</p>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm max-w-2xl mx-auto">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFaq === i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </Section>

      {/* ====================================================== */}
      {/* ===== FINAL CTA ===== */}
      {/* ====================================================== */}
      <section
        id="final-cta"
        className="py-14 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F4C75 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #16A34A 0%, transparent 50%), radial-gradient(circle at 70% 30%, #14B8A6 0%, transparent 50%)' }} />
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/50 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-4 h-4 text-green-300" />
            <span className="text-green-200 text-[13px] font-bold">5,000+ עצמאים כבר נפתחו איתנו</span>
          </div>

          <h2 className="text-[28px] sm:text-[34px] md:text-5xl font-extrabold text-white mb-4 leading-[1.15]">
            מוכנים להתחיל?<br />
            <span className="text-green-400">זה לוקח לכם 10 דקות.</span>
          </h2>
          <p className="text-white/85 text-[16px] md:text-xl mb-7 leading-relaxed">
            השאירו פרטים — רו״ח יחזור אליכם תוך 15 דקות עם בדיקת התאמה חינם.
          </p>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-5 md:p-8">
            <LeadForm variant="final" ctaText="בואו נתחיל — פתחו לי" darkBg />

            <div className="mt-5 pt-5 border-t border-white/20">
              <p className="text-white/70 text-[13px] mb-3">או דברו איתנו עכשיו:</p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-[52px] rounded-xl font-bold text-[14px] bg-green-600 hover:bg-green-700 text-white transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="inline-flex items-center justify-center gap-2 h-[52px] rounded-xl font-bold text-[14px] bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-all active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4" />
                  חייגו
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6 text-white/60 text-[12px]">
            <span>✓ ללא התחייבות</span>
            <span>·</span>
            <span>✓ בדיקת התאמה חינם</span>
            <span>·</span>
            <span>✓ רו״ח מוסמך</span>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* ===== STICKY MOBILE BAR ===== */}
      {/* ====================================================== */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
          showSticky ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-2 gap-2 p-3">
          <button
            onClick={openLeadModal}
            className="inline-flex items-center justify-center gap-2 h-[52px] rounded-xl font-extrabold text-[15px] bg-green-600 hover:bg-green-700 text-white shadow-md active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            פתחו לי
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-[52px] rounded-xl font-extrabold text-[15px] bg-white text-green-700 border-2 border-green-600 active:scale-[0.98] transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            וואטסאפ
          </a>
        </div>
      </div>

      {/* Sticky bar spacer — prevents content from being hidden on mobile */}
      <div className="md:hidden h-[72px]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />

      {/* ====================================================== */}
      {/* ===== LEAD MODAL ===== */}
      {/* ====================================================== */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0" dir="rtl">
          <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-white text-[22px] font-extrabold mb-1 text-center">
                מעולה! בואו נתחיל
              </DialogTitle>
              <DialogDescription className="text-white/90 text-[14px] text-center">
                השאירו פרטים — רו״ח יחזור אליכם תוך 15 דקות
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
            <LeadForm variant="modal" ctaText="שלחו — חזרו אליי תוך 15 דקות" />
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-[12px] mb-2">מעדיפים לשאול קודם?</p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-700 font-bold text-[14px] hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                דברו איתנו בוואטסאפ
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
