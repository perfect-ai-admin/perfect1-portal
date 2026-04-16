import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, Sparkles, Bot, XCircle, AlertTriangle,
  Layers, Megaphone, DollarSign, Brain, Zap, Phone,
  Target, TrendingUp, ArrowLeft, Users, Award, Clock,
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { PORTAL_CTA } from '@/portal/config/navigation';

// ============================
// Lead Form (unchanged logic)
// ============================
function LeadForm({ id, variant = 'hero', title, subtitle, ctaText = 'לקביעת שיחה ללא עלות →', className = '' }) {
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
      {title && <h3 className="font-bold text-center mb-1 text-xl text-slate-900">{title}</h3>}
      {subtitle && <p className="text-center mb-4 text-sm text-gray-500">{subtitle}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="שם מלא"
          required
          aria-label="שם מלא"
          className="h-12 rounded-xl text-base border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 text-right"
        />
        <Input
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="טלפון נייד"
          type="tel"
          required
          dir="ltr"
          aria-label="טלפון נייד"
          className="h-12 rounded-xl text-base border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 text-right"
        />

        {error && <p className="text-red-500 text-sm text-center font-medium" role="alert">{error}</p>}

        <label className="flex items-start gap-2 cursor-pointer text-xs leading-relaxed text-gray-500">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set('consent', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 shrink-0"
          />
          <span>
            אני מאשר/ת את{' '}
            <a href="/Terms" target="_blank" className="underline hover:text-blue-600">תנאי השימוש</a>
            {' '}ו<a href="/Privacy" target="_blank" className="underline hover:text-blue-600">מדיניות הפרטיות</a>
            {' '}ומסכימ/ה לקבלת פניות.
          </span>
        </label>

        <Button
          type="submit"
          disabled={loading}
          aria-label={ctaText}
          className="w-full h-14 rounded-xl text-lg font-bold shadow-lg transition-all duration-200 hover:shadow-xl bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : ctaText}
        </Button>
      </form>

      <p className="text-xs text-center mt-3 text-gray-400">
        ללא התחייבות · נחזור אליך להסביר איך התוכנית עובדת
      </p>
    </div>
  );
}

// ============================
// CTA Button (scrolls to form)
// ============================
function CTAButton({ label = 'לקביעת שיחה ללא עלות →', className = '' }) {
  const scrollToForm = () => {
    const form = document.getElementById('main-lead-form');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <button
      onClick={scrollToForm}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 hover:shadow-lg bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg ${className}`}
    >
      {label}
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
    const form = document.getElementById('main-lead-form');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <a
            href={`tel:${PORTAL_CTA.phone}`}
            aria-label="התקשרו אלינו"
            className="flex-1 flex items-center justify-center gap-1.5 h-12 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm transition-colors hover:bg-blue-50"
          >
            <Phone className="w-4 h-4" />
            התקשרו
          </a>
          <button
            onClick={scrollToForm}
            aria-label="קביעת שיחה ללא עלות"
            className="flex-[1.4] flex items-center justify-center gap-1.5 h-12 font-bold text-sm transition-all rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            לשיחה ללא עלות →
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
// Content Data
// ============================
const RESULTS = [
  { number: '87%', label: 'השיגו לקוח ראשון תוך חודש', icon: Target },
  { number: '4', label: 'מפגשים בלבד עד מערכת שלמה', icon: Clock },
  { number: '3X', label: 'יותר פניות בממוצע אחרי 60 יום', icon: TrendingUp },
];

const PROBLEMS = [
  { text: 'אין לך מערכת שמביאה לקוחות באופן קבוע', icon: XCircle },
  { text: 'אתה לא יודע איך לתמחר את השירות שלך', icon: XCircle },
  { text: 'אין לך נוכחות דיגיטלית שעובדת בשבילך', icon: XCircle },
  { text: 'אתה מבזבז שעות על שיווק שלא מביא תוצאות', icon: XCircle },
];

const LESSONS = [
  {
    number: '01',
    icon: Bot,
    title: 'הקמת מערכת AI לעסק',
    desc: 'נקים עבורך כלי AI שיודע ליצור תוכן שיווקי, לכתוב הצעות מחיר, לענות ללקוחות וליצור מסרים שיווקיים. העסק שלך יעבוד חכם יותר.',
  },
  {
    number: '02',
    icon: Layers,
    title: 'נכסים דיגיטליים שמביאים לידים',
    desc: 'דף נחיתה מקצועי, כרטיס ביקור דיגיטלי, ומערכת פניות — נוכחות דיגיטלית שעובדת 24/7 גם כשאתה ישן.',
  },
  {
    number: '03',
    icon: Megaphone,
    title: 'מערכת שיווק אוטומטית',
    desc: 'נבנה מערכת שמאפשרת לך ליצור מודעות, לכתוב פוסטים, ולהביא לקוחות חדשים — בלי שתצטרך להיות מומחה שיווק.',
  },
  {
    number: '04',
    icon: DollarSign,
    title: 'תמחור ומודל עסקי רווחי',
    desc: 'נבנה תמחור נכון, חבילות שירות, ומודל שמאפשר לעסק להיות רווחי מהיום הראשון. בלי ניחושים.',
  },
];

const OUTCOMES = [
  { icon: Brain, text: 'מערכת AI שעובדת בשבילך' },
  { icon: Layers, text: 'נכסים דיגיטליים מקצועיים' },
  { icon: Target, text: 'מערכת להבאת לקוחות' },
  { icon: TrendingUp, text: 'מודל עסקי ותמחור ברור' },
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
      <div dir="rtl" className="min-h-screen bg-white" style={{ fontFamily: "'Heebo', sans-serif" }}>
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

        {/* ===== BRAND BAR ===== */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <span className="text-xl font-extrabold text-slate-900">פרפקט וואן</span>
            <a
              href={`tel:${PORTAL_CTA.phone}`}
              aria-label="התקשרו אלינו"
              className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{PORTAL_CTA.phone}</span>
              <span className="sm:hidden">התקשרו</span>
            </a>
          </div>
        </header>

        {/* ===== HERO — Clean, white, focused ===== */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
              <Bot className="w-4 h-4" aria-hidden="true" />
              מערכת AI לעסק · 4 מפגשים
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
              איך לבנות עסק שמביא לקוחות
              <br />
              <span className="text-blue-600">בלי להתחנן</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              ב-4 מפגשים בלבד נקים עבורך מערכת AI שלמה שמביאה לקוחות, משווקת את העסק ובונה לך נוכחות דיגיטלית מקצועית.
            </p>

            <CTAButton />

            <p className="text-sm text-gray-400 mt-4">ללא התחייבות · שיחת אבחון של 20 דקות</p>
          </div>
        </section>

        {/* ===== RESULTS — Numbers that speak ===== */}
        <section className="py-14 md:py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid sm:grid-cols-3 gap-6">
              {RESULTS.map(({ number, label, icon: Icon }, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-blue-600 mb-2">{number}</div>
                  <p className="text-gray-600 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== THE PROBLEM ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-4">
              מכירים את זה?
            </h2>
            <p className="text-center text-gray-600 text-lg mb-10">
              רוב העצמאים מתחילים עם שירות מעולה — אבל בלי מערכת שמביאה לקוחות.
            </p>

            <div className="space-y-3 max-w-xl mx-auto">
              {PROBLEMS.map(({ text, icon: Icon }, i) => (
                <div key={i} className="flex items-center gap-4 bg-red-50/50 rounded-xl p-4 border border-red-100">
                  <Icon className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                  <span className="text-slate-800 font-medium">{text}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-slate-900 font-bold text-xl mt-8">
              זה לא בגלל שאתה לא טוב. זה בגלל שחסרה לך <span className="text-blue-600">מערכת</span>.
            </p>
          </div>
        </section>

        {/* ===== CTA BREAK ===== */}
        <section className="py-10 bg-blue-600">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-white text-xl md:text-2xl font-bold mb-4">
              רוצה שנבנה לך את המערכת? שיחה של 20 דקות — בחינם.
            </p>
            <button
              onClick={() => document.getElementById('main-lead-form')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="לקביעת שיחה ללא עלות"
              className="inline-flex items-center gap-2 rounded-xl font-bold px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-50 transition-colors"
            >
              לקביעת שיחה ללא עלות →
            </button>
          </div>
        </section>

        {/* ===== THE SOLUTION — What we build ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                מה נבנה יחד ב-4 מפגשים
              </h2>
              <p className="text-gray-600 text-lg">כל מפגש = תוצר מוחשי שעובד מהיום</p>
            </div>

            <div className="space-y-6">
              {LESSONS.map(({ number, icon: Icon, title, desc }, i) => (
                <div key={i} className="flex gap-5 items-start p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
                    <Icon className="w-7 h-7 text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-600 mb-1">מפגש {number}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <CTAButton />
            </div>
          </div>
        </section>

        {/* ===== OUTCOMES ===== */}
        <section className="py-14 md:py-20 bg-slate-900">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                מה יהיה לך בסוף התוכנית
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {OUTCOMES.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-white font-bold text-lg">{text}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                כלומר — <span className="text-blue-400">עסק שמוכן לעבוד ולהרוויח</span>
              </p>
            </div>
          </div>
        </section>

        {/* ===== TRUST ===== */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-8 h-8 text-blue-600" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              תוכנית שנבנתה לעצמאים בישראל
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              התוכנית פותחה עבור עצמאים שרוצים לבנות עסק בצורה חכמה, עם כלים טכנולוגיים מתקדמים וליווי אישי צמוד. כל מפגש מותאם אישית לעסק שלך.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" aria-hidden="true" /> ליווי אישי</span>
              <span className="flex items-center gap-1"><Zap className="w-4 h-4" aria-hidden="true" /> תוצאות מיידיות</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" aria-hidden="true" /> ללא התחייבות</span>
            </div>
          </div>
        </section>

        {/* ===== FINAL FORM ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-lg mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                רוצה להתחיל?
              </h2>
              <p className="text-gray-600 text-lg">
                השאר פרטים ונחזור אליך לשיחת אבחון קצרה — בחינם וללא התחייבות.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8">
              <LeadForm
                id="main-lead-form"
                variant="final"
                ctaText="לקביעת שיחה ללא עלות →"
              />
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="py-8 bg-slate-900 text-center">
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
