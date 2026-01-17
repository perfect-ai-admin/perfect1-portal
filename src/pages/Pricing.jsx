import React from 'react';
import { Helmet } from 'react-helmet-async';
import PricingSection from '../components/home/PricingSection';
import FAQSection from '../components/home/FAQSection';
import CTASection from '../components/home/CTASection';

export default function Pricing() {
  return (
    <>
      <Helmet>
        <title>מחירון - Perfect One</title>
        <meta name="description" content="מחירון שקוף וברור לפתיחת עוסק פטור, ליווי חודשי ושירותים נוספים. בחרו את המסלול המתאים לכם." />
      </Helmet>
      
      <div className="min-h-screen bg-white" dir="rtl">
        <div className="pt-20">
          <PricingSection />
          <FAQSection />
          <CTASection />
        </div>
      </div>
    </>
  );
}