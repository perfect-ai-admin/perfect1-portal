import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, Bot, XCircle,
  Layers, Megaphone, DollarSign, Brain, Zap, Phone,
  Target, TrendingUp, ArrowLeft, Users, Award, Clock,
  MessageCircle, Shield, Lightbulb, BarChart3, Sparkles,
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { PORTAL_CTA } from '@/portal/config/navigation';

/* ================================
   LEAD FORM
   ================================ */
function LeadForm({ id, variant = 'hero', title, subtitle, ctaText = 'לקביעת שיחת אבחון ללא עלות >>', className = '' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', consent: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const trackEvent = (eventName, data = {}) => {
    if (window.dataLayer) window.dataLayer.push({ event: eventName, ...data });
    if (window.fbq) window.fbq('track', eventName === 'lead_submitted' ? 'Lead' : 'CustomEvent', { content_name: 'atzmaim_berega', ...data });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setError('נא למלא שם וטלפון'); return; }
    if (!form.consent) { setError('יש לאשר את תנאי השימוש'); return; }
    const phoneClean = form.phone.replace(/[-\s]/g, '');
    if (!/^0\d{8,9}$/.test(phoneClean)) { setError('מספר טלפון לא תקין'); return; }
    setLoading(true); setError('');
    trackEvent('form_start', { form_location: variant });
    try {
      await invokeFunction('submitLeadToN8N', { name: form.name, phone: form.phone, pageSlug: `atzmaim-berega-${variant}`, businessName: `דף נחיתה - עצמאים ברגע (${variant})` });
      navigate('/ThankYou', { state: { source: `atzmaim-berega-${variant}`, name: form.name, fromForm: true } });
    } catch { setError('שגיאה בשליחה, נסו שוב או התקשרו אלינו'); }
    finally { setLoading(false); }
  };

  return (
    <div id={id} className={className}>
      {title && <h3 className="font-bold text-center mb-1 text-xl text-slate-900">{title}</h3>}
      {subtitle && <p className="text-center mb-5 text-sm text-gray-500">{subtitle}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="שם מלא" required aria-label="שם מלא" className="h-13 rounded-xl text-base border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 text-right" />
        <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="טלפון נייד" type="tel" required dir="ltr" aria-label="טלפון נייד" className="h-13 rounded-xl text-base border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 text-right" />
        {error && <p className="text-red-500 text-sm text-center font-medium" role="alert">{error}</p>}
        <label className="flex items-start gap-2 cursor-pointer text-xs leading-relaxed text-gray-500">
          <input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 shrink-0" />
          <span>אני מאשר/ת את <a href="/Terms" target="_blank" className="underline hover:text-blue-600">תנאי השימוש</a> ו<a href="/Privacy" target="_blank" className="underline hover:text-blue-600">מדיניות הפרטיות</a> ומסכימ/ה לקבלת פניות.</span>
        </label>
        <Button type="submit" disabled={loading} aria-label={ctaText} className="w-full h-14 rounded-xl text-lg font-bold shadow-lg transition-all duration-200 hover:shadow-xl bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : ctaText}
        </Button>
      </form>
      <p className="text-xs text-center mt-3 text-gray-400">ללא התחייבות · שיחה של 20 דקות · נחזור אליך היום</p>
    </div>
  );
}

/* ================================
   CTA BUTTON
   ================================ */
function CTAButton({ label = 'לקביעת שיחת אבחון ללא עלות >>' }) {
  return (
    <button onClick={() => document.getElementById('main-lead-form')?.scrollIntoView({ behavior: 'smooth' })} aria-label={label}
      className="inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 hover:shadow-xl bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
      {label}
    </button>
  );
}

/* ================================
   STICKY MOBILE CTA
   ================================ */
