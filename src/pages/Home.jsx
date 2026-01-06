import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import ServicesSection from '../components/home/ServicesSection';
import ProcessSection from '../components/home/ProcessSection';
import PricingSection from '../components/home/PricingSection';
import ProfessionsGrid from '../components/home/ProfessionsGrid';
import FAQSection from '../components/home/FAQSection';
import CTASection from '../components/home/CTASection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <ProfessionsGrid />
      <ProcessSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}