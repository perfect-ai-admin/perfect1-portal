import React from 'react';
import HeroNewSection from '../components/home/HeroNewSection';
import BusinessTypesSection from '../components/home/BusinessTypesSection';
import TrustSection from '../components/home/TrustSection';
import ProcessSimpleSection from '../components/home/ProcessSimpleSection';
import KnowledgeSection from '../components/home/KnowledgeSection';
import CTAGentleSection from '../components/home/CTAGentleSection';
import GeoContent from '../components/seo/GeoContent';
import CTASection from '../components/home/CTASection';
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
        <HeroNewSection />
        <BusinessTypesSection />
        <TrustSection />
        <ProcessSimpleSection />
        <KnowledgeSection />
        <CTAGentleSection />
        <GeoContent />
        <CTASection />
      </main>
    </>
  );
}