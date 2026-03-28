import React, { useState } from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import FinalCTA from '@/components/marketing/FinalCTA';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, Star, Palette, Presentation, Megaphone, ShieldCheck, CreditCard, Smartphone, Sticker, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

import { getSignupUrl } from '@/components/utils/tracking';

const OneTimeService = ({ title, price, description, icon: Icon, features, color, ctaText = "בחר בשירות זה" }) => {
  const SIGNUP_URL = getSignupUrl();
  return (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-violet-100 group flex flex-col h-full">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="bg-gray-50 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
        חד-פעמי
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm mb-4 min-h-[40px] flex-grow">{description}</p>
    <div className="mb-6">
      <span className="text-3xl font-bold text-gray-900">{price}</span>
      <span className="text-gray-400 text-sm mr-1">/ תשלום אחד</span>
    </div>
    
    <a href={SIGNUP_URL} className="mt-auto">
      <Button variant="outline" className="w-full border-violet-100 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all">
        {ctaText}
        <ArrowLeft className="w-4 h-4 mr-2" />
      </Button>
    </a>
    
    <div className="mt-4 pt-4 border-t border-gray-50">
      <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
        {features.includes('sparkle') && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
        {features.replace('sparkle', '')}
      </p>
    </div>
  </div>
  );
};

export default function Pricing() {
  const SIGNUP_URL = getSignupUrl();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  const plans = [
    {
      name: 'התחלה חכמה',
      description: 'מתאים לעצמאים בתחילת הדרך',
      monthlyPrice: '₪0',
      yearlyPrice: '₪0',
      features: [
        'מטרה אחת פעילה',
        'Mentor עסקי למטרה אחת',
        'מערכת מיתוג בסיסית',
        'חיבור למערכת חשבונות',
      ],
      notIncluded: [
        'ריבוי מטרות',
        'פיננסים מתקדמים',
        'אוטומציות',
      ],
      color: 'gray',
      popular: false,
      ctaText: 'המסלול הנוכחי שלך',
      ctaVariant: 'outline',
    },
    {
      name: 'התקדמות יציבה',
      description: 'לעסק שכבר מתחיל לזוז',
      monthlyPrice: '₪59',
      yearlyPrice: '₪49',
      features: [
        'עד 3 מטרות',
        'Mentor מלא',
        'שיווק + מיתוג מתקדם',
        'חיבור פיננסי בסיסי',
        'אוטומציות',
      ],
      notIncluded: [
        'פיננסים מתקדמים',
      ],
      color: 'blue',
      popular: false,
      ctaText: 'שדרג למסלול Basic',
      ctaVariant: 'default',
    },
    {
      name: 'שליטה וצמיחה',
      description: 'לעסק פעיל שרוצה סדר ותוצאות',
      monthlyPrice: '₪149',
      yearlyPrice: '₪124',
      features: [
        'עד 7 מטרות',
        'Mentor מתקדם (מעקב, מדדים)',
        'שיווק מתקדם (קמפיינים)',
        'Finance בסיסי',
        'סדר וניהול עסקי',
      ],
      notIncluded: [],
      color: 'violet',
      popular: true,
      ctaText: 'בחר במסלול Pro',
      ctaVariant: 'default',
    },
    {
      name: 'מערכת שעובדת בשבילך',
      description: 'לעסקים שרוצים מקסימום יכולת',
      monthlyPrice: '₪349',
      yearlyPrice: '₪290',
      features: [
        'מטרות ללא הגבלה',
        'עבודה על כמה מטרות במקביל',
        'Mentor מלא + מתקדם',
        'שיווק מלא',
        'Finance מלא',
        'אוטומציות חכמות',
        'עדיפות לפיצ’רים עתידיים',
      ],
      notIncluded: [],
      color: 'black',
      popular: false,
      ctaText: 'הצטרף ל־Elite',
      ctaVariant: 'default',
    },
  ];

  const colorClasses = {
    gray: {
      bg: 'bg-white',
      border: 'border-gray-200',
      header: 'bg-gray-50',
      text: 'text-gray-900',
      icon: 'bg-gray-100 text-gray-600',
      button: 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50',
    },
    blue: {
      bg: 'bg-white',
      border: 'border-blue-100',
      header: 'bg-blue-50/50',
      text: 'text-blue-900',
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20',
    },
    violet: {
      bg: 'bg-white',
      border: 'border-violet-200',
      header: 'bg-violet-50',
      text: 'text-violet-900',
      icon: 'bg-violet-100 text-violet-600',
      button: 'bg-violet-600 text-white hover:bg-violet-700 shadow-xl shadow-violet-600/30',
    },
    black: {
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      header: 'bg-slate-800/50',
      text: 'text-white',
      icon: 'bg-slate-800 text-white',
      button: 'bg-white text-slate-900 hover:bg-gray-100 shadow-lg shadow-white/10',
      textMuted: 'text-slate-400',
      checkColor: 'text-emerald-400',
    },
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="pt-16 pb-12 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              בחר את הדרך הנכונה
              <span className="block text-violet-600">לקדם את העסק שלך</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
              התחל בחינם, התקדם בקצב שלך, ושדרג רק כשזה באמת עוזר לך
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                חודשי
              </span>
              <button
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-14 h-8 rounded-full bg-violet-100 p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-violet-600 shadow-sm transition-transform duration-200 ${billingCycle === 'yearly' ? '-translate-x-6' : 'translate-x-0'}`}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                  שנתי
                </span>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  -17%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {plans.map((plan, index) => {
                const colors = colorClasses[plan.color];
                const isBlack = plan.color === 'black';
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      ${colors.bg} 
                      border ${colors.border} 
                      rounded-3xl overflow-hidden relative transition-all duration-300
                      ${plan.popular ? 'shadow-2xl ring-2 ring-violet-500 scale-105 z-10' : 'hover:shadow-xl'}
                    `}
                  >
                    {plan.popular && (
                      <div className="bg-violet-600 text-white text-xs font-bold py-1.5 text-center">
                        הבחירה המומלצת
                      </div>
                    )}
                    
                    <div className={`p-6 ${colors.header}`}>
                      <h3 className={`text-lg font-bold mb-2 ${colors.text}`}>{plan.name}</h3>
                      <p className={`text-sm min-h-[40px] mb-6 ${isBlack ? 'text-gray-400' : 'text-gray-500'}`}>
                        {plan.description}
                      </p>
                      
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className={`text-4xl font-black ${colors.text}`}>
                          {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                        </span>
                        {plan.monthlyPrice !== '₪0' && (
                          <span className={`text-sm ${isBlack ? 'text-gray-500' : 'text-gray-400'}`}>/חודש</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-8">
                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm">
                              <div className={`mt-0.5 rounded-full p-0.5 ${isBlack ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                                <Check className={`w-3 h-3 ${isBlack ? 'text-emerald-400' : 'text-emerald-600'}`} />
                              </div>
                              <span className={isBlack ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                            </li>
                          ))}
                          {plan.notIncluded.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm opacity-50 grayscale">
                              <div className={`mt-0.5 rounded-full p-0.5 bg-gray-100`}>
                                <div className="w-3 h-3" />
                              </div>
                              <span className={isBlack ? 'text-gray-600' : 'text-gray-400'}>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <a href={SIGNUP_URL} className="block mt-auto">
                        <Button className={`w-full h-12 rounded-xl font-bold ${colors.button}`}>
                          {plan.ctaText}
                        </Button>
                      </a>
                      
                      <p className={`text-xs text-center mt-4 ${isBlack ? 'text-gray-500' : 'text-gray-400'}`}>
                        {plan.monthlyPrice === '₪0' ? 'אפשר לשדרג בכל זמן' : 'ניתן לבטל בכל רגע • ללא התחייבות'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* One-Time Services */}
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-gray-900 mb-4">צריך משהו נקודתי? אפשר גם בלי מנוי</h2>
              <p className="text-lg text-gray-600">שירותים מקצועיים לחיזוק העסק שלך, בתשלום חד-פעמי ללא התחייבות</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <OneTimeService
                title="כרטיס ביקור דיגיטלי"
                price="₪149"
                description="כרטיס חכם עם URL קבוע, QR, שמירה לאנשי קשר וכפתורי פעולה"
                icon={Smartphone}
                color="bg-indigo-100 text-indigo-600"
                features="כולל עיצוב ועריכה חופשית"
                ctaText="צור כרטיס"
              />
              
              <OneTimeService
                title="דף נחיתה עסקי"
                price="₪299"
                description="דף נחיתה מקצועי וממיר שמותאם לעסק שלך – עם טופס לידים, עיצוב מרשים וטקסטים שיווקיים"
                icon={Layout}
                color="bg-emerald-50 text-emerald-600"
                features="כולל אחסון ודומיין • מוכן לשימוש sparkle"
                ctaText="בנה דף נחיתה"
              />

              <OneTimeService
                title="סטיקר ממותג לעסק"
                price="₪29"
                description="סטיקר מעוצב ומותאם אישית לוואטסאפ ורשתות חברתיות – מחזק נוכחות ומיתוג"
                icon={Sticker}
                color="bg-pink-50 text-pink-500"
                features="תשלום חד־פעמי • מוכן תוך דקות sparkle"
                ctaText="צור סטיקר עכשיו"
              />

              <OneTimeService
                title="יצירת לוגו ומיתוג"
                price="₪39"
                description="עיצוב לוגו מקצועי ומותאם אישית + קבצים לכל השימושים"
                icon={Palette}
                color="bg-purple-100 text-purple-600"
                features="תשלום חד־פעמי • ללא מנוי"
                ctaText="עצב לוגו"
              />

              <OneTimeService
                title="מצגת עסקית מנצחת"
                price="₪149"
                description="בניית מצגת שיווקית או עסקית שתשכנע כל לקוח או משקיע"
                icon={Presentation}
                color="bg-violet-100 text-violet-600"
                features="מתאים לזום, פגישות וכנסים"
                ctaText="צור מצגת"
              />

              <OneTimeService
                title="הזנקת קמפיין שיווקי"
                price="₪299"
                description="הקמת קמפיין ממומן ממוקד להבאת לידים איכותיים"
                icon={Megaphone}
                color="bg-orange-100 text-orange-600"
                features="הגדרה ראשונית מהירה ומקצועית"
                ctaText="התחל קמפיין"
              />
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-400 text-sm font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span>המידע שלך מאובטח (SSL)</span>
              </div>
              <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span>תשלום מאובטח ע"י Stripe</span>
              </div>
              <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>אין אותיות קטנות או התחייבויות נסתרות</span>
              </div>
            </div>
          </div>
        </section>

        <FinalCTA />
      </main>
      
      <Footer />
    </div>
  );
}