import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Search, Mail, ArrowLeft } from 'lucide-react';

import { getSignupUrl } from '@/components/utils/tracking';

const campaigns = [
  {
    icon: Facebook,
    title: 'קמפיין רשתות חברתיות',
    platforms: 'Facebook, Instagram',
    budget: '₪500–1,000',
    color: 'blue',
  },
  {
    icon: Search,
    title: 'פרסום בגוגל',
    platforms: 'Google Ads',
    budget: '₪1,000–3,000',
    color: 'emerald',
  },
  {
    icon: Mail,
    title: 'שיווק במייל',
    platforms: 'ניוזלטרים ואוטומציות',
    budget: '₪0–200',
    color: 'violet',
  },
];

const colorClasses = {
  blue: { 
    bg: 'bg-blue-50', 
    icon: 'bg-blue-100 text-blue-600',
    badge: 'bg-emerald-100 text-emerald-700'
  },
  emerald: { 
    bg: 'bg-emerald-50', 
    icon: 'bg-emerald-100 text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700'
  },
  violet: { 
    bg: 'bg-violet-50', 
    icon: 'bg-violet-100 text-violet-600',
    badge: 'bg-emerald-100 text-emerald-700'
  },
};

export default function CampaignTemplates() {
  const SIGNUP_URL = getSignupUrl();
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            בחר תבנית קמפיין
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            לא מתחילים מאפס — מתחילים מתבנית מוכנה שמתאימה לעסק שלך
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => {
            const colors = colorClasses[campaign.color];
            return (
              <div
                key={index}
                className={`${colors.bg} rounded-2xl p-6 md:p-8 transition-all hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className={`w-14 h-14 ${colors.icon} rounded-xl flex items-center justify-center mb-5`}>
                  <campaign.icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {campaign.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {campaign.platforms}
                </p>
                
                <div className={`inline-flex items-center ${colors.badge} rounded-full px-3 py-1.5 text-sm font-medium mb-6`}>
                  תקציב מומלץ: {campaign.budget}
                </div>
                
                <a href={SIGNUP_URL} className="block">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center text-gray-700 hover:bg-white/50 rounded-xl h-11"
                  >
                    התחל עם התבנית
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}