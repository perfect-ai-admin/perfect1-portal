import React from 'react';
import PortalHeader from '@/portal/components/PortalHeader';
import PortalFooter from '@/portal/components/PortalFooter';
import ToolsGrid from '@/components/marketing/ToolsGrid';
import CampaignTemplates from '@/components/marketing/CampaignTemplates';
import GoalsGrid from '@/components/marketing/GoalsGrid';
import Modules from '@/components/marketing/Modules';
import FinalCTA from '@/components/marketing/FinalCTA';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const SIGNUP_URL = "https://www.perfect1.co.il/login?from_url=https%3A%2F%2Fwww.perfect1.co.il%2FAPP";

export default function Features() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <PortalHeader />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              כל הכלים שהעסק שלך צריך
              <span className="text-violet-600"> במקום אחד</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              מיתוג, שיווק, ניהול מטרות וכספים – הכל בפלטפורמה אחת שעובדת בשבילך
            </p>
            <a href={SIGNUP_URL}>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 h-14 text-lg font-medium shadow-xl shadow-violet-600/30">
                התחל עכשיו בחינם
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </section>

        <Modules />
        <ToolsGrid />
        <CampaignTemplates />
        <GoalsGrid />
        <FinalCTA />
      </main>
      
      <PortalFooter />
    </div>
  );
}