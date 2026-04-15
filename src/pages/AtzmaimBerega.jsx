import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, Sparkles, Rocket, Bot, XCircle, AlertTriangle,
  Layers, Megaphone, DollarSign, Brain, ClipboardCheck, Zap, Phone,
  Target, TrendingUp, Briefcase, Wrench, ArrowLeft,
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { PORTAL_CTA } from '@/portal/config/navigation';

// ============================
// Lead Form
// ============================
function LeadForm({ id, variant = 'hero', title, subtitle, ctaText = 'אני רוצה לבנות עסק חכם', className = '' }) {
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
          style={{ height: '52px', backgroundColor: '#F59E0B', color: '#1E3A5F', fontSize: 'clamp(15px, 2vw, 19px)' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="ml-1.5 h-5 w-5" />{ctaText}</>}
        </Button>
      </form>

      <p className={`text-xs text-center mt-2 ${variant === 'hero' ? 'text-white/60' : 'text-gray-400'}`}>
        🔒 ללא התחייבות · נחזור אליך להסביר איך התוכנית עובדת
      </p>
    </div>
  );
}

// ============================
// Inline CTA Button (scrolls to nearest form)
// ============================
function InlineCTA({ label = 'אני רוצה לבנות עסק חכם' }) {
  const scrollToForm = () => {
    const form = document.getElementById('hero-lead-form-mobile') || document.getElementById('hero-lead-form');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <button
      onClick={scrollToForm}
      className="inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
      style={{
        backgroundColor: '#F59E0B',
        color: '#1E3A5F',
        padding: '16px 32px',
        fontSize: 'clamp(16px, 2.2vw, 19px)',
        minHeight: '60px',
      }}
    >
      <Sparkles className="w-5 h-5" />
      {label}
      <ArrowLeft className="w-5 h-5" />
    </button>
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
            התקשרו
          </a>
          <button
            onClick={scrollToForm}
            className="flex-[1.4] flex items-center justify-center gap-1.5 h-12 font-bold text-sm transition-all rounded-xl"
            style={{ backgroundColor: '#F59E0B', color: '#1E3A5F' }}
          >
            <Sparkles className="w-4 h-4" />
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
function LandingSchemaMarkup() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'עצמאים ברגע — תוכנית הקמת עסק חכם עם AI',
    description: 'תוכנית בת 4 מפגשים להקמת מערכת עסקית חכמה לעצמאים: מערכת AI לעסק, נכסים דיגיטליים, מערכת שיווק, תמחור ומודל עסקי.',
    provider: {
      '@type': 'Organization',
      name: 'פרפקט וואן',
      url: 'https://perfect1.co.il',
      logo: 'https://perfect1.co.il/og-image.png',
      telephone: '+972502277087',
      areaServed: { '@type': 'Country', name: 'Israel' },
    },
    serviceType: 'הקמת מערכת עסקית חכמה לעצמאים',
    areaServed: { '@type': 'Country', name: 'Israel' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: 'https://perfect1.co.il/atzmaim-berega',
      servicePhone: '+972502277087',
    },
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
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
}

// ============================
// Content
// ============================
const HERO_BULLETS = [
  'מערכת AI לעסק',
  'נכסים דיגיטליים שמביאים פניות',
  'מערכת שיווק חכמה',
  'מודל תמחור נכון ורווחי',
];

const PROBLEMS = [
  'מערכת להבאת לקוחות',
  'נכסים דיגיטליים',
  'תמחור נכון',
  'שיטה לשיווק העסק',
];

const SOLUTION_BULLETS = [
  'ליצור שיווק בעזרת AI',
  'להקים נכסים דיגיטליים',
  'לבנות הצעת שירות ברורה',
  'להביא לקוחות לעסק',
];

const LESSONS = [
  {
    number: '01',
    icon: Bot,
    title: 'הקמת מערכת AI לעסק',
    intro: 'נקים עבורך כלי AI שיודע:',
    bullets: ['ליצור תוכן שיווקי', 'לכתוב הצעות מחיר', 'לענות ללקוחות', 'ליצור מסרים שיווקיים'],
    outcome: 'כך העסק שלך עובד בצורה חכמה',
  },
  {
    number: '02',
    icon: Layers,
    title: 'הקמת נכסים דיגיטליים',
    intro: 'נקים לעסק שלך נכסים בסיסיים:',
    bullets: ['דף נחיתה שמביא לידים', 'כרטיס ביקור דיגיטלי', 'מערכת פניות מלקוחות'],
    outcome: 'נוכחות דיגיטלית מקצועית מהיום הראשון',
  },
  {
    number: '03',
    icon: Megaphone,
    title: 'מערכת שיווק עם AI',
    intro: 'נבנה מערכת שמאפשרת לך:',
    bullets: ['ליצור מודעות', 'לכתוב פוסטים', 'להביא לקוחות חדשים'],
    outcome: 'שיווק אוטומטי ועקבי',
  },
  {
    number: '04',
    icon: DollarSign,
    title: 'מודל עסקי ותמחור',
    intro: 'נבנה יחד:',
    bullets: ['תמחור נכון לשירותים', 'חבילות שירות', 'מודל שמאפשר לעסק להיות רווחי'],
    outcome: 'עסק רווחי בצורה מסודרת',
  },
];

const OUTCOMES = [
  { icon: Brain, text: 'מערכת AI לעסק' },
  { icon: Layers, text: 'נכסים דיגיטליים' },
  { icon: Target, text: 'מערכת להבאת לקוחות' },
  { icon: TrendingUp, text: 'תמחור ברור ורווחי' },
];

// ============================
// Main Page
// ============================
export default function AtzmaimBerega() {
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

  return (
    <>
      <div dir="rtl" className="portal-root min-h-screen" style={{ fontFamily: "'Heebo', sans-serif" }}>
        <Helmet>
          <title>עצמאים ברגע — הקמת עסק חכם עם מערכת AI | פרפקט וואן</title>
          <meta name="description" content="תוכנית בת 4 מפגשים להקמת מערכת עסקית חכמה עם AI: נכסים דיגיטליים, מערכת שיווק, תמחור ומודל עסקי. השאירו פרטים ונחזור אליכם." />
          <meta name="keywords" content="עצמאים ברגע, עסק עם AI, מערכת AI לעסק, הקמת עסק חכם, נכסים דיגיטליים, שיווק AI, תמחור שירותים, תוכנית עצמאים" />
          <link rel="canonical" href="https://www.perfect1.co.il/atzmaim-berega" />
          <meta property="og:title" content="עצמאים ברגע — עסק חכם בעזרת AI" />
          <meta property="og:description" content="מערכת AI להקמת עסק — 4 מפגשים, נכסים דיגיטליים, שיווק ותמחור." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.perfect1.co.il/atzmaim-berega" />
          <meta property="og:image" content="https://www.perfect1.co.il/og-image.png" />
          <meta property="og:locale" content="he_IL" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>

        <LandingSchemaMarkup />

        {/* MINIMAL BRAND BAR — no nav */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <span className="text-xl font-bold text-portal-navy">פרפקט וואן</span>
            <a
              href={`tel:${PORTAL_CTA.phone}`}
              className="flex items-center gap-2 text-portal-teal font-bold text-sm hover:underline"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{PORTAL_CTA.phone}</span>
              <span className="sm:hidden">התקשרו</span>
            </a>
          </div>
        </div>

        {/* ===== BLOCK 1 — HERO ===== */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #152D4A 50%, #0F766E 100%)' }}>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, white 2%, transparent 2%), radial-gradient(circle at 75% 75%, white 1.5%, transparent 1.5%)',
              backgroundSize: '60px 60px',
            }} />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-16">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
                  <Bot className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/90 text-sm font-medium">מערכת AI לעסק · 4 מפגשים</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                  הקם עסק חכם בעזרת AI
                  <br />
                  <span style={{ color: '#F59E0B' }}>גם אם אתה רק מתחיל</span>
                </h1>

                <p className="text-lg md:text-xl text-white/85 mb-6 leading-relaxed max-w-lg">
                  רוב העצמאים מתחילים בלי מערכת להבאת לקוחות.
                  בתוכנית "עצמאים ברגע" נקים עבורך מערכת AI שתעזור לך לבנות ולשווק את העסק בצורה חכמה.
                </p>

                {/* Mobile form */}
                <div className="md:hidden mb-6">
                  <div className="bg-white rounded-3xl shadow-2xl p-6">
                    <LeadForm
                      id="hero-lead-form-mobile"
                      variant="hero"
                      title="השאירו פרטים — נחזור תוך דקות"
                      subtitle="נסביר איך נקים עבורכם מערכת AI לעסק"
                      ctaText="אני רוצה לבנות עסק חכם"
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div className="flex flex-col gap-2">
                  {HERO_BULLETS.map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/85 text-sm md:text-base">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                      <span className="font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop form */}
              <div className="hidden md:block">
                <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto md:mx-0">
                  <LeadForm
                    id="hero-lead-form"
                    variant="hero"
                    title="השאירו פרטים — נחזור תוך דקות"
                    subtitle="נסביר איך נקים עבורכם מערכת AI לעסק"
                    ctaText="אני רוצה לבנות עסק חכם"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== BLOCK 2 — THE PROBLEM ===== */}
        <section className="py-14 md:py-20 bg-amber-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-portal-navy mb-5">
              למה הרבה עסקים חדשים נתקעים
            </h2>
            <p className="text-center text-gray-700 text-lg mb-8 leading-relaxed">
              רוב האנשים פותחים עוסק פטור, אבל מהר מאוד מגלים שאין להם:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6 max-w-2xl mx-auto">
              {PROBLEMS.map((text, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-portal-navy font-semibold">{text}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-amber-900 font-bold text-lg">
              לכן הרבה עסקים מתקשים לצמוח.
            </p>
          </div>
        </section>

        {/* ===== BLOCK 3 — THE SOLUTION ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-portal-teal/10 text-portal-teal rounded-full px-4 py-1.5 mb-5 text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              הפתרון
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-portal-navy mb-5 leading-tight">
              בדיוק בשביל זה נוצרה תוכנית
              <br />
              <span className="text-portal-teal">"עצמאים ברגע"</span>
            </h2>
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              ב-4 מפגשים בלבד נקים עבורך מערכת עסקית חכמה שמאפשרת לך:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-10 text-right">
              {SOLUTION_BULLETS.map((text, i) => (
                <div key={i} className="flex items-center gap-3 bg-gradient-to-br from-portal-teal/5 to-portal-navy/5 rounded-xl p-4 border border-portal-teal/20">
                  <div className="w-10 h-10 rounded-full bg-portal-teal flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-portal-navy font-bold">{text}</span>
                </div>
              ))}
            </div>
            <InlineCTA label="אני רוצה לבנות עסק חכם" />
          </div>
        </section>

        {/* ===== BLOCK 4 — WHAT WE BUILD ===== */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-portal-navy mb-3">מה נבנה יחד בתוכנית</h2>
              <p className="text-gray-600 text-lg">4 מפגשים · מערכת עסקית שלמה</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {LESSONS.map(({ number, icon: Icon, title, intro, bullets, outcome }, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 md:p-7 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#1E3A5F' }}>
                      <Icon className="w-7 h-7" style={{ color: '#F59E0B' }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-portal-teal mb-1">מפגש {number}</div>
                      <h3 className="text-xl font-bold text-portal-navy leading-tight">{title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm">{intro}</p>
                  <ul className="space-y-2 pr-1 mb-4">
                    {bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-portal-teal shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-portal-navy font-bold text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} />
                      {outcome}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <InlineCTA label="אני רוצה להתחיל" />
            </div>
          </div>
        </section>

        {/* ===== BLOCK 5 — THE OUTCOME ===== */}
        <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F766E 100%)' }}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                <Rocket className="w-4 h-4 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">התוצאה שלך</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">מה יהיה לך אחרי התוכנית</h2>
              <p className="text-white/80 text-lg">בסיום התוכנית יהיה לך:</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {OUTCOMES.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#F59E0B' }}>
                    <Icon className="w-6 h-6" style={{ color: '#1E3A5F' }} />
                  </div>
                  <span className="text-white font-bold text-base md:text-lg">{text}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-white text-xl md:text-2xl font-bold mb-2">
                כלומר — <span style={{ color: '#F59E0B' }}>עסק שמוכן להתחיל לעבוד</span>
              </p>
            </div>
          </div>
        </section>

        {/* ===== BLOCK 6 — FINAL CTA + FORM ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-portal-navy mb-3">
                רוצה להקים עסק חכם בעזרת AI?
              </h2>
              <p className="text-gray-600 text-lg">
                השאר פרטים ונחזור אליך להסביר איך התוכנית עובדת.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10">
              <LeadForm id="final-lead-form" variant="final" ctaText="קבע שיחה" />
            </div>
          </div>
        </section>

        {/* ===== BLOCK 7 — TRUST ===== */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-portal-teal/10 text-portal-teal rounded-full px-4 py-1.5 mb-5 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              תוכנית שנבנתה לעצמאים בישראל
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              התוכנית נבנתה עבור עצמאים בתחילת הדרך שרוצים לבנות עסק בצורה חכמה ולהשתמש בכלים טכנולוגיים מתקדמים.
            </p>
          </div>
        </section>

        {/* ===== BLOCK 8 — DISCLAIMER ===== */}
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
