import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { HelmetProvider } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, Phone, ChevronDown, ChevronUp,
  Shield, FileCheck, Headphones, Zap, Star,
  ClipboardCheck, AlertTriangle, Users, Clock
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { PORTAL_CTA } from '@/portal/config/navigation';

// ============================
// Lead Form (Short: name + phone)
// ============================
function LeadForm({ id, variant = 'hero', ctaText = 'קבלו ליווי לפתיחת עוסק פטור', className = '' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const trackEvent = (eventName, data = {}) => {
    if (window.dataLayer) {
      window.dataLayer.push({ event: eventName, ...data });
    }
    if (window.fbq) {
      window.fbq('track', eventName === 'lead_submitted' ? 'Lead' : 'CustomEvent', {
        content_name: 'open_osek_patur',
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
        pageSlug: `open-osek-patur-${variant}`,
        businessName: `דף נחיתה - open-osek-patur-${variant}`,
      });

      navigate('/ThankYou', { state: { source: `open-osek-patur-${variant}`, name: form.name, fromForm: true } });
    } catch (err) {
      setError('שגיאה בשליחה, נסו שוב או התקשרו אלינו');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id={id} className={className}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="שם מלא"
          required
          className="h-[52px] rounded-xl text-base border-gray-200 bg-white focus:border-portal-teal focus:ring-portal-teal text-right"
        />
        <Input
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="טלפון נייד"
          type="tel"
          required
          dir="ltr"
          className="h-[52px] rounded-xl text-base border-gray-200 bg-white focus:border-portal-teal focus:ring-portal-teal text-right"
        />

        {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: '#F59E0B', color: '#1E3A5F', fontSize: '18px' }}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Phone className="ml-2 h-5 w-5" />
              {ctaText}
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-center mt-2.5 text-gray-400">
        ללא התחייבות · המידע שלך מאובטח · נחזור אליך בהקדם
      </p>
    </div>
  );
}

// ============================
// FAQ Accordion
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
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-portal-teal flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-5 px-1 text-gray-600 leading-relaxed text-base">
          {answer}
        </div>
      )}
    </div>
  );
}

