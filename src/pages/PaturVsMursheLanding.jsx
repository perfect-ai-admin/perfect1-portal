import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { HelmetProvider } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, Shield, Clock,
  AlertTriangle, ChevronDown, ChevronUp, FileCheck,
  Headphones, Zap, UserCheck, HandCoins,
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { motion } from 'framer-motion';

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
function LeadForm({ id, variant = 'hero', title, subtitle, ctaText = 'בדקו איזה עסק מתאים לכם' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('נא למלא שם וטלפון'); return; }
    setLoading(true);
    setError('');

    try {
      await invokeFunction('submitLeadToN8N', {
        name: form.name,
        phone: form.phone,
        pageSlug: `landing-patur-vs-murshe-${variant}`,
        businessName: `דף נחיתה - landing-patur-vs-murshe-${variant}`,
      });

      navigate('/ThankYou', { state: { source: `landing-patur-vs-murshe-${variant}`, name: form.name, fromForm: true } });
    } catch (err) {
      setError('שגיאה בשליחה, נסו שוב או התקשרו אלינו');
    } finally {
      setLoading(false);
    }
  };

  const isHero = variant === 'hero';

  return (
    <div id={id} className={`rounded-2xl p-5 sm:p-7 ${isHero ? 'bg-white shadow-2xl border border-gray-100' : 'bg-white/10 backdrop-blur-sm border border-white/20'}`}>
      {title && (
        <h3 className={`text-lg sm:text-xl font-bold mb-1 text-center ${isHero ? 'text-gray-900' : 'text-white'}`}>
          {title}
        </h3>
      )}
      {subtitle && (
        <p className={`text-sm text-center mb-4 ${isHero ? 'text-gray-500' : 'text-white/70'}`}>{subtitle}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={form.name}
          onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="שם מלא"
          required
          className={`h-13 rounded-xl text-base ${isHero
            ? 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500'
            : 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-green-400'
          }`}
        />
        <Input
          value={form.phone}
          onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
          placeholder="טלפון"
          type="tel"
          required
          className={`h-13 rounded-xl text-base ${isHero
            ? 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500'
            : 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-green-400'
          }`}
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : ctaText}
        </Button>
      </form>

      {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

      <div className={`flex items-center justify-center gap-4 mt-3 text-xs ${isHero ? 'text-gray-400' : 'text-white/50'}`}>
        <span className="inline-flex items-center gap-1"><Shield className="w-3.5 h-3.5" />בדיקה ללא התחייבות</span>
        <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />מענה תוך דקות</span>
      </div>
    </div>
  );
}

// ─── FAQ Item ───
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
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
  { q: 'מה עדיף – עוסק פטור או מורשה?', a: 'תלוי בסוג העסק, מחזור ההכנסות והצרכים שלך. עוסק פטור מתאים למחזור נמוך ללא חובת מע"מ. עוסק מורשה מתאים למחזור גבוה ומאפשר קיזוז מע"מ על הוצאות.' },
  { q: 'כמה עולה לפתוח עוסק?', a: 'פתיחת תיק ברשויות היא חינם. העלויות הן בעיקר עבור ליווי מקצועי ורואה חשבון, שיכולות לנוע בין 500 ל-2,000 ש"ח בשנה.' },
  { q: 'כמה זמן לוקח לפתוח תיק?', a: 'פתיחת תיק במס הכנסה ובמע"מ אפשרית תוך ימים ספורים. עם ליווי מקצועי, התהליך מהיר ומסודר יותר.' },
  { q: 'האם חייבים רואה חשבון?', a: 'עוסק פטור לא חייב רו"ח על פי חוק, אבל מומלץ מאוד. עוסק מורשה חייב לנהל ספרים ולדווח מע"מ — ולכן כמעט תמיד צריך רו"ח.' },
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
  headline: 'עוסק פטור או מורשה – מה עדיף ואיך לבחור',
  description: 'מתלבטים בין עוסק פטור לעוסק מורשה? בדיקה קצרה תעזור לכם להבין מה מתאים לעסק שלכם.',
  author: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.perfect1.co.il/patur-vs-murshe' },
  inLanguage: 'he',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'פרפקט וואן', item: 'https://www.perfect1.co.il' },
    { '@type': 'ListItem', position: 2, name: 'עוסק פטור או מורשה', item: 'https://www.perfect1.co.il/patur-vs-murshe' },
  ],
};

