import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, Phone, Sparkles, Rocket, Target,
  Layers, Megaphone, DollarSign, Bot, ChevronDown, ChevronUp,
  Zap, ClipboardCheck, Users, Brain,
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { PORTAL_CTA } from '@/portal/config/navigation';

// ============================
// Lead Form
// ============================
function LeadForm({ id, variant = 'hero', title, subtitle, ctaText = 'אני רוצה להתחיל', className = '' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', consent: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const trackEvent = (eventName, data = {}) => {
    if (window.dataLayer) window.dataLayer.push({ event: eventName, ...data });
    if (window.fbq) {
      window.fbq('track', eventName === 'lead_submitted' ? 'Lead' : 'CustomEvent', {
        content_name: 'atzmaim_berega',
        ...data,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('נא למלא שם וטלפון');
      return;
    }
    if (!form.consent) {
      setError('יש לאשר את תנאי השימוש ומדיניות הפרטיות');
      return;
    }
    const phoneClean = form.phone.replace(/[-\s]/g, '');
    if (!/^0\d{8,9}$/.test(phoneClean)) {
      setError('מספר טלפון לא תקין');
      return;
    }

    setLoading(true);
    setError('');
    trackEvent('form_start', { form_location: variant });

    try {
      await invokeFunction('submitLeadToN8N', {
        name: form.name,
        phone: form.phone,
        pageSlug: `atzmaim-berega-${variant}`,
        businessName: `דף נחיתה - עצמאים ברגע (${variant})`,
      });
      navigate('/ThankYou', { state: { source: `atzmaim-berega-${variant}`, name: form.name, fromForm: true } });
    } catch (err) {
      setError('שגיאה בשליחה, נסו שוב או התקשרו אלינו');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id={id} className={className}>
      {title && <h3 className="font-bold text-center mb-1 text-xl text-portal-navy">{title}</h3>}
      {subtitle && <p className="text-center mb-4 text-sm text-gray-500">{subtitle}</p>}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <Input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="שם מלא"
          required
          className="h-11 sm:h-[52px] rounded-lg sm:rounded-xl text-sm sm:text-base border-gray-200 bg-white focus:border-portal-teal focus:ring-portal-teal text-right"
        />
        <Input
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="טלפון נייד"
          type="tel"
          required
          dir="ltr"
          className="h-11 sm:h-[52px] rounded-lg sm:rounded-xl text-sm sm:text-base border-gray-200 bg-white focus:border-portal-teal focus:ring-portal-teal text-right"
        />

        {error && <p className="text-red-400 text-xs sm:text-sm text-center font-medium">{error}</p>}

        <label className={`flex items-start gap-2 cursor-pointer text-xs leading-relaxed ${variant === 'hero' ? 'text-white/80' : 'text-gray-500'}`}>
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set('consent', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 shrink-0"
          />
          <span>
            אני מאשר/ת את{' '}
            <a href="/Terms" target="_blank" className="underline hover:opacity-80">תנאי השימוש</a>
            {' '}ו<a href="/Privacy" target="_blank" className="underline hover:opacity-80">מדיניות הפרטיות</a>
            {' '}ומסכימ/ה לקבלת פניות.
          </span>
        </label>

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg sm:rounded-2xl text-sm sm:text-lg font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{ height: '48px', backgroundColor: '#F59E0B', color: '#1E3A5F', fontSize: 'clamp(14px, 2vw, 18px)' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="ml-1.5 h-5 w-5" />{ctaText}</>}
        </Button>
      </form>

      <p className={`text-xs text-center mt-2 ${variant === 'hero' ? 'text-white/60' : 'text-gray-400'}`}>
        🔒 ללא התחייבות · המידע שלך מאובטח · נחזור אליך תוך דקות
      </p>
    </div>
  );
}

// ============================
// FAQ Item (reused pattern)
// ============================
function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 px-1 text-right hover:bg-gray-50/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-portal-navy pr-0 pl-4">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-portal-teal flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {isOpen && <div className="pb-5 px-1 text-gray-600 leading-relaxed text-base">{answer}</div>}
    </div>
  );
}

// ============================
// Sticky Mobile CTA
// ============================
function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    const form = document.getElementById('hero-lead-form-mobile') || document.getElementById('hero-lead-form');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <a
            href={`tel:${PORTAL_CTA.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 h-12 bg-portal-teal hover:bg-portal-teal-dark text-white rounded-xl font-bold text-sm transition-colors"
          >
            <Phone className="w-4 h-4" />
            התקשרו עכשיו
          </a>
          <button
            onClick={scrollToForm}
            className="flex-[1.3] flex items-center justify-center gap-1.5 h-12 font-bold text-sm transition-all rounded-xl"
            style={{ backgroundColor: '#F59E0B', color: '#1E3A5F' }}
          >
            <ClipboardCheck className="w-4 h-4" />
            אני רוצה להתחיל
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================
// Schema
// ============================
function LandingSchemaMarkup({ faqItems }) {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'עצמאים ברגע — תוכנית הקמת עסק חכם עם AI',
    description: 'תוכנית בת 4 מפגשים לבניית עסק עצמאי חכם: הקמת נכסים דיגיטליים, קמפיינים בעזרת AI, תמחור וניהול עסק עצמאי.',
    provider: {
      '@type': 'Organization',
      name: 'פרפקט וואן',
      url: 'https://perfect1.co.il',
      logo: 'https://perfect1.co.il/og-image.png',
      telephone: '+972502277087',
      areaServed: { '@type': 'Country', name: 'Israel' },
    },
    serviceType: 'ליווי הקמת עסק עצמאי',
    areaServed: { '@type': 'Country', name: 'Israel' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: 'https://perfect1.co.il/atzmaim-berega',
      servicePhone: '+972502277087',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'פרפקט וואן', item: 'https://perfect1.co.il' },
      { '@type': 'ListItem', position: 2, name: 'עצמאים ברגע', item: 'https://perfect1.co.il/atzmaim-berega' },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
}

// ============================
// Content
// ============================
const FAQ_ITEMS = [
  {
    question: 'מה זו תוכנית "עצמאים ברגע"?',
    answer: 'זו תוכנית קצרה בת 4 מפגשים שמלמדת אותך איך להקים עסק עצמאי חכם — כולל בניית נכסים דיגיטליים, שיווק בעזרת AI, תמחור נכון וניהול השוטף של העסק.',
  },
  {
    question: 'האם התוכנית מתאימה גם למי שעדיין לא פתח עסק?',
    answer: 'כן. התוכנית בנויה גם למי שרוצה לפתוח עוסק פטור וגם למי שכבר בתחילת הדרך. נתחיל יחד מהיסודות ונתקדם לבניית עסק שעובד.',
  },
  {
    question: 'מה הופך את התוכנית לייחודית?',
    answer: 'השילוב של כלי AI מתקדמים בתוך תהליך עסקי מסודר. במקום רק ללמד תיאוריה, אנחנו בונים יחד את הנכסים הדיגיטליים של העסק ומפעילים אותם בעזרת AI.',
  },
  {
    question: 'האם צריך ידע טכני מוקדם?',
    answer: 'לא. התוכנית מותאמת גם למי שלא עבד מעולם עם כלי AI. כל הכלים שנשתמש בהם פשוטים להפעלה ולא דורשים רקע טכני.',
  },
  {
    question: 'כמה זמן לוקחת התוכנית?',
    answer: '4 מפגשים מרוכזים שניתן לעבור במהלך מספר שבועות, בקצב שמתאים לך. אחרי התוכנית נשארים לך נכסים פעילים שאתה יכול להשתמש בהם מיד.',
  },
  {
    question: 'כמה זה עולה?',
    answer: 'השאר פרטים ונחזור אליך עם הסבר על התוכנית וההתאמה שלה עבורך. השיחה הראשונית היא ללא עלות וללא התחייבות.',
  },
];

const AUDIENCE = [
  { icon: Rocket, text: 'אנשים שרוצים לפתוח עוסק פטור' },
  { icon: Users, text: 'עצמאים בתחילת הדרך' },
  { icon: Brain, text: 'מי שרוצה להשתמש ב-AI לבניית עסק חכם' },
  { icon: Target, text: 'מי שרוצה להביא לקוחות בלי לבזבז זמן וכסף' },
];

const LESSONS = [
  {
    number: '01',
    icon: Layers,
    title: 'מפגש 1 — בניית בסיס העסק',
    bullets: ['הגדרת השירותים שלך', 'הבנת קהל היעד', 'יצירת הצעת ערך ברורה'],
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'מפגש 2 — בניית נכסים דיגיטליים',
    bullets: ['דף נחיתה לעסק', 'כרטיס ביקור דיגיטלי', 'נראות מקצועית ברשת'],
  },
  {
    number: '03',
    icon: Megaphone,
    title: 'מפגש 3 — שיווק בעזרת AI',
    bullets: ['יצירת מודעות עם AI', 'כתיבת תוכן שיווקי', 'הבאת לקוחות חדשים'],
  },
  {
    number: '04',
    icon: DollarSign,
    title: 'מפגש 4 — תמחור וצמיחה',
    bullets: ['תמחור שירותים נכון', 'הגדלת רווחיות', 'בניית בסיס יציב לעסק'],
  },
];

const AI_BENEFITS = [
  { icon: Sparkles, title: 'יצירת תוכן ושיווק', desc: 'כלי AI שכותבים לך מודעות, פוסטים ודפי נחיתה במקום שתכתוב לבד.' },
  { icon: Zap, title: 'ייעול תהליכים', desc: 'אוטומציה של משימות חוזרות — לידים, מעקבים, תזכורות ודוחות.' },
  { icon: Bot, title: 'חיסכון בזמן', desc: 'משחררים אותך מהעבודה הטכנית כדי שתתמקד בלקוחות ובצמיחה.' },
];

// ============================
// Main Page
// ============================
export default function AtzmaimBerega() {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    let tracked = {};
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      [25, 50, 75, 100].forEach((threshold) => {
        if (scrollPercent >= threshold && !tracked[threshold]) {
          tracked[threshold] = true;
          if (window.dataLayer) {
            window.dataLayer.push({ event: 'scroll_depth', scroll_percent: threshold, page: 'atzmaim_berega' });
          }
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trackClick = (ctaName) => {
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'click_cta', cta_name: ctaName, page: 'atzmaim_berega' });
    }
  };

  return (
    <>
      <div dir="rtl" className="portal-root min-h-screen" style={{ fontFamily: "'Heebo', sans-serif" }}>
        <Helmet>
          <title>עצמאים ברגע — הקמת עסק חכם עם AI | פרפקט וואן</title>
          <meta name="description" content="תוכנית בת 4 מפגשים להקמת עסק עצמאי חכם: בניית נכסים דיגיטליים, קמפיינים בעזרת AI, תמחור וניהול. השאירו פרטים — ונחזור אליכם." />
          <meta name="keywords" content="עצמאים ברגע, פתיחת עסק, עסק עם AI, תוכנית עצמאים, בניית עסק, נכסים דיגיטליים, שיווק AI, תמחור שירותים" />
          <link rel="canonical" href="https://www.perfect1.co.il/atzmaim-berega" />
          <meta property="og:title" content="עצמאים ברגע — עסק חכם בעזרת AI" />
          <meta property="og:description" content="4 מפגשים שבהם תקים עסק חכם: נכסים דיגיטליים, שיווק AI, תמחור וצמיחה." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.perfect1.co.il/atzmaim-berega" />
          <meta property="og:image" content="https://www.perfect1.co.il/og-image.png" />
          <meta property="og:locale" content="he_IL" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>

        <LandingSchemaMarkup faqItems={FAQ_ITEMS} />

        {/* HEADER */}
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-portal-navy">פרפקט וואן</span>
              <span className="text-xs text-gray-400 hidden sm:inline">| עצמאים ברגע</span>
            </div>
            <a
              href={`tel:${PORTAL_CTA.phone}`}
              onClick={() => trackClick('header_phone')}
              className="flex items-center gap-2 text-portal-teal font-bold text-sm hover:underline"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{PORTAL_CTA.phone}</span>
              <span className="sm:hidden">התקשרו</span>
            </a>
          </div>
        </header>

        {/* HERO */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #152D4A 50%, #0F766E 100%)' }}>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, white 2%, transparent 2%), radial-gradient(circle at 75% 75%, white 1.5%, transparent 1.5%)',
              backgroundSize: '60px 60px',
            }} />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-16">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
              <div className="order-1 md:order-1">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/90 text-sm font-medium">תוכנית חדשה · 4 מפגשים · מבוססת AI</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                  פותחים עסק חכם
                  <br />
                  <span style={{ color: '#F59E0B' }}>עם AI שעובד בשבילך</span>
                </h1>

                <p className="text-lg md:text-xl text-white/85 mb-6 leading-relaxed max-w-lg">
                  תוכנית קצרה של 4 מפגשים שבה תלמד להקים נכסים דיגיטליים, להביא לקוחות ולנהל את העסק שלך בעזרת כלי AI מתקדמים.
                </p>

                {/* Mobile form */}
                <div className="md:hidden mb-6">
                  <div className="bg-white rounded-3xl shadow-2xl p-6">
                    <LeadForm
                      id="hero-lead-form-mobile"
                      variant="hero"
                      title="השאירו פרטים — נחזור תוך דקות"
                      subtitle="נסביר לכם על התוכנית ונתאים אותה עבורכם"
                      ctaText="אני רוצה להתחיל"
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div className="flex flex-col gap-2 mb-6">
                  {[
                    'בניית נכסים דיגיטליים לעסק',
                    'יצירת קמפיינים בעזרת AI',
                    'תמחור נכון לשירותים',
                    'כלים שמאפשרים לנהל את העסק לבד',
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/85 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop form */}
              <div className="hidden md:block order-2">
                <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto md:mx-0">
                  <LeadForm
                    id="hero-lead-form"
                    variant="hero"
                    title="השאירו פרטים — נחזור תוך דקות"
                    subtitle="נסביר לכם על התוכנית ונתאים אותה עבורכם"
                    ctaText="אני רוצה להתחיל"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-portal-navy mb-3">למי התוכנית מתאימה</h2>
            <p className="text-center text-gray-600 mb-10 text-lg">התוכנית נבנתה לעצמאים בתחילת הדרך שרוצים עסק חכם</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {AUDIENCE.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-portal-teal/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-portal-teal" />
                  </div>
                  <span className="text-portal-navy font-semibold">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LESSONS */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-portal-navy mb-3">4 מפגשים לבניית עסק חכם</h2>
              <p className="text-gray-600 text-lg">מה תלמד בתוכנית — מפגש אחרי מפגש</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {LESSONS.map(({ number, icon: Icon, title, bullets }, i) => (
                <div key={i} className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-7 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-portal-navy flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7 text-white" style={{ color: '#F59E0B' }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-portal-teal mb-1">מפגש {number}</div>
                      <h3 className="text-xl font-bold text-portal-navy leading-tight">{title}</h3>
                    </div>
                  </div>
                  <ul className="space-y-2 pr-2">
                    {bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-portal-teal shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI BENEFITS */}
        <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F766E 100%)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">עסק חכם שעובד איתך</h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                במקום לעבוד קשה על כל דבר לבד — תלמד להשתמש בכלי AI שמייצרים לך תוכן, מייעלים תהליכים וחוסכים לך זמן יקר.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {AI_BENEFITS.map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" style={{ color: '#F59E0B' }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-white/80 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MID CTA */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-extrabold text-portal-navy mb-2">רוצה להקים עסק חכם משלך?</h2>
                <p className="text-gray-600">השאר פרטים ונחזור אליך עם הסבר על התוכנית.</p>
              </div>
              <LeadForm id="mid-lead-form" variant="mid" ctaText="קבע שיחה" />
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="py-14 md:py-18 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-portal-teal/10 text-portal-teal rounded-full px-4 py-1.5 mb-5 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              תוכנית שנבנתה לעצמאים בישראל
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-portal-navy mb-4">ניסיון עם עצמאים + כלי AI מתקדמים</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              התוכנית משלבת ניסיון מעשי בעבודה עם עצמאים יחד עם כלי הטכנולוגיה החדשים ביותר — כדי לעזור לך להתחיל את הדרך העסקית בצורה נכונה, חכמה ומהירה.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-portal-navy mb-10">שאלות נפוצות</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6">
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem
                  key={i}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFAQ === i}
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F766E 100%)' }}>
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">זה הזמן להתחיל</h2>
              <p className="text-white/85 text-lg">השאר פרטים — נחזור אליך עם הסבר על התוכנית והצעד הראשון.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
              <LeadForm id="final-lead-form" variant="final" ctaText="קבע שיחה" />
            </div>
          </div>
        </section>

        {/* DISCLAIMER */}
        <footer className="py-8 bg-portal-navy text-center">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-white/60 text-xs leading-relaxed">
              פרפקט וואן היא חברה פרטית המספקת שירותי ליווי להקמת עסק ואינה גוף ממשלתי.
            </p>
            <p className="text-white/40 text-xs mt-2">© פרפקט וואן · perfect1.co.il</p>
          </div>
        </footer>

        <StickyMobileCTA />
      </div>
    </>
  );
}
