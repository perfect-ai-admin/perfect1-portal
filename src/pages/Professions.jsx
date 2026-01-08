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
      </main>
    </>
  );
}