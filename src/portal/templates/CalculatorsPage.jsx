import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Award, ChevronLeft, Scale, TrendingUp, DollarSign, BarChart3, HelpCircle } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import PortalLeadForm from '../components/PortalLeadForm';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import { Helmet } from 'react-helmet-async';

const CALCULATORS = [
  {
    slug: 'net-income',
    title: 'מחשבון נטו לעצמאי',
    description: 'כמה נשאר לכם נטו אחרי הוצאות, מס הכנסה וביטוח לאומי',
    icon: Calculator,
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    iconColor: 'text-teal-500',
    live: true,
  },
  {
    slug: 'credit-points',
    title: 'מחשבון נקודות זיכוי',
    description: 'כמה נקודות זיכוי מגיעות לכם וכמה מס תחסכו בזכותן',
    icon: Award,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    iconColor: 'text-indigo-500',
    live: true,
  },
  {
    slug: null,
    title: 'מחשבון מס לעצמאי',
    description: 'חישוב מס הכנסה לפי מדרגות מס — כמה תשלמו בפועל',
    icon: DollarSign,
    color: 'bg-gray-50 border-gray-200 text-gray-400',
    iconColor: 'text-gray-300',
    live: false,
  },
  {
    slug: null,
    title: 'מחשבון תקרת עוסק פטור',
    description: 'בדיקת תקרת ההכנסות השנתית — האם עברתם את המותר?',
    icon: BarChart3,
    color: 'bg-gray-50 border-gray-200 text-gray-400',
    iconColor: 'text-gray-300',
    live: false,
  },
  {
    slug: null,
    title: 'פטור או מורשה?',
    description: 'כלי החלטה שעוזר להבין מה עדיף — עוסק פטור או מורשה',
    icon: HelpCircle,
    color: 'bg-gray-50 border-gray-200 text-gray-400',
    iconColor: 'text-gray-300',
    live: false,
  },
];

const breadcrumbs = [
  { label: 'דף הבית', href: '/' },
  { label: 'מחשבונים' },
];

const webPageSchema = {
  '@context': 'https://schema.org', '@type': 'CollectionPage',
  name: 'מחשבונים לעסקים ולעצמאים — פרפקט וואן',
  description: 'מחשבונים חינמיים לעצמאים ובעלי עסקים בישראל: מחשבון נטו, נקודות זיכוי, מס הכנסה ועוד.',
  url: 'https://www.perfect1.co.il/calculators',
  inLanguage: 'he',
  isPartOf: { '@type': 'WebSite', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
  publisher: { '@type': 'Organization', name: 'פרפקט וואן', url: 'https://www.perfect1.co.il' },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [{ '@type': 'ListItem', position: 1, name: 'דף הבית', item: 'https://www.perfect1.co.il/' }, { '@type': 'ListItem', position: 2, name: 'מחשבונים', item: 'https://www.perfect1.co.il/calculators' }],
};

function CalcCard({ calc }) {
  const { icon: Icon, title, description, color, iconColor, slug, live } = calc;
  const content = (
    <div className={`relative p-6 rounded-2xl border-2 transition-all ${live ? `${color} hover:shadow-lg hover:scale-[1.02] cursor-pointer` : 'bg-gray-50 border-gray-200 opacity-60'}`}>
      {!live && <span className="absolute top-3 left-3 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">בקרוב</span>}
      <Icon className={`w-10 h-10 ${iconColor} mb-4`} />
      <h3 className="text-lg font-bold text-portal-navy mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      {live && (
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-portal-teal">
          לחישוב
          <ChevronLeft className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  return live && slug ? <Link to={`/calculators/${slug}`}>{content}</Link> : content;
}

export default function CalculatorsPage() {
  return (
    <>
      <SEOHead
        title="מחשבונים לעסקים ולעצמאים — נטו, מס, נקודות זיכוי | פרפקט וואן"
        description="מחשבונים חינמיים לעצמאים ובעלי עסקים בישראל: מחשבון נטו, נקודות זיכוי, מס הכנסה ועוד. חשבו כמה נשאר לכם וכמה מס תחסכו."
        canonical="/calculators"
        keywords="מחשבונים לעצמאים, מחשבון נטו, מחשבון מס הכנסה, מחשבון נקודות זיכוי, מחשבון עוסק פטור, כלים לעסקים"
        type="website"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <PortalHeader />
      <main className="pt-14 sm:pt-16 md:pt-[72px]">
        {/* Hero */}
        <section className="bg-gradient-to-b from-portal-bg to-white py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Breadcrumbs items={breadcrumbs} />
            <div className="text-center mt-6 mb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-portal-navy leading-tight mb-4">מחשבונים לעצמאים ולעסקים</h1>
              <p className="hero-subtitle text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                כלים חינמיים שעוזרים לכם להבין כמה נשאר נטו, כמה מס תשלמו, וכמה אפשר לחסוך
              </p>
            </div>

            {/* Calculator Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CALCULATORS.map((calc) => (
                <CalcCard key={calc.title} calc={calc} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-xl mx-auto px-4 sm:px-6">
            <PortalLeadForm
              sourcePage="calculators-hub"
              title="רוצים חישוב מדויק ומקצועי?"
              subtitle="השאירו פרטים ורואה חשבון יבדוק עבורכם — חינם וללא התחייבות"
              ctaText="בדיקה מקצועית חינם"
            />
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 sm:py-16 bg-portal-bg">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">למה להשתמש במחשבונים שלנו?</h2>
              <p className="text-gray-600 leading-relaxed">המחשבונים של פרפקט וואן נבנו במיוחד עבור עצמאים ובעלי עסקים קטנים בישראל. הם עוזרים לכם לקבל תמונה מהירה וברורה על מצבכם הפיננסי — לפני שמתחילים לדבר עם רואה חשבון.</p>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-portal-navy mb-4">מה אפשר לחשב?</h2>
              <ul className="space-y-3">
                {['כמה נשאר נטו לעצמאי אחרי כל המסים וההוצאות', 'כמה נקודות זיכוי מגיעות לכם ואיך הן מפחיתות מס', 'האם עברתם את תקרת עוסק פטור (בקרוב)', 'האם עדיף להישאר פטור או לעבור למורשה (בקרוב)'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600"><ChevronLeft className="w-4 h-4 text-portal-teal flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2"><Scale className="w-4 h-4" />הסתייגות משפטית</h3>
              <p className="text-xs text-gray-500 leading-relaxed">המחשבונים באתר נועדו לצרכי מידע כללי והערכה בלבד, ואינם מהווים ייעוץ מס, ייעוץ חשבונאי, חוות דעת מקצועית או תחליף לבדיקה פרטנית.</p>
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
