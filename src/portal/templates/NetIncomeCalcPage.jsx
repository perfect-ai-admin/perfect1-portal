import React from 'react';
import { Calculator, ChevronLeft, FileText, Users, Building2, Briefcase, Scale } from 'lucide-react';
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
  { q: 'איך מחשבים נטו לעצמאי?', a: 'מחשבים את הרווח לפני מס (הכנסה פחות הוצאות מוכרות), ואז מפחיתים מס הכנסה לפי מדרגות המס, מזכים נקודות זיכוי, ומפחיתים ביטוח לאומי ומס בריאות. התוצאה היא הנטו המשוער שנשאר לעצמאי.' },
  { q: 'האם ההוצאות מורידות את המס?', a: 'כן. הוצאות מוכרות מורידות את הרווח החייב במס, ולכן ככל שיש יותר הוצאות מוכרות — המס יורד. חשוב שההוצאות יהיו מוכרות על פי חוק ומתועדות כראוי.' },
  { q: 'מה זה נקודות זיכוי ואיך הן משפיעות?', a: 'נקודות זיכוי הן הנחה ישירה מסכום המס. כל תושב ישראל מקבל 2.25 נקודות בסיסיות. נשים, הורים, חיילים משוחררים ואוכלוסיות נוספות זכאים לנקודות נוספות. כל נקודה מפחיתה כ-235 ₪ ממס ההכנסה החודשי.' },
  { q: 'האם המחשבון מדויק ב-100%?', a: 'לא. המחשבון מספק הערכה משוערת בלבד. החישוב המדויק תלוי בנתונים נוספים כמו הכנסות ממקורות אחרים, זכאויות מיוחדות, הפרשות לפנסיה, קופות גמל ועוד. לחישוב מדויק מומלץ לפנות לרואה חשבון.' },
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
  name: 'מחשבון נטו לעצמאי – כמה נשאר אחרי מס והוצאות',
  description: 'מחשבון נטו לעצמאי בישראל: הזינו הכנסות, הוצאות ונקודות זיכוי וגלו כמה נשאר לכם נטו אחרי מס הכנסה וביטוח לאומי.',
  url: 'https://www.perfect1.co.il/calculators/net-income',
  inLanguage: 'he',
  isPartOf: { '@type': 'WebSite', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hero-subtitle'] },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.filter(b => b.href).map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.label, item: `https://www.perfect1.co.il${b.href}` })),
};

export default function NetIncomeCalcPage() {
  return (
    <>
      <SEOHead
        title="מחשבון נטו לעצמאי – כמה נשאר אחרי מס והוצאות | פרפקט וואן"
        description="מחשבון נטו לעצמאי בישראל: הזינו הכנסות, הוצאות ונקודות זיכוי וגלו כמה נשאר לכם נטו אחרי מס הכנסה וביטוח לאומי."
        canonical="/calculators/net-income"
        keywords="מחשבון נטו לעצמאי, כמה נשאר נטו עצמאי, מחשבון מס הכנסה עצמאי, מחשבון ביטוח לאומי, חישוב נטו עוסק פטור, חישוב נטו עוסק מורשה"
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
