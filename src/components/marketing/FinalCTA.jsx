import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

import { getSignupUrl } from '@/components/utils/tracking';

export default function FinalCTA() {
  const SIGNUP_URL = getSignupUrl();
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              התחל עכשיו בחינם
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              הגיע הזמן להפוך את הניהול לקל
            </h2>
            
            <p className="text-violet-100 text-lg mb-8 max-w-2xl mx-auto">
              הצטרף עוד היום ל-ClientDashboard ותראה את ההבדל – מטרות ברורות, כלים מוכנים, ותוצאות אמיתיות.
            </p>
            
            <a href={SIGNUP_URL}>
              <Button className="bg-white text-violet-700 hover:bg-violet-50 rounded-xl px-8 h-14 text-lg font-medium shadow-xl">
                יצירת חשבון בחינם
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </a>
            
            <p className="text-violet-200 text-sm mt-4">
              ללא צורך בכרטיס אשראי • ניתן לבטל בכל עת
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}