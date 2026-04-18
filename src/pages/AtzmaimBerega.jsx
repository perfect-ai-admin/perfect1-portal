import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CheckCircle2, Bot, XCircle,
  Layers, Megaphone, DollarSign, Brain, Zap, Phone,
  Target, TrendingUp, Users, Award, Clock,
  MessageCircle, Shield, Lightbulb, BarChart3, ArrowDown,
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { PORTAL_CTA } from '@/portal/config/navigation';

/* ── Lead Form ── */
function LeadForm({ id, variant = 'hero', ctaText = 'אני רוצה שיחת אבחון חינם →', className = '' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', consent: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setError('נא למלא שם וטלפון'); return; }
    const p = form.phone.replace(/[-\s]/g, '');
    if (!/^0\d{8,9}$/.test(p)) { setError('מספר טלפון לא תקין'); return; }
    setLoading(true); setError('');
    try {
      await invokeFunction('submitLeadToN8N', { name: form.name, phone: form.phone, pageSlug: `atzmaim-berega-${variant}`, businessName: `עצמאים ברגע (${variant})` });
      navigate('/ThankYou', { state: { source: `atzmaim-berega-${variant}`, name: form.name, fromForm: true } });
    } catch { setError('שגיאה, נסו שוב או התקשרו'); }
    finally { setLoading(false); }
  };

  return (
    <div id={id} className={className}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="שם מלא" className="h-13 rounded-xl text-base bg-white text-right" />
        <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="טלפון נייד" type="tel" dir="ltr" className="h-13 rounded-xl text-base bg-white text-right" />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <label className="flex items-start gap-2 text-xs text-gray-400">
          <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)} className="mt-0.5 w-4 h-4 rounded" />
          <span>מאשר/ת <a href="/Terms" target="_blank" className="underline">תנאי שימוש</a> ו<a href="/Privacy" target="_blank" className="underline">פרטיות</a></span>
        </label>
        <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : ctaText}
        </Button>
      </form>
      <p className="text-[11px] text-center mt-2.5 text-gray-400">20 דקות · ללא התחייבות · נחזור היום</p>
    </div>
  );
}

/* ── Scroll CTA ── */
const scrollToForm = () => document.getElementById('main-lead-form')?.scrollIntoView({ behavior: 'smooth' });

/* ── Sticky Mobile ── */
function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => { const h = () => setShow(window.scrollY > 500); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 backdrop-blur-lg border-t px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <button onClick={scrollToForm} className="w-full h-12 font-bold text-sm rounded-xl bg-blue-600 text-white">אני רוצה שיחת אבחון חינם →</button>
      </div>
    </div>
  );
}