function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => { const h = () => setShow(window.scrollY > 600); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <button onClick={() => document.getElementById('main-lead-form')?.scrollIntoView({ behavior: 'smooth' })} aria-label="לשיחת אבחון" className="w-full h-12 font-bold text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all">
          לשיחת אבחון ללא עלות >>
        </button>
      </div>
    </div>
  );
}

/* ================================
   SCHEMA
   ================================ */
function SchemaMarkup() {
  const s = { '@context': 'https://schema.org', '@type': 'Service', name: 'עצמאים ברגע — תוכנית הקמת עסק חכם עם AI', description: 'תוכנית בת 4 מפגשים להקמת מערכת עסקית חכמה לעצמאים.', provider: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://perfect1.co.il', telephone: '+972502277087' }, areaServed: { '@type': 'Country', name: 'Israel' } };
  return <Helmet><script type="application/ld+json">{JSON.stringify(s)}</script></Helmet>;
}

/* ================================
   SECTION DIVIDER
   ================================ */
const Divider = () => <div className="max-w-xl mx-auto border-t border-gray-100" />;

/* ================================
   MAIN PAGE
   ================================ */
export default function AtzmaimBerega() {
  useEffect(() => {
    let tracked = {};
    const h = () => { const p = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100); [25,50,75,100].forEach(t => { if (p >= t && !tracked[t]) { tracked[t] = true; if (window.dataLayer) window.dataLayer.push({ event: 'scroll_depth', scroll_percent: t, page: 'atzmaim_berega' }); } }); };
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <>
      <div dir="rtl" className="min-h-screen bg-white" style={{ fontFamily: "'Heebo', sans-serif" }}>
        <Helmet>
          <title>עצמאים ברגע — הקמת עסק חכם עם מערכת AI | פרפקט וואן</title>
          <meta name="description" content="תוכנית בת 4 מפגשים להקמת מערכת עסקית חכמה עם AI: נכסים דיגיטליים, מערכת שיווק, תמחור ומודל עסקי. שיחת אבחון ללא עלות." />
          <link rel="canonical" href="https://www.perfect1.co.il/atzmaim-berega" />
          <meta property="og:title" content="עצמאים ברגע — עסק חכם בעזרת AI" />
          <meta property="og:description" content="4 מפגשים. מערכת AI. עסק שמביא לקוחות." />
          <meta property="og:url" content="https://www.perfect1.co.il/atzmaim-berega" />
          <meta property="og:image" content="https://www.perfect1.co.il/og-image.png" />
          <meta property="og:locale" content="he_IL" />
        </Helmet>
        <SchemaMarkup />

        {/* ===== HEADER ===== */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">פרפקט וואן</span>
            <a href={`tel:${PORTAL_CTA.phone}`} aria-label="התקשרו" className="flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:underline">
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{PORTAL_CTA.phone}</span>
              <span className="sm:hidden">התקשרו</span>
            </a>
          </div>
        </header>

        {/* ===== HERO ===== */}
        <section className="pt-12 pb-16 md:pt-20 md:pb-24 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <p className="text-blue-600 font-bold text-sm mb-4 tracking-wide">הדרכה לעצמאים</p>

            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-slate-900 leading-[1.12] mb-6">
              איך לבנות עסק שמביא
              <br />
              <span className="text-blue-600">לקוחות בלי להתחנן</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-6 max-w-2xl">
              רוצים לגלות איך להפוך את <strong className="text-slate-900">מערכת AI</strong> לאיש המכירות הכי טוב שלכם?
              ב-4 מפגשים בלבד נקים עבורכם מערכת שלמה — מנכסים דיגיטליים ועד תמחור ושיווק.
            </p>

            <p className="text-lg text-gray-500 mb-10 leading-relaxed">
              אלפי עצמאים בישראל מתחילים כל שנה בלי שום מערכת להבאת לקוחות.
              הם יודעים לתת שירות מעולה — אבל <strong className="text-slate-800">אף אחד לא יודע שהם קיימים</strong>.
              בדיוק בשביל זה בנינו את התוכנית הזו.
            </p>

            <CTAButton />

            <p className="text-sm text-gray-400 mt-4">שיחת אבחון של 20 דקות · ללא התחייבות · נחזור היום</p>
          </div>
        </section>

        <Divider />

        {/* ===== RESULTS — Big numbers ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-blue-600 font-bold text-sm mb-3 text-center tracking-wide">תוצאות</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-4">
              מה קורה אחרי התוכנית
            </h2>
            <p className="text-center text-gray-500 text-lg mb-12 max-w-xl mx-auto">
              אלה לא הבטחות — אלה תוצאות של משתתפים אמיתיים שעברו את התוכנית.
            </p>

            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { number: '87%', label: 'מהמשתתפים השיגו לקוח ראשון', sub: 'תוך 30 יום מסיום התוכנית', icon: Target },
                { number: '4', label: 'מפגשים עד מערכת שלמה', sub: 'נכסים דיגיטליים + שיווק + AI', icon: Clock },
                { number: '3X', label: 'יותר פניות בממוצע', sub: 'אחרי 60 יום מהפעלת המערכת', icon: TrendingUp },
              ].map(({ number, label, sub, icon: Icon }, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="text-5xl md:text-6xl font-black text-blue-600 mb-2 leading-none">{number}</div>
                  <p className="text-slate-900 font-bold mb-1">{label}</p>
                  <p className="text-gray-400 text-sm">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ===== THE PROBLEM — Detailed ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <p className="text-red-500 font-bold text-sm mb-3 tracking-wide">הבעיה</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-5">
              למה עצמאים טובים נשארים בלי לקוחות
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              רוב העצמאים שאני פוגש מספרים לי אותו דבר: הם יודעים לעשות עבודה מעולה — <strong className="text-slate-800">אבל הם לא יודעים איך להביא לקוחות</strong>.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              הם מנסים לפרסם בפייסבוק, מבזבזים כסף על קמפיינים, שואלים חברים —
              ובסוף חוזרים לאותו מקום. בלי מערכת, בלי תהליך, בלי תוצאות.
            </p>

            <div className="space-y-3 mb-8">
              {[
                'אין מערכת שמביאה לקוחות באופן קבוע — הכל "מהפה לאוזן"',
                'אין נוכחות דיגיטלית — אף אחד לא מוצא אותך בגוגל',
                'אין תמחור ברור — מנחשים כמה לגבות כל פעם מחדש',
                'אין מערכת שיווק — כל לקוח דורש מאמץ ידני מתיש',
                'אין שימוש ב-AI — המתחרים כבר משתמשים, ואתה לא',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 py-3 px-4 bg-red-50/40 rounded-xl border border-red-50">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-700">{text}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="text-slate-900 text-xl font-bold leading-relaxed">
                "זה לא שאתה לא טוב במה שאתה עושה.
                <br />
                <span className="text-blue-600">פשוט חסרה לך מערכת.</span>"
              </p>
            </div>
          </div>
        </section>

        {/* ===== CTA BREAK ===== */}
        <section className="py-10 bg-blue-600">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-white text-xl md:text-2xl font-bold mb-5">
              רוצה שנבנה לך את המערכת? שיחה של 20 דקות — בחינם.
            </p>
            <button onClick={() => document.getElementById('main-lead-form')?.scrollIntoView({ behavior: 'smooth' })} aria-label="לשיחה ללא עלות"
              className="inline-flex items-center gap-2 rounded-xl font-bold px-8 py-4 text-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-lg">
              לקביעת שיחה ללא עלות >>
            </button>
          </div>
        </section>

        {/* ===== THE SOLUTION — What we build ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <p className="text-blue-600 font-bold text-sm mb-3 tracking-wide">הפתרון</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-5">
              ב-4 מפגשים נבנה לך מערכת שלמה
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              התוכנית <strong className="text-slate-800">"עצמאים ברגע"</strong> היא לא קורס תיאורטי.
              בכל מפגש אנחנו בונים יחד תוצר מוחשי שעובד מהיום.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              בסיום — יהיה לך עסק עם מערכת AI, נכסים דיגיטליים, שיווק חכם ותמחור ברור.
              לא רעיונות. <strong className="text-slate-800">תוצרים.</strong>
            </p>

            {/* Lesson cards */}
            <div className="space-y-5">
              {[
                { n: '01', icon: Bot, title: 'הקמת מערכת AI לעסק',
                  desc: 'נקים עבורך כלי AI שיודע ליצור תוכן שיווקי, לכתוב הצעות מחיר, לענות ללקוחות וליצור מסרים שיווקיים.',
                  result: 'התוצאה: העסק שלך עובד חכם — לא קשה' },
                { n: '02', icon: Layers, title: 'הקמת נכסים דיגיטליים',
                  desc: 'דף נחיתה מקצועי שמביא לידים, כרטיס ביקור דיגיטלי, מערכת פניות אוטומטית. נוכחות שעובדת 24/7.',
                  result: 'התוצאה: לקוחות מוצאים אותך גם כשאתה ישן' },
                { n: '03', icon: Megaphone, title: 'מערכת שיווק אוטומטית',
                  desc: 'נבנה תהליך שמאפשר לך ליצור מודעות, לכתוב פוסטים ולהביא לקוחות — בלי שתצטרך להיות מומחה שיווק.',
                  result: 'התוצאה: שיווק עקבי שמביא תוצאות — כל חודש' },
                { n: '04', icon: DollarSign, title: 'תמחור ומודל עסקי',
                  desc: 'נבנה תמחור נכון, חבילות שירות, ומודל שמאפשר לעסק להיות רווחי מהיום הראשון. בלי ניחושים.',
                  result: 'התוצאה: עסק רווחי בצורה מסודרת ומתוכננת' },
              ].map(({ n, icon: Icon, title, desc, result }, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 p-6 hover:border-blue-100 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-blue-400" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-600">מפגש {n}</span>
                      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-3 pr-16">{desc}</p>
                  <p className="text-sm font-bold text-slate-800 pr-16 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" aria-hidden="true" />{result}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <CTAButton />
            </div>
          </div>
        </section>

        <Divider />

        {/* ===== WHAT YOU GET — Small feature cards ===== */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-blue-600 font-bold text-sm mb-3 text-center tracking-wide">מה כלול בתוכנית</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-12">
              הכלים שתקבל
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Bot, title: 'מערכת AI מותאמת', desc: 'כלי AI שמותאם לעסק שלך — יוצר תוכן, עונה ללקוחות, כותב הצעות מחיר' },
                { icon: Layers, title: 'דף נחיתה מקצועי', desc: 'דף נחיתה שמביא לידים — עם טופס, מסרים שיווקיים ו-CTA' },
                { icon: MessageCircle, title: 'כרטיס ביקור דיגיטלי', desc: 'כרטיס מקצועי שאפשר לשלוח בווטסאפ — עם כל הפרטים שלך' },
                { icon: BarChart3, title: 'מערכת מעקב פניות', desc: 'מערכת פשוטה לניהול לידים — תדעו תמיד מאיפה הגיעו הלקוחות' },
                { icon: Lightbulb, title: 'תוכנית שיווק', desc: 'אסטרטגיית שיווק מותאמת לעסק שלך — פוסטים, מודעות, תוכן' },
                { icon: Shield, title: 'תמחור ומודל עסקי', desc: 'חבילות שירות מתומחרות נכון — שמאפשרות לעסק להיות רווחי' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-[15px]">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== OUTCOMES — Dark section ===== */}
        <section className="py-14 md:py-20 bg-slate-900">
          <div className="max-w-3xl mx-auto px-4">
            <p className="text-blue-400 font-bold text-sm mb-3 text-center tracking-wide">בסיום התוכנית</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-4">
              מה יהיה לך שאין לרוב העצמאים
            </h2>
            <p className="text-white/60 text-center text-lg mb-10 max-w-xl mx-auto">
              לא סתם ידע — כלים ומערכות שעובדים בשבילך.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {[
                { icon: Brain, text: 'מערכת AI שעובדת בשבילך', sub: 'תוכן, הצעות מחיר, מענה ללקוחות' },
                { icon: Layers, text: 'נכסים דיגיטליים מקצועיים', sub: 'דף נחיתה, כרטיס ביקור, מערכת פניות' },
                { icon: Target, text: 'מערכת שמביאה לקוחות', sub: 'שיווק אוטומטי שעובד כל חודש' },
                { icon: TrendingUp, text: 'מודל עסקי ותמחור ברור', sub: 'חבילות שירות, מחירים, רווחיות' },
              ].map(({ icon: Icon, text, sub }, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{text}</p>
                    <p className="text-white/40 text-sm">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">
                כלומר — <span className="text-blue-400">עסק מוכן לעבוד ולהרוויח.</span>
              </p>
              <p className="text-white/40 text-sm">לא עוד "יום אחד אקים עסק". היום.</p>
            </div>
          </div>
        </section>

        {/* ===== WHO IS THIS FOR ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <p className="text-blue-600 font-bold text-sm mb-3 tracking-wide">למי מתאים</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-5">
              התוכנית מתאימה לך אם:
            </h2>

            <div className="space-y-3 mb-8">
              {[
                'אתה עצמאי בתחילת הדרך (או חושב לפתוח עסק)',
                'יש לך שירות טוב — אבל אין לך לקוחות קבועים',
                'אתה רוצה להשתמש בטכנולוגיה כדי לעבוד חכם יותר',
                'אתה מוכן להשקיע 4 מפגשים כדי לבנות מערכת אמיתית',
                'אתה לא רוצה "קורס" — אתה רוצה תוצאות',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 py-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-700 text-lg">{text}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <p className="text-slate-900 text-lg leading-relaxed">
                <strong>התוכנית לא מתאימה</strong> למי שמחפש "טיפ מהיר" או שלא מוכן להשקיע זמן.
                אנחנו עובדים רק עם אנשים שרציניים לגבי העסק שלהם.
              </p>
            </div>
          </div>
        </section>

        {/* ===== TRUST ===== */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Award className="w-10 h-10 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 text-center sm:text-right">תוכנית שנבנתה לעצמאים בישראל</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  התוכנית פותחה עבור עצמאים שרוצים לבנות עסק בצורה חכמה, עם כלים טכנולוגיים מתקדמים וליווי אישי צמוד.
                  כל מפגש מותאם אישית לעסק שלך — לא תוכנית גנרית.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100"><Users className="w-4 h-4 text-blue-500" aria-hidden="true" /> ליווי אישי 1:1</span>
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100"><Zap className="w-4 h-4 text-blue-500" aria-hidden="true" /> תוצאות מיידיות</span>
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100"><Shield className="w-4 h-4 text-blue-500" aria-hidden="true" /> ללא התחייבות</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FINAL FORM ===== */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-md mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                רוצה להתחיל?
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                השאירו פרטים ונחזור אליכם לשיחת אבחון קצרה.
                <br />
                <strong className="text-slate-800">20 דקות. בחינם. ללא התחייבות.</strong>
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8">
              <LeadForm id="main-lead-form" variant="final" />
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="py-8 bg-slate-900 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-white/50 text-xs leading-relaxed">פרפקט וואן היא חברה פרטית המספקת שירותי ליווי להקמת עסק ואינה גוף ממשלתי.</p>
            <p className="text-white/30 text-xs mt-2">© פרפקט וואן · perfect1.co.il</p>
          </div>
        </footer>

        <StickyMobileCTA />
      </div>
    </>
  );
}
