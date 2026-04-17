import React from 'react';
import { Calculator, ChevronLeft, FileText, Users, Building2, Briefcase, Scale, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import IncomeTaxCalculator from '../calculators/IncomeTaxCalculator';
import { Helmet } from 'react-helmet-async';

const FAQ_ITEMS = [
  { q: 'כמה מס הכנסה משלם עצמאי?', a: 'עצמאי בישראל משלם מס הכנסה לפי מדרגות מס פרוגרסיביות — מ-10% על 84,120 ש"ח הראשונים בשנה ועד 50% על הכנסה מעל 721,560 ש"ח. מס ההכנסה מחושב על הרווח (הכנסה פחות הוצאות מוכרות), ולאחר מכן מפחיתים נקודות זיכוי.' },
  { q: 'מה זה מדרגות מס הכנסה?', a: 'מדרגות מס הן שיטה פרוגרסיבית — כל חלק מההכנסה חייב בשיעור מס שונה. לדוגמה: על 84,120 ש"ח הראשונים תשלמו 10%, על החלק בין 84,120 ל-120,720 תשלמו 14%, וכך הלאה. ככל שההכנסה גבוהה יותר, השיעור על החלק העליון גבוה יותר — אבל לא על כל ההכנסה.' },
  { q: 'איך נקודות זיכוי מפחיתות מס?', a: 'כל נקודת זיכוי שווה 235 ש"ח הנחה בחודש (2,820 ש"ח בשנה) ישירות מסכום המס. כל תושב מקבל 2.25 נקודות בסיס. נשים מקבלות חצי נקודה נוספת. הורים לילדים מקבלים נקודות נוספות לפי גיל הילדים. למשל, עצמאי עם 2.25 נקודות חוסך 6,345 ש"ח מס בשנה.' },
  { q: 'מה ההבדל בין עוסק פטור לעוסק מורשה במס?', a: 'לעניין מס הכנסה — אין הבדל. שניהם משלמים מס הכנסה לפי אותן מדרגות. ההבדל המרכזי הוא במע"מ: עוסק מורשה גובה ומשלם מע"מ (17%), ויכול לקזז מע"מ תשומות. עוסק פטור לא גובה מע"מ אבל גם לא מקזז.' },
  { q: 'איך הוצאות מוכרות מפחיתות מס?', a: 'הוצאות מוכרות מפחיתות את הרווח החייב במס. לדוגמה: אם הכנסתכם 20,000 ש"ח והוצאותיכם 5,000 ש"ח, תשלמו מס רק על 15,000 ש"ח. הוצאות נפוצות: שכירות משרד, ציוד מחשוב, נסיעות עסקיות, טלפון, אינטרנט, שירותים מקצועיים, ביטוח מקצועי.' },
  { q: 'מה שיעור המס האפקטיבי?', a: 'שיעור המס האפקטיבי הוא אחוז המס שאתם באמת משלמים מתוך הרווח. בגלל שמדרגות המס פרוגרסיביות ויש נקודות זיכוי, השיעור האפקטיבי תמיד נמוך מהמדרגה הגבוהה ביותר. עצמאי שמרוויח 15,000 ש"ח בחודש ישלם שיעור אפקטיבי של כ-10-12% בלבד.' },
  { q: 'האם המחשבון כולל ביטוח לאומי?', a: 'לא. המחשבון הזה מחשב רק מס הכנסה. ביטוח לאומי ומס בריאות הם תשלומים נפרדים שמגיעים בנוסף למס הכנסה. לחישוב מלא כולל ביטוח לאומי, השתמשו במחשבון הנטו המלא שלנו.' },
];

const breadcrumbs = [
  { label: 'דף הבית', href: '/' },
  { label: 'מחשבונים', href: '/calculators' },
  { label: 'מחשבון מס הכנסה לעצמאי' },
];

const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
};