// ============================
// Sticky Mobile CTA
// ============================
function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    const el = document.getElementById('hero-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <a
            href={`tel:${PORTAL_CTA.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 h-12 bg-portal-teal text-white rounded-xl font-bold text-sm transition-colors"
          >
            <Phone className="w-4 h-4" />
            התקשרו עכשיו
          </a>
          <button
            onClick={scrollToForm}
            className="flex-[1.3] flex items-center justify-center gap-1.5 h-12 font-bold text-sm rounded-xl"
            style={{ backgroundColor: '#F59E0B', color: '#1E3A5F' }}
          >
            <ClipboardCheck className="w-4 h-4" />
            השאירו פרטים
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================
// Schema Markup
// ============================
function SchemaMarkup({ faqItems }) {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'פתיחת עוסק פטור בליווי מקצועי',
    description: 'ליווי מקצועי לפתיחת עוסק פטור בישראל — בדיקת התאמה, הכוונה למסמכים, וליווי בתהליך מול הרשויות.',
    provider: {
      '@type': 'Organization',
      name: 'פרפקט וואן',
      url: 'https://perfect1.co.il',
      logo: 'https://perfect1.co.il/og-image.png',
      telephone: '+972502277087',
      areaServed: { '@type': 'Country', name: 'Israel' },
    },
    serviceType: 'פתיחת עוסק פטור',
    areaServed: { '@type': 'Country', name: 'Israel' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: 'https://perfect1.co.il/open-osek-patur',
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
      { '@type': 'ListItem', position: 2, name: 'פתיחת עוסק פטור', item: 'https://perfect1.co.il/open-osek-patur' },
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
// FAQ Data
// ============================
const FAQ_ITEMS = [
  {
    question: 'איך פותחים עוסק פטור?',
    answer: 'פתיחת עוסק פטור כוללת פתיחת תיקים במס הכנסה, במע"מ ובביטוח לאומי. עם ליווי מקצועי, אנחנו מכוונים אתכם בכל שלב כדי שהתהליך יעבור בצורה חלקה ונכונה.',
  },
  {
    question: 'כמה זמן לוקח לפתוח עוסק פטור?',
    answer: 'התהליך יכול להיגמר תוך מספר ימי עסקים. עם הכוונה מקצועית, הכל מתבצע מהר יותר ובלי עיכובים מיותרים.',
  },
  {
    question: 'כמה עולה לפתוח עוסק פטור?',
    answer: 'פתיחת התיקים עצמה אינה כרוכה בתשלום לרשויות. עלות הליווי המקצועי תלויה במצב שלכם — השאירו פרטים ונתאים הצעה. הבדיקה הראשונית בחינם.',
  },
  {
    question: 'האם צריך רואה חשבון לעוסק פטור?',
    answer: 'עוסק פטור לא חייב רואה חשבון מבחינת החוק, אבל ליווי מקצועי חוסך טעויות ומוודא שאתם עומדים בכל הדרישות מההתחלה.',
  },
  {
    question: 'מה ההבדל בין עוסק פטור למורשה?',
    answer: 'עוסק פטור פטור מגביית מע"מ ומתאים להכנסה שנתית עד 120,000 ₪. עוסק מורשה גובה מע"מ, יכול לקזז מע"מ על הוצאות, ואין מגבלת הכנסות. אנחנו נבדוק מה מתאים לכם.',
  },
];

// ============================
// Main Page Component
// ============================
export default function OpenOsekPatur() {
  const [openFAQ, setOpenFAQ] = useState(null);

  // Scroll depth tracking
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
            window.dataLayer.push({ event: 'scroll_depth', scroll_percent: threshold, page: 'open_osek_patur' });
          }
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <HelmetProvider>
      <div dir="rtl" className="portal-root min-h-screen bg-white" style={{ fontFamily: "'Heebo', sans-serif" }}>
        {/* SEO Head */}
        <Helmet>
          <title>פתיחת עוסק פטור בישראל – בליווי מקצועי | פרפקט וואן</title>
          <meta name="description" content="בדקו האם עוסק פטור מתאים לכם וקבלו הכוונה מקצועית בתהליך פתיחת העסק מול הרשויות. ליווי צמוד, חיסכון בזמן, בלי בירוקרטיה." />
          <meta name="keywords" content="פתיחת עוסק פטור, עוסק פטור בישראל, פתיחת עסק, ליווי מקצועי עוסק פטור, פתיחת תיק עוסק פטור" />
          <link rel="canonical" href="https://www.perfect1.co.il/open-osek-patur" />
          <meta property="og:title" content="פתיחת עוסק פטור בישראל – בליווי מקצועי" />
          <meta property="og:description" content="בדקו התאמה וקבלו הכוונה מקצועית לפתיחת עוסק פטור. ליווי צמוד מול הרשויות, בלי בירוקרטיה." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.perfect1.co.il/open-osek-patur" />
          <meta property="og:image" content="https://www.perfect1.co.il/og-image.png" />
          <meta property="og:locale" content="he_IL" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="robots" content="index, follow" />
        </Helmet>

        <SchemaMarkup faqItems={FAQ_ITEMS} />

        {/* ===== MINIMAL HEADER ===== */}
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
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
        </header>

        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #152D4A 50%, #0F766E 100%)' }}>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, white 2%, transparent 2%), radial-gradient(circle at 75% 75%, white 1.5%, transparent 1.5%)',
              backgroundSize: '60px 60px',
            }} />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-16">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Content */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-white leading-tight mb-5">
                  פתיחת עוסק פטור בישראל
                  <br />
                  <span style={{ color: '#F59E0B' }}>בליווי מקצועי</span>
                </h1>

                <p className="text-lg text-white/85 mb-6 leading-relaxed max-w-lg">
                  בדקו האם עוסק פטור מתאים לכם וקבלו הכוונה בתהליך פתיחת העסק מול הרשויות.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    'ליווי בתהליך פתיחת העסק',
                    'הכוונה מול מע״מ, מס הכנסה וביטוח לאומי',
                    'תהליך ברור ופשוט',
                    'חיסכון בזמן ובבירוקרטיה',
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/90">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-base font-medium">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-3 text-white/70 text-sm">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span>מעל 5,000 עצמאים כבר פתחו איתנו עסק</span>
                </div>

                {/* Mobile: Form */}
                <div className="md:hidden mt-8">
                  <div className="bg-white rounded-3xl shadow-2xl p-6">
                    <h3 className="font-bold text-center text-lg text-portal-navy mb-1">השאירו פרטים</h3>
                    <p className="text-center text-sm text-gray-500 mb-4">נחזור אליכם בהקדם</p>
                    <LeadForm id="hero-form-mobile" variant="hero" />
                  </div>
                </div>
              </div>

              {/* Desktop: Form */}
              <div className="hidden md:block">
                <div className="bg-white rounded-3xl shadow-2xl p-7 max-w-md mx-auto">
                  <h3 className="font-bold text-center text-xl text-portal-navy mb-1">השאירו פרטים</h3>
                  <p className="text-center text-sm text-gray-500 mb-5">נחזור אליכם בהקדם</p>
                  <LeadForm id="hero-form" variant="hero" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-portal-navy text-center mb-10">
              כך נראה תהליך פתיחת עוסק פטור
            </h2>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  num: '1',
                  title: 'בדיקה ראשונית',
                  desc: 'בדיקה ראשונית של הפעילות העסקית שלכם',
                  icon: FileCheck,
                  color: 'bg-portal-teal',
                },
                {
                  num: '2',
                  title: 'הכוונה בתהליך',
                  desc: 'הכוונה בתהליך פתיחת התיקים מול הרשויות',
                  icon: Headphones,
                  color: 'bg-portal-navy',
                },
                {
                  num: '3',
                  title: 'התחלת פעילות',
                  desc: 'התחלת פעילות עסקית בצורה מסודרת',
                  icon: Zap,
                  color: 'bg-amber-500',
                },
              ].map((step, i) => (
                <div key={i} className="text-center bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className={`w-14 h-14 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4`}>
                    {step.num}
                  </div>
                  <h3 className="font-bold text-portal-navy text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== WHY NOT ALONE ===== */}
        <section className="py-12 md:py-16" style={{ backgroundColor: '#FEF2F2' }}>
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-portal-navy text-center mb-8">
              למה רבים מעדיפים ליווי מקצועי?
            </h2>

            <div className="space-y-3 mb-8">
              {[
                'טעויות בטפסים שעלולות לעכב את התהליך',
                'בחירת סיווג עיסוק לא נכון',
                'אי הבנה של חובות דיווח',
                'עיכובים מול הרשויות',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">{text}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 border-2 border-green-200 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-portal-navy font-semibold text-lg">
                בליווי מקצועי ניתן להימנע מטעויות ולבצע את התהליך בצורה מסודרת.
              </p>
            </div>
          </div>
        </section>

        {/* ===== WHY PERFECT ONE ===== */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-portal-navy text-center mb-10">
              למה לבחור בפרפקט וואן?
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Headphones, title: 'ליווי מקצועי', desc: 'הכוונה בכל שלב בתהליך' },
                { icon: Users, title: 'ניסיון בליווי עצמאים', desc: 'אלפי לקוחות מרוצים' },
                { icon: FileCheck, title: 'תהליך ברור ופשוט', desc: 'בלי בירוקרטיה מיותרת' },
                { icon: Clock, title: 'חיסכון בזמן', desc: 'אנחנו מפשטים לכם את הכל' },
                { icon: Zap, title: 'מענה מהיר לשאלות', desc: 'תמיד כאן בשבילכם' },
                { icon: Shield, title: 'ללא התחייבות', desc: 'הבדיקה הראשונית בחינם' },
              ].map((item, i) => (
                <div key={i} className="text-center p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-portal-teal/20 transition-colors">
                  <div className="w-12 h-12 bg-portal-teal/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-portal-teal" />
                  </div>
                  <h3 className="font-bold text-portal-navy text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SOCIAL PROOF ===== */}
        <section className="py-10 md:py-14" style={{ backgroundColor: '#F0FDFA' }}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { num: '5,000+', label: 'עצמאים פתחו איתנו' },
                { num: '8+', label: 'שנות ניסיון' },
                { num: '98%', label: 'שביעות רצון' },
                { num: '< 1 שעה', label: 'זמן תגובה ממוצע' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-extrabold text-portal-teal mb-1" dir="ltr">{stat.num}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FIRST CTA FORM ===== */}
        <section className="py-10 md:py-14" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F766E 100%)' }}>
          <div className="max-w-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
              רוצים לפתוח עוסק פטור?
            </h2>
            <p className="text-white/80 text-center mb-6">
              השאירו פרטים ונחזור אליכם בהקדם
            </p>
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <LeadForm
                id="mid-form"
                variant="mid"
                ctaText="בדקו איך לפתוח עוסק פטור"
              />
            </div>
          </div>
        </section>

        {/* ===== FAQ SECTION ===== */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-portal-navy text-center mb-10">
              שאלות נפוצות
            </h2>
            <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
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

        {/* ===== FINAL CTA ===== */}
        <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #152D4A 40%, #0F766E 100%)' }}>
          <div className="max-w-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              רוצים לפתוח עוסק פטור?
            </h2>
            <p className="text-white/80 mb-8">
              השאירו פרטים עכשיו — ותתחילו לעבוד מסודר
            </p>

            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
              <LeadForm
                id="final-form"
                variant="final"
                ctaText="קבלו ליווי לפתיחת עוסק פטור"
              />
            </div>

            <p className="text-white/50 text-xs mt-6">
              או התקשרו ישירות:{' '}
              <a href={`tel:${PORTAL_CTA.phone}`} className="text-white/70 underline">{PORTAL_CTA.phone}</a>
              {' '}|{' '}
              <a
                href={`${PORTAL_CTA.whatsapp}?text=${encodeURIComponent('היי, אני רוצה לפתוח עוסק פטור')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 underline"
              >
                WhatsApp
              </a>
            </p>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="bg-portal-navy py-8">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
            <p className="text-white/70 text-sm font-medium">
              האתר מופעל על ידי פרפקט וואן — שירות ליווי עסקי פרטי.
            </p>
            <p className="text-white/50 text-xs leading-relaxed max-w-xl mx-auto">
              אנו מספקים שירותי ייעוץ והכוונה בתהליך פתיחת עסק.
              האתר אינו אתר ממשלתי ואינו קשור לרשות המסים, מע״מ או ביטוח לאומי.
            </p>
            <p className="text-white/30 text-xs pt-2">
              © {new Date().getFullYear()} פרפקט וואן |{' '}
              <a href="/Privacy" className="hover:text-white/50 underline">מדיניות פרטיות</a>
              {' '}|{' '}
              <a href="/Terms" className="hover:text-white/50 underline">תנאי שימוש</a>
            </p>
          </div>
        </footer>

        {/* Sticky Mobile CTA */}
        <StickyMobileCTA />
      </div>
    </HelmetProvider>
  );
}
