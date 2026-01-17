import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Star, Zap, Crown, Briefcase, Palette, MonitorPlay, Megaphone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

export default function ClientPricing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch User and Plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, plansData] = await Promise.all([
          base44.auth.me().catch(() => null),
          base44.entities.Plan.list()
        ]);
        setUser(userData);
        setPlans(plansData);
      } catch (error) {
        console.error("Error fetching pricing data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to find Plan ID from DB by fuzzy name matching
  const getPlanIdByName = (name) => {
    if (!plans.length) return null;
    const plan = plans.find(p => p.name?.toLowerCase().includes(name.toLowerCase()) || p.name_en?.toLowerCase().includes(name.toLowerCase()));
    return plan?.id;
  };

  const tiers = [
    {
      name: 'Free / Starter',
      dbName: 'חינמי', // Key to match in DB
      price: 0,
      description: 'צעד ראשון בעולם העסקים',
      icon: Zap,
      features: [
        { name: 'מטרה אחת פעילה', included: true },
        { name: 'Mentor עסקי (למטרה אחת)', included: true },
        { name: 'מערכת מיתוג בסיסית', included: true },
        { name: 'חיבור למערכת חשבונות', included: true },
        { name: 'ריבוי מטרות', included: false },
        { name: 'פיננסים מתקדמים', included: false },
        { name: 'אוטומציות', included: false },
      ],
      cta: 'התחל בחינם',
      color: 'gray'
    },
    {
      name: 'Basic',
      dbName: 'Basic',
      price: 59,
      description: 'לעסקים שרוצים להתקדם',
      icon: Star,
      popular: true,
      features: [
        { name: 'עד 3 מטרות', included: true },
        { name: 'Mentor מלא', included: true },
        { name: 'שיווק + מיתוג מתקדם', included: true },
        { name: 'חיבור פיננסי בסיסי', included: true },
        { name: 'אוטומציות', included: false },
        { name: 'פיננסים מתקדמים', included: false },
      ],
      cta: 'שדרג ל-Basic',
      color: 'blue'
    },
    {
      name: 'Pro',
      dbName: 'Pro',
      price: 149,
      description: 'למקצוענים שרוצים יותר',
      icon: Briefcase,
      features: [
        { name: 'עד 7 מטרות', included: true },
        { name: 'Mentor מתקדם (מעקב ומדדים)', included: true },
        { name: 'שיווק מתקדם (קמפיינים)', included: true },
        { name: 'Finance בסיסי', included: true },
        { name: 'סדר וניהול עסקי', included: true },
        { name: 'אוטומציות', included: false },
      ],
      cta: 'בחר Pro',
      color: 'purple'
    },
    {
      name: 'Elite',
      dbName: 'Elite',
      price: 349,
      description: 'החבילה המלאה ללא גבולות',
      icon: Crown,
      features: [
        { name: 'מטרות ללא הגבלה', included: true },
        { name: 'עבודה על כמה מטרות במקביל', included: true },
        { name: 'Mentor מלא + מתקדם', included: true },
        { name: 'שיווק מלא', included: true },
        { name: 'Finance מלא', included: true },
        { name: 'אוטומציות חכמות', included: true },
        { name: 'עדיפות לפיצ׳רים עתידיים', included: true },
      ],
      cta: 'הצטרף ל-Elite',
      color: 'gold'
    }
  ];

  const oneTimeServices = [
    {
      id: 'logo',
      name: 'יצירת לוגו',
      price: 99,
      description: 'עיצוב לוגו מקצועי + קבצים להורדה',
      icon: Palette,
      cta: 'רכוש לוגו'
    },
    {
      id: 'presentation',
      name: 'מצגת עסקית',
      price: 149,
      description: 'מצגת שיווקית / עסקית מוכנה',
      icon: MonitorPlay,
      cta: 'צור מצגת'
    },
    {
      id: 'campaign',
      name: 'קמפיין שיווקי',
      price: 299,
      description: 'הקמת קמפיין בסיסי מותאם לעסק',
      icon: Megaphone,
      cta: 'התחל קמפיין'
    }
  ];

  const handlePlanClick = (plan) => {
    if (!user) {
      navigate(createPageUrl('ClientLogin'));
      return;
    }

    const planId = getPlanIdByName(plan.dbName);
    
    // If user is already on this plan
    if (user.current_plan_id === planId) {
      return; 
    }

    if (planId) {
      navigate(`${createPageUrl('Checkout')}?product_type=plan&product_id=${planId}`);
    } else {
      console.warn("Plan ID not found for", plan.name);
      // Fallback or alert logic
    }
  };

  const handleServiceClick = (service) => {
    if (!user) {
      navigate(createPageUrl('ClientLogin'));
      return;
    }
    // Navigate to checkout with service details
    navigate(`${createPageUrl('Checkout')}?product_type=service&product_id=${service.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Helmet>
        <title>מחירון ומסלולים | Perfect Biz AI</title>
      </Helmet>

      {/* Hero Section */}
      <div className="bg-[#1E3A5F] text-white pt-20 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            בחר את הדרך הנכונה לקדם את העסק שלך
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            מסלולים חודשיים או שירותים נקודתיים – לפי מה שמתאים לך עכשיו
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-sm font-medium transition-colors", billingCycle === 'monthly' ? "text-white" : "text-blue-300")}>
              חודשי
            </span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              className="data-[state=checked]:bg-[#D4AF37]"
            />
            <span className={cn("text-sm font-medium transition-colors", billingCycle === 'yearly' ? "text-white" : "text-blue-300")}>
              שנתי (בקרוב)
            </span>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => {
            const planId = getPlanIdByName(tier.dbName);
            const isCurrentPlan = user && user.current_plan_id === planId;
            const Icon = tier.icon;
            
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "h-full flex flex-col relative border-2 transition-all duration-300 hover:shadow-xl",
                  isCurrentPlan ? "border-[#27AE60] bg-green-50/10" : "border-transparent hover:border-blue-100",
                  tier.popular && !isCurrentPlan ? "border-[#D4AF37] shadow-lg" : ""
                )}>
                  {tier.popular && (
                    <div className="absolute -top-4 right-1/2 translate-x-1/2">
                      <Badge className="bg-[#D4AF37] text-white hover:bg-[#D4AF37] px-3 py-1 text-xs uppercase tracking-wider">
                        הכי משתלם
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={cn(
                      "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4",
                      tier.color === 'gold' ? "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700" :
                      tier.color === 'purple' ? "bg-purple-100 text-purple-700" :
                      tier.color === 'blue' ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{tier.name}</CardTitle>
                    <div className="mt-2 flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-gray-900">₪{tier.price}</span>
                      {tier.price > 0 && <span className="text-sm text-gray-500">/ חודש</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{tier.description}</p>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                          )}
                          <span className={cn(feature.included ? "text-gray-700" : "text-gray-400")}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-4">
                    <Button 
                      className={cn(
                        "w-full h-11 font-semibold",
                        isCurrentPlan 
                          ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                          : tier.color === 'gold'
                            ? "bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white hover:opacity-90"
                            : "bg-[#1E3A5F] hover:bg-[#162B47] text-white"
                      )}
                      onClick={() => handlePlanClick(tier)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'המסלול הנוכחי שלך' : tier.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* One-Time Services Section */}
      <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-3">
            צריך משהו נקודתי? אפשר גם בלי מסלול
          </h2>
          <p className="text-gray-600">שירותים מקצועיים ללא התחייבות חודשית</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {oneTimeServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border border-gray-100">
                <CardHeader>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <service.icon className="w-5 h-5 text-[#1E3A5F]" />
                  </div>
                  <CardTitle className="text-lg font-bold">{service.name}</CardTitle>
                  <div className="mt-1">
                    <span className="text-2xl font-bold text-[#27AE60]">₪{service.price}</span>
                    <span className="text-xs text-gray-500 mr-1">חד פעמי</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#1E3A5F] text-[#1E3A5F] hover:bg-blue-50"
                    onClick={() => handleServiceClick(service)}
                  >
                    {service.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {!user && (
          <div className="text-center mt-6 text-sm text-gray-500">
            * רכישת שירותים נקודתיים דורשת התחברות לחשבון
          </div>
        )}
      </div>
    </div>
  );
}