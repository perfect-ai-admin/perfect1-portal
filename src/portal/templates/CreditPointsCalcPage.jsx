import React from 'react';
import { Award, ChevronLeft, Scale, Users, Briefcase, GraduationCap, Baby, Shield } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import PortalLeadForm from '../components/PortalLeadForm';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import CreditPointsCalculator from '../calculators/CreditPointsCalculator';
import { Helmet } from 'react-helmet-async';

const FAQ_ITEMS = [
  { q: 'מה זה נקודות זיכוי ממס הכנסה?', a: 'נקודות זיכוי הן הנחה ישירה מסכום מס ההכנסה. כל נקודת זיכוי שווה כ-235 ₪ בחודש (2,820 ₪ בשנה). ככל שיש לכם יותר נקודות — משלמים פחות מס.' },
  { q: 'כמה נקודות זיכוי מגיע לכל אחד?', a: 'כל תושב ישראל מקבל 2.25 נקודות בסיס. נשים מקבלות חצי נקודה נוספת. הורים לילדים, חיילים משוחררים, בעלי תארים אקדמיים, עולים חדשים ואוכלוסיות נוספות זכאים לנקודות נוספות.' },
  { q: 'איך נקודות זיכוי מפחיתות את המס?', a: 'נקודות הזיכוי מופחתות ישירות מסכום המס שחושב לפי מדרגות המס. לדוגמה: אם המס החודשי שלכם הוא 1,500 ₪ ויש לכם 4 נקודות (940 ₪ חיסכון), תשלמו בפועל רק 560 ₪.' },
  { q: 'האם אפשר לקבל החזר מס בזכות נקודות זיכוי?', a: 'כן. אם שילמתם מס עודף בגלל שלא נוצלו כל נקודות הזיכוי שמגיעות לכם, אפשר להגיש בקשה להחזר מס עד 6 שנים אחורה. רואה חשבון יכול לבדוק את הזכאות.' },
  { q: 'האם המחשבון מתאים גם לשכירים?', a: 'כן. נקודות זיכוי רלוונטיות גם לשכירים וגם לעצמאים. ההבדל הוא שלשכירים המעסיק מחשב את הנקודות בתלוש, בעוד שעצמאים צריכים לדאוג לכך בעצמם בדוח השנתי.' },
];

const breadcrumbs = [
  { label: 'דף הבית', href: '/' },
  { label: 'מחשבונים', href: '/calculators' },
  { label: 'מחשבון נקודות זיכוי' },
];

const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
};

const webPageSchema = {
  '@context': 'https://schema.org', '@type': 'WebPage',
  name: 'מחשבון נקודות זיכוי – כמה נקודות מגיע לי ואיך זה חוסך מס',
  description: 'מחשבון נקודות זיכוי ממס הכנסה: בדקו כמה נקודות מגיעות לכם לפי מצב משפחתי, ילדים, לימודים וסטטוס — וכמה מס תחסכו.',
  url: 'https://www.perfect1.co.il/calculators/credit-points',
  inLanguage: 'he',
  isPartOf: { '@type': 'WebSite', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hero-subtitle'] },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.filter(b => b.href).map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.label, item: `https://www.perfect1.co.il${b.href}` })),
};

export default function CreditPointsCalcPage() {
  return (
    <>
      <SEOHead
        title="מחשבון נקודות זיכוי – כמה נקודות מגיע לי וכמה מס אחסוך | פרפקט וואן"
        description="מחשבון נקודות זיכוי ממס הכנסה: בדקו כמה נקודות מגיעות לכם לפי מצב משפחתי, ילדים, לימודים וסטטוס — וכמה מס תחסכו."
        canonical="/calculators/credit-points"
        keywords="מחשבון נקודות זיכוי, כמה נקודות זיכוי מגיע לי, חישוב נקודות זיכוי, נקודות זיכוי ילדים, נקודות זיכוי מס הכנסה, נקודות זיכוי עצמאי"
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-portal-navy leading-tight mb-4">מחשבון נקודות זיכוי</h1>
              <p className="hero-subtitle text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                בדקו כמה נקודות זיכוי מגיעות לכם ממס הכנסה — וכמה כסף תחסכו כל חודש
              </p>
              <p className="text-sm text-gray-600 mt-3">ענו על 6 שאלות פשוטות וגלו את הזכאות המלאה שלכם לנקודות זיכוי.</p>
            </div>
            <CreditPointsCalculator />
            <div className="mt-12">
              <PortalLeadForm sourcePage="calculator-credit-points" title="רוצים לבדוק אם מגיע לכם החזר מס?" subtitle="השאירו פרטים — רואה חשבון יבדוק את הזכאות שלכם חינם" ctaText="בדיקת זכאות חינם" />
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מה זה נקודות זיכוי ולמה הן חשובות?</h2>
              <p className="text-gray-600 leading-relaxed">נקודות זיכוי הן הטבת מס ישירה שמפחיתה את סכום מס ההכנסה שצריך לשלם. כל נקודת זיכוי שווה כ-235 ₪ בחודש. למשל, מי שזכאי ל-4 נקודות זיכוי חוסך כ-940 ₪ ממס הכנסה בכל חודש — מעל 11,000 ₪ בשנה.</p>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מי זכאי לנקודות זיכוי?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Users, label: 'כל תושב ישראל' }, { icon: Baby, label: 'הורים לילדים' }, { icon: GraduationCap, label: 'בעלי תארים' },
                  { icon: Shield, label: 'חיילים משוחררים' }, { icon: Award, label: 'עולים חדשים' }, { icon: Briefcase, label: 'שכירים ועצמאים' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-3 bg-portal-bg rounded-xl"><Icon className="w-5 h-5 text-portal-teal flex-shrink-0" /><span className="text-sm text-portal-navy font-medium">{label}</span></div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">איך נקודות זיכוי חוסכות כסף?</h2>
              <ul className="space-y-3">
                {['כל נקודה = 235 ₪ הפחתה ממס ההכנסה בחודש', 'הנקודות מופחתות ישירות מסכום המס (לא מההכנסה)', 'אם המס נמוך מהזיכוי — לא משלמים מס כלל', 'אפשר לתבוע החזר מס עד 6 שנים אחורה', 'נקודות נוספות להורים, חיילים, בעלי תארים ועולים'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600"><ChevronLeft className="w-4 h-4 text-portal-teal flex-shrink-0" />{item}</li>
                ))}
              </ul>
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
