import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Check, Star, Building, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Pricing() {
  const navigate = useNavigate();

  const pricingTiers = [
    {
      name: 'עוסק פטור',
      price: '₪117',
      period: '/חודש',
      description: 'הפתרון המושלם לעסקים קטנים ופטורים ממע"מ',
      icon: Star,
      features: [
        'פתיחת תיק ברשויות',
        'הגשת דוח שנתי',
        'הצהרת הון (במידת הצורך)',
        'ייצוג מול רשויות המס',
        'אפליקציה להפקת קבלות',
        'התייעצות שוטפת בווצאפ'
      ],
      cta: 'פתח תיק עוסק פטור',
      link: 'OsekPaturLanding',
      highlight: false
    },
    {
      name: 'עוסק מורשה',
      price: '₪250',
      period: '/חודש',
      description: 'לעסקים בצמיחה שחייבים בדיווח מע"מ',
      icon: Briefcase,
      features: [
        'פתיחת תיק ברשויות',
        'דיווח מע"מ דו-חודשי/חד-חודשי',
        'דוח שנתי והצהרות הון',
        'ייצוג מלא מול כל הרשויות',
        'הנהלת חשבונות מלאה',
        'ייעוץ מס ותכנון מקדמות',
        'אפליקציה לניהול העסק'
      ],
      cta: 'פרטים על עוסק מורשה',
      link: 'OsekMorshaLanding',
      highlight: true
    },
    {
      name: 'חברה בע"מ',
      price: '₪1,200',
      period: '/חודש',
      description: 'לחברות וארגונים הדורשים הנהלת חשבונות כפולה',
      icon: Building,
      features: [
        'פתיחת חברה ברשם החברות',
        'הנהלת חשבונות כפולה',
        'ביקורת דוחות כספיים',
        'דוח שנתי לחברה וליחיד',
        'משכורות לעובדים ובעלי שליטה',
        'ייצוג מלא בביטוח לאומי ומס הכנסה',
        'ייעוץ פיננסי שוטף'
      ],
      cta: 'צור קשר לפתיחת חברה',
      link: 'CompanyLanding',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Helmet>
        <title>מחירון שירותי ראיית חשבון | Perfect One</title>
        <meta name="description" content="מחירון שקוף והוגן לשירותי ראיית חשבון: עוסק פטור, עוסק מורשה וחברה בע״מ. כולל דוחות שנתיים, ייצוג ברשויות ואפליקציה מתקדמת." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-[#1E3A5F] text-white pt-20 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            מחירון שירותי ראיית חשבון
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            מחירים הוגנים ושקופים, ללא הפתעות וללא אותיות קטנות.
            בחרו את סוג העסק שלכם והתחילו להתנהל בראש שקט.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div 
                key={index}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 flex flex-col ${
                  tier.highlight ? 'border-[#D4AF37] ring-4 ring-[#D4AF37]/10' : 'border-transparent'
                }`}
              >
                {tier.highlight && (
                  <div className="bg-[#D4AF37] text-white text-center py-2 text-sm font-bold uppercase tracking-wider">
                    הכי פופולרי
                  </div>
                )}
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    tier.highlight ? 'bg-yellow-50 text-[#D4AF37]' : 'bg-blue-50 text-[#1E3A5F]'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-500 mb-6">{tier.description}</p>
                  
                  <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-extrabold text-[#1E3A5F]">{tier.price}</span>
                    <span className="text-gray-500 mr-2">{tier.period}</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 ml-3 mt-0.5 shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-6 text-lg font-bold shadow-lg transition-all ${
                      tier.highlight 
                        ? 'bg-[#1E3A5F] hover:bg-[#162B47] text-white' 
                        : 'bg-white border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-blue-50'
                    }`}
                    onClick={() => navigate(createPageUrl(tier.link))}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Link / Contact */}
      <div className="text-center mt-16 mb-10">
        <p className="text-gray-600 mb-4">מתלבטים איזה עוסק לפתוח?</p>
        <Button 
          variant="link" 
          onClick={() => navigate(createPageUrl('Contact'))}
          className="text-[#1E3A5F] font-semibold text-lg"
        >
          דברו איתנו ונשמח לייעץ ללא עלות &larr;
        </Button>
      </div>
    </div>
  );
}