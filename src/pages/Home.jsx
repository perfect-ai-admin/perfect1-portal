import React from 'react';
import HeroSection from '../components/home/HeroSection';
import WhatIsSection from '../components/home/WhatIsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import ServicesSection from '../components/home/ServicesSection';
import ProcessSection from '../components/home/ProcessSection';
import PricingSection from '../components/home/PricingSection';
import ProfessionsGrid from '../components/home/ProfessionsGrid';
import FAQSection from '../components/home/FAQSection';
import CTASection from '../components/home/CTASection';
import QuickCTASection from '../components/home/QuickCTASection';
import SEOOptimized, { seoPresets, schemaTemplates } from './SEOOptimized';

export default function Home() {
  return (
    <>
      <SEOOptimized 
        {...seoPresets.home}
        canonical="https://perfect1.co.il"
        schema={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Perfect One - פתיחת עוסק פטור בישראל",
          "description": "המרכז הארצי לפתיחת עוסקים פטורים בישראל. ליווי מקצועי מא' ועד ת'",
          "url": "https://perfect1.co.il",
          "telephone": "+972-50-227-7087",
          "priceRange": "₪₪",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IL",
            "addressRegion": "ישראל"
          },
          "areaServed": [
            {
              "@type": "Country",
              "name": "ישראל"
            },
            {
              "@type": "City",
              "name": "תל אביב"
            },
            {
              "@type": "City",
              "name": "ירושלים"
            },
            {
              "@type": "City",
              "name": "חיפה"
            },
            {
              "@type": "City",
              "name": "באר שבע"
            }
          ],
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "31.0461",
            "longitude": "34.8516"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "2000"
          },
          "serviceType": ["פתיחת עוסק פטור", "ליווי חודשי", "דוח שנתי"]
        }}
      />
      <main>
        <HeroSection />
        <WhatIsSection />
        <MicroCTA text="רוצה לדעת אם עוסק פטור מתאים לך?" cta="בדיקה מהירה ללא עלות" variant="subtle" />
        <FeaturesSection />
        <ServicesSection />
        <ProfessionsGrid />
        <QuickCTASection />
        <ProcessSection />
        <MicroCTA text="מוכנים להתחיל?" cta="שיחה קצרה ללא התחייבות" />
        <FAQSection />
        <CTASection />
      </main>
    </>
  );
}