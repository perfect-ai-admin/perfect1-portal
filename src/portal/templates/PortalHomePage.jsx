import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MessageCircle, Search, CheckCircle2, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import CategoryCard from '../components/CategoryCard';
import ArticleCard from '../components/ArticleCard';
import TrustSection from '../components/TrustSection';
import StatsCounter from '../components/StatsCounter';
import PortalLeadForm from '../components/PortalLeadForm';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import SchemaMarkup from '../components/SchemaMarkup';
import { useCategoryList } from '../hooks/usePortalContent';
import { PORTAL_CTA } from '../config/navigation';

const POPULAR_ARTICLES = [
  { title: 'איך פותחים עוסק פטור — מדריך מלא', description: 'שלב אחר שלב: מה צריך, כמה עולה, וכמה זמן לוקח', href: '/osek-patur/how-to-open', readTime: 12, category: 'עוסק פטור' },
  { title: 'עוסק פטור או מורשה — מה מתאים לך?', description: 'השוואה מלאה עם יתרונות וחסרונות של כל אופציה', href: '/compare/osek-patur-vs-murshe', readTime: 10, category: 'השוואות' },
  { title: 'כמה עולה עוסק מורשה? כל העלויות', description: 'פירוט מלא של עלויות פתיחה, הוצאות שוטפות ומחיר רואה חשבון', href: '/osek-murshe/cost', readTime: 8, category: 'עוסק מורשה' },
  { title: 'איך סוגרים עוסק פטור', description: 'תהליך הסגירה מול מס הכנסה, מע"מ וביטוח לאומי', href: '/sgirat-tikim/close-osek-patur', readTime: 9, category: 'סגירת תיקים' },
  { title: 'פתיחת חברה בע"מ — המדריך המלא', description: 'כל מה שצריך לדעת לפני שפותחים חברה', href: '/hevra-bam/how-to-open', readTime: 15, category: 'חברה בע"מ' },
  { title: 'מדריך מיסוי לעסקים — כל מה שצריך', description: 'מס הכנסה, מע"מ, ביטוח לאומי והוצאות מוכרות — עדכני ל-2026', href: '/guides/taxation', readTime: 11, category: 'מדריכים' },
];

const HOME_FAQ = [
  { question: 'מה ההבדל בין עוסק פטור לעוסק מורשה?', answer: 'עוסק פטור פטור מגביית מע"מ ומניהול ספרים מורכב, עד תקרת הכנסות מסוימת. עוסק מורשה חייב לגבות מע"מ, לנהל הנהלת חשבונות מסודרת ולהגיש דוחות תקופתיים. הבחירה תלויה בסוג העסק, היקף ההכנסות והלקוחות שלך.' },
  { question: 'כמה עולה לפתוח עסק בישראל?', answer: 'פתיחת עוסק פטור היא בחינם ואפשר לעשות אונליין. עוסק מורשה — גם בחינם אך מומלץ עם ליווי רואה חשבון (200-500₪). הקמת חברה בע"מ עולה כ-2,600₪ אגרת רישום + שכ"ט עו"ד (3,000-8,000₪).' },
  { question: 'האם אני חייב רואה חשבון?', answer: 'עוסק פטור לא חייב אך מומלץ (בעלות של 75-150₪ לחודש). עוסק מורשה — מומלץ מאוד בגלל חובות הדיווח. חברה בע"מ — חובה על פי חוק.' },
  { question: 'כמה זמן לוקח לפתוח עסק?', answer: 'עוסק פטור — 1-3 ימי עסקים. עוסק מורשה — 3-7 ימי עסקים. חברה בע"מ — 2-4 שבועות (כולל רישום ברשם החברות).' },
  { question: 'מה קורה אם לא סוגרים תיק של עסק לא פעיל?', answer: 'עסק פתוח שלא נסגר כראוי ממשיך לצבור חובות לביטוח לאומי, קנסות על אי-הגשת דוחות למס הכנסה, ועלול לגרום לבעיות בדירוג האשראי. חשוב לסגור בצורה מסודרת.' },
];

// Memoize components to prevent unnecessary re-renders
const MemoizedCategoryCard = React.memo(CategoryCard);
const MemoizedTrustSection = React.memo(TrustSection);
const MemoizedStatsCounter = React.memo(StatsCounter);
const MemoizedArticleCard = React.memo(ArticleCard);

