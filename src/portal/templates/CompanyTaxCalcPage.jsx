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
import CompanyTaxCalculator from '../calculators/CompanyTaxCalculator';
import { COMPANY_TAX_CONFIG } from '../calculators/calcCompanyTax';
import { Helmet } from 'react-helmet-async';

const FAQ_ITEMS = [
  { q: 'כמה מס משלמת חברה בע"מ בישראל?', a: `חברה בע"מ משלמת מס חברות של ${(COMPANY_TAX_CONFIG.corporateTaxRate * 100)}% על הרווח החייב במס. כלומר, אם הרווח השנתי של החברה הוא 500,000 ₪ — היא תשלם 115,000 ₪ מס חברות. יתרת הרווח אחרי מס (385,000 ₪) נשארת בחברה ועדיין לא חויבה במס נוסף — אלא בעת חלוקה לבעלים.` },
  { q: 'מהו מס חברות?', a: 'מס חברות הוא מס שמוטל על רווחי החברה כישות משפטית עצמאית — לא על בעליה. שיעורו בישראל הוא 23% (2026). הוא מחושב על הכנסות החברה פחות כל ההוצאות המוכרות, כולל משכורות, שכירות, ציוד ועוד. בשונה מעצמאי, החברה מגישה דוחות נפרדים ומשלמת מס בנפרד מהבעלים.' },
  { q: 'האם חברה משלמת גם מס על דיבידנד?', a: `כן. כאשר בעלי המניות מושכים רווחים מהחברה בדרך של דיבידנד, הם משלמים מס נוסף של ${(COMPANY_TAX_CONFIG.dividendTaxRate * 100)}% (ובעל שליטה מעל 10% — ${(COMPANY_TAX_CONFIG.dividendTaxRateControlling * 100)}%). לכן המיסוי הכולל הוא "שכבות": מס חברות 23% על הרווח, ואז מס דיבידנד 25%-30% על מה שנותר. בסך הכל, שיעור מס כולל של כ-42%-47%.` },
  { q: 'מה עדיף לבעל חברה — משכורת או דיבידנד?', a: 'תלוי בסכום ובמצב האישי. משכורת מאפשרת לבעל החברה לצבור זכויות סוציאליות (פנסיה, ביטוח לאומי, דמי אבטלה) ויוצרת הוצאה מוכרת לחברה. דיבידנד חייב במס נמוך יותר לבעל שהכנסתו גבוהה, אך ללא זכויות סוציאליות. בדרך כלל, שילוב של משכורת בסיסית + דיבידנד הוא האסטרטגיה המשתלמת ביותר.' },
  { q: 'האם אפשר להשאיר כסף בחברה בלי למשוך?', a: 'כן. לאחר תשלום מס חברות (23%), הרווח שנותר בחברה לא חייב במס נוסף עד שיחולק. שארית הרווח יכולה להישאר בחברה להשקעה, לצמיחה, או לצבירת רזרבות. זה אחד היתרונות הגדולים של חברה בע"מ — ניתן לבצע "תכנון מס על ידי דחיית מס".' },
  { q: 'מתי משתלם לעבור מעוסק מורשה לחברה?', a: 'בדרך כלל כאשר הרווח השנתי עולה על 300,000-400,000 ₪. מתחת לרף זה, עלויות הקמה ותפעול של חברה (רואה חשבון, אגרות, ניהול) אינן מוצדקות. מעל הרף, חסכון מס החברות (23%) לעומת מדרגות מס הכנסה הגבוהות (מעל 45%) יכול להגיע לעשרות אלפי שקלים בשנה.' },
  { q: 'האם המחשבון מדויק ב-100%?', a: 'לא. המחשבון נותן הערכה משוערת בלבד. התוצאה בפועל תלויה במבנה ההוצאות, הכנסות ממקורות נוספים, מעמד אישי, ניצול פטורים וזיכויים, וגורמים נוספים. לחישוב מדויק מומלץ להתייעץ עם רואה חשבון.' },
  { q: 'האם הכנסה נוספת משפיעה על הכדאיות?', a: 'כן. אם לבעל החברה יש הכנסות נוספות (שכיר, עסק אחר, שכ"ד), הן מגדילות את הכנסתו האישית הכוללת ומעלות את מדרגת המס שלו. במקרה כזה, משיכת משכורת גבוהה מהחברה תהיה פחות יעילה, ועדיף לשקול להשאיר יותר רווח בחברה ולמשוך דיבידנד.' },
];

const breadcrumbs = [
  { label: 'דף הבית', href: '/' },
  { label: 'מחשבונים', href: '/calculators' },
  { label: 'מחשבון מיסוי חברה בע"מ' },
];

const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
};

