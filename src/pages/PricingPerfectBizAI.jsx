import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, X, ArrowRight, Star, Zap, Layout, Presentation, Megaphone, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PricingPerfectBizAI() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Define static data from spec
  const subscriptionTiers = [
    {
      name: 'Free', // Map to DB name 'חינמי' or 'Free'
      dbNames: ['חינמי', 'Free', 'Starter'],
      price: 0,
      description: 'לצעדים הראשונים בעולם העסקים',
      features: [
        { text: 'מטרה אחת פעילה', included: true },
        { text: 'Mentor עסקי למטרה אחת', included: true },
        { text: 'מערכת מיתוג בסיסית', included: true },
        { text: 'חיבור למערכת חשבונות', included: true },
        { text: 'ריבוי מטרות', included: false },
        { text: 'פיננסים מתקדמים', included: false },
        { text: 'אוטומציות', included: false },
      ],
      cta: 'התחל בחינם',
      highlight: false
    },
    {
      name: 'Basic',
      dbNames: ['Basic', 'בסיסי'],
      price: 59,
      description: 'לעסקים שרוצים להתחיל לצמוח',
      features: [
        { text: 'עד 3 מטרות', included: true },
        { text: 'Mentor מלא', included: true },
        { text: 'שיווק + מיתוג מתקדם', included: true },
        { text: 'חיבור פיננסי בסיסי', included: true },
        { text: 'אוטומציות', included: false },
        { text: 'פיננסים מתקדמים', included: false },
      ],
      cta: 'שדרג למסלול Basic',
      highlight: false
    },
    {
      name: 'Pro',
      dbNames: ['Pro', 'מקצועי'],
      price: 149,
      description: 'הפתרון המושלם לעסק בצמיחה',
      features: [
        { text: 'עד 7 מטרות', included: true },
        { text: 'Mentor מתקדם (מעקב, מדדים)', included: true },
        { text: 'שיווק מתקדם (קמפיינים)', included: true },
        { text: 'Finance בסיסי', included: true },
        { text: 'סדר וניהול עסקי', included: true },
      ],
      cta: 'בחר Pro',
      highlight: true // Popular choice
    },
    {
      name: 'Elite',
      dbNames: ['Elite', 'עלית'],
      price: 349,
      description: 'מעטפת מלאה לעסקים מובילים',
      features: [
        { text: 'מטרות ללא הגבלה', included: true },
        { text: 'עבודה על כמה מטרות במקביל', included: true },
        { text: 'Mentor מלא + מתקדם', included: true },
        { text: 'שיווק מלא', included: true },
        { text: 'Finance מלא', included: true },
        { text: 'אוטומציות חכמות', included: true },
        { text: 'עדיפות לפיצ’רים עתידיים', included: true },
      ],
      cta: 'הצטרף ל־Elite',
      highlight: false
    }
  ];

  const oneTimeServices = [
    {
      name: 'יצירת לוגו',
      dbNames: ['Logo', 'לוגו', 'Logo Design'],
      price: 99,
      icon: Layout,
      description: 'עיצוב לוגו מקצועי ומותאם אישית + קבצים להורדה',
      cta: 'רכוש לוגו'
    },
    {
      name: 'מצגת עסקית',
      dbNames: ['Presentation', 'מצגת', 'Business Presentation'],
      price: 149,
      icon: Presentation,
      description: 'בניית מצגת שיווקית או עסקית מנצחת',
      cta: 'צור מצגת'
    },
    {
      name: 'קמפיין שיווקי',
      dbNames: ['Campaign', 'קמפיין', 'Marketing Campaign'],
      price: 299,
      icon: Megaphone,
      description: 'הקמת קמפיין בסיסי ממוקד להבאת לידים',
      cta: 'התחל קמפיין'
    }
  ];

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Get current user
        const currentUser = await base44.auth.me().catch(() => null);
        setUser(currentUser);

        // 2. Fetch plans from DB to get IDs
        const dbPlans = await base44.entities.Plan.list({ limit: 50 });
        setPlans(dbPlans);
      } catch (error) {
        console.error('Error loading pricing data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const getPlanId = (tier) => {
    // Find matching DB plan
    const match = plans.find(p => tier.dbNames.some(name => p.name.toLowerCase().includes(name.toLowerCase())));
    return match?.id;
  };

  const handleSubscriptionClick = (tier) => {
    const planId = getPlanId(tier);
    
    if (!user) {
      toast.info('יש להתחבר למערכת כדי לרכוש מסלול');
      navigate(createPageUrl('ClientLogin'));
      return;
    }

    if (!planId) {
      // Fallback if plan doesn't exist in DB yet
      toast.error(`המסלול ${tier.name} אינו זמין כרגע לרכישה`);
      return;
    }

    if (user.current_plan_id === planId) {
       toast.info('זהו המסלול הנוכחי שלך');
       return;
    }

    // Navigate to checkout
    navigate(`/Checkout?type=plan&id=${planId}`);
  };

  const handleServiceClick = (service) => {
    const planId = getPlanId(service);
    
    if (!user) {
      toast.info('יש להתחבר למערכת כדי לרכוש שירות');
      navigate(createPageUrl('ClientLogin'));
      return;
    }

    // Since these are "Services" but logic requires a Plan entity for checkout (or special handling),
    // we assume for now they are set up as Plans in the backend or we handle them specially.
    // If we found a matching ID, great. If not, we might need a workaround.
    // For this implementation, we'll try to find the ID.
    
    if (planId) {
        navigate(`/Checkout?type=plan&id=${planId}`);
    } else {
        // Fallback: Use 'goal' type or similar if 'service' isn't supported, 
        // OR pass hardcoded ID/Name if Checkout supports it (it doesn't seem to based on reading).
        // We'll show an error for now if not found in DB.
        toast.error(`השירות ${service.name} אינו זמין כרגע לרכישה`);
    }
  };

  const isCurrentPlan = (tier) => {
    if (!user || !user.current_plan_id) {
        return tier.name === 'Free'; // Default to Free if no plan
    }
    const planId = getPlanId(tier);
    return user.current_plan_id === planId;
  };

  // Determine if a tier is "lower" than current (simple logic based on price)
  const isDowngrade = (tier) => {
    if (!user) return false;
    // Find current user's plan price
    const currentDbPlan = plans.find(p => p.id === user.current_plan_id);
    if (!currentDbPlan) return false; // Can't determine
    return tier.price < (currentDbPlan.price || 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>מחירון ומסלולים | Perfect Biz AI</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 pb-20 font-heebo" dir="rtl">
        {/* Navbar / Back Button */}
        <div className="bg-white border-b sticky top-0 z-40">
             <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowRight className="w-4 h-4" />
                    חזור
                </Button>
                <span className="font-bold text-[#1E3A5F]">Perfect Biz AI</span>
                <div className="w-20" /> {/* Spacer */}
             </div>
        </div>

        {/* 1. Hero Section */}
        <div className="bg-[#1E3A5F] text-white py-16 px-4 text-center relative overflow-hidden">
             {/* Abstract Background */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute top-10 right-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
                 <div className="absolute bottom-10 left-10 w-64 h-64 bg-green-400 rounded-full blur-3xl" />
             </div>

             <div className="relative z-10 max-w-3xl mx-auto">
                 <h1 className="text-3xl md:text-5xl font-bold mb-4">
                     בחר את הדרך הנכונה לקדם את העסק שלך
                 </h1>
                 <p className="text-blue-100 text-lg md:text-xl mb-8">
                     מסלולים חודשיים או שירותים נקודתיים – לפי מה שמתאים לך עכשיו
                 </p>

                 {/* Toggle */}
                 <div className="flex items-center justify-center gap-4 bg-white/10 w-fit mx-auto p-1 rounded-full backdrop-blur-sm">
                     <button
                        onClick={() => setBillingCycle('monthly')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all",
                            billingCycle === 'monthly' ? "bg-white text-[#1E3A5F] shadow-lg" : "text-white hover:bg-white/10"
                        )}
                     >
                         חודשי
                     </button>
                     <button
                        onClick={() => setBillingCycle('yearly')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                            billingCycle === 'yearly' ? "bg-white text-[#1E3A5F] shadow-lg" : "text-white hover:bg-white/10"
                        )}
                     >
                         שנתי
                         <Badge variant="secondary" className="bg-green-500 text-white border-0 text-[10px] h-5 px-1.5">
                             -17%
                         </Badge>
                     </button>
                 </div>
             </div>
        </div>

        {/* 2. Subscriptions Section */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subscriptionTiers.map((tier, idx) => {
                    const isCurrent = isCurrentPlan(tier);
                    const downgrade = !isCurrent && isDowngrade(tier);
                    
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "bg-white rounded-2xl p-6 shadow-xl border-2 flex flex-col relative",
                                tier.highlight ? "border-[#D4AF37] ring-4 ring-[#D4AF37]/10" : "border-transparent",
                                isCurrent && "border-green-500 ring-1 ring-green-500"
                            )}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-4 right-0 left-0 flex justify-center">
                                    <span className="bg-[#D4AF37] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                        <Star className="w-3 h-3 fill-current" />
                                        מומלץ
                                    </span>
                                </div>
                            )}

                            {isCurrent && (
                                <div className="absolute -top-4 right-0 left-0 flex justify-center">
                                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                        <Check className="w-3 h-3" />
                                        המסלול שלך
                                    </span>
                                </div>
                            )}

                            <div className="mb-6 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-gray-900">
                                        ₪{billingCycle === 'yearly' ? Math.round(tier.price * 0.83) : tier.price}
                                    </span>
                                    <span className="text-gray-500 text-sm">/חודש</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-3 h-10">{tier.description}</p>
                            </div>

                            <div className="flex-1 space-y-3 mb-8">
                                {tier.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-start gap-3 text-sm">
                                        {feature.included ? (
                                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <X className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                                        )}
                                        <span className={cn(
                                            feature.included ? "text-gray-700" : "text-gray-400 line-through decoration-gray-300"
                                        )}>
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => handleSubscriptionClick(tier)}
                                disabled={isCurrent || (downgrade && user)} // Disable downgrade based on spec "Low plans -> disabled"
                                variant={tier.highlight ? "default" : "outline"}
                                className={cn(
                                    "w-full rounded-xl h-12 font-bold transition-all",
                                    tier.highlight 
                                        ? "bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] hover:shadow-lg hover:shadow-blue-900/20 text-white" 
                                        : "hover:bg-gray-50 border-gray-200",
                                    isCurrent && "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 opacity-100 cursor-default"
                                )}
                            >
                                {isCurrent ? 'המסלול הנוכחי שלך' : downgrade ? 'כלול במסלול שלך' : tier.cta}
                            </Button>
                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* 3. One-time Services Section */}
        <div className="max-w-7xl mx-auto px-4 mt-20">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    צריך משהו נקודתי? אפשר גם בלי מסלול
                </h2>
                <p className="text-gray-500">
                    שירותים מקצועיים לחיזוק העסק שלך, בתשלום חד-פעמי
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {oneTimeServices.map((service, idx) => {
                    const Icon = service.icon;
                    return (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-[#1E3A5F]">
                                <Icon className="w-6 h-6" />
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-gray-500 text-sm mb-4 min-h-[40px]">
                                {service.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                                <div className="text-2xl font-bold text-gray-900">
                                    ₪{service.price}
                                    <span className="text-xs text-gray-400 font-normal mr-1">חד-פעמי</span>
                                </div>
                                <Button 
                                    onClick={() => handleServiceClick(service)}
                                    size="sm"
                                    className="bg-white border border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors rounded-lg"
                                >
                                    {service.cta}
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>

      </div>
    </>
  );
}