// ─── Comparison Data ───
const comparisonRows = [
  { label: 'תקרת מחזור', patur: 'עד ~120,000 ₪ לשנה', murshe: 'ללא הגבלה' },
  { label: 'חובת מע"מ', patur: 'פטור מגביית מע"מ', murshe: 'חייב לגבות ולדווח מע"מ' },
  { label: 'דוחות', patur: 'דוח שנתי למס הכנסה', murshe: 'דוח שנתי + דו"חות מע"מ דו-חודשיים' },
  { label: 'קבלות / חשבוניות', patur: 'קבלה בלבד', murshe: 'חשבונית מס + קבלה' },
  { label: 'קיזוז מע"מ על הוצאות', patur: 'לא', murshe: 'כן' },
  { label: 'ניהול ספרים', patur: 'פשוט', murshe: 'מורכב יותר' },
];

// ─── Main Page ───
export default function PaturVsMursheLanding() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-white" dir="rtl">
        {/* SEO Head */}
        <Helmet>
          <title>עוסק פטור או מורשה – מה עדיף ואיך לבחור</title>
          <meta name="description" content="מתלבטים בין עוסק פטור לעוסק מורשה? בדיקה קצרה תעזור לכם להבין מה מתאים לעסק שלכם." />
          <meta name="keywords" content="עוסק פטור או מורשה, מה ההבדל בין עוסק פטור למורשה, מה עדיף עוסק פטור או מורשה, איך לבחור עוסק פטור או מורשה" />
          <link rel="canonical" href="https://www.perfect1.co.il/patur-vs-murshe" />
          <meta property="og:title" content="עוסק פטור או מורשה – מה עדיף ואיך לבחור" />
          <meta property="og:description" content="מתלבטים בין עוסק פטור לעוסק מורשה? בדיקה קצרה תעזור לכם להבין מה מתאים לעסק שלכם." />
          <meta property="og:type" content="article" />
          <meta property="og:url" content="https://www.perfect1.co.il/patur-vs-murshe" />
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
              {/* Left: Text */}
              <div className="text-center md:text-right">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-5"
                >
                  <span className="text-white">עוסק פטור או מורשה</span>
                  <br />
                  <span style={{ color: '#F59E0B' }}>מה עדיף לך?</span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <p className="text-lg md:text-xl text-white/85 mb-4 leading-relaxed max-w-lg mx-auto md:mx-0">
                    בדיקה קצרה יכולה לחסוך טעויות מול מס הכנסה ומע״מ.
                  </p>
                  <p className="text-base text-white/60 mb-6 max-w-lg mx-auto md:mx-0">
                    בדקו תוך דקה איזה סוג עסק מתאים לכם.
                  </p>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-wrap gap-x-5 gap-y-2 justify-center md:justify-start mb-6"
                >
                  {['בדיקה חינם', 'ללא התחייבות', 'מענה מהיר'].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>{text}</span>
                    </div>
                  ))}
                </motion.div>

                {/* Social proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-center gap-2 text-white/60 text-sm justify-center md:justify-start"
                >
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs text-white/70">
                        {['👤', '👩', '👨', '👤'][i]}
                      </div>
                    ))}
                  </div>
                  <span>+5,000 עצמאים כבר קיבלו אצלנו הכוונה</span>
                </motion.div>
              </div>

              {/* Right: Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <LeadForm
                  id="hero-form"
                  variant="hero"
                  title="בדיקה מהירה — איזה עסק מתאים לך?"
                  subtitle="השאירו פרטים ונחזור עם תשובה ברורה"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== EXPLANATION ===== */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
                מה ההבדל בין עוסק פטור לעוסק מורשה?
              </h2>
              <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8 leading-relaxed">
                עוסק פטור מתאים לעסקים קטנים עם מחזור נמוך.
                עוסק מורשה מתאים לעסקים עם מחזור גבוה יותר או עסקים שצריכים לגבות מע״מ.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {[
                  { icon: FileCheck, label: 'דיווחים למס הכנסה' },
                  { icon: HandCoins, label: 'גביית מע"מ' },
                  { icon: AlertTriangle, label: 'חובות דיווח' },
                  { icon: Shield, label: 'הוצאות מוכרות' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                    <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-center text-gray-700 font-medium text-lg mb-6">
                הבחירה משפיעה על הדיווחים, המיסוי וההוצאות שלכם — לכן חשוב לבחור נכון.
              </p>
              <div className="text-center">
                <Button
                  onClick={() => document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-13 px-8 rounded-xl text-base bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg"
                >
                  בדקו מה מתאים לכם
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== COMPARISON TABLE ===== */}
        <section className="py-14 md:py-20">
          <div className="max-w-4xl mx-auto px-4">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                טבלת השוואה — עוסק פטור מול עוסק מורשה
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-right p-4 bg-gray-50 rounded-tr-xl font-medium text-gray-500 text-sm w-1/3"></th>
                      <th className="p-4 bg-blue-50 text-blue-800 font-bold text-base text-center w-1/3">עוסק פטור</th>
                      <th className="p-4 bg-amber-50 text-amber-800 font-bold text-base text-center rounded-tl-xl w-1/3">עוסק מורשה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                        <td className="p-4 font-medium text-gray-700 text-sm border-t border-gray-100">{row.label}</td>
                        <td className="p-4 text-center text-gray-600 text-sm border-t border-gray-100">{row.patur}</td>
                        <td className="p-4 text-center text-gray-600 text-sm border-t border-gray-100">{row.murshe}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== WHO IS IT FOR ===== */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <FadeIn>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 h-full">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">מתי כדאי לפתוח עוסק פטור?</h3>
                  <ul className="space-y-3">
                    {['פרילנסרים', 'נותני שירותים', 'מעצבים גרפיים', 'מורים פרטיים', 'צלמים'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>

              <FadeIn delay={0.15}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 h-full">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <HandCoins className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">מתי עדיף עוסק מורשה?</h3>
                  <ul className="space-y-3">
                    {['עסקים עם מחזור גבוה', 'עסקים עם הרבה הוצאות', 'עסקים שעובדים מול חברות'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ===== MID CTA ===== */}
        <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F766E 100%)' }}>
          <div className="max-w-lg mx-auto px-4">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
                לא בטוחים מה מתאים לכם?
              </h2>
              <p className="text-white/70 text-center mb-8">
                השאירו פרטים ונעזור לכם להבין תוך דקות.
              </p>
              <LeadForm
                id="mid-form"
                variant="mid"
                ctaText="בדקו עכשיו איזה סוג עסק מתאים לכם"
              />
            </FadeIn>
          </div>
        </section>

        {/* ===== MISTAKES ===== */}
        <section className="py-14 md:py-20">
          <div className="max-w-4xl mx-auto px-4">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
                טעויות שאנשים עושים כשהם פותחים עסק
              </h2>
            </FadeIn>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                'בחירת סוג עסק לא נכון',
                'דיווח לא נכון למס הכנסה',
                'טעויות מול מע"מ',
                'סיווג פעילות שגוי',
              ].map((mistake, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="flex items-start gap-3 bg-red-50 rounded-xl p-4 border border-red-100">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{mistake}</span>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.3}>
              <p className="text-center text-gray-700 font-medium text-lg mb-6">
                בדיקה קצרה יכולה למנוע טעויות יקרות.
              </p>
              <div className="text-center">
                <Button
                  onClick={() => document.getElementById('final-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-13 px-8 rounded-xl text-base bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg"
                >
                  בדקו עכשיו איזה סוג עסק מתאים לכם
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== TRUST ===== */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <FadeIn>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Shield, title: 'בדיקה ללא התחייבות', desc: 'חינם, בלי הפתעות' },
                  { icon: Headphones, title: 'ליווי מקצועי', desc: 'מומחים שמכירים כל פרט' },
                  { icon: Zap, title: 'מענה מהיר', desc: 'חוזרים אליכם בהקדם' },
                  { icon: UserCheck, title: 'התאמה אישית', desc: 'פתרון שמתאים לך' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100">
                    <item.icon className="w-9 h-9 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="py-14 md:py-20">
          <div className="max-w-3xl mx-auto px-4">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
                שאלות נפוצות
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                {faqData.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
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
                מתלבטים בין עוסק פטור למורשה?
              </h2>
              <p className="text-white/80 text-center mb-8 text-lg">
                בדקו עכשיו איזה סוג עסק מתאים לכם.
              </p>

              <LeadForm
                id="final-form"
                variant="final"
                title="קבלו הכוונה לפתיחת עסק"
                subtitle="ללא התחייבות · נחזור אליכם בהקדם"
                ctaText="קבלו הכוונה לפתיחת עסק"
              />

              {/* Social proof */}
              <div className="flex items-center gap-2 text-white/50 text-sm justify-center mt-6">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs text-white/70">
                      {['👤', '👩', '👨', '👤'][i]}
                    </div>
                  ))}
                </div>
                <span>+5,000 עצמאים כבר קיבלו אצלנו הכוונה</span>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="bg-portal-navy text-white/60 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm space-y-3">
            <p>© {new Date().getFullYear()} פרפקט וואן — ליווי עסקי מקצועי. כל הזכויות שמורות.</p>
            <div className="border-t border-white/10 pt-3 text-white/40 text-xs leading-relaxed max-w-2xl mx-auto">
              <p>האתר מופעל על ידי חברה פרטית המספקת שירותי ייעוץ וליווי עסקי.</p>
              <p>האתר אינו אתר ממשלתי ואינו פועל מטעם רשות המסים, מע״מ או ביטוח לאומי.</p>
            </div>
          </div>
        </footer>
      </div>
    </HelmetProvider>
  );
}
