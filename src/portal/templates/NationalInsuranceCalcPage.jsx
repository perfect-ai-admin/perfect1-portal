import React from 'react';
import { Shield, ChevronLeft, FileText, Users, Building2, Briefcase, Scale, ArrowLeft, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import PortalLeadForm from '../components/PortalLeadForm';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import NationalInsuranceCalculator from '../calculators/NationalInsuranceCalculator';
import { NI_CONFIG } from '../calculators/calcNationalInsurance';
import { Helmet } from 'react-helmet-async';

const fmt = (n) => Math.round(n).toLocaleString('he-IL');

const FAQ_ITEMS = [
  { q: 'כמה ביטוח לאומי משלם עוסק פטור?', a: 'עוסק פטור משלם ביטוח לאומי ומס בריאות לפי הרווח שלו. על החלק עד 7,522 ש"ח — שיעור מופחת של 5.78% (2.66% ביטוח לאומי + 3.12% מס בריאות). על החלק מעל 7,522 ש"ח — שיעור מלא של 16.83% (11.83% + 5%). לדוגמה, עוסק פטור שמרוויח 10,000 ש"ח ישלם כ-785 ש"ח בחודש.' },
  { q: 'האם עוסק פטור משלם ביטוח לאומי?', a: 'כן. כל עצמאי בישראל, כולל עוסק פטור, חייב בתשלום ביטוח לאומי ומס בריאות. התשלום מחושב לפי הרווח (הכנסה פחות הוצאות מוכרות) ולא לפי מחזור ההכנסות.' },
  { q: 'כמה משלם עוסק מורשה לביטוח לאומי?', a: 'עוסק מורשה משלם ביטוח לאומי ומס בריאות באותם שיעורים כמו עוסק פטור — אין הבדל. השיעורים הם 5.78% על חלק ההכנסה עד 7,522 ש"ח ו-16.83% על היתרה. ההבדל היחיד הוא שלעוסק מורשה יש בדרך כלל יותר הוצאות מוכרות שמפחיתות את הבסיס לחישוב.' },
  { q: 'האם ביטוח לאומי מחושב לפי הכנסות או רווח?', a: 'ביטוח לאומי מחושב לפי הרווח — כלומר ההכנסה פחות הוצאות מוכרות. ככל שיש יותר הוצאות מוכרות, הבסיס לחישוב נמוך יותר, ולכן גם התשלום יהיה נמוך יותר. חשוב לתעד ולדווח על כל ההוצאות המוכרות.' },
  { q: 'האם הוצאות מורידות את החיוב?', a: 'כן, בהחלט. הוצאות מוכרות מפחיתות את הרווח החייב בביטוח לאומי. הוצאות נפוצות: שכירות משרד, ציוד, נסיעות, טלפון, אינטרנט, שירותים מקצועיים, ביטוח מקצועי. ככל שיותר הוצאות מוכרות — פחות ביטוח לאומי.' },
  { q: 'מה ההבדל בין ביטוח לאומי למס בריאות?', a: 'ביטוח לאומי ומס בריאות הם שני תשלומים נפרדים שנגבים יחד. ביטוח לאומי מממן קצבאות (ילדים, זקנה, נכות, אבטלה). מס בריאות מממן את שירותי הבריאות הציבוריים. שני התשלומים נגבים על ידי ביטוח לאומי ומחושבים לפי אותו בסיס הכנסה.' },
  { q: 'מה קורה אם יש לי גם עבודה כשכיר וגם עסק?', a: 'אם אתה גם שכיר וגם עצמאי, המעסיק כבר מפריש עבורך ביטוח לאומי על המשכורת. על ההכנסה מהעסק תשלם בנפרד, אבל סך כל התשלום לא יעלה על התקרה (49,030 ש"ח בחודש). כדאי להתייעץ עם רואה חשבון לתכנון נכון.' },
  { q: 'האם המחשבון מדויק ב-100%?', a: 'לא. המחשבון נותן הערכה משוערת בלבד. התוצאה בפועל תלויה בדיווח השנתי, הכנסות ממקורות נוספים, מעמד אישי בביטוח לאומי, הפרשות לפנסיה ועוד. לחישוב מדויק מומלץ לפנות לרואה חשבון.' },
];

const breadcrumbs = [
  { label: 'דף הבית', href: '/' },
  { label: 'מחשבונים', href: '/calculators' },
  { label: 'מחשבון ביטוח לאומי לעצמאי' },
];

const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
};

