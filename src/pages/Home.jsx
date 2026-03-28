import React, { useRef } from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Hero from '@/components/marketing/Hero';
import Benefits from '@/components/marketing/Benefits';
import ToolsGrid from '@/components/marketing/ToolsGrid';
import CampaignTemplates from '@/components/marketing/CampaignTemplates';
import GoalsGrid from '@/components/marketing/GoalsGrid';
import Modules from '@/components/marketing/Modules';
import SocialProof from '@/components/marketing/SocialProof';
import FAQSection from '@/components/marketing/FAQSection';
import FinalCTA from '@/components/marketing/FinalCTA';

export default function Home() {
  const toolsRef = useRef(null);

  const scrollToTools = () => {
    toolsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      <main>
        <Hero scrollToTools={scrollToTools} />
        <Benefits />
        <GoalsGrid />
        <div ref={toolsRef}>
          <ToolsGrid id="tools" />
        </div>
        <CampaignTemplates />
        <Modules />
        <SocialProof />
        <FAQSection />
        <FinalCTA />
      </main>
      
      <Footer />
    </div>
  );
}