const webPageSchema = {
  '@context': 'https://schema.org', '@type': 'WebPage',
  name: 'מחשבון מיסוי חברה בע"מ 2026 — כמה מס משלמת חברה | פרפקט וואן',
  description: 'מחשבון מיסוי חברה בע"מ 2026: מס חברות, דיבידנד, משכורת בעלים והשוואה לעוסק מורשה. גלו מה הכי משתלם לכם. חינם.',
  url: 'https://www.perfect1.co.il/calculators/company-tax',
  inLanguage: 'he',
  isPartOf: { '@type': 'WebSite', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hero-subtitle', '.answer-block'] },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.filter(b => b.href).map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.label, item: `https://www.perfect1.co.il${b.href}` })),
};

export default function CompanyTaxCalcPage() {
  return (
    <>
      <SEOHead
        title='מחשבון מיסוי חברה בע"מ 2026 — כמה מס משלמת חברה | פרפקט וואן'
        description='מחשבון מיסוי חברה בע"מ 2026: מס חברות, דיבידנד, משכורת בעלים והשוואה לעוסק מורשה. גלו מה הכי משתלם לכם. חינם.'
        canonical="/calculators/company-tax"
        keywords="מחשבון מס חברה בעמ, כמה מס משלמת חברה, מס חברות בישראל, דיבידנד חברה בעמ, מיסוי חברה בעמ, חברה בעמ או עוסק מורשה, מס חברות 2026"
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
                כמה מס משלמת חברה בע&quot;מ בישראל?
              </h1>
              <p className="hero-subtitle text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                חשבו תוך פחות מדקה כמה תשלם החברה במס, כמה יישאר אחרי מס חברות, וכמה נשאר לך אם תמשוך משכורת או דיבידנד.
              </p>
              <p className="text-sm text-gray-500 mt-3">מעודכן לשנת המס 2026 · כולל השוואה בין תרחישי משיכה</p>
            </div>
            <CompanyTaxCalculator />
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">כמה מס משלמת חברה בע&quot;מ בישראל?</h2>
              <p className="answer-block text-gray-700 leading-relaxed mb-4">
                חברה בע&quot;מ בישראל משלמת <strong>מס חברות בשיעור {(COMPANY_TAX_CONFIG.corporateTaxRate * 100)}%</strong> על הרווח החייב במס. מדובר בשיעור קבוע — בניגוד למס הכנסה של עצמאי שהוא פרוגרסיבי ועולה עם ההכנסה. כלומר, בין אם החברה הרוויחה 200,000 ₪ ובין אם הרוויחה 2,000,000 ₪ — המס הוא תמיד 23% מהרווח.
              </p>
              <p className="text-gray-700 leading-relaxed">
                בנוסף, כאשר הרווח מחולק לבעלים בדרך של דיבידנד, חל מס דיבידנד נוסף של {(COMPANY_TAX_CONFIG.dividendTaxRate * 100)}% (או {(COMPANY_TAX_CONFIG.dividendTaxRateControlling * 100)}% לבעל שליטה). לכן חשוב להבין את מבנה המיסוי הכולל לפני שמחליטים על דרך המשיכה.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מה ההבדל בין מס חברות למס על דיבידנד?</h2>
              <div className="space-y-3">
                {[
                  { label: `מס חברות — ${(COMPANY_TAX_CONFIG.corporateTaxRate * 100)}%`, desc: 'מוטל על רווחי החברה כישות עצמאית. משולם לאחר הגשת הדוח השנתי. מחושב לפי הכנסות החברה פחות כל ההוצאות המוכרות.' },
                  { label: `מס דיבידנד — ${(COMPANY_TAX_CONFIG.dividendTaxRate * 100)}%-${(COMPANY_TAX_CONFIG.dividendTaxRateControlling * 100)}%`, desc: 'מוטל על בעלי המניות בעת חלוקת רווחים. 25% לבעל מניות רגיל, 30% לבעל שליטה (מעל 10% מהמניות). מנוכה במקור על ידי החברה.' },
                ].map(({ label, desc }, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-portal-bg rounded-xl">
                    <Shield className="w-5 h-5 text-portal-teal flex-shrink-0 mt-0.5" />
                    <div><div className="font-medium text-portal-navy">{label}</div><div className="text-sm text-gray-600">{desc}</div></div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">* המיסוי הכולל (מס חברות + דיבידנד) מגיע לכ-42%-47%, בהתאם לסוג הבעלות.</p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מה עדיף — משכורת או דיבידנד?</h2>
              <p className="text-gray-600 leading-relaxed mb-3">אין תשובה אחת — תלוי ברמת ההכנסה ובמצב האישי. הנה ההשוואה:</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="p-4 bg-portal-bg rounded-xl">
                  <div className="font-semibold text-portal-navy mb-2">משכורת — יתרונות</div>
                  <ul className="space-y-1">
                    {['זכויות סוציאליות (פנסיה, ביטוח לאומי)', 'הוצאה מוכרת לחברה', 'מגדילה בסיס לקצבאות', 'ניכוי מס במקור מסודר'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700"><ChevronLeft className="w-3 h-3 text-portal-teal flex-shrink-0" />{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-portal-bg rounded-xl">
                  <div className="font-semibold text-portal-navy mb-2">דיבידנד — יתרונות</div>
                  <ul className="space-y-1">
                    {['מס נמוך יותר לבעל שליטה בהכנסה גבוהה', 'גמישות בעיתוי החלוקה', 'ללא דמי ביטוח לאומי', 'ניצול רווחים שנצברו בחברה'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700"><ChevronLeft className="w-3 h-3 text-portal-teal flex-shrink-0" />{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">בדרך כלל, האסטרטגיה המומלצת היא שילוב: משכורת בסיסית המכסה צרכים שוטפים + צבירת זכויות, ומשיכת דיבידנד לפי הצורך בשנים טובות.</p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מתי משתלם לפתוח חברה בע&quot;מ?</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                הרף הכלכלי הנפוץ הוא רווח שנתי של <strong>300,000-400,000 ₪</strong>. מתחת לרף זה, עלויות הניהול (רואה חשבון, אגרות, ניירת) בדרך כלל מבטלות את יתרון מס החברות. מעל הרף — החיסכון במס יכול להגיע ל-30,000-80,000 ₪ בשנה.
              </p>
              <ul className="space-y-2 mb-3">
                {[
                  'רווח שנתי מעל 300,000 ₪ — כדאי לבדוק',
                  'רווח שנתי מעל 400,000 ₪ — כמעט תמיד משתלם',
                  'לקוחות גדולים שדורשים חברה בע"מ — גם מתחת לרף',
                  'הגנה משפטית על נכסים אישיים — שיקול נוסף',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700"><ChevronLeft className="w-4 h-4 text-portal-teal flex-shrink-0" />{item}</li>
                ))}
              </ul>
              <Link to="/hevra-bam/transition" className="inline-flex items-center gap-2 text-portal-teal font-medium hover:underline">
                מדריך מעבר מעוסק לחברה בע&quot;מ →
              </Link>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">למי מתאים המחשבון?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Building2, label: 'בעל חברה בע"מ' },
                  { icon: Briefcase, label: 'עצמאי שוקל לפתוח חברה' },
                  { icon: Users, label: 'שותפים בחברה' },
                  { icon: FileText, label: 'בודק כדאיות עסקית' },
                  { icon: Calculator, label: 'תכנון מס שנתי' },
                  { icon: Scale, label: 'משכורת מול דיבידנד' },
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
            <PortalLeadForm sourcePage="calculator-company-tax" title="רוצים לדעת מה הכי משתלם לכם?" subtitle="השאירו פרטים ונבדוק לכם את המבנה העסקי המיטבי — בדיקה ראשונית חינם" ctaText="רוצה בדיקה מקצועית" />
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 sm:py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-6">מדריכים קשורים</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/hevra-bam/taxes', label: 'מיסוי חברה בע"מ', desc: 'מדריך מקיף על מס חברות, דיבידנד ותכנון מס' },
                { href: '/hevra-bam/how-to-open', label: 'פתיחת חברה בע"מ', desc: 'שלבי פתיחת חברה ועלויות הקמה' },
                { href: '/hevra-bam/transition', label: 'מעבר מעוסק לחברה', desc: 'מתי כדאי לעבור ואיך עושים את זה' },
                { href: '/calculators/income-tax', label: 'מחשבון מס הכנסה', desc: 'חישוב מס הכנסה לפי מדרגות ונקודות זיכוי' },
                { href: '/calculators/net-income', label: 'מחשבון נטו מלא', desc: 'מס הכנסה + ביטוח לאומי — כמה נשאר נטו' },
                { href: '/osek-murshe/taxes', label: 'מיסוי עוסק מורשה', desc: 'מדרגות מס, מע"מ וביטוח לאומי לעוסק מורשה' },
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
              <p className="text-xs text-gray-500 leading-relaxed">המידע והמחשבון נועדו להערכה כללית בלבד ואינם מהווים ייעוץ מקצועי, ייעוץ מס או תחליף לבדיקה פרטנית. שיעורי מס חברות ומס דיבידנד מעודכנים לשנת 2026. לחישוב מדויק ותכנון מס אישי פנו לרואה חשבון מוסמך.</p>
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
