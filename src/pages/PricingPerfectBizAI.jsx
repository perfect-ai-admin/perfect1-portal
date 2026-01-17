import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Check, X, ArrowRight, Star, Zap, Layout, Presentation, Megaphone, 
  Loader2, ArrowLeft, ShieldCheck, LogIn, CreditCard, Lock, AlertTriangle 
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

      <div className="min-h-screen bg-gray-50 pb-20 font-heebo" dir="rtl">
        {/* Header - Like ClientDashboard */}
        <header 
          className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow sticky top-0 z-50"
          role="banner"
        >
          <div className="w-full px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(-1)} 
                    className="text-white hover:bg-white/10 hover:text-white p-2 h-auto rounded-full"
                 >
                    <ArrowRight className="w-5 h-5" />
                 </Button>

                 {user ? (
                   <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 border border-white/20">
                        <AvatarFallback className="bg-white/10 text-white text-xs">
                          {user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden sm:inline-block">{user.full_name}</span>
                   </div>
                 ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">Perfect Biz AI</span>
                    </div>
                 )}
              </div>

              <div className="flex items-center gap-2">
                 {!user && (
                     <Button 
                        size="sm" 
                        onClick={() => setShowLoginModal(true)}
                        className="bg-white/20 hover:bg-white/30 text-white border-none"
                     >
                        <LogIn className="w-4 h-4 ml-2" />
                        התחבר
                     </Button>
                 )}
              </div>
            </div>
          </div>
        </header>

        {/* Limit Reached Alert */}
        <AnimatePresence>
            {limitReached && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border-b border-red-200"
                >
                    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-red-100 p-2 rounded-full">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-900">הגעת למכסת המטרות במסלול שלך</h3>
                                <p className="text-sm text-red-700">כדי להקים מטרה נוספת, יש לשדרג את המסלול</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 w-full md:w-auto">
                            <Button 
                                onClick={() => document.getElementById('plans-section').scrollIntoView({ behavior: 'smooth' })}
                                className="bg-red-600 hover:bg-red-700 text-white w-full md:w-auto"
                            >
                                צפה באפשרויות שדרוג
                            </Button>
                            <span className="text-[10px] text-red-600 font-medium">השדרוג נכנס לתוקף מיידית</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

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
                     התחל בחינם, התקדם בקצב שלך, ושדרג רק כשזה באמת עוזר לך
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
        <div id="plans-section" className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subscriptionTiers.map((tier, idx) => {
                    const isCurrent = isCurrentPlan(tier);
                    
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
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{tier.title}</h3>
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-normal mb-4">
                                    {tier.badge}
                                </Badge>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-gray-900">
                                        ₪{billingCycle === 'yearly' ? Math.round(tier.price * 0.83) : tier.price}
                                    </span>
                                    {tier.price > 0 && <span className="text-gray-500 text-sm">/חודש</span>}
                                </div>
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

                            <div className="mt-auto">
                                <Button
                                    onClick={() => handleSubscriptionClick(tier)}
                                    disabled={isCurrent}
                                    variant={tier.highlight ? "default" : "outline"}
                                    className={cn(
                                        "w-full rounded-xl h-12 font-bold transition-all",
                                        tier.highlight 
                                            ? "bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] hover:shadow-lg hover:shadow-blue-900/20 text-white" 
                                            : "hover:bg-gray-50 border-gray-200",
                                        isCurrent && "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 opacity-100 cursor-default"
                                    )}
                                >
                                    {isCurrent ? 'המסלול הנוכחי שלך' : tier.cta}
                                </Button>
                                <p className="text-[10px] text-gray-400 text-center mt-2 h-4">
                                    {isCurrent ? 'אפשר לשדרג בכל זמן מההגדרות' : tier.micro}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* 3. One-time Services Section */}
        <div className="max-w-7xl mx-auto px-4 mt-20">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    צריך משהו נקודתי? אפשר גם בלי מנוי
                </h2>
                <p className="text-gray-500">
                    שירותים חד־פעמיים, בלי התחייבות למסלול חודשי
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {oneTimeServices.map((service, idx) => {
                    const Icon = service.icon;
                    return (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-[#1E3A5F]">
                                <Icon className="w-6 h-6" />
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-gray-500 text-sm mb-4 flex-1">
                                {service.description}
                            </p>
                            
                            <div className="pt-6 border-t border-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-2xl font-bold text-gray-900">
                                        ₪{service.price}
                                    </div>
                                    <Badge variant="outline" className="text-xs text-gray-400 font-normal border-gray-200">חד-פעמי</Badge>
                                </div>
                                <Button 
                                    onClick={() => handleServiceClick(service)}
                                    className="w-full bg-white border border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors rounded-lg font-medium"
                                >
                                    {service.cta}
                                </Button>
                                <p className="text-[10px] text-gray-400 text-center mt-2">
                                    {service.micro}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>

        {/* Trust Footer */}
        <div className="text-center mt-20 pb-8 text-gray-400 text-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>המידע שלך מאובטח · תשלום דרך ספקים מאושרים</span>
            </div>
            <p>אין אותיות קטנות · אתה שולט בשדרוגים ובביטול</p>
        </div>

        {/* Login Modal */}
        <AnimatePresence>
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setShowLoginModal(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl"
                    >
                        <button 
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-6 h-6 text-[#1E3A5F]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">כדי להמשיך, יש להתחבר לחשבון</h3>
                            <p className="text-sm text-gray-500">
                                ההתחברות מאפשרת לנו לשייך את הרכישה לחשבון שלך
                            </p>
                        </div>

                        <div className="space-y-3">
                             <Button
                                onClick={handleGoogleLogin}
                                variant="outline"
                                className="w-full h-11 text-base font-medium border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center justify-center gap-2"
                              >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                התחבר עם Google
                              </Button>
                              <Button
                                onClick={() => navigate(createPageUrl('ClientLogin'))}
                                className="w-full h-11 text-base bg-[#1E3A5F] hover:bg-[#162B47] text-white rounded-lg"
                              >
                                כניסה רגילה
                              </Button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-3">
                            לוקח כמה שניות · ללא רישום ידני
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </>
  );
}