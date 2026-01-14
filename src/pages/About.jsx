import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import InternalLinker from '../components/seo/InternalLinker';
import MicroCTA from '../components/cro/MicroCTA';
import { CheckCircle, Users, Award, Clock, ArrowLeft, Target, Heart, Shield, HelpCircle } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'מקצועיות',
    description: 'צוות מקצועי עם ניסיון רב בליווי עצמאים ועסקים'
  },
  {
    icon: Heart,
    title: 'שירות אישי',
    description: 'ליווי צמוד ואישי לכל לקוח, כאילו אתה הלקוח היחיד שלנו'
  },
  {
    icon: Shield,
    title: 'אמינות',
    description: 'שקיפות מלאה במחירים ובתהליכים, בלי הפתעות'
  }
];

const stats = [
  { number: '2,000+', label: 'עוסקים פטורים בשנה' },
  { number: '98%', label: 'שביעות רצון' },
  { number: 'מהיר', label: 'זמן תגובה' },
  { number: '10+', label: 'שנות ניסיון' }
];

export default function About() {
  // Preload critical resources
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);
  }, []);

  // Enhanced About Schema with sameAs and about
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Perfect One - פרפקט וואן",
      "alternateName": "שירות ייעוץ וליווי לפתיחת עסקים",
      "taxID": "516309747",
      "url": "https://perfect1.co.il",
      "logo": "https://perfect1.co.il/logo.png",
      "description": "המרכז המוביל בישראל לפתיחת עוסקים פטורים. מעל 2,000 עוסקים פטורים בשנה.",
      "foundingDate": "2016",
      "telephone": "+972-50-227-7087",
      "email": "info@perfect1.co.il",
      "sameAs": [
        "https://www.facebook.com/perfect1.co.il",
        "https://www.linkedin.com/company/perfect1",
        "https://www.instagram.com/perfect1.co.il"
      ],
      "knowsAbout": ["עוסק פטור", "מס הכנסה", "ביטוח לאומי", "רגולציה ישראלית"],
      "areaServed": {
        "@type": "Country",
        "name": "ישראל"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "2000"
      },
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": "15"
      }
    },
    "about": {
      "@type": "Thing",
      "name": "עוסק פטור בישראל",
      "description": "שירותי פתיחה וליווי עוסקים פטורים"
    }
  };

  return (
    <>
      <SEOOptimized 
        {...seoPresets.about}
        canonical="https://perfect1.co.il/about"
        schema={aboutSchema}
      />
      <main className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              אודות
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              מי אנחנו ומה אנחנו עושים
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-lg p-8 md:p-12 space-y-8"
          >
            {/* פרטי החברה */}
            <div className="bg-blue-50 border-2 border-[#1E3A5F] rounded-lg p-6 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-4">
                פרטי החברה
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">שם החברה:</p>
                  <p className="text-xl font-bold text-gray-800">פרפקט וואן</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">מספר חברה:</p>
                  <p className="text-xl font-bold text-gray-800">516309747</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">טלפון:</p>
                  <p className="text-xl font-bold text-gray-800">0502277087</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">אימייל:</p>
                  <p className="text-xl font-bold text-gray-800">info@perfect1.co.il</p>
                </div>
              </div>
            </div>

            {/* מי אנחנו */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-4">
                מי אנחנו - ליווי עצמאים בפתיחת עסק קטן
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                <strong>פרפקט וואן</strong> היא חברה פרטית המתמחה ב<Link to={createPageUrl('Services')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">ייעוץ וליווי עצמאים</Link> בתהליך פתיחת עסק קטן בישראל.
                אנחנו צוות מקצועי עם למעלה מ-10 שנות ניסיון בתחום, שמבין לעומק את הקשיים והאתגרים של <Link to={createPageUrl('HowToOpenOsekPatur')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">פתיחת עוסק פטור</Link> ו<Link to={createPageUrl('OsekMorshaLanding')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">פתיחת עוסק מורשה</Link> בישראל.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                לאורך השנים ליווינו יותר מ-2,000 עצמאים מכל התחומים - <Link to={createPageUrl('GraphicDesignerLanding')} className="text-[#1E3A5F] hover:text-[#27AE60]">גרפיקאים</Link>, <Link to={createPageUrl('PhotographerLanding')} className="text-[#1E3A5F] hover:text-[#27AE60]">צלמים</Link>, <Link to={createPageUrl('FitnessTrainerLanding')} className="text-[#1E3A5F] hover:text-[#27AE60]">מדריכי כושר</Link>, יועצים ועוד - בדרכם לפתוח עסק קטן ולהפוך את החלום העצמאי למציאות.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                אנחנו מספקים <strong>ייעוץ מס מקצועי</strong> ו<strong>ליווי אישי</strong> לכל לקוח, תוך הסבר מפורט על הזכויות, החובות, והדרישות מול הרשויות - מס הכנסה, ביטוח לאומי ומע"מ.
              </p>
              
              {/* הבהרה חשובה */}
              <div className="bg-amber-50 border-r-4 border-amber-500 p-5 rounded-lg mb-4">
                <h3 className="font-bold text-amber-900 text-xl mb-3 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>הבהרה חשובה</span>
                </h3>
                <ul className="space-y-2 text-gray-800 text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span><strong>השירות ניתן על ידי גורם פרטי</strong> - פרפקט וואן היא חברה פרטית עצמאית.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span><strong>האתר אינו אתר ממשלתי</strong> - איננו פועלים מטעם רשות ממשלתית כלשהי.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span><strong>פתיחת התיק מתבצעת על ידך או רו״ח מטעמך</strong> - הליך הפתיחה מול רשות המסים והביטוח הלאומי מתבצע ישירות על ידי הלקוח או רואה חשבון מטעמו.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* למה האתר קיים */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-4">
                למה האתר קיים - המשימה שלנו
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                <strong>פתיחת עסק קטן בישראל</strong> יכולה להיות תהליך מורכב ומלא בחששות. הבירוקרטיה, הטפסים, הדרישות השונות מול רשויות המס - כל אלה יוצרים תחושה של חוסר ודאות אצל עצמאים רבים שרוצים פשוט להתחיל לעבוד.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                יצרנו את האתר הזה כדי <strong>להפוך את התהליך לפשוט, ברור ונגיש</strong>. המטרה שלנו היא לספק <Link to={createPageUrl('Blog')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">מידע מקצועי ומעודכן</Link> על כל היבטי פתיחת עסק - החל מ<Link to={createPageUrl('WhatIsOsekPatur')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">הבנת המושג "עוסק פטור"</Link>, דרך <Link to={createPageUrl('PricingCost')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">עלויות פתיחה</Link>, ועד <Link to={createPageUrl('MonthlyReportOsekPatur')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">דיווחים חודשיים ושנתיים</Link>.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                אנחנו מאמינים שכל עצמאי ראוי ל<strong>ליווי מקצועי ואישי</strong> בדרכו לפתיחת עסק, ללא צורך בהשקעה כספית גדולה או מפגשים מיותרים. השירות שלנו נועד למי שמחפש <strong>הדרכה מסודרת, תמיכה רציפה</strong>, ו<strong>ייעוץ מס אמין</strong> בתהליך פתיחת העסק.
              </p>
            </div>

            {/* איך השירות עובד */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-4">
                איך השירות עובד
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                אנחנו מספקים ליווי מקצועי לאורך כל התהליך – מההסברים הראשוניים ועד להגשת הטפסים הנדרשים.
                השירות כולל הדרכה, מענה לשאלות, וסיוע בהבנת הדרישות השונות של הרשויות.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                <strong>השירותים שלנו כוללים:</strong>
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">
                    <Link to={createPageUrl('OsekPaturLanding')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold">
                      פתיחת עוסק פטור
                    </Link> - ליווי מלא בתהליך הפתיחה, מילוי טפסים, וייעוץ מס ראשוני
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">
                    <Link to={createPageUrl('OsekMorshaLanding')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold">
                      פתיחת עוסק מורשה
                    </Link> - הכוונה וסיוע בהליך מול מס הכנסה וביטוח לאומי
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">
                    <Link to={createPageUrl('CompanyLanding')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold">
                      פתיחת חברה בע״מ
                    </Link> - ליווי מקצועי בהקמת תאגיד
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">
                    <Link to={createPageUrl('Professions')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold">
                      ייעוץ לפי מקצוע
                    </Link> - ליווי מותאם אישית לכל תחום עיסוק
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">
                    <Link to={createPageUrl('AnnualReportOsekPatur')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold">
                      דוחות שנתיים
                    </Link> - הכנה והגשת דוחות למס הכנסה
                  </span>
                </li>
              </ul>
            </div>

            {/* שאלות נפוצות */}
            <div className="mt-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-6">
                שאלות נפוצות על פרפקט וואן
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-bold text-[#1E3A5F] text-xl mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    מתי הוקמה פרפקט וואן?
                  </h3>
                  <p className="text-gray-700 text-lg">
                    פרפקט וואן הוקמה בשנת 2016 ופועלת כבר למעלה מעשור בתחום ליווי עצמאים ופתיחת עסקים בישראל.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-bold text-[#1E3A5F] text-xl mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    מה הניסיון שלכם בתחום?
                  </h3>
                  <p className="text-gray-700 text-lg">
                    לצוות שלנו יותר מ-10 שנות ניסיון בליווי עצמאים ופתיחת עסקים. ליווינו מעל 2,000 עוסקים פטורים ומורשים מכל התחומים, ואנחנו בקיאים לעומק במערכת הרגולציה הישראלית.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-bold text-[#1E3A5F] text-xl mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    האם אתם רואי חשבון?
                  </h3>
                  <p className="text-gray-700 text-lg">
                    פרפקט וואן היא חברה פרטית המספקת שירותי ייעוץ וליווי. אנחנו עובדים בשיתוף פעולה עם רואי חשבון מוסמכים ומספקים ליווי מקצועי לאורך כל התהליך.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-bold text-[#1E3A5F] text-xl mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    האם השירות שלכם כולל ליווי לאחר הפתיחה?
                  </h3>
                  <p className="text-gray-700 text-lg">
                    כן! אנחנו מספקים הדרכה מלאה על החובות והזכויות שלך כעצמאי, כולל <Link to={createPageUrl('MonthlyReportOsekPatur')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">דיווחים חודשיים</Link> ו<Link to={createPageUrl('AnnualReportOsekPatur')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">דוחות שנתיים</Link>. אנחנו כאן כדי לתמוך בך גם לאחר שהעסק נפתח.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-bold text-[#1E3A5F] text-xl mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    כמה עולה השירות שלכם?
                  </h3>
                  <p className="text-gray-700 text-lg">
                    השירות שלנו מתומחר בצורה שקופה ונגישה. <Link to={createPageUrl('Pricing')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">לצפייה במחירון המלא</Link> או <Link to={createPageUrl('Contact')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold underline">צרו איתנו קשר</Link> לקבלת הצעת מחיר אישית.
                  </p>
                </div>
              </div>
            </div>


          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              מוכנים להתחיל את המסע העצמאי שלכם?
            </h2>
            <p className="text-xl text-white/80 mb-4">
              הצטרפו לאלפי העצמאים שכבר בחרו בנו לליווי בפתיחת עסק קטן
            </p>
            <p className="text-lg text-white/70 mb-8">
              קבלו ייעוץ מקצועי, ליווי אישי, ותמיכה מלאה בדרככם להצלחה עצמאית
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Contact')}>
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg font-bold rounded-full bg-[#D4AF37] hover:bg-[#c9a432] text-[#1E3A5F] w-full sm:w-auto"
                >
                  צרו קשר לייעוץ חינם
                  <ArrowLeft className="mr-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl('OsekPaturOnlineLanding')}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-14 px-8 text-lg font-bold rounded-full bg-white/10 hover:bg-white/20 text-white border-2 border-white w-full sm:w-auto"
                >
                  פתיחה אונליין ב-249 ₪
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      </main>
    </>
  );
}