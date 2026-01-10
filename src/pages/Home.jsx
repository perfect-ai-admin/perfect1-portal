import React from 'react';
import NewHeroSection from '../components/home/NewHeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import TrustSection from '../components/home/TrustSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import KnowledgeSection from '../components/home/KnowledgeSection';
import FinalCTASection from '../components/home/FinalCTASection';
import GeoContent from '../components/seo/GeoContent';
import SEOOptimized, { seoPresets, schemaTemplates } from './SEOOptimized';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';

export default function Home() {
  return (
    <>
      <LocalBusinessSchema />
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
          "serviceType": ["פתיחת עוסק פטור", "ליווי חודשי", "דוח שנתי"],
          "sameAs": [
            "https://www.facebook.com/perfect1.co.il",
            "https://www.linkedin.com/company/perfect1",
            "https://www.instagram.com/perfect1.co.il"
          ],
          "knowsAbout": ["מס הכנסה", "ביטוח לאומי", "חשבונאות עצמאים", "רגולציה ישראלית"],
          "slogan": "המומחים לפתיחת עוסקים פטורים בישראל",
          "founder": {
            "@type": "Person",
            "name": "יוסי כהן",
            "jobTitle": "רואה חשבון מוסמך"
          }
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
        <GeoContent />
        <MicroCTA text="מוכנים להתחיל?" cta="שיחה קצרה ללא התחייבות" />
        <FAQSection />
        <CTASection />
      </main>
    </>
  );
}