import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import HeroNewSection from '../components/home/HeroNewSection';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import SafeCtaBar from '../components/cro/SafeCtaBar';
import SafeLeadInline from '../components/cro/SafeLeadInline';

// Lazy Load sections below the fold
const BusinessTypesSection = React.lazy(() => import('../components/home/BusinessTypesSection'));
const TrustSection = React.lazy(() => import('../components/home/TrustSection'));
const ProcessSimpleSection = React.lazy(() => import('../components/home/ProcessSimpleSection'));
const KnowledgeSection = React.lazy(() => import('../components/home/KnowledgeSection'));
const CTAGentleSection = React.lazy(() => import('../components/home/CTAGentleSection'));
const GeoContent = React.lazy(() => import('../components/seo/GeoContent'));
const CTASection = React.lazy(() => import('../components/home/CTASection'));

const SectionLoader = () => <div className="h-96 w-full bg-gray-50/50 animate-pulse" />;

export default function Home() {
  return (
    <>
      <Helmet>
        <meta name="google-site-verification" content="bLaptZTTD_btTGoFrlW9uYdfP6oYBsoLSXdM3HDyWJg" />
      </Helmet>
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
        {/* Eager load the Hero section for LCP */}
        <HeroNewSection />
        
        <Suspense fallback={<SectionLoader />}>
          <BusinessTypesSection />
          <TrustSection />
          <ProcessSimpleSection />
          <KnowledgeSection />
          <CTAGentleSection />
          <GeoContent />
          
          
          <CTASection />
        </Suspense>

        {/* Safe CTA Solutions - Google Compliant */}
        <div className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SafeLeadInline 
              title="בדיקה אישית ללא התחייבות"
              subtitle="גלו אם עוסק פטור זה הפתרון המושלם לכם"
              description="שם + טלפון בלבד. אנחנו נחזור אליך עם ייעוץ מעמיק תוך 24 שעות."
              sourcePage="Home - Inline Section"
              variant="highlight"
            />
          </div>
        </div>

        {/* Sticky Bar - Mobile/Desktop */}
        <SafeCtaBar 
          title="בדיקה אישית ללא התחייבות"
          subtitle="שם + טלפון בלבד"
          sourcePage="Home - SafeCtaBar"
        />
      </main>
    </>
  );
}