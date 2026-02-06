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
  Palette, MonitorPlay, Rocket, Loader2, LogIn, CreditCard, ShieldCheck,
  LogOut, HelpCircle, User, Globe, Sparkles, Sticker, Layout, Smartphone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TabNavigation from '@/components/client/TabNavigation';
import NotificationCenter from '@/components/client/NotificationCenter';
import ShoppingCart from '@/components/client/shared/ShoppingCart';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { SkeletonPricing } from '@/components/client/SkeletonLoaders';

// Static data outside component
const SUBSCRIPTION_TIERS = [
  {
    name: 'Free',
    title: 'התחלה חכמה',
    badge: 'מתאים לעצמאים בתחילת הדרך',
    dbNames: ['חינמי', 'Free'],
    price: 0,
    cta: 'התחל בחינם',
    micro: 'לא נדרש כרטיס אשראי · אפשר לשדרג בכל שלב',
    features: [
      { text: 'מטרה אחת פעילה', included: true },
      { text: 'כל המודולים פתוחים (מנטור, שיווק, פיננסים)', included: true },
      { text: 'מערכת מיתוג בסיסית', included: true },
      { text: 'חיבור למערכת חשבונות', included: true },
      { text: 'ריבוי מטרות בו זמנית', included: false },
    ],
    highlight: false
  },
  {
    name: 'Basic',
    title: 'התקדמות יציבה',
    badge: 'לעסק שכבר מתחיל לזוז',
    dbNames: ['Basic', 'בסיסי', 'Starter'],
    price: 59,
    cta: 'שדרג למסלול Basic',
    micro: 'ניתן לבטל בכל רגע · ללא התחייבות',
    features: [
      { text: 'עד 3 מטרות', included: true },
      { text: 'כל המודולים פתוחים (מנטור, שיווק, פיננסים)', included: true },
      { text: 'מערכת מיתוג מתקדמת', included: true },
      { text: 'ניהול פיננסי מלא', included: true },
      { text: 'אוטומציות בסיסיות', included: true },
    ],
    highlight: false
  },
  {
    name: 'Pro',
    title: 'שליטה וצמיחה',
    badge: 'לעסק פעיל שרוצה סדר ותוצאות',
    dbNames: ['Pro', 'מקצועי', 'Growth'],
    price: 149,
    cta: 'בחר במסלול Pro',
    micro: 'המסלול המשתלם ביותר לצמיחה',
    features: [
      { text: 'עד 7 מטרות', included: true },
      { text: 'כל המודולים פתוחים ללא הגבלה', included: true },
      { text: 'ניהול שיווק וקמפיינים', included: true },
      { text: 'דוחות פיננסיים מתקדמים', included: true },
      { text: 'תמיכה בעדיפות', included: true },
    ],
    highlight: true // Popular choice
  },
  {
    name: 'Elite',
    title: 'מערכת שעובדת בשבילך',
    badge: 'לעסקים שרוצים מקסימום יכולת',
    dbNames: ['Elite', 'עלית', 'Full'],
    price: 349,
    cta: 'הצטרף ל־Elite',
    micro: 'המגבלות יורדות · הכל פתוח',
    features: [
      { text: 'מטרות ללא הגבלה', included: true },
      { text: 'ריבוי מטרות במקביל', included: true },
      { text: 'כל המודולים פתוחים ללא הגבלה', included: true },
      { text: 'אוטומציות מתקדמות מלאות', included: true },
      { text: 'ליווי אישי וצמוד יותר', included: true },
      { text: 'גישה ראשונית לפיצ’רים חדשים', included: true },
    ],
    highlight: false
  }
];