/* ── Schema ── */
function SchemaMarkup() {
  const s = { '@context': 'https://schema.org', '@type': 'Service', name: 'עצמאים ברגע — הקמת עסק חכם עם AI', provider: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://perfect1.co.il', telephone: '+972502277087' }, areaServed: { '@type': 'Country', name: 'Israel' } };
  return <Helmet><script type="application/ld+json">{JSON.stringify(s)}</script></Helmet>;
}

/* ══════════════════════════════
   MAIN PAGE
   ══════════════════════════════ */
export default function AtzmaimBerega() {
  return (
    <>
      <div dir="rtl" className="min-h-screen bg-white" style={{ fontFamily: "'Heebo', sans-serif" }}>
        <Helmet>
          <title>עצמאים ברגע — עסק חכם עם AI תוך 4 מפגשים | פרפקט וואן</title>
          <meta name="description" content="4 מפגשים. מערכת AI. עסק שמביא לקוחות. תוכנית מעשית לעצמאים — נכסים דיגיטליים, שיווק וליווי אישי. שיחת אבחון חינם." />
          <link rel="canonical" href="https://www.perfect1.co.il/atzmaim-berega" />
        </Helmet>
        <SchemaMarkup />

        {/* ── HEADER ── */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <span className="text-lg font-extrabold text-slate-900">פרפקט וואן</span>
            <a href={`tel:${PORTAL_CTA.phone}`} className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
              <Phone className="w-4 h-4" /><span className="hidden sm:inline">{PORTAL_CTA.phone}</span><span className="sm:hidden">התקשרו</span>
            </a>
          </div>
        </header>

        {/* ═══ HERO ═══ */}
        <section className="pt-14 pb-16 md:pt-24 md:pb-28 bg-gradient-to-b from-white to-blue-50/30">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <Zap className="w-4 h-4" />4 מפגשים בלבד
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
              תפסיק לרדוף אחרי לקוחות.
              <br />
              <span className="text-blue-600">תבנה מערכת שמביאה אותם.</span>
            </h1>

            <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
              ב-4 מפגשים נבנה לך עסק עם <strong className="text-slate-800">מערכת AI, דף נחיתה, שיווק ותמחור</strong> — הכל עובד מהיום הראשון.
            </p>

            <button onClick={scrollToForm} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              אני רוצה שיחת אבחון חינם →
            </button>

            <p className="text-sm text-gray-400 mt-4">ללא התחייבות · 20 דקות · נחזור היום</p>
          </div>
        </section>

        {/* ═══ SOCIAL PROOF STRIP ═══ */}
        <section className="py-4 bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-x-10 gap-y-2 text-white text-sm">
            <span className="flex items-center gap-2"><Target className="w-4 h-4 text-blue-400" /><strong>87%</strong> השיגו לקוח תוך 30 יום</span>
            <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /><strong>3X</strong> יותר פניות אחרי 60 יום</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-amber-400" />ליווי אישי <strong>1:1</strong></span>
          </div>
        </section>

        {/* ═══ THE PROBLEM — Short & punchy ═══ */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <p className="text-red-500 font-bold text-sm mb-3 tracking-wide text-center">מכירים את זה?</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-10">
              אתה טוב במה שאתה עושה.
              <br />אבל <span className="text-red-500">אף אחד לא יודע שאתה קיים.</span>
            </h2>

            <div className="space-y-3">
              {[
                'אין מערכת — הכל "מהפה לאוזן" ותקוות',
                'אין נוכחות דיגיטלית — אף אחד לא מוצא אותך',
                'אין תמחור ברור — מנחש כל פעם מחדש',
                'אין שיווק — כל לקוח זה מאמץ ידני',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-red-50/60">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="text-gray-700 font-medium">{text}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 mt-8 text-center">
              <p className="text-white text-xl font-bold leading-relaxed">
                "לא חסר לך כישרון.
                <br /><span className="text-blue-400">חסרה לך מערכת.</span>"
              </p>
            </div>
          </div>
        </section>

        {/* ═══ CTA BREAK ═══ */}
        <section className="py-8 bg-blue-600">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-white text-xl font-bold mb-4">רוצה שנבנה לך את המערכת?</p>
            <button onClick={scrollToForm} className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-50 shadow-lg transition-all">
              לשיחה ללא עלות →
            </button>
          </div>
        </section>

        {/* ═══ THE SOLUTION — 4 Meetings ═══ */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-blue-600 font-bold text-sm mb-3 tracking-wide">איך זה עובד</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                4 מפגשים. מערכת שלמה. תוצאות.
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { n: '01', icon: Bot, color: 'bg-violet-500', title: 'מערכת AI לעסק', result: 'העסק שלך עובד חכם, לא קשה',
                  bullets: ['AI שכותב לך תוכן שיווקי', 'הצעות מחיר אוטומטיות', 'מענה ללקוחות — בלעדיך'] },
                { n: '02', icon: Layers, color: 'bg-blue-500', title: 'נכסים דיגיטליים', result: 'לקוחות מוצאים אותך 24/7',
                  bullets: ['דף נחיתה שמביא לידים', 'כרטיס ביקור דיגיטלי', 'מערכת פניות אוטומטית'] },
                { n: '03', icon: Megaphone, color: 'bg-teal-500', title: 'שיווק אוטומטי', result: 'שיווק שעובד כל חודש — בלי מאמץ',
                  bullets: ['תוכנית שיווק מותאמת', 'פוסטים ומודעות מוכנים', 'מערכת שמביאה לקוחות קבוע'] },
                { n: '04', icon: DollarSign, color: 'bg-amber-500', title: 'תמחור ומודל עסקי', result: 'עסק רווחי מהיום הראשון',
                  bullets: ['חבילות שירות מתומחרות', 'מודל רווחיות ברור', 'אסטרטגיית מחירים חכמה'] },
              ].map(({ n, icon: Icon, color, title, result, bullets }, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 p-5 pb-3">
                    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400">מפגש {n}</span>
                      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    </div>
                  </div>
                  <div className="px-5 pb-4 pr-[76px]">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {bullets.map((b, j) => (
                        <span key={j} className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg">{b}</span>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-500" />{result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WHAT YOU GET — Grid ═══ */}
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black text-slate-900 text-center mb-10">מה כלול בתוכנית</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: Bot, title: 'מערכת AI מותאמת', desc: 'יוצר תוכן, עונה ללקוחות, כותב הצעות מחיר' },
                { icon: Layers, title: 'דף נחיתה מקצועי', desc: 'דף שמביא לידים — מוכן תוך ימים' },
                { icon: MessageCircle, title: 'כרטיס ביקור דיגיטלי', desc: 'שולחים בוואטסאפ — מקצועי ומרשים' },
                { icon: BarChart3, title: 'מעקב לידים', desc: 'תדע מאיפה הגיע כל לקוח' },
                { icon: Lightbulb, title: 'אסטרטגיית שיווק', desc: 'תוכנית מותאמת לעסק שלך' },
                { icon: Shield, title: 'תמחור חכם', desc: 'חבילות שירות עם מחירים שעובדים' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                  <Icon className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ RESULTS — Dark Impact ═══ */}
        <section className="py-16 md:py-24 bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-blue-400 font-bold text-sm mb-3 tracking-wide">תוצאות אמיתיות</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-12">
              מה קורה אחרי התוכנית
            </h2>

            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {[
                { number: '87%', label: 'השיגו לקוח ראשון', sub: 'תוך 30 יום', icon: Target },
                { number: '4', label: 'מפגשים עד מערכת שלמה', sub: 'AI + שיווק + נכסים', icon: Clock },
                { number: '3X', label: 'יותר פניות בממוצע', sub: 'אחרי 60 יום', icon: TrendingUp },
              ].map(({ number, label, sub, icon: Icon }, i) => (
                <div key={i}>
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-5xl font-black text-blue-400 mb-2">{number}</div>
                  <p className="text-white font-bold">{label}</p>
                  <p className="text-white/40 text-sm">{sub}</p>
                </div>
              ))}
            </div>

            <p className="text-2xl font-bold text-white">
              לא סתם ידע — <span className="text-blue-400">עסק מוכן להרוויח.</span>
            </p>
          </div>
        </section>

        {/* ═══ WHO IS THIS FOR ═══ */}
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">
              מתאים לך אם:
            </h2>

            <div className="space-y-2 mb-8">
              {[
                'עצמאי בתחילת הדרך (או מתכנן לפתוח)',
                'יש לך שירות טוב אבל אין לקוחות קבועים',
                'רוצה לעבוד חכם — עם טכנולוגיה וAI',
                'מוכן להשקיע 4 מפגשים לבנות מערכת אמיתית',
                'לא רוצה "קורס" — רוצה תוצאות',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="text-gray-700 text-lg">{text}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 text-center">
              <p className="text-slate-800">
                <strong>לא מתאים</strong> למי שמחפש טיפ מהיר. אנחנו עובדים רק עם רציניים.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ TRUST ═══ */}
        <section className="py-10 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border"><Users className="w-4 h-4 text-blue-500" />ליווי אישי 1:1</span>
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border"><Zap className="w-4 h-4 text-blue-500" />תוצאות מיידיות</span>
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border"><Shield className="w-4 h-4 text-blue-500" />ללא התחייבות</span>
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border"><Award className="w-4 h-4 text-blue-500" />מותאם אישית</span>
            </div>
          </div>
        </section>

        {/* ═══ FINAL FORM ═══ */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-sm mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                מתחילים?
              </h2>
              <p className="text-gray-500 text-lg">
                20 דקות. בחינם. ללא התחייבות.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
              <LeadForm id="main-lead-form" variant="final" />
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-6 bg-slate-900 text-center">
          <p className="text-white/40 text-xs">© פרפקט וואן · perfect1.co.il</p>
        </footer>

        <StickyMobileCTA />
      </div>
    </>
  );
}
