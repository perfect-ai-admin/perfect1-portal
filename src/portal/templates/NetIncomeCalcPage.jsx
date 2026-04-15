import React from 'react';
import { Calculator, ChevronLeft, FileText, Users, Building2, Briefcase, Scale, ArrowLeft, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import PortalLeadForm from '../components/PortalLeadForm';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import NetIncomeCalculator from '../calculators/NetIncomeCalculator';
import { Helmet } from 'react-helmet-async';

const FAQ_ITEMS = [
  { q: 'כמה מס משלם עצמאי בישראל?', a: 'עצמאי בישראל משלם מס הכנסה לפי מדרגות מס פרוגרסיביות (10% עד 50%), ביטוח לאומי (6.72% עד 11.23%) ומס בריאות. גובה המס תלוי ברווח השנתי, בנקודות הזיכוי ובהוצאות המוכרות. לדוגמה, עצמאי שמרוויח 15,000 ש"ח בחודש ישלם כ-25%-30% מהרווח במסים.' },
  { q: 'איך מחשבים מס הכנסה לעצמאי?', a: 'חישוב מס הכנסה לעצמאי נעשה בשלושה שלבים: ראשית, מחשבים את הרווח (הכנסה פחות הוצאות מוכרות). שנית, מחשבים מס לפי מדרגות מס הכנסה 2026 — מ-10% על 84,120 ש"ח הראשונים ועד 50% מעל 721,560 ש"ח. שלישית, מפחיתים נקודות זיכוי (2.75 נקודות בסיס = 7,986 ש"ח בשנה).' },
  { q: 'כמה ביטוח לאומי משלם עצמאי?', a: 'עצמאי משלם ביטוח לאומי בשני שלבים: על החלק עד 7,522 ש"ח בחודש — 6.72%, ועל החלק מעל 7,522 ש"ח — 11.23%. לדוגמה, עצמאי עם הכנסה של 20,000 ש"ח בחודש ישלם כ-1,907 ש"ח ביטוח לאומי בחודש.' },
  { q: 'מה ההבדל בין ברוטו לנטו לעצמאי?', a: 'ברוטו הוא סך ההכנסות של העצמאי לפני ניכויים. נטו הוא מה שנשאר אחרי הפחתת הוצאות מוכרות, מס הכנסה, ביטוח לאומי ומס בריאות. בממוצע, עצמאי נשאר עם 60%-75% מהרווח כנטו, תלוי בגובה ההכנסה ובהוצאות המוכרות.' },
  { q: 'כמה נשאר נטו מ-10,000 ש"ח לעצמאי?', a: 'עצמאי שמרוויח 10,000 ש"ח בחודש (120,000 ש"ח בשנה) לפני הוצאות, משלם כ-450 ש"ח מס הכנסה וכ-785 ש"ח ביטוח לאומי. נשאר כ-8,760 ש"ח נטו בחודש — כ-87.6% מההכנסה.' },
  { q: 'כמה נשאר נטו מ-20,000 ש"ח לעצמאי?', a: 'עצמאי שמרוויח 20,000 ש"ח בחודש (240,000 ש"ח בשנה) לפני הוצאות, משלם כ-2,874 ש"ח מס הכנסה וכ-1,907 ש"ח ביטוח לאומי. נשאר כ-15,220 ש"ח נטו בחודש — כ-76.1% מההכנסה.' },
  { q: 'כמה נשאר נטו מ-30,000 ש"ח לעצמאי?', a: 'עצמאי שמרוויח 30,000 ש"ח בחודש (360,000 ש"ח בשנה) לפני הוצאות, משלם כ-6,276 ש"ח מס הכנסה וכ-3,030 ש"ח ביטוח לאומי. נשאר כ-20,694 ש"ח נטו בחודש — כ-69% מההכנסה.' },
  { q: 'האם ההוצאות מורידות את המס?', a: 'כן. הוצאות מוכרות מורידות את הרווח החייב במס, ולכן ככל שיש יותר הוצאות מוכרות — המס יורד. חשוב שההוצאות יהיו מוכרות על פי חוק ומתועדות כראוי. הוצאות נפוצות: שכירות משרד, ציוד, נסיעות, טלפון, אינטרנט ושירותים מקצועיים.' },
  { q: 'מה זה נקודות זיכוי ואיך הן משפיעות?', a: 'נקודות זיכוי הן הנחה ישירה מסכום המס. כל תושב ישראל מקבל 2.75 נקודות בסיסיות (שווי 7,986 ש"ח בשנה, 665 ש"ח בחודש). נשים, הורים, חיילים משוחררים ואוכלוסיות נוספות זכאים לנקודות נוספות. נקודות הזיכוי מפחיתות ישירות מסכום המס שצריך לשלם.' },
  { q: 'האם המחשבון מדויק ב-100%?', a: 'לא. המחשבון מספק הערכה משוערת בלבד על בסיס מדרגות המס והביטוח הלאומי לשנת 2026. החישוב המדויק תלוי בנתונים נוספים כמו הכנסות ממקורות אחרים, זכאויות מיוחדות, הפרשות לפנסיה, קופות גמל ועוד. לחישוב מדויק מומלץ לפנות לרואה חשבון.' },
];

const breadcrumbs = [
  { label: 'דף הבית', href: '/' },
  { label: 'מחשבונים', href: '/calculators' },
  { label: 'מחשבון נטו לעצמאי' },
];

const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
};

