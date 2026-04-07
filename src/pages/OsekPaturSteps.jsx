import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, Phone, Shield, Clock, Users, Star,
  CheckCircle2, ChevronDown, ChevronUp, AlertTriangle,
  BookOpen, FileText, Zap, HelpCircle, ArrowLeft,
  ClipboardList, UserCheck, BadgeCheck, Lightbulb
} from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';

// ============================
// Lead Form
// ============================
function LeadForm({ id, variant = 'hero', title, subtitle, ctaText = 'בדקו איך לפתוח עוסק פטור', className = '' }) {
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

  const isHero = variant === 'hero';

  return (
    <div id={id} className={className}>
      {title && (
        <h3 className={`font-bold text-center mb-1 text-xl md:text-2xl ${isHero ? 'text-white' : 'text-portal-navy'}`}>
          {title}
        </h3>
      )}
      {subtitle && (
        <p className={`text-center mb-5 text-sm ${isHero ? 'text-white/70' : 'text-gray-500'}`}>
          {subtitle}
        </p>
      )}

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
        {[
          { icon: Shield, text: 'ללא התחייבות' },
          { icon: Users, text: '+5,000 עצמאים' },
          { icon: Star, text: 'דירוג 5 כוכבים' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${isHero ? 'bg-white/20 border border-white/30' : 'bg-green-50 border border-green-100'}`}>
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isHero ? 'text-yellow-300' : 'text-green-600'}`} />
            <span className={`text-xs font-semibold ${isHero ? 'text-white' : 'text-green-700'}`}>{text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="שם מלא"
          required
          className="h-[56px] rounded-xl text-lg border-2 border-gray-200 bg-white focus:border-portal-teal focus:ring-portal-teal text-right font-medium placeholder:text-gray-400"
        />
        <Input
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="טלפון נייד"
          type="tel"
          required
          dir="ltr"
          className="h-[56px] rounded-xl text-lg border-2 border-gray-200 bg-white focus:border-portal-teal focus:ring-portal-teal text-right font-medium placeholder:text-gray-400"
        />
        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl font-extrabold shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ height: '60px', backgroundColor: '#F59E0B', color: '#1E3A5F', fontSize: '18px' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <><Phone className="ml-2 h-5 w-5" />{ctaText}</>
          )}
        </Button>
      </form>

      <p className={`text-xs text-center mt-3 ${isHero ? 'text-white/60' : 'text-gray-400'}`}>
        🔒 חינם · ללא התחייבות · נחזור אליכם תוך שעה
      </p>
    </div>
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
        className="w-full flex items-center justify-between py-4 px-4 text-right hover:bg-gray-50 transition-colors min-h-[56px]"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] md:text-lg font-semibold text-portal-navy pl-4 leading-snug">{question}</span>
        {isOpen
          ? <ChevronUp className="w-5 h-5 text-portal-teal flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {isOpen && (
        <div className="pb-5 px-4 text-gray-600 leading-relaxed text-[15px]">
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
    <section id={id} className={`py-10 md:py-20 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  );
}

// ============================
// Main Page
// ============================
export default function OsekPaturSteps() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: 'כמה זמן לוקח לפתוח עוסק פטור?',
      answer: 'הפתיחה עצמה לוקחת בין 10 דקות לשעה, תלוי אם עושים את זה לבד או עם ליווי. ברוב המקרים, הרישום אצל מס הכנסה ומע"מ מאושר באותו יום.',
    },
    {
      question: 'מה ההבדל בין עוסק פטור למורשה?',
      answer: 'עוסק פטור מתאים להכנסות עד כ-120,000 ש"ח בשנה ולא מוציא חשבונית מע"מ. עוסק מורשה מתאים להכנסות גבוהות יותר ומוציא חשבונית מס. אם אתם בתחילת הדרך — כמעט תמיד כדאי להתחיל כעוסק פטור.',
    },
    {
      question: 'האם חייבים רואה חשבון כדי לפתוח עוסק פטור?',
      answer: 'חוקית — לא. אבל בפועל, ליווי מקצועי עוזר מאוד להימנע מטעויות, לבחור את הסיווג הנכון, ולהגיש דוחות בצורה תקינה. הרבה אנשים מתחרטים שחסכו בהתחלה.',
    },
    {
      question: 'האם עוסק פטור משלם מע"מ?',
      answer: 'עוסק פטור פטור מגביית מע"מ מלקוחותיו ואינו מגיש דוחות מע"מ. בתמורה, אינו יכול לנכות מע"מ על הוצאות. זו בדיוק הסיבה שמתאים לעסקים קטנים.',
    },
    {
      question: 'מה עושים כשמגיעים לתקרת ההכנסות?',
      answer: 'כשהמחזור עובר את תקרת הפטור (כ-120,000 ש"ח), יש חובה לעבור לעוסק מורשה תוך 30 יום. ניתן לעשות זאת בצורה פשוטה ובתיאום עם יועץ מס.',
    },
    {
      question: 'האם עוסק פטור משלם ביטוח לאומי?',
      answer: 'כן. עוסק פטור הוא עצמאי לכל דבר ומשלם דמי ביטוח לאומי בהתאם להכנסתו הנטו. יש לדווח לביטוח הלאומי על פתיחת העסק בנפרד.',
    },
    {
      question: 'מה ההגדרה של "הכנסה" לצורך התקרה?',
      answer: 'מחזור העסק — כל ההכנסות מהעסק לפני הוצאות. לא מדובר ברווח נקי אלא בסך התקבולים.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'רישום במס הכנסה ומע"מ',
      body: 'פותחים תיק עצמאי במס הכנסה ותיק במע"מ (כעוסק פטור). ניתן לעשות את זה אונליין דרך שע"מ, או פיזית בסניף קרוב.',
      icon: FileText,
    },
    {
      num: '02',
      title: 'רישום בביטוח לאומי',
      body: 'מדווחים על פתיחת עסק לביטוח הלאומי ומגדירים תשלומי דמי ביטוח. זה שלב שרבים שוכחים וזה עלול לעלות כסף.',
      icon: Shield,
    },
    {
      num: '03',
      title: 'פתיחת חשבון עסקי ועבודה',
      body: 'מומלץ לפתוח חשבון בנק נפרד לעסק, להפיק קבלות ולשמור קבלות הוצאות. מכאן — אתם עוסק פטור לכל דבר.',
      icon: BadgeCheck,
    },
  ];

  const mustHave = [
    'תעודת זהות',
    'מספר חשבון בנק',
    'כתובת עסק (יכולה להיות הבית)',
    'תיאור קצר של פעילות העסק',
    'קוד ענף מתאים (ייעוץ / שיווק / אמנות וכו\')',
    'טופס 5329 (נרשמים ממלאים בקלות)',
  ];

  const mistakes = [
    { title: 'לא לדווח לביטוח לאומי', desc: 'פותחים תיק במע"מ אבל שוכחים לעדכן את ביטוח לאומי — ונצברים קנסות.' },
    { title: 'לא לשמור קבלות', desc: 'ללא קבלות הוצאות אי אפשר לנכות הוצאות — משלמים יותר מס בסוף השנה.' },
    { title: 'לחצות את התקרה בלי לדעת', desc: 'אנשים לא עוקבים אחרי המחזור ועוברים את תקרת הפטור בלי לדעת.' },
    { title: 'לא לבחור ענף נכון', desc: 'קוד ענף שגוי עלול לגרום לבעיות בדיווחים שנתיים ולבלבול מול רשויות.' },
    { title: 'להשתמש בחשבון פרטי', desc: 'ערבוב כספים אישיים ועסקיים מסבך הכל — גם בדוח וגם בשליטה על העסק.' },
  ];

  const withUs = [
    'פגישת ייעוץ ראשונית חינם',
    'ליווי מלא ברישום מול מס הכנסה',
    'פתיחת תיק ביטוח לאומי',
    'הנחיות ניהול קבלות ודוחות',
    'מענה על שאלות לאחר הפתיחה',
    'תזכורות לדוחות ותשלומים',
  ];

  const withoutUs = [
    'מתחילים ללא הכוונה — מבלבל ומבזבז זמן',
    'טעויות ברישום שקשה לתקן',
    'שוכחים שלבים קריטיים (כמו ביטוח לאומי)',
    'ספק לגבי קוד הענף הנכון',
    'קנסות ועיכובים מיותרים',
  ];

  const schemaArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'איך פותחים עוסק פטור בישראל? המדריך המלא לשנת 2026',
    description: 'מדריך שלב אחרי שלב לפתיחת עוסק פטור בישראל — מה צריך, מה לא לשכוח, וטעויות נפוצות שחשוב להימנע מהן.',
    datePublished: '2026-01-01',
    dateModified: '2026-04-05',
    author: { '@type': 'Organization', name: 'פרפקט וואן' },
    publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://perfect1.co.il' },
    url: 'https://perfect1.co.il/osek-patur/steps',
    inLanguage: 'he',
  };

  const schemaFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: typeof f.answer === 'string' ? f.answer : f.question },
    })),
  };

  return (
    <div dir="rtl" className="bg-white min-h-screen font-sans">
      <Helmet>
        <title>איך פותחים עוסק פטור בישראל? המדריך המלא 2026 | פרפקט וואן</title>
        <meta name="description" content="מדריך שלב אחרי שלב לפתיחת עוסק פטור — מה צריך, שלבי הרישום, טעויות נפוצות וכיצד לחסוך זמן וכסף. ליווי מקצועי זמין." />
        <meta name="keywords" content="פתיחת עוסק פטור, שלבי פתיחת עוסק פטור, איך פותחים עוסק פטור, רישום עוסק פטור, מדריך עוסק פטור" />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.perfect1.co.il/OsekPaturSteps" />
        <script type="application/ld+json">{JSON.stringify(schemaArticle)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaFaq)}</script>
      </Helmet>

      {/* ===== HERO ===== */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F4C75 60%, #1a6b8a 100%)' }}
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #F59E0B 0%, transparent 50%), radial-gradient(circle at 80% 20%, #34D399 0%, transparent 50%)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-20">

          {/* Mobile: single column stack. Desktop: 2 columns */}
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-10 md:items-center">

            {/* === Block 1: Badge + Title + Subtitle (mobile: top) === */}
            <div className="text-right md:hidden mb-5">
              <div className="inline-flex items-center gap-2 bg-yellow-400/30 border border-yellow-400/60 rounded-full px-3 py-1.5 mb-4">
                <BookOpen className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                <span className="text-yellow-200 text-sm font-bold">מדריך מקיף לשנת 2026</span>
              </div>
              <h1 className="text-[28px] font-extrabold text-white leading-tight mb-3">
                איך פותחים<br />
                <span className="text-yellow-400">עוסק פטור</span> בישראל?
              </h1>
              <p className="text-white/85 text-base leading-relaxed mb-4">
                המדריך המלא — שלב אחרי שלב, מה צריך להכין, אילו טעויות להימנע, ולמה כדאי לא לעשות את זה לבד.
              </p>
            </div>

            {/* === Block 2: Form (mobile: before checkmarks) === */}
            <div className="md:order-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 md:p-8">
              <LeadForm
                id="hero-form"
                variant="hero"
                title="קבלו ליווי לפתיחת עוסק פטור"
                subtitle="מלאו פרטים — נחזור אליכם תוך שעה"
                ctaText="בדקו איך לפתוח עוסק פטור"
              />
            </div>

            {/* === Block 3: Checkmarks (mobile: after form) === */}
            <div className="md:hidden flex flex-col gap-2.5 mb-5">
              {[
                { icon: CheckCircle2, text: 'פתיחה מלאה ב-3 שלבים פשוטים' },
                { icon: Clock, text: 'זמן ממוצע: שעה עם ליווי מקצועי' },
                { icon: Zap, text: 'ליווי מקצועי ב-0 עלות ייעוץ ראשוני' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                  <Icon className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white font-medium text-[15px]">{text}</span>
                </div>
              ))}
            </div>

            {/* === Desktop only: text + checkmarks in left column === */}
            <div className="hidden md:block text-right md:order-1">
              <div className="inline-flex items-center gap-2 bg-yellow-400/30 border border-yellow-400/60 rounded-full px-4 py-2 mb-5">
                <BookOpen className="w-4 h-4 text-yellow-300" />
                <span className="text-yellow-200 text-sm font-bold">מדריך מקיף לשנת 2026</span>
              </div>
              <div className="text-4xl font-extrabold text-white leading-tight mb-4" aria-hidden="true">
                איך פותחים<br />
                <span className="text-yellow-400">עוסק פטור</span> בישראל?
              </div>
              <p className="text-white/85 text-xl leading-relaxed mb-7">
                המדריך המלא — שלב אחרי שלב, מה צריך להכין, אילו טעויות להימנע, ולמה כדאי לא לעשות את זה לבד.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: CheckCircle2, text: 'פתיחה מלאה ב-3 שלבים פשוטים' },
                  { icon: Clock, text: 'זמן ממוצע: שעה עם ליווי מקצועי' },
                  { icon: Zap, text: 'ליווי מקצועי ב-0 עלות ייעוץ ראשוני' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
                    <Icon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white font-medium text-lg">{text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== מה תמצאו במדריך ===== */}
      <Section className="bg-gray-50">
        <div className="text-center mb-7">
          <h2 className="text-[22px] md:text-3xl font-extrabold text-portal-navy mb-2">מה תמצאו במדריך הזה?</h2>
          <p className="text-gray-500 text-[15px] max-w-xl mx-auto">כל מה שצריך לדעת לפני שפותחים — בלי ז'רגון, בלי שטויות</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {[
            { icon: ClipboardList, title: '3 שלבי הרישום', desc: 'מס הכנסה, מע"מ וביטוח לאומי' },
            { icon: FileText, title: 'מה צריך להכין', desc: 'רשימת מסמכים ומידע מראש' },
            { icon: AlertTriangle, title: '5 טעויות נפוצות', desc: 'ואיך להימנע מהן' },
            { icon: UserCheck, title: 'לבד מול ליווי', desc: 'מה באמת כדאי לבחור' },
            { icon: HelpCircle, title: '7 שאלות נפוצות', desc: 'תשובות ישירות וברורות' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-portal-teal" />
              </div>
              <h3 className="font-bold text-portal-navy mb-1 text-[14px] md:text-base">{title}</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ===== מה זה עוסק פטור ===== */}
      <Section>
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-10 md:items-center gap-6">
          <div>
            <h2 className="text-[22px] md:text-3xl font-extrabold text-portal-navy mb-3">מה זה בכלל עוסק פטור?</h2>
            <p className="text-gray-600 leading-relaxed mb-3 text-[15px]">
              עוסק פטור הוא סטטוס עסקי שמיועד לבעלי עסקים קטנים ועצמאים שהמחזור השנתי שלהם נמוך מהתקרה הקבועה בחוק (כ-120,000 ש"ח בשנה).
            </p>
            <p className="text-gray-600 leading-relaxed mb-3 text-[15px]">
              היתרון המרכזי: <strong className="text-portal-navy">לא גובים מע"מ מהלקוחות ולא מגישים דוחות מע"מ.</strong> זה הופך את הניהול לפשוט הרבה יותר.
            </p>
            <p className="text-gray-600 leading-relaxed mb-5 text-[15px]">
              פרילנסרים, מורים פרטיים, יועצים, מעצבים, צלמים — רבים מהם מתחילים כעוסק פטור ועוברים לעוסק מורשה רק כשהעסק גדל.
            </p>
            <a href="/osek-patur" className="inline-flex items-center gap-2 text-portal-teal font-semibold hover:underline text-[15px]">
              <ArrowLeft className="w-4 h-4" />
              קראו עוד על עוסק פטור
            </a>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 md:p-7 border border-blue-100">
            <h3 className="font-bold text-portal-navy mb-4 text-[17px]">מי מתאים לעוסק פטור?</h3>
            {[
              'פרילנסרים ועצמאים בתחילת הדרך',
              'מחזור עסקי עד ~120,000 ש"ח בשנה',
              'שירות ישיר לאנשים פרטיים (לא לעסקים)',
              'מי שרוצה ניהול חשבונאי פשוט',
              'עבודה מהבית או בלי עלויות גבוהות',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 mb-3 last:mb-0">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-[15px]">{item}</span>
              </div>
            ))}
            <div className="mt-5 pt-4 border-t border-blue-200">
              <p className="text-[13px] text-blue-700 font-medium">
                לא בטוחים שעוסק פטור מתאים לכם?{' '}
                <a href="/patur-vs-murshe" className="underline">קראו השוואה מלאה</a>
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== שלבי הפתיחה + טופס ===== */}
      <Section id="steps" className="bg-gray-50">
        <div className="text-center mb-7">
          <h2 className="text-[22px] md:text-3xl font-extrabold text-portal-navy mb-2">3 שלבים לפתיחת עוסק פטור</h2>
          <p className="text-gray-500 text-[15px]">בצדו הנכון של הבירוקרטיה — מהיר יותר ממה שחשבתם</p>
        </div>

        <div className="space-y-4 mb-8">
          {steps.map(({ num, title, body, icon: Icon }, i) => (
            <div key={num} className="bg-white rounded-2xl p-4 md:p-8 border border-gray-100 shadow-sm flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-portal-navy flex items-center justify-center">
                <span className="text-white font-extrabold text-lg">{num}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="w-4 h-4 text-portal-teal flex-shrink-0" />
                  <h3 className="font-bold text-portal-navy text-[16px] md:text-lg">{title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-[14px] md:text-base">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* טופס שני — באמצע */}
        <div className="bg-white rounded-2xl p-5 md:p-10 border border-blue-100 shadow-md max-w-lg mx-auto">
          <LeadForm
            id="mid-form-steps"
            variant="mid-steps"
            title="רוצים שנעשה את זה בשבילכם?"
            subtitle="ליווי מלא בכל 3 השלבים — בלי לחכות בתורים"
            ctaText="קבלו ליווי לפתיחת עוסק פטור"
          />
        </div>
      </Section>

      {/* ===== מה צריך להכין ===== */}
      <Section>
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-10 md:items-start gap-6">
          <div>
            <h2 className="text-[22px] md:text-3xl font-extrabold text-portal-navy mb-3">מה צריך להכין לפני שמתחילים?</h2>
            <p className="text-gray-600 mb-5 text-[15px] leading-relaxed">
              לפני שיושבים ממלאים טפסים, כדאי להכין מראש את כל המידע. ככה זה הולך הרבה יותר מהר.
            </p>
            <ul className="space-y-3">
              {mustHave.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-[15px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-5 md:p-7 border border-yellow-100">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <h3 className="font-bold text-portal-navy text-[17px]">טיפ חשוב</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4 text-[15px]">
              בחירת קוד הענף הנכון היא אחת ההחלטות הכי חשובות בשלב הרישום. קוד לא מתאים עלול ליצור בעיות בדיווחים ולגרום לספקות בביקורת.
            </p>
            <p className="text-gray-700 leading-relaxed text-[15px]">
              יועץ מקצועי מכיר את כל הקודים ויכול לחסוך מכם הרבה כאב ראש — עוד לפני שמתחילים.
            </p>
            {/* טופס שלישי */}
            <div className="mt-6 pt-5 border-t border-yellow-200">
              <LeadForm
                id="mid-form-checklist"
                variant="mid-checklist"
                title="רוצים עזרה בבחירת קוד הענף?"
                ctaText="שלחו פרטים — ניצור קשר"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ===== טעויות נפוצות ===== */}
      <Section className="bg-red-50">
        <div className="text-center mb-7">
          <h2 className="text-[22px] md:text-3xl font-extrabold text-portal-navy mb-2">5 טעויות נפוצות שאנשים עושים</h2>
          <p className="text-gray-500 text-[15px]">הימנעות מהן יכולה לחסוך לכם אלפי שקלים וכאב ראש</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3 md:gap-5 mb-7">
          {mistakes.map(({ title, desc }) => (
            <div key={title} className="bg-white rounded-xl p-4 md:p-6 border border-red-100 shadow-sm flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-portal-navy mb-1 text-[14px] md:text-base">{title}</h3>
                <p className="text-gray-600 text-[13px] md:text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* טופס רביעי */}
        <div className="bg-white rounded-2xl p-5 md:p-9 border border-red-100 shadow-md max-w-lg mx-auto">
          <LeadForm
            id="mid-form-mistakes"
            variant="mid-mistakes"
            title="רוצים ליווי שמונע את הטעויות?"
            subtitle="נבדוק יחד שהכל עובר תקין — מהרישום הראשון"
            ctaText="קבלו ייעוץ חינם"
          />
        </div>
      </Section>

      {/* ===== לבד מול ליווי ===== */}
      <Section>
        <div className="text-center mb-7">
          <h2 className="text-[22px] md:text-3xl font-extrabold text-portal-navy mb-2">לפתוח לבד או עם ליווי?</h2>
          <p className="text-gray-500 text-[15px]">השוואה כנה — כדי שתחליטו בעצמכם</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4 text-[16px] flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold flex-shrink-0">✗</span>
              לבד (ללא ליווי)
            </h3>
            <ul className="space-y-3">
              {withoutUs.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-red-400 text-base mt-0.5 flex-shrink-0 leading-none">✗</span>
                  <span className="text-gray-600 text-[14px] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
            <h3 className="font-bold text-green-700 mb-4 text-[16px] flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center text-sm font-bold flex-shrink-0">✓</span>
              עם ליווי פרפקט וואן
            </h3>
            <ul className="space-y-3">
              {withUs.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-[14px] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ===== מה השירות כולל ===== */}
      <Section className="bg-portal-navy text-white">
        <div className="text-center mb-7">
          <h2 className="text-[22px] md:text-3xl font-extrabold text-white mb-2">השירות שלנו — מה כולל?</h2>
          <p className="text-white/70 text-[15px]">ליווי מלא מהיום הראשון ועד שהעסק פועל</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
          {[
            { icon: Phone, title: 'פגישת ייעוץ חינם', desc: 'בודקים יחד מה הצעדים הבאים' },
            { icon: FileText, title: 'רישום מלא', desc: 'מס הכנסה, מע"מ, ביטוח לאומי' },
            { icon: Shield, title: 'מניעת טעויות', desc: 'קוד ענף, טפסים, סדר פעולות' },
            { icon: Clock, title: 'חיסכון בזמן', desc: 'מה שלוקח ימים לבד — שעות איתנו' },
            { icon: Users, title: 'מענה לשאלות', desc: 'זמינים גם אחרי הפתיחה' },
            { icon: BadgeCheck, title: 'ניסיון של שנים', desc: 'ליווינו אלפי עצמאים' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/10 border border-white/20 rounded-xl p-4 md:p-5">
              <Icon className="w-5 h-5 text-yellow-400 mb-2" />
              <h3 className="font-bold text-white mb-1 text-[14px] md:text-base">{title}</h3>
              <p className="text-white/70 text-[12px] md:text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ===== FAQ ===== */}
      <Section>
        <div className="text-center mb-7">
          <h2 className="text-[22px] md:text-3xl font-extrabold text-portal-navy mb-2">שאלות נפוצות</h2>
          <p className="text-gray-500 text-[15px]">תשובות ישירות לשאלות שרוב האנשים שואלים</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-w-2xl mx-auto">
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

      {/* ===== FINAL CTA ===== */}
      <section
        className="py-12 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F4C75 0%, #1E3A5F 100%)' }}
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #F59E0B 0%, transparent 50%)' }} />
        <div className="relative max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-4 py-1.5 mb-5">
            <Star className="w-4 h-4 text-yellow-300 flex-shrink-0" />
            <span className="text-yellow-200 text-[13px] font-semibold">+5,000 עצמאים כבר נפתחו איתנו</span>
          </div>
          <h2 className="text-[26px] md:text-4xl font-extrabold text-white mb-3">
            מוכנים לפתוח את<br />
            <span className="text-yellow-400">עוסק הפטור שלכם?</span>
          </h2>
          <p className="text-white/80 text-[15px] md:text-lg mb-6">
            מלאו פרטים — ניצור קשר תוך שעה ונתאם ייעוץ חינמי
          </p>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 md:p-7">
            <LeadForm
              id="final-form"
              variant="final"
              title="השאירו פרטים — נחזור אליכם"
              ctaText="פתחו עוסק פטור עכשיו"
            />
          </div>
        </div>
      </section>

      {/* ===== FOOTER LINKS ===== */}
      <div className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-4">קישורים קשורים</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { href: '/osek-patur', label: 'עוסק פטור — כל מה שצריך לדעת' },
              { href: '/patur-vs-murshe', label: 'עוסק פטור או מורשה?' },
              { href: '/osek-patur/open', label: 'פתיחת עוסק פטור' },
              { href: '/osek-patur/accountant', label: 'רואה חשבון לעוסק פטור' },
            ].map(({ href, label }) => (
              <a key={href} href={href} className="text-portal-teal hover:underline text-sm font-medium">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