export default function PricingPerfectBizAI() {
  const [activeTab, setActiveTab] = useState(null);
  const [language, setLanguage] = useState('he');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [limitReached, setLimitReached] = useState(false);

  // Optimized data fetching with React Query
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => base44.auth.me().catch(() => null),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: plans = [], isLoading: isPlansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list({ limit: 50 }),
    staleTime: 1000 * 60 * 60, // 1 hour (plans don't change often)
  });

  const isLoading = isUserLoading || isPlansLoading;

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

  const oneTimeServices = React.useMemo(() => [
    {
      name: 'כרטיס ביקור דיגיטלי',
      dbNames: ['DigitalCard', 'כרטיס ביקור', 'Digital Business Card'],
      price: 149,
      icon: Smartphone,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'כרטיס חכם עם URL קבוע, QR, שמירה לאנשי קשר וכפתורי פעולה',
      cta: 'בחר בשירות זה',
      micro: 'כולל עיצוב ועריכה חופשית'
    },
    {
      name: 'יצירת לוגו ומיתוג',
      dbNames: ['Logo', 'לוגו', 'Logo Design'],
      price: 39,
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'עיצוב לוגו מקצועי ומותאם אישית + קבצים לכל השימושים',
      cta: 'צור לוגו עכשיו',
      micro: 'תשלום חד־פעמי · ללא מנוי'
    },
    {
      name: 'מצגת עסקית מנצחת',
      dbNames: ['Presentation', 'מצגת', 'Business Presentation'],
      price: 149,
      icon: MonitorPlay,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'בניית מצגת שיווקית או עסקית שתשכנע כל לקוח או משקיע',
      cta: 'הכן מצגת',
      micro: 'מתאים לזום, פגישות וכנסים'
    },
    {
      name: 'סטיקר ממותג לעסק',
      dbNames: ['Sticker', 'סטיקר'],
      price: 29,
      icon: Sticker,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      description: 'סטיקר מעוצב ומותאם אישית לוואטסאפ ורשתות חברתיות – מחזק נוכחות ומיתוג',
      cta: 'צור סטיקר עכשיו',
      micro: 'תשלום חד־פעמי · מוכן תוך דקות'
    },
    {
      name: 'דף נחיתה עסקי',
      dbNames: ['LandingPage', 'דף נחיתה', 'Landing Page'],
      price: 299,
      icon: Layout,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'דף נחיתה מקצועי וממיר שמותאם לעסק שלך – עם טופס לידים, עיצוב מרשים וטקסטים שיווקיים',
      cta: 'בנה דף נחיתה',
      micro: 'כולל אחסון ודומיין · מוכן לשימוש'
    },
    {
      name: 'הזנקת קמפיין שיווקי',
      dbNames: ['Campaign', 'קמפיין', 'Marketing Campaign'],
      price: 299,
      icon: Rocket,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'הקמת קמפיין ממומן ממוקד להבאת לידים איכותיים',
      cta: 'התחל קמפיין',
      micro: 'הגדרה ראשונית מהירה ומקצועית'
    }
  ], []);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate(createPageUrl('ClientLogin'));
  };

  const toggleLanguage = () => {
    const newLang = language === 'he' ? 'en' : 'he';
    setLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  // Permissions logic for tabs - Show all tabs like in Dashboard
  const permissions = React.useMemo(() => ({
    marketing: true,
    mentor: true,
    finance: true
  }), [user]);

  const handleTabChange = (tabId) => {
    // Navigate to dashboard with specific tab
    navigate(`${createPageUrl('ClientDashboard')}?tab=${tabId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SkeletonPricing />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>מחירון ומסלולים | Perfect Biz AI</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 pb-20 font-heebo overflow-x-hidden" dir={language === 'he' ? 'rtl' : 'ltr'}>
        {/* Header - Exact replica of ClientDashboard */}
        <header 
          className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow sticky top-0 z-50"
          role="banner"
        >
          <div className="w-full px-3 sm:px-6 lg:px-8">
            {/* Top Bar - 56px fixed height */}
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(-1)} 
                  className="text-white hover:bg-white/10 hover:text-white p-2 h-auto rounded-full transition-colors mr-1"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
                
                {user ? (
                  <>
                    <Avatar className="w-9 h-9 border border-white/20 flex-shrink-0">
                      <AvatarFallback className="bg-white/10 text-white text-sm font-semibold">
                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.full_name}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                     <span className="text-lg font-bold tracking-tight">Perfect Biz AI</span>
                  </div>
                )}
              </div>

              {/* Right Icons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {user && <ShoppingCart />}
                
                <button
                  className="p-2 bg-white/10 rounded-lg transition-colors text-white"
                  title="מחירון ומסלולים"
                >
                  <CreditCard className="w-6 h-6" />
                </button>

                {user && <NotificationCenter />}
                
                {!user && (
                   <Button 
                      size="sm" 
                      onClick={() => setShowLoginModal(true)}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all ml-2"
                   >
                      <LogIn className="w-4 h-4 ml-2" />
                      התחבר
                   </Button>
                )}

                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-white/10 rounded transition-colors" aria-label="תפריט">
                        <User className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={toggleLanguage} className="text-sm">
                        <Globe className="w-4 h-4 ml-2" />
                        {language === 'he' ? 'English' : 'עברית'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-sm">
                        <HelpCircle className="w-4 h-4 ml-2" />
                        עזרה
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="text-sm text-red-600">
                        <LogOut className="w-4 h-4 ml-2" />
                        יציאה
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Tab Navigation - Desktop Only - Only if user is logged in */}
            {user && (
              <div className="hidden md:block">
                <TabNavigation 
                  activeTab={activeTab} 
                  onChange={handleTabChange} 
                  availableTabs={[
                    { id: 'progress', label: 'מסע העסק', icon: 'MapPin' },
                    permissions.finance && { id: 'business', label: 'נתוני העסק', icon: 'BarChart3' },
                    permissions.finance && { id: 'financial', label: 'כספים', icon: 'Wallet' },
                    permissions.mentor && { id: 'goals', label: 'מטרות', icon: 'Target' },
                    permissions.marketing && { id: 'marketing', label: 'שיווק', icon: 'Megaphone' },
                    permissions.mentor && { id: 'mentor', label: 'מנטור', icon: 'Lightbulb' }
                  ].filter(Boolean)} 
                />
              </div>
            )}
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
                 <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
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
                {SUBSCRIPTION_TIERS.map((tier, idx) => {
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {oneTimeServices.map((service, idx) => {
                    const Icon = service.icon;
                    return (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden"
                        >
                            {/* Top Accent Gradient */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${service.bgColor.replace('bg-', 'bg-gradient-to-r from-white via-')}`} />

                            <div className="flex items-start justify-between mb-6">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm",
                                    service.bgColor,
                                    service.color
                                )}>
                                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <Badge variant="secondary" className="bg-gray-50 text-gray-500 font-normal text-[10px] border-0">
                                    חד-פעמי
                                </Badge>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1E3A5F] transition-colors">
                                {service.name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-8 flex-1 leading-relaxed">
                                {service.description}
                            </p>
                            
                            <div className="mt-auto">
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-black text-gray-900">
                                        ₪{service.price}
                                    </span>
                                    <span className="text-sm text-gray-400 font-medium">/תשלום אחד</span>
                                </div>
                                
                                <Button 
                                    onClick={() => handleServiceClick(service)}
                                    className="w-full bg-white border border-gray-200 text-gray-700 hover:border-[#1E3A5F] hover:text-[#1E3A5F] hover:bg-gray-50 transition-all rounded-xl font-bold h-12 shadow-sm group-hover:shadow-md flex items-center justify-between px-6"
                                >
                                    <span>{service.cta}</span>
                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                </Button>
                                <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
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