const webPageSchema = {
  '@context': 'https://schema.org', '@type': 'WebPage',
  name: 'מחשבון נטו לעצמאי 2026 – כמה נשאר אחרי מס הכנסה וביטוח לאומי',
  description: 'מחשבון נטו לעצמאי בישראל 2026: חשבו כמה מס משלם עצמאי שמרוויח 10,000, 20,000 או 30,000 ש"ח — לפי מדרגות מס הכנסה וביטוח לאומי.',
  url: 'https://www.perfect1.co.il/calculators/net-income',
  inLanguage: 'he',
  isPartOf: { '@type': 'WebSite', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hero-subtitle', '.answer-block'] },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.filter(b => b.href).map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.label, item: `https://www.perfect1.co.il${b.href}` })),
};

export default function NetIncomeCalcPage() {
  return (
    <>
      <SEOHead
        title="מחשבון נטו לעצמאי 2026 – כמה נשאר אחרי מס הכנסה וביטוח לאומי | פרפקט וואן"
        description="מחשבון נטו לעצמאי 2026: חשבו כמה מס משלם עצמאי שמרוויח 10,000, 20,000 או 30,000 ₪. חישוב מדרגות מס הכנסה + ביטוח לאומי — בדיקה חינם."
        canonical="/calculators/net-income"
        keywords="מחשבון נטו לעצמאי, כמה נשאר נטו עצמאי, כמה מס משלם עצמאי, מחשבון מס הכנסה עצמאי, מחשבון ביטוח לאומי, חישוב נטו עוסק פטור, חישוב נטו עוסק מורשה, כמה מס משלם עצמאי שמרוויח 10000, כמה מס משלם עצמאי שמרוויח 20000, מדרגות מס הכנסה 2026, ביטוח לאומי עצמאי 2026"
        type="website"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <PortalHeader />
      <main className="pt-14 sm:pt-16 md:pt-[72px]">
        {/* Hero + Calculator */}
        <section className="bg-gradient-to-b from-portal-bg to-white py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Breadcrumbs items={breadcrumbs} />
            <div className="text-center mt-6 mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-portal-navy leading-tight mb-4">מחשבון נטו לעצמאי</h1>
              <p className="hero-subtitle text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                בדקו כמה נשאר לכם נטו אחרי הוצאות, מס הכנסה וביטוח לאומי — לפי חישוב משוער לעצמאים בישראל
              </p>
              <p className="text-sm text-gray-600 mt-3">עצמאים רבים לא באמת יודעים כמה נשאר להם נטו אחרי מסים והוצאות. המחשבון הזה נותן לכם הערכה מהירה ופשוטה.</p>
            </div>
            <NetIncomeCalculator />
            <div className="mt-12">
              <PortalLeadForm sourcePage="calculator-net-income" title="רוצים להבין באמת כמה תשלמו?" subtitle="השאירו פרטים ונבדוק לכם בצורה מקצועית — בדיקה ראשונית חינם" ctaText="רוצה בדיקה מקצועית" />
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">איך מחשבים נטו לעצמאי?</h2>
              <p className="text-gray-600 leading-relaxed">הנטו של עצמאי אינו רק ההכנסה שנכנסת לחשבון. צריך להפחית הוצאות מוכרות, לחשב את הרווח, ואז להביא בחשבון מס הכנסה, ביטוח לאומי ונקודות זיכוי. לכן עצמאים רבים רוצים להבין כמה באמת נשאר להם בסוף החודש — והמחשבון שלנו עוזר לקבל תמונה ראשונית.</p>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מה משפיע על הנטו של עצמאי?</h2>
              <ul className="space-y-3">
                {['גובה ההכנסה החודשית', 'גובה ההוצאות המוכרות', 'מספר נקודות זיכוי', 'מעמד העסק (פטור / מורשה)', 'מבנה הדיווח ותכנון מס', 'ביטוח לאומי ומס בריאות'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600"><ChevronLeft className="w-4 h-4 text-portal-teal flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">למי מתאים המחשבון?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: FileText, label: 'עוסק פטור' }, { icon: Briefcase, label: 'עוסק מורשה' }, { icon: Users, label: 'פרילנסר' },
                  { icon: Building2, label: 'עצמאי בתחילת הדרך' }, { icon: Scale, label: 'מי ששוקל לפתוח עסק' }, { icon: Calculator, label: 'בודקים כמה נשאר נטו' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-3 bg-portal-bg rounded-xl"><Icon className="w-5 h-5 text-portal-teal flex-shrink-0" /><span className="text-sm text-portal-navy font-medium">{label}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tax calculations by income level - AEO/GEO optimized */}
        <section className="py-12 sm:py-16 bg-portal-bg" id="tax-by-income">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-3 text-center">כמה מס משלם עצמאי? חישוב לפי הכנסה</h2>
            <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">חישובים מעודכנים לשנת 2026, לפי מדרגות מס הכנסה וביטוח לאומי לעצמאים. הנתונים הם הערכה לפני הוצאות מוכרות.</p>

            {/* 10,000 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6" id="income-10000">
              <h3 className="text-xl font-bold text-portal-navy mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-portal-teal" />
                <Link to="/misui/tax-10000" className="hover:text-portal-teal transition-colors">כמה מס משלם עצמאי שמרוויח 10,000 ש"ח בחודש</Link>
              </h3>
              <p className="answer-block text-gray-700 leading-relaxed mb-4">
                עצמאי שמרוויח 10,000 ש"ח בחודש (120,000 ש"ח בשנה) משלם כ-454 ש"ח מס הכנסה בחודש וכ-785 ש"ח ביטוח לאומי ומס בריאות. סה"כ ניכויים: כ-1,239 ש"ח בחודש. נשאר כ-8,760 ש"ח נטו — כ-87.6% מההכנסה.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">הכנסה שנתית</div><div className="font-bold text-portal-navy">120,000 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">מס הכנסה</div><div className="font-bold text-red-600">~5,450 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">ביטוח לאומי</div><div className="font-bold text-red-600">~9,400 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">נטו שנתי</div><div className="font-bold text-green-600">~105,150 ש"ח</div></div>
              </div>
              <Link to="/misui/tax-10000" className="inline-flex items-center gap-2 mt-4 text-portal-teal font-medium hover:underline">
                לחישוב מלא + טיפים להפחתת מס →
              </Link>
            </div>

            {/* 20,000 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6" id="income-20000">
              <h3 className="text-xl font-bold text-portal-navy mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-portal-teal" />
                <Link to="/misui/tax-20000" className="hover:text-portal-teal transition-colors">כמה מס משלם עצמאי שמרוויח 20,000 ש"ח בחודש</Link>
              </h3>
              <p className="answer-block text-gray-700 leading-relaxed mb-4">
                עצמאי שמרוויח 20,000 ש"ח בחודש (240,000 ש"ח בשנה) משלם כ-2,874 ש"ח מס הכנסה בחודש וכ-1,907 ש"ח ביטוח לאומי ומס בריאות. סה"כ ניכויים: כ-4,781 ש"ח בחודש. נשאר כ-15,220 ש"ח נטו — כ-76.1% מההכנסה.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">הכנסה שנתית</div><div className="font-bold text-portal-navy">240,000 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">מס הכנסה</div><div className="font-bold text-red-600">~34,500 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">ביטוח לאומי</div><div className="font-bold text-red-600">~22,900 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">נטו שנתי</div><div className="font-bold text-green-600">~182,600 ש"ח</div></div>
              </div>
              <Link to="/misui/tax-20000" className="inline-flex items-center gap-2 mt-4 text-portal-teal font-medium hover:underline">
                לחישוב מלא + טיפים להפחתת מס →
              </Link>
            </div>

            {/* 30,000 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6" id="income-30000">
              <h3 className="text-xl font-bold text-portal-navy mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-portal-teal" />
                <Link to="/misui/tax-30000" className="hover:text-portal-teal transition-colors">כמה מס משלם עצמאי שמרוויח 30,000 ש"ח בחודש</Link>
              </h3>
              <p className="answer-block text-gray-700 leading-relaxed mb-4">
                עצמאי שמרוויח 30,000 ש"ח בחודש (360,000 ש"ח בשנה) משלם כ-6,276 ש"ח מס הכנסה בחודש וכ-3,030 ש"ח ביטוח לאומי ומס בריאות. סה"כ ניכויים: כ-9,306 ש"ח בחודש. נשאר כ-20,694 ש"ח נטו — כ-69% מההכנסה.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">הכנסה שנתית</div><div className="font-bold text-portal-navy">360,000 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">מס הכנסה</div><div className="font-bold text-red-600">~75,300 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">ביטוח לאומי</div><div className="font-bold text-red-600">~36,350 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">נטו שנתי</div><div className="font-bold text-green-600">~248,350 ש"ח</div></div>
              </div>
              <Link to="/misui/tax-30000" className="inline-flex items-center gap-2 mt-4 text-portal-teal font-medium hover:underline">
                לחישוב מלא + טיפים להפחתת מס →
              </Link>
            </div>

            {/* 50,000 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6" id="income-50000">
              <h3 className="text-xl font-bold text-portal-navy mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-portal-teal" />
                <Link to="/misui/tax-50000" className="hover:text-portal-teal transition-colors">כמה מס משלם עצמאי שמרוויח 50,000 ש"ח בחודש</Link>
              </h3>
              <p className="answer-block text-gray-700 leading-relaxed mb-4">
                עצמאי שמרוויח 50,000 ש"ח בחודש (600,000 ש"ח בשנה) משלם כ-13,674 ש"ח מס הכנסה בחודש וכ-5,167 ש"ח ביטוח לאומי ומס בריאות. סה"כ ניכויים: כ-18,841 ש"ח בחודש. נשאר כ-31,160 ש"ח נטו — כ-62.3% מההכנסה.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">הכנסה שנתית</div><div className="font-bold text-portal-navy">600,000 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">מס הכנסה</div><div className="font-bold text-red-600">~164,100 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">ביטוח לאומי</div><div className="font-bold text-red-600">~62,000 ש"ח</div></div>
                <div className="bg-portal-bg rounded-lg p-3"><div className="text-xs text-gray-500">נטו שנתי</div><div className="font-bold text-green-600">~373,900 ש"ח</div></div>
              </div>
              <Link to="/misui/tax-50000" className="inline-flex items-center gap-2 mt-4 text-portal-teal font-medium hover:underline">
                לחישוב מלא + טיפים להפחתת מס →
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">* החישובים מבוססים על מדרגות מס הכנסה וביטוח לאומי 2026, ללא הוצאות מוכרות, עם 2.75 נקודות זיכוי בסיסיות. לחישוב מדויק השתמשו במחשבון למעלה.</p>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 sm:py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-6">מדריכים קשורים</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/misui/tax-10000', label: 'מס על 10,000 ₪ בחודש', desc: 'חישוב מלא: מס הכנסה, ביטוח לאומי, ונטו' },
                { href: '/misui/tax-20000', label: 'מס על 20,000 ₪ בחודש', desc: 'חישוב מלא: מס הכנסה, ביטוח לאומי, ונטו' },
                { href: '/misui/tax-30000', label: 'מס על 30,000 ₪ בחודש', desc: 'חישוב מלא: מס הכנסה, ביטוח לאומי, ונטו' },
                { href: '/misui/tax-50000', label: 'מס על 50,000 ₪ בחודש', desc: 'חישוב מלא: מס הכנסה, ביטוח לאומי, ונטו' },
                { href: '/misui/tax-brackets', label: 'מדרגות מס הכנסה 2026', desc: 'כל מדרגות המס העדכניות לשכירים ועצמאים' },
                { href: '/misui/advance-payments', label: 'מקדמות מס הכנסה', desc: 'איך עובדות מקדמות ואיך מפחיתים אותן' },
                { href: '/osek-patur/taxes', label: 'מיסוי עוסק פטור', desc: 'כל מה שצריך לדעת על מס הכנסה לעוסק פטור' },
                { href: '/osek-murshe/income-tax', label: 'מס הכנסה עוסק מורשה', desc: 'מדריך דיווח ותשלום מס לעוסק מורשה' },
                { href: '/osek-murshe/tax-deductions', label: 'הוצאות מוכרות לעצמאי', desc: 'אילו הוצאות מפחיתות מס ואיך מדווחים' },
              ].map(({ href, label, desc }) => (
                <Link key={href} to={href} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-portal-teal/30 hover:bg-portal-bg/50 transition-colors group">
                  <ArrowLeft className="w-5 h-5 text-portal-teal flex-shrink-0 mt-0.5 group-hover:translate-x-[-2px] transition-transform" />
                  <div>
                    <div className="font-medium text-portal-navy group-hover:text-portal-teal transition-colors">{label}</div>
                    <div className="text-sm text-gray-500">{desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 bg-portal-bg">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-8 text-center">שאלות נפוצות</h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, i) => (
                <details key={i} className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-portal-navy">{item.q}</span>
                    <ChevronLeft className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-[-90deg]" aria-hidden="true" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2"><Scale className="w-4 h-4" />הסתייגות משפטית</h3>
              <p className="text-xs text-gray-500 leading-relaxed">המידע והמחשבון באתר נועדו לצרכי מידע כללי והערכה בלבד, ואינם מהווים ייעוץ מס, ייעוץ חשבונאי, חוות דעת מקצועית או תחליף לבדיקה פרטנית על ידי רואה חשבון או יועץ מס.</p>
            </div>
          </div>
        </section>
      </main>
      <PortalFooter />
      <WhatsAppButton />
      <StickyMobileCTA />
    </>
  );
}
