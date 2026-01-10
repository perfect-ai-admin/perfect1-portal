import React from 'react';
import { motion } from 'framer-motion';
import ProfessionsGrid from '../components/home/ProfessionsGrid';
import MicroCTA from '../components/cro/MicroCTA';
import SEOOptimized, { seoPresets } from './SEOOptimized';

export default function Professions() {
  // Enhanced Professions Hub Schema
  const professionsSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "פתיחת עוסק פטור לפי מקצוע",
    "description": "מדריך מקיף לפתיחת עוסק פטור לכל מקצוע בישראל - מעצבים, צלמים, מפתחים, מאמנים ועוד",
    "url": "https://perfect1.co.il/professions",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Perfect One",
      "url": "https://perfect1.co.il"
    },
    "about": {
      "@type": "Thing",
      "name": "עוסק פטור בישראל",
      "description": "פתיחת עוסק פטור לפי מקצוע"
    },
    "provider": {
      "@type": "Organization",
      "name": "Perfect One",
      "sameAs": [
        "https://www.facebook.com/perfect1.co.il",
        "https://www.linkedin.com/company/perfect1",
        "https://www.instagram.com/perfect1.co.il"
      ]
    }
  };

  return (
    <>
      <SEOOptimized 
        {...seoPresets.professions}
        canonical="https://perfect1.co.il/professions"
        schema={professionsSchema}
      />
      <main className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              פתיחת עוסק פטור לפי מקצוע בישראל
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              לכל מקצוע יש דרישות, הוצאות מוכרות ודגשים שונים בתהליך פתיחת העוסק הפטור.
              בחר את המקצוע שלך וקבל מידע מותאם אישית - מהפתיחה ועד הניהול השוטף.
            </p>
          </motion.div>
          
          {/* Internal Link to Main Guide */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
            >
              ← למדריך המלא לפתיחת עוסק פטור
            </a>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MicroCTA text="רוצה לדעת איזה מסלול מתאים לך?" cta="ייעוץ מהיר ללא עלות" variant="subtle" />
      </div>

      {/* Professions Grid - Show All */}
      <ProfessionsGrid showAll={true} />

      {/* מקצועות חייבים מורשה */}
      <section className="py-16 bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-t-4 border-red-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              ⚠️ חשוב לדעת
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
              מקצועות שחייבים להיות עוסק מורשה
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              יש מקצועות שלא יכולים להתנהל כעוסק פטור – חייבים מיד עוסק מורשה. להלן המקצועות שחייבים להרשם כעוסק מורשה מתחילה או שיש להם דרישות מיוחדות.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'דילרים וחנויות',
                desc: 'כל דילר של מוצרים, חנות או עסק קמעוני חייב להיות עוסק מורשה ולנהל מע״מ.',
                icon: '🏪'
              },
              {
                title: 'ספקים לעסקים',
                desc: 'חברות המספקות מוצרים/שירותים לעסקים אחרים חייבות להיות עוסק מורשה.',
                icon: '🚚'
              },
              {
                title: 'יבוא וייצוא',
                desc: 'כל מי שיובא או מייצא מוצרים חייב בעוסק מורשה מיד.',
                icon: '🌍'
              },
              {
                title: 'שכירות וקרקע',
                desc: 'בעלי נכסים להשכרה חייבים עוסק מורשה (אפילו לא תמיד כפטור)',
                icon: '🏠'
              },
              {
                title: 'ייצור ותעשייה',
                desc: 'כל יצור של מוצרים (קטנים או גדולים) דורש עוסק מורשה.',
                icon: '🏭'
              },
              {
                title: 'קונטרקטורים',
                desc: 'קונטרקטורים וקבלנים צריכים עוסק מורשה בגלל סכומי החוזים.',
                icon: '👷'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-red-500 hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                <p className="text-gray-700 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border-2 border-red-300 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">למה? 🤔</h3>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              המס הישראלי דורש מקצועות אלה להיות עוסק מורשה כדי לשלוט טוב יותר על תשלום מע״מ ודיווחים. אם אתה מנסה להתנהל כפטור בעוד אתה צריך מורשה – זה בעיה משפטית חמורה שיכולה להוביל לקנסות גבוהים.
            </p>
            <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-600">
              <p className="font-bold text-red-900 text-lg">
                אם אתה לא בטוח איזה סוג עוסק אתה צריך – צרו קשר. אנחנו נבדוק ונודיע לך בדיוק מה נדרש.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      </main>
    </>
  );
}