function PortalHomePage() {
  const { categories, loading } = useCategoryList();

  return (
    <>
      <SEOHead
        title="פתיחת עסק בישראל — מדריכים, מידע וליווי אישי | פרפקט וואן"
        description="כל מה שצריך לדעת על פתיחת עוסק פטור, עוסק מורשה, חברה בע״מ וסגירת תיקים — במקום אחד. מדריכים מקיפים + ליווי אישי."
        canonical="/"
        keywords="פתיחת עסק, עוסק פטור, עוסק מורשה, חברה בע״מ, סגירת תיקים, פתיחת עסק בישראל"
      />
      <SchemaMarkup type="home" faqItems={HOME_FAQ} />
      <PortalHeader />

      <main className="pt-14 sm:pt-16 md:pt-[72px]">
        {/* Hero */}
        <section className="relative py-14 sm:py-20 md:py-32 overflow-hidden bg-gradient-to-b from-portal-bg to-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50/50 via-transparent to-transparent -z-10" />
          <div className="max-w-6xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-portal-teal/10 text-portal-teal rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-portal-teal opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-portal-teal"></span></span>
                מרכז מידע מקצועי
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-portal-navy leading-[1.15] mb-5 sm:mb-6">
                פתיחת עסק בישראל
                <br />
                <span className="text-portal-teal">מדריכים, מידע וליווי אישי</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light">
                כל מה שצריך לדעת על פתיחת עוסק פטור, עוסק מורשה, חברה בע״מ וסגירת תיקים — במקום אחד.
              </p>
              {/* Hero Lead Form */}
              <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-lg">
                <PortalLeadForm
                  sourcePage="homepage-hero"
                  variant="compact"
                  ctaText="לייעוץ חינם עם רו״ח"
                />
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="text-xs text-gray-400">או:</span>
                  <a href={`tel:${PORTAL_CTA.phone}`} className="inline-flex items-center gap-1.5 text-portal-teal hover:underline text-sm font-medium">
                    <Phone className="w-4 h-4" />
                    {PORTAL_CTA.phone}
                  </a>
                  <a href={PORTAL_CTA.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-green-600 hover:underline text-sm font-medium">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="portal-h2 text-center mb-3">באיזה נושא אתה מחפש מידע?</h2>
            <p className="text-center text-gray-500 text-lg mb-10">בחר קטגוריה כדי לקבל מדריכים, מידע והמלצות</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {(categories || []).slice(0, 4).map((cat) => (
                <MemoizedCategoryCard
                  key={cat.id}
                  title={cat.title}
                  description={cat.description}
                  href={`/${cat.slug}`}
                  icon={cat.icon}
                  color={cat.color}
                  stats={cat.stats}
                />
              ))}
            </div>
            {/* Guides category - full width */}
            {categories && categories[4] && (
              <div className="mt-6">
                <Link to={`/${categories[4].slug}`} className="block bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl p-6 md:p-8 transition-all hover:shadow-xl hover:-translate-y-0.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{categories[4].title}</h3>
                      <p className="text-white/80">{categories[4].description}</p>
                    </div>
                    <ArrowLeft className="w-6 h-6 hidden md:block" />
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Trust */}
        <MemoizedTrustSection />

        {/* Stats */}
        <MemoizedStatsCounter />

        {/* Popular Articles */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="portal-h2 text-center mb-3">מדריכים פופולריים</h2>
            <p className="text-center text-gray-500 text-lg mb-10">המאמרים הכי מבוקשים באתר</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {POPULAR_ARTICLES.map((article, i) => (
                <MemoizedArticleCard key={i} {...article} />
              ))}
            </div>
          </div>
        </section>

        {/* Lead Form */}
        <section id="portal-lead-form" className="py-16 md:py-20 bg-portal-bg">
          <div className="max-w-2xl mx-auto px-4">
            <PortalLeadForm
              sourcePage="homepage"
              title="רואה חשבון ייעץ לך — בחינם"
              subtitle="השאר שם וטלפון, רו״ח מוסמך יחזור אליך תוך 30 דקות ויעזור לך לבחור את המסלול הנכון"
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="portal-h2 text-center mb-10">שאלות נפוצות</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {HOME_FAQ.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-portal-bg rounded-xl border border-gray-200 px-4 sm:px-6 overflow-hidden">
                  <AccordionTrigger className="text-right font-bold text-base sm:text-lg text-portal-navy hover:no-underline py-4 sm:py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-base leading-relaxed pb-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <PortalFooter />
      <WhatsAppButton />
      <StickyMobileCTA />
    </>
  );
}

export default React.memo(PortalHomePage);
