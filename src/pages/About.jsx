import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import InternalLinker from '../components/seo/InternalLinker';
import MicroCTA from '../components/cro/MicroCTA';
import { CheckCircle, Users, Award, Clock, ArrowLeft, Target, Heart, Shield } from 'lucide-react';

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
  { number: '24h', label: 'זמן תגובה מקסימלי' },
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
                מי אנחנו
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                <strong>פרפקט וואן</strong> היא חברה פרטית המספקת ייעוץ וליווי בפתיחת עסקים בישראל.
                אנחנו צוות מקצועי עם ניסיון רב בתחום, שמבין את הקשיים והאתגרים של פתיחת עסק בישראל.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                <strong>⚠️ חשוב:</strong> אנחנו אינו אתר ממשלתי ואינו מייצגים אף רשות.
                אנחנו חברה פרטית המספקת ייעוץ וליווי בלבד - אתה מבצע את הפעולות בעצמך מול הרשויות.
              </p>
            </div>

            {/* למה האתר קיים */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-4">
                למה האתר קיים
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                פתיחת עסק בישראל יכולה להיות מסובכת ומלאה בשאלות. יצרנו את האתר הזה כדי לספק מידע ברור ונגיש,
                ולהציע ליווי מסודר לכל מי שרוצה להתחיל לעבוד כעצמאי או לפתוח עסק.
                השירות שלנו מיועד למי שמחפש הדרכה וליווי ראשוני בתהליך.
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
                    </Link> - ליווי מלא בתהליך הפתיחה
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">
                    <Link to={createPageUrl('OsekMorshaLanding')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold">
                      פתיחת עוסק מורשה
                    </Link> - הכוונה וסיוע בהליך
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">
                    <Link to={createPageUrl('CompanyLanding')} className="text-[#1E3A5F] hover:text-[#27AE60] font-semibold">
                      פתיחת חברה בע״מ
                    </Link> - ליווי מקצועי
                  </span>
                </li>
              </ul>
            </div>

            {/* הבהרה חשובה */}
            <div className="border-t-2 border-[#D4AF37] pt-6">
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-3 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-yellow-600" />
                  הבהרה חשובה
                </h3>
                <p className="text-gray-800 text-base leading-relaxed font-medium">
                  השירות ניתן על ידי גורם פרטי לצורכי ייעוץ וליווי בלבד.
                  <br />
                  <strong>האתר אינו אתר ממשלתי</strong> ואינו מהווה ייעוץ חשבונאי או משפטי.
                  <br />
                  לשאלות משפטיות או חשבונאיות מורכבות, מומלץ לפנות לגורם מוסמך.
                </p>
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
              מוכנים להתחיל?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              הצטרפו לאלפי העצמאים שכבר בחרו בנו
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg font-bold rounded-full bg-[#D4AF37] hover:bg-[#c9a432] text-[#1E3A5F]"
              >
                לפתיחת עוסק פטור עכשיו
                <ArrowLeft className="mr-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      </main>
    </>
  );
}