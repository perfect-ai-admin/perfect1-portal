import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import ServicesSection from '../components/home/ServicesSection';
import ProcessSection from '../components/home/ProcessSection';
import PricingSection from '../components/home/PricingSection';
import ProfessionsGrid from '../components/home/ProfessionsGrid';
import FAQSection from '../components/home/FAQSection';
import CTASection from '../components/home/CTASection';
import SEOOptimized, { seoPresets, schemaTemplates } from './SEOOptimized';

export default function Home() {
  return (
    <>
      <SEOOptimized 
        {...seoPresets.home}
        canonical="https://perfect1.co.il"
        schema={schemaTemplates.organization}
      />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
        <ProfessionsGrid />
        <ProcessSection />
        <FAQSection />
        <CTASection />
      </main>
    </>
  );
}