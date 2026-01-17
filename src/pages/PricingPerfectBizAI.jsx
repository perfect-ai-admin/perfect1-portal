import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Check, X, ArrowRight, Star, Lock, AlertTriangle, 
  Layout, Presentation, Megaphone, Loader2, LogIn, CreditCard, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PricingPerfectBizAI() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [limitReached, setLimitReached] = useState(false);

  // Check for limit reached param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('limit') === 'true') {
      setLimitReached(true);
      // Scroll to plans after a short delay to ensure rendering
      setTimeout(() => {
        document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [location.search]);

  // Define static data from spec
  const subscriptionTiers = [
    {
      name: 'Free',
      title: 'התחלה חכמה',
      badge: 'מתאים לעצמאים בתחילת הדרך',
      dbNames: ['חינמי', 'Free', 'Starter'],
      price: 0,
      cta: 'התחל בחינם',
      micro: 'לא נדרש כרטיס אשראי · אפשר לשדרג בכל שלב',
      features: [
        { text: 'מטרה אחת פעילה', included: true },
        { text: 'Mentor עסקי למטרה אחת', included: true },
        { text: 'מערכת מיתוג בסיסית', included: true },
        { text: 'חיבור למערכת חשבונות', included: true },
        { text: 'ריבוי מטרות', included: false },
        { text: 'פיננסים מתקדמים', included: false },
        { text: 'אוטומציות', included: false },
      ],
      highlight: false
    },
    {
      name: 'Basic',
      title: 'התקדמות יציבה',
      badge: 'לעסק שכבר מתחיל לזוז',
      dbNames: ['Basic', 'בסיסי'],
      price: 59,
      cta: 'שדרג למסלול Basic',
      micro: 'ניתן לבטל בכל רגע · ללא התחייבות',
      features: [
        { text: 'עד 3 מטרות', included: true },
        { text: 'Mentor מלא', included: true },
        { text: 'שיווק + מיתוג מתקדם', included: true },
        { text: 'חיבור פיננסי בסיסי', included: true },
        { text: 'אוטומציות', included: false },
        { text: 'פיננסים מתקדמים', included: false },
      ],
      highlight: false
    },
    {
      name: 'Pro',
      title: 'שליטה וצמיחה',
      badge: 'לעסק פעיל שרוצה סדר ותוצאות',
      dbNames: ['Pro', 'מקצועי'],
      price: 149,
      cta: 'בחר במסלול Pro',
      micro: 'גישה מלאה למנטור ולניהול מתקדם',
      features: [
        { text: 'עד 7 מטרות', included: true },
        { text: 'Mentor מתקדם (מעקב, מדדים)', included: true },
        { text: 'שיווק מתקדם (קמפיינים)', included: true },
        { text: 'Finance בסיסי', included: true },
        { text: 'סדר וניהול עסקי', included: true },
      ],
      highlight: true // Popular choice
    },
    {
      name: 'Elite',
      title: 'מערכת שעובדת בשבילך',
      badge: 'לעסקים שרוצים מקסימום יכולת',
      dbNames: ['Elite', 'עלית'],
      price: 349,
      cta: 'הצטרף ל־Elite',
      micro: 'המגבלות יורדות · הכל פתוח',
      features: [
        { text: 'מטרות ללא הגבלה', included: true },
        { text: 'עבודה על כמה מטרות במקביל', included: true },
        { text: 'Mentor מלא + מתקדם', included: true },
        { text: 'שיווק מלא', included: true },
        { text: 'Finance מלא', included: true },
        { text: 'אוטומציות חכמות', included: true },
        { text: 'עדיפות לפיצ’רים עתידיים', included: true },
      ],
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
      cta: 'צור לוגו עכשיו',
      micro: 'תשלום חד־פעמי · ללא מנוי'
    },
    {
      name: 'מצגת עסקית',
      dbNames: ['Presentation', 'מצגת', 'Business Presentation'],
      price: 149,
      icon: Presentation,
      description: 'בניית מצגת שיווקית או עסקית מנצחת',
      cta: 'הכן מצגת',
      micro: 'מתאים להצגה ללקוחות או משקיעים'
    },
    {
      name: 'קמפיין שיווקי',
      dbNames: ['Campaign', 'קמפיין', 'Marketing Campaign'],
      price: 299,
      icon: Megaphone,
      description: 'הקמת קמפיין בסיסי ממוקד להבאת לידים',
      cta: 'התחל קמפיין',
      micro: 'הגדרה ראשונית, בלי התחייבות'
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
      setShowLoginModal(true);
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
      setShowLoginModal(true);
      return;
    }
    
    if (planId) {
        navigate(`/Checkout?type=plan&id=${planId}`);
    } else {
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

  const handleGoogleLogin = async () => {
    try {
      const response = await base44.functions.invoke('googleAuthStart', {});
      if (response.data && response.data.url) {
        sessionStorage.setItem('oauth_state', response.data.state);
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('שגיאה בהתחברות לגוגל');
    }
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

      <div className="min-h-screen bg-gray-50 pb-20 font-heebo overflow-x-hidden" dir="rtl">
        {/* Header - Consistent with ClientDashboard */}
        <header 
          className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow-md sticky top-0 z-50"
          role="banner"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(-1)} 
                    className="text-white hover:bg-white/10 hover:text-white p-2 h-auto rounded-full transition-colors"
                 >
                    <ArrowRight className="w-5 h-5" />
                 </Button>

                 {user ? (
                   <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8 border-2 border-white/20 shadow-sm">
                        <AvatarFallback className="bg-white/10 text-white text-xs font-medium">
                          {user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden sm:inline-block text-white/90">{user.full_name}</span>
                   </div>
                 ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tracking-tight">Perfect Biz AI</span>
                    </div>
                 )}
              </div>

              <div className="flex items-center gap-2">
                 {!user && (
                     <Button 
                        size="sm" 
                        onClick={() => setShowLoginModal(true)}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
                     >
                        <LogIn className="w-4 h-4 ml-2" />
                        התחבר
                     </Button>
                 )}
              </div>
            </div>
          </div>
        </header>

        {/* Limit Reached Alert - Fixed Top or floating */}
        <AnimatePresence>
            {limitReached && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border-b border-red-200 sticky top-16 z-40 shadow-sm"
                >
                    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-900 text-sm sm:text-base">הגעת למכסת המטרות במסלול שלך</h3>
                                <p className="text-xs sm:text-sm text-red-700">כדי להקים מטרה נוספת, יש לשדרג את המסלול</p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => document.getElementById('plans-section').scrollIntoView({ behavior: 'smooth' })}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm w-full sm:w-auto"
                        >
                            צפה באפשרויות שדרוג
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* 1. Hero Section - Improved Visuals */}
        <div className="bg-[#1E3A5F] text-white py-12 md:py-20 px-4 text-center relative overflow-hidden">
             {/* Abstract Background */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
             </div>

             <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                 <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                     בחר את הדרך הנכונה <br className="md:hidden" /> לקדם את העסק שלך
                 </h1>
                 <p className="text-blue-100 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                     התחל בחינם, התקדם בקצב שלך, ושדרג רק כשזה באמת עוזר לך
                 </p>

                 {/* Toggle - Enhanced Tap Target */}
                 <div className="inline-flex bg-white/10 p-1.5 rounded-full backdrop-blur-md shadow-inner mt-6">
                     <button
                        onClick={() => setBillingCycle('monthly')}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 min-w-[100px]",
                            billingCycle === 'monthly' ? "bg-white text-[#1E3A5F] shadow-lg scale-105" : "text-white/80 hover:bg-white/5"
                        )}
                     >
                         חודשי
                     </button>
                     <button
                        onClick={() => setBillingCycle('yearly')}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 min-w-[100px]",
                            billingCycle === 'yearly' ? "bg-white text-[#1E3A5F] shadow-lg scale-105" : "text-white/80 hover:bg-white/5"
                        )}
                     >
                         שנתי
                         <Badge variant="secondary" className="bg-emerald-500 text-white border-0 text-[10px] px-1.5 h-5 shadow-sm">
                             -17%
                         </Badge>
                     </button>
                 </div>
             </div>
        </div>

        {/* 2. Subscriptions Section - Improved Cards */}
        <div id="plans-section" className="max-w-7xl mx-auto px-4 -mt-10 md:-mt-16 relative z-20 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {subscriptionTiers.map((tier, idx) => {
                    const isCurrent = isCurrentPlan(tier);
                    const isPro = tier.name === 'Pro';
                    
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "bg-white rounded-2xl p-6 shadow-xl border relative flex flex-col h-full transition-all duration-300",
                                // Highlight logic
                                tier.highlight 
                                    ? "border-[#D4AF37] ring-4 ring-[#D4AF37]/10 z-10 lg:-mt-4 lg:mb-4 lg:py-8 shadow-2xl" 
                                    : "border-gray-100 hover:border-gray-200 hover:shadow-2xl",
                                isCurrent && "border-green-500 ring-2 ring-green-500 bg-green-50/10"
                            )}
                        >
                            {/* Badges */}
                            {tier.highlight && (
                                <div className="absolute -top-4 right-0 left-0 flex justify-center z-20">
                                    <span className="bg-[#D4AF37] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transform hover:scale-105 transition-transform">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        הבחירה המומלצת
                                    </span>
                                </div>
                            )}

                            {isCurrent && (
                                <div className="absolute -top-4 right-0 left-0 flex justify-center z-20">
                                    <span className="bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                        <Check className="w-3.5 h-3.5" />
                                        המסלול הנוכחי
                                    </span>
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-6 text-center space-y-2">
                                <h3 className={cn("text-xl font-extrabold", tier.highlight ? "text-[#1E3A5F]" : "text-gray-900")}>
                                    {tier.title}
                                </h3>
                                <div className="h-8 flex items-center justify-center">
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[11px] font-normal px-2 py-0.5 whitespace-normal text-center h-auto leading-tight">
                                        {tier.badge}
                                    </Badge>
                                </div>
                                <div className="flex items-baseline justify-center gap-1 mt-4">
                                    <span className={cn("text-4xl font-black tracking-tight", tier.highlight ? "text-[#1E3A5F]" : "text-gray-900")}>
                                        ₪{billingCycle === 'yearly' ? Math.round(tier.price * 0.83) : tier.price}
                                    </span>
                                    {tier.price > 0 && <span className="text-gray-500 text-sm font-medium">/חודש</span>}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="flex-1 space-y-4 mb-8">
                                <div className="space-y-3">
                                    {tier.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-start gap-3 text-sm group">
                                            {feature.included ? (
                                                <div className="bg-green-100 p-0.5 rounded-full mt-0.5 flex-shrink-0">
                                                    <Check className="w-3 h-3 text-green-600 font-bold" />
                                                </div>
                                            ) : (
                                                <div className="p-0.5 mt-0.5 flex-shrink-0">
                                                    <X className="w-3.5 h-3.5 text-gray-300" />
                                                </div>
                                            )}
                                            <span className={cn(
                                                "transition-colors",
                                                feature.included 
                                                    ? "text-gray-700 font-medium group-hover:text-gray-900" 
                                                    : "text-gray-400 line-through decoration-gray-300"
                                            )}>
                                                {feature.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="mt-auto space-y-3">
                                <Button
                                    onClick={() => handleSubscriptionClick(tier)}
                                    disabled={isCurrent}
                                    size="lg"
                                    className={cn(
                                        "w-full rounded-xl font-bold text-base h-14 shadow-sm transition-all duration-300 transform active:scale-95",
                                        tier.highlight 
                                            ? "bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] hover:shadow-lg hover:shadow-blue-900/20 text-white" 
                                            : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                                        isCurrent && "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 opacity-100 cursor-default shadow-none"
                                    )}
                                >
                                    {isCurrent ? 'המסלול הנוכחי שלך' : tier.cta}
                                </Button>
                                <p className="text-[11px] text-gray-500 text-center min-h-[1.2em] font-medium px-1">
                                    {isCurrent ? 'אפשר לשדרג בכל זמן מההגדרות' : tier.micro}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* 3. One-time Services Section - More Distinct */}
        <div className="max-w-7xl mx-auto px-4 py-12 bg-white rounded-3xl shadow-sm border border-gray-100 my-12">
            <div className="text-center mb-12 max-w-2xl mx-auto">
                <Badge variant="outline" className="mb-4 border-blue-200 text-blue-700 bg-blue-50 px-3 py-1 text-xs">
                    גמישות מלאה
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    צריך משהו נקודתי? אפשר גם בלי מנוי
                </h2>
                <p className="text-gray-500 text-lg">
                    שירותים מקצועיים לחיזוק העסק שלך, בתשלום חד-פעמי ללא התחייבות
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {oneTimeServices.map((service, idx) => {
                    const Icon = service.icon;
                    return (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col group"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-5 text-[#1E3A5F] group-hover:scale-110 group-hover:text-[#D4AF37] transition-all">
                                <Icon className="w-7 h-7" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1E3A5F] transition-colors">
                                {service.name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">
                                {service.description}
                            </p>
                            
                            <div className="mt-auto pt-6 border-t border-gray-200/60">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="text-2xl font-black text-gray-900">
                                        ₪{service.price}
                                    </div>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">חד-פעמי</span>
                                </div>
                                <Button 
                                    onClick={() => handleServiceClick(service)}
                                    className="w-full bg-white border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-all rounded-xl font-bold h-12 shadow-sm"
                                >
                                    {service.cta}
                                </Button>
                                <p className="text-[11px] text-gray-400 text-center mt-3 font-medium">
                                    {service.micro}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* Trust Footer */}
        <div className="max-w-4xl mx-auto px-4 text-center mt-12 mb-8">
            <div className="inline-flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8 bg-gray-50 rounded-full px-6 py-3 border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>המידע שלך מאובטח (SSL)</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-gray-300" />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>תשלום מאובטח ע"י Stripe</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-gray-300" />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-600" />
                    <span>אין אותיות קטנות או התחייבויות נסתרות</span>
                </div>
            </div>
        </div>

        {/* Login Modal */}
        <AnimatePresence>
            {showLoginModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setShowLoginModal(false)}
                        className="absolute inset-0 bg-[#1E3A5F]/40 backdrop-blur-sm transition-opacity"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white rounded-3xl p-8 w-full max-w-[400px] relative z-10 shadow-2xl border border-gray-100 overflow-hidden"
                    >
                         {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10" />
                        
                        <button 
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-4 left-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center mb-8 mt-2">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#1E3A5F] shadow-sm transform rotate-3">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">כמעט שם...</h3>
                            <p className="text-gray-500 text-base leading-relaxed">
                                כדי להשלים את הרכישה בצורה מאובטחת, <br/> אנא התחבר לחשבון שלך
                            </p>
                        </div>

                        <div className="space-y-4">
                             <Button
                                onClick={handleGoogleLogin}
                                variant="outline"
                                className="w-full h-12 text-base font-medium border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center gap-3 transition-all hover:border-gray-300 hover:shadow-sm"
                              >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                התחבר באמצעות Google
                              </Button>
                              <Button
                                onClick={() => navigate(createPageUrl('ClientLogin'))}
                                className="w-full h-12 text-base bg-[#1E3A5F] hover:bg-[#162B47] text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                              >
                                כניסה רגילה
                              </Button>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-5 font-medium flex items-center justify-center gap-1.5">
                            <Zap className="w-3 h-3 text-yellow-500 fill-current" />
                            לוקח פחות מ-10 שניות
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </>
  );
}