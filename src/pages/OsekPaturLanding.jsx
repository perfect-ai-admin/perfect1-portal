import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';
import FAQSchema from '../components/seo/FAQSchema';
import PageTracker from '../components/seo/PageTracker';

import HeroSection from '../components/landing/aggressive/HeroSection';
import FomoSection from '../components/landing/aggressive/FomoSection';
import SolutionSection from '../components/landing/aggressive/SolutionSection';
import ProofSection from '../components/landing/aggressive/ProofSection';
import ProcessSection from '../components/landing/aggressive/ProcessSection';
import MidCta from '../components/landing/aggressive/MidCta';
import FaqSection from '../components/landing/aggressive/FaqSection';
import ClosingSection from '../components/landing/aggressive/ClosingSection';
import FloatingWhatsApp from '../components/landing/aggressive/FloatingWhatsApp';
import StickyMobileCta from '../components/landing/aggressive/StickyMobileCta';
import LeadPopup from '../components/cro/LeadPopup';

export default function OsekPaturLanding() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const closingRef = useRef(null);

  const handleSubmit = async ({ name, phone, sourcePage }) => {
    if (!name || !phone) return;
    setIsSubmitting(true);
    await base44.functions.invoke('submitLead', {
      name,
      phone,
      source_page: sourcePage || 'דף נחיתה אגרסיבי',
      status: 'new'
    });

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'lead_submit', lead_source: sourcePage });

    window.location.href = '/ThankYou';
  };

  const scrollToClosing = () => {
    if (closingRef.current) {
      closingRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowLeadPopup(true);
    }
  };

  const faqs = [
    { question: 'כמה זמן לוקח לפתוח עוסק פטור?', answer: 'עם ליווי מקצועי, התהליך נמשך בדרך כלל בין יום ל-3 ימי עסקים.' },
    { question: 'האם חייבים ליווי?', answer: 'לא חייבים, אבל ליווי חוסך טעויות יקרות, זמן ובירוקרטיה מיותרת.' },
    { question: 'מה כולל התהליך?', answer: 'פתיחת תיק מול כל הרשויות, הסבר מלא על החובות שלך, ליווי שוטף.' }
  ];

  return (
    <>
      <PageTracker pageUrl="/OsekPaturLanding" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <SEOOptimized
        title="פתיחת עוסק פטור – ליווי מלא, מהיר ובלי להסתבך | Perfect One"
        description="פתיחת עוסק פטור בליווי אישי מלא. חזרה תוך 10 דקות. חוסכים זמן, טעויות ובירוקרטיה. הצטרפו ל-2,000+ עצמאים."
        keywords="פתיחת עוסק פטור, עוסק פטור, פתיחת עסק, ליווי עוסק פטור"
        canonical="https://perfect1.co.il/OsekPaturLanding"
        schema={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Perfect One - פתיחת עוסק פטור",
          "description": "שירות מלא לפתיחת עוסק פטור כולל ליווי אישי",
          "url": "https://perfect1.co.il/OsekPaturLanding",
          "telephone": "+972-50-227-7087",
          "priceRange": "₪₪",
          "address": { "@type": "PostalAddress", "addressCountry": "IL" },
          "areaServed": { "@type": "Country", "name": "ישראל" }
        }}
      />

      {/* No header, no footer, no navigation - pure conversion */}
      <main className="bg-[#F8F9FA]" dir="rtl">
        <HeroSection onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        <FomoSection />
        <SolutionSection onCtaClick={scrollToClosing} />
        <ProofSection />
        <ProcessSection />
        <MidCta onCtaClick={scrollToClosing} />
        <FaqSection />
        <div ref={closingRef}>
          <ClosingSection onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </main>

      {/* Fixed elements */}
      <FloatingWhatsApp />
      <StickyMobileCta onCtaClick={scrollToClosing} />

      {/* Popup fallback */}
      <LeadPopup
        open={showLeadPopup}
        onClose={() => setShowLeadPopup(false)}
        sourcePage="דף נחיתה אגרסיבי - פופאפ"
      />
    </>
  );
}