const webPageSchema = {
  '@context': 'https://schema.org', '@type': 'WebPage',
  name: 'מחשבון ביטוח לאומי לעצמאי 2026 — כמה ביטוח לאומי משלם עצמאי',
  description: 'מחשבון ביטוח לאומי ומס בריאות לעצמאי 2026: חשבו כמה תשלמו לפי ההכנסה שלכם. כולל השוואת תרחישים ופירוט מדרגות.',
  url: 'https://www.perfect1.co.il/calculators/national-insurance',
  inLanguage: 'he',
  isPartOf: { '@type': 'WebSite', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hero-subtitle', '.answer-block'] },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.filter(b => b.href).map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.label, item: `https://www.perfect1.co.il${b.href}` })),
};

export default function NationalInsuranceCalcPage() {
  return (
    <>
      <SEOHead
        title="מחשבון ביטוח לאומי לעצמאי 2026 — כמה ביטוח לאומי משלם עצמאי | פרפקט וואן"
        description="מחשבון ביטוח לאומי ומס בריאות לעצמאי 2026: חשבו כמה תשלמו לפי ההכנסה. כולל השוואה בין רמות הכנסה ופירוט מדרגות. חינם."
        canonical="/calculators/national-insurance"
        keywords="מחשבון ביטוח לאומי עצמאי, כמה ביטוח לאומי משלם עצמאי, ביטוח לאומי עוסק פטור, ביטוח לאומי עוסק מורשה, חישוב ביטוח לאומי לעצמאי, מס בריאות עצמאי, דמי ביטוח לאומי, מדרגות ביטוח לאומי 2026"
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
                כמה ביטוח לאומי משלם עצמאי בישראל?
              </h1>
              <p className="hero-subtitle text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                חשבו תוך פחות מדקה כמה ביטוח לאומי ומס בריאות תשלמו לפי ההכנסה שלכם כעצמאי
              </p>
              <p className="text-sm text-gray-500 mt-3">מעודכן לשנת המס 2026 · כולל השוואה בין רמות הכנסה</p>
            </div>
            <NationalInsuranceCalculator />
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">כמה ביטוח לאומי משלם עצמאי בישראל?</h2>
              <p className="answer-block text-gray-700 leading-relaxed mb-4">
                עצמאי בישראל משלם ביטוח לאומי ומס בריאות לפי הרווח (הכנסה פחות הוצאות). התשלום מחולק ל-2 מדרגות:
                על הכנסה עד {fmt(NI_CONFIG.reducedThreshold)} ₪ בחודש — שיעור מופחת של {((NI_CONFIG.niReducedRate + NI_CONFIG.healthReducedRate) * 100).toFixed(2)}%.
                על הכנסה מעל {fmt(NI_CONFIG.reducedThreshold)} ₪ — שיעור מלא של {((NI_CONFIG.niFullRate + NI_CONFIG.healthFullRate) * 100).toFixed(2)}%.
                תקרת הכנסה לחישוב: {fmt(NI_CONFIG.maxInsurableIncome)} ₪ בחודש.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מדרגות ביטוח לאומי לעצמאים 2026</h2>
              <div className="bg-portal-bg rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-portal-navy text-white">
                    <tr>
                      <th className="p-3 text-right">רכיב</th>
                      <th className="p-3 text-right">עד {fmt(NI_CONFIG.reducedThreshold)} ₪</th>
                      <th className="p-3 text-right">מעל {fmt(NI_CONFIG.reducedThreshold)} ₪</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="p-3 font-medium">ביטוח לאומי</td>
                      <td className="p-3">{(NI_CONFIG.niReducedRate * 100).toFixed(2)}%</td>
                      <td className="p-3">{(NI_CONFIG.niFullRate * 100).toFixed(2)}%</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 font-medium">מס בריאות</td>
                      <td className="p-3">{(NI_CONFIG.healthReducedRate * 100).toFixed(2)}%</td>
                      <td className="p-3">{(NI_CONFIG.healthFullRate * 100).toFixed(2)}%</td>
                    </tr>
                    <tr className="bg-white font-bold">
                      <td className="p-3">סה"כ</td>
                      <td className="p-3">{((NI_CONFIG.niReducedRate + NI_CONFIG.healthReducedRate) * 100).toFixed(2)}%</td>
                      <td className="p-3">{((NI_CONFIG.niFullRate + NI_CONFIG.healthFullRate) * 100).toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">* תקרת הכנסה חודשית לחישוב: {fmt(NI_CONFIG.maxInsurableIncome)} ₪. הכנסה מעל תקרה זו לא חייבת בביטוח לאומי נוסף.</p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">איך מחשבים ביטוח לאומי לעוסק פטור?</h2>
              <p className="text-gray-600 leading-relaxed mb-3">עוסק פטור משלם ביטוח לאומי ומס בריאות לפי הרווח שלו — הכנסה פחות הוצאות מוכרות. השיעורים זהים לעוסק מורשה. ההבדל הוא שלעוסק פטור בדרך כלל פחות הוצאות מוכרות, כך שהבסיס לחישוב עלול להיות גבוה יותר.</p>
              <div className="bg-portal-bg rounded-xl p-4 space-y-2">
                {[
                  { income: '6,000 ₪', ni: '~347 ₪', rate: '5.78%' },
                  { income: '10,000 ₪', ni: '~785 ₪', rate: '7.85%' },
                  { income: '15,000 ₪', ni: '~1,346 ₪', rate: '8.97%' },
                  { income: '20,000 ₪', ni: '~1,907 ₪', rate: '9.54%' },
                ].map((ex, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg text-sm">
                    <span className="text-gray-700">רווח {ex.income}</span>
                    <span className="font-medium text-portal-navy">{ex.ni}/חודש ({ex.rate})</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">איך מחשבים ביטוח לאומי לעוסק מורשה?</h2>
              <p className="text-gray-600 leading-relaxed">
                עוסק מורשה משלם ביטוח לאומי ומס בריאות באותם שיעורים כמו עוסק פטור. ההבדל העיקרי: עוסק מורשה יכול לקזז מע"מ תשומות ולנכות יותר הוצאות מוכרות, מה שמפחית את הרווח החייב בביטוח לאומי. לכן, בפועל, עוסק מורשה עם אותה הכנסה ברוטו עשוי לשלם פחות ביטוח לאומי מעוסק פטור.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מה ההבדל בין ביטוח לאומי למס הכנסה?</h2>
              <div className="space-y-3">
                {[
                  { label: 'ביטוח לאומי + מס בריאות', desc: 'תשלום חובה לביטוח לאומי — מממן קצבאות ושירותי בריאות. מחושב לפי 2 מדרגות עם תקרה.' },
                  { label: 'מס הכנסה', desc: 'מס פרוגרסיבי על הרווח — 7 מדרגות מ-10% ועד 50%. מופחת בנקודות זיכוי.' },
                ].map(({ label, desc }, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-portal-bg rounded-xl">
                    <Shield className="w-5 h-5 text-portal-teal flex-shrink-0 mt-0.5" />
                    <div><div className="font-medium text-portal-navy">{label}</div><div className="text-sm text-gray-600">{desc}</div></div>
                  </div>
                ))}
              </div>
              <Link to="/calculators/income-tax" className="inline-flex items-center gap-2 mt-3 text-portal-teal font-medium hover:underline">
                מחשבון מס הכנסה לעצמאי →
              </Link>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מתי כדאי לבדוק תכנון מס או מבנה עסקי אחר?</h2>
              <p className="text-gray-600 leading-relaxed mb-3">כאשר הרווח החודשי עולה על 20,000-25,000 ₪, ההוצאות על ביטוח לאומי ומס הכנסה ביחד מגיעות ל-30-40% מהרווח. בשלב הזה כדאי לבדוק:</p>
              <ul className="space-y-2">
                {['האם כל ההוצאות המוכרות מדווחות', 'האם כדאי לעבור לחברה בע"מ (מס חברות 23% בלבד)', 'האם הפרשות לפנסיה וקרן השתלמות מנוצלות למקסימום', 'האם תכנון מס שנתי יכול לחסוך'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700"><ChevronLeft className="w-4 h-4 text-portal-teal flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">למי מתאים המחשבון?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: FileText, label: 'עוסק פטור' },
                  { icon: Briefcase, label: 'עוסק מורשה' },
                  { icon: Users, label: 'פרילנסר' },
                  { icon: Building2, label: 'מתכנן לפתוח עסק' },
                  { icon: Calculator, label: 'בודק כדאיות' },
                  { icon: Scale, label: 'תכנון מס שנתי' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-3 bg-portal-bg rounded-xl">
                    <Icon className="w-5 h-5 text-portal-teal flex-shrink-0" />
                    <span className="text-sm text-portal-navy font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lead Form */}
        <section className="py-10 sm:py-12 bg-portal-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <PortalLeadForm sourcePage="calculator-national-insurance" title="רוצים לדעת בדיוק כמה תשלמו?" subtitle="השאירו פרטים ונבדוק לכם בצורה מקצועית — בדיקה ראשונית חינם" ctaText="רוצה בדיקה מקצועית" />
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 sm:py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-6">מדריכים קשורים</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/calculators/net-income', label: 'מחשבון נטו מלא', desc: 'מס הכנסה + ביטוח לאומי — כמה נשאר נטו' },
                { href: '/calculators/income-tax', label: 'מחשבון מס הכנסה', desc: 'חישוב מס הכנסה לפי מדרגות ונקודות זיכוי' },
                { href: '/calculators/credit-points', label: 'מחשבון נקודות זיכוי', desc: 'כמה נקודות זיכוי מגיעות לכם' },
                { href: '/osek-patur/bituach-leumi', label: 'ביטוח לאומי עוסק פטור', desc: 'מדריך מקיף — חובות, שיעורים וזכויות' },
                { href: '/osek-murshe/bituach-leumi', label: 'ביטוח לאומי עוסק מורשה', desc: 'כל מה שצריך לדעת על תשלומי ביטוח לאומי' },
                { href: '/osek-murshe/tax-deductions', label: 'הוצאות מוכרות', desc: 'הוצאות שמפחיתות את הבסיס לביטוח לאומי' },
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
                <details key={i} className="group bg-white rounded-xl border border-gray-100 overflow-hidden">
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
        <section className="py-8 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2"><Scale className="w-4 h-4" />הסתייגות משפטית</h3>
              <p className="text-xs text-gray-500 leading-relaxed">המידע והמחשבון נועדו להערכה כללית בלבד ואינם מהווים ייעוץ מקצועי, ייעוץ מס או תחליף לבדיקה פרטנית. שיעורי ביטוח לאומי ומס בריאות מעודכנים לשנת 2026. לחישוב מדויק פנו לרואה חשבון או לביטוח לאומי.</p>
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