const webPageSchema = {
  '@context': 'https://schema.org', '@type': 'WebPage',
  name: 'מחשבון מס הכנסה לעצמאי 2026 — כמה מס משלם עצמאי בישראל',
  description: 'מחשבון מס הכנסה לעצמאי 2026: חשבו כמה מס הכנסה תשלמו לפי מדרגות מס, נקודות זיכוי והוצאות מוכרות. חישוב מהיר ומדויק.',
  url: 'https://www.perfect1.co.il/calculators/income-tax',
  inLanguage: 'he',
  isPartOf: { '@type': 'WebSite', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hero-subtitle', '.answer-block'] },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.filter(b => b.href).map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.label, item: `https://www.perfect1.co.il${b.href}` })),
};

export default function IncomeTaxCalcPage() {
  return (
    <>
      <SEOHead
        title="מחשבון מס הכנסה לעצמאי 2026 — כמה מס משלם עצמאי בישראל | פרפקט וואן"
        description="מחשבון מס הכנסה לעצמאי 2026: חשבו כמה מס הכנסה תשלמו לפי מדרגות מס, נקודות זיכוי והוצאות מוכרות. בדיקה חינם תוך 30 שניות."
        canonical="/calculators/income-tax"
        keywords="מחשבון מס הכנסה לעצמאי, כמה מס משלם עצמאי, מדרגות מס הכנסה 2026, חישוב מס הכנסה עצמאי, מס הכנסה עוסק פטור, מס הכנסה עוסק מורשה, נקודות זיכוי מס, הוצאות מוכרות, שיעור מס אפקטיבי, מחשבון מס ישראל"
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-portal-navy leading-tight mb-4">
                כמה מס הכנסה משלם עצמאי בישראל?
              </h1>
              <p className="hero-subtitle text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                חשבו תוך 30 שניות כמה מס הכנסה תשלמו לפי ההכנסה, ההוצאות ונקודות הזיכוי שלכם
              </p>
              <p className="text-sm text-gray-500 mt-3">מחשבון מס הכנסה בלבד — ללא ביטוח לאומי. מעודכן לשנת המס 2026.</p>
            </div>
            <IncomeTaxCalculator />
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מדרגות מס הכנסה לעצמאים 2026</h2>
              <p className="text-gray-600 leading-relaxed mb-4">מס הכנסה בישראל מחושב לפי שיטת מדרגות — כל חלק מההכנסה חייב בשיעור מס שונה. ככל שההכנסה גבוהה יותר, המדרגה על החלק העליון גבוהה יותר, אבל לא על כל ההכנסה.</p>
              <div className="bg-portal-bg rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-portal-navy text-white">
                    <tr>
                      <th className="p-3 text-right">הכנסה שנתית</th>
                      <th className="p-3 text-right">שיעור מס</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['עד 84,120 ש"ח', '10%'],
                      ['84,121 – 120,720 ש"ח', '14%'],
                      ['120,721 – 193,800 ש"ח', '20%'],
                      ['193,801 – 269,280 ש"ח', '31%'],
                      ['269,281 – 560,280 ש"ח', '35%'],
                      ['560,281 – 721,560 ש"ח', '47%'],
                      ['מעל 721,560 ש"ח', '50%'],
                    ].map(([income, rate], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 text-gray-700">{income}</td>
                        <td className="p-3 font-semibold text-portal-navy">{rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">איך לחשב מס הכנסה לעצמאי</h2>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'חשבו את הרווח — הכנסה חודשית פחות הוצאות מוכרות' },
                  { step: '2', text: 'הכפילו ב-12 לקבלת הרווח השנתי' },
                  { step: '3', text: 'חשבו מס לפי מדרגות — כל חלק מההכנסה במדרגה שלו' },
                  { step: '4', text: 'הפחיתו נקודות זיכוי — כל נקודה = 2,820 ש"ח הנחה בשנה' },
                  { step: '5', text: 'חלקו ב-12 לקבלת המס החודשי' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3 p-3 bg-portal-bg rounded-xl">
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-portal-teal text-white text-sm font-bold rounded-full">{step}</span>
                    <span className="text-gray-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מתי כדאי לעבור לחברה בע"מ?</h2>
              <p className="text-gray-600 leading-relaxed">כאשר הרווח השנתי עולה על 300,000-400,000 ש"ח, כדאי לבדוק מעבר לחברה בע"מ. מס חברות עומד על 23% בלבד — לעומת 35% ומעלה לעצמאי ברווחים גבוהים. עם זאת, יש עלויות נוספות (רואה חשבון, דוחות, אגרות), ולכן ההחלטה צריכה להיות מבוססת על חישוב מדויק.</p>
              <Link to="/hevra-bam/how-to-open" className="inline-flex items-center gap-2 mt-3 text-portal-teal font-medium hover:underline">
                מדריך: מתי לפתוח חברה בע"מ →
              </Link>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">למי מתאים המחשבון?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: FileText, label: 'עוסק פטור' }, { icon: Briefcase, label: 'עוסק מורשה' }, { icon: Users, label: 'פרילנסר' },
                  { icon: Building2, label: 'עצמאי בתחילת הדרך' }, { icon: Scale, label: 'בודקים כדאיות חברה' }, { icon: Calculator, label: 'תכנון מס שנתי' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-3 bg-portal-bg rounded-xl"><Icon className="w-5 h-5 text-portal-teal flex-shrink-0" /><span className="text-sm text-portal-navy font-medium">{label}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 sm:py-12 bg-portal-bg">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-6">מדריכים קשורים</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/calculators/net-income', label: 'מחשבון נטו מלא', desc: 'כולל ביטוח לאומי ומס בריאות' },
                { href: '/calculators/credit-points', label: 'מחשבון נקודות זיכוי', desc: 'כמה נקודות זיכוי מגיעות לכם' },
                { href: '/misui/tax-brackets', label: 'מדרגות מס הכנסה 2026', desc: 'טבלת מדרגות מס עדכנית' },
                { href: '/misui/advance-payments', label: 'מקדמות מס הכנסה', desc: 'איך עובדות מקדמות ואיך מפחיתים' },
                { href: '/osek-murshe/tax-deductions', label: 'הוצאות מוכרות', desc: 'אילו הוצאות מפחיתות מס' },
                { href: '/hevra-bam/taxes', label: 'מיסוי חברה בע"מ', desc: 'מס חברות, דיבידנד ותכנון מס' },
              ].map(({ href, label, desc }) => (
                <Link key={href} to={href} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-portal-teal/30 transition-colors group">
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
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-8 text-center">שאלות נפוצות</h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, i) => (
                <details key={i} className="group bg-portal-bg rounded-xl border border-gray-100 overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-portal-navy">{item.q}</span>
                    <ChevronLeft className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-[-90deg]" aria-hidden="true" />
                  </summary>
                  <div className="answer-block px-5 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-portal-bg border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="p-5 bg-white rounded-xl border border-gray-200">
              <h3 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2"><Scale className="w-4 h-4" />הסתייגות משפטית</h3>
              <p className="text-xs text-gray-500 leading-relaxed">המחשבון נותן הערכה כללית בלבד ואינו מהווה ייעוץ מס. החישוב מבוסס על מדרגות מס הכנסה 2026 ואינו כולל ביטוח לאומי, מס בריאות, הפרשות פנסיוניות או זכאויות מיוחדות. לחישוב מדויק פנו לרואה חשבון.</p>
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
