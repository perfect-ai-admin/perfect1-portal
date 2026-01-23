import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Target, TrendingUp, LogOut, HelpCircle, User, Globe, CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Summary() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('he');

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl('Summary'));
          return;
        }
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth error:', error);
        base44.auth.redirectToLogin(createPageUrl('Summary'));
      }
    };
    checkAuth();
  }, []);

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      if (!user?.id) return user;
      try {
        const users = await base44.entities.User.filter({ id: user.id });
        return users?.[0] || user;
      } catch (err) {
        return user;
      }
    },
    enabled: !!user?.id,
  });

  const data = userData || user;

  // Generate personalized summary based on business state
  const summary = useMemo(() => {
    if (!data?.business_state) {
      return {
        title: 'ברוכים הבאים!',
        description: 'אנחנו כאן כדי ללוות אתך בבניית העסק שלך.',
        insights: ['תחילת המסע', 'הגדרת הבסיס', 'בניית רموז הצלחה']
      };
    }

    const stage = data.business_state.stage;
    const summaries = {
      pre_revenue: {
        title: 'עד לשלב הראשון',
        description: 'אתה בשלב התכנון. זה הזמן להגדיר את היסודות של העסק שלך ולהשיק את הראשון לקוח.',
        insights: ['הגדרת מודל עסקי ברור', 'בניית מודעות למותג', 'השיג הלקוח הראשון']
      },
      early_revenue: {
        title: 'התחלה מלהיבה',
        description: 'יש לך לקוחות ראשונים! עכשיו זה בעת להיות ממוקדים על הגדלת ההכנסה ותיקנון התהליכים.',
        insights: ['הגדלת מחזור הלקוחות', 'שיפור איכות השירות', 'בניית מערכת למתן שירות ערך']
      },
      growing: {
        title: 'בשלב הגדילה',
        description: 'העסק שלך צומח! עכשיו זה הזמן להתמקד על יעילות וניתוח הנתונים.',
        insights: ['הגדלה של המכירות לא עם עלויות', 'בניית צוות טוב', 'חזור על מה שעובד']
      },
      stable: {
        title: 'עסק בגודל יציב',
        description: 'המבנה שלך יציב. עכשיו זה בעת להתמקד על אופטימיזציה ופיתוח.',
        insights: ['חדשנות בתהליכים', 'הרחבה לשווקים חדשים', 'שיפור ה-ROI']
      },
      declining: {
        title: 'זמן לחזקא מחדש',
        description: 'יש אתגרים בעסק. בואו נעבוד ביחד כדי למצוא את האתגר הראשי ולפתור אותו.',
        insights: ['זיהוי מקור הבעיה', 'תכנון תקומה', 'ביצוע בשלבים']
      },
      crisis: {
        title: 'זמן לפעולה עכשוויה',
        description: 'יש צורך בשינוי דחוף. בואו נתמקד על ההקלות ההכרחיות וההקלות לטווח קצר.',
        insights: ['בחירה של דברים קריטיים', 'הפחתת עלויות לא הכרחיות', 'שימור מזומנים']
      }
    };

    return summaries[stage] || summaries.pre_revenue;
  }, [data?.business_state]);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const toggleLanguage = () => {
    const newLang = language === 'he' ? 'en' : 'he';
    setLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir={language === 'he' ? 'rtl' : 'ltr'} lang={language}>
      {/* Header - Match ClientDashboard */}
      <header 
        className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow sticky top-0 z-50"
        role="banner"
      >
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="w-9 h-9 border border-white/20 flex-shrink-0">
                <AvatarFallback className="bg-white/10 text-white text-sm font-semibold">
                  {data?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{data?.full_name || 'משתמש'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => navigate(createPageUrl('PricingPerfectBizAI'))}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/90 hover:text-white"
                title="מחירון ומסלולים"
              >
                <CreditCard className="w-6 h-6" />
              </button>

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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-8 pb-6" role="main">
        <div className="max-w-2xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {summary.title}
          </h1>
          <p className="text-gray-600 text-lg">
            {summary.description}
          </p>
        </div>

        {/* Main Summary Card */}
        <Card className="p-6 md:p-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">תובנות עיקריות</h3>
                <ul className="space-y-2">
                  {summary.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Mentor Message */}
        <Card className="p-6 md:p-8 border border-gray-200 bg-white">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">🤝</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">המנטור שלך כאן</h3>
              <p className="text-gray-700 leading-relaxed">
                אני כאן כדי ללוות אותך בכל שלב של המסע. בואו נעבוד ביחד כדי להביא את העסק שלך לשלב הבא.
              </p>
            </div>
          </div>
        </Card>

        {/* Progress Indicator */}
        <Card className="p-6 md:p-8 border border-gray-200 bg-white">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-indigo-600" />
              <h3 className="font-bold text-gray-900">הצעד הבא</h3>
            </div>
            <p className="text-gray-700 mb-4">
              הגדרת המטרה הראשונה שלך זה הדרך הטובה ביותר להתחיל. בואו נבנה תוכנית פעולה מעשית.
            </p>
            <Button
              onClick={() => navigate(createPageUrl('ClientDashboard') + '?tab=goals')}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
            >
              <Target className="w-4 h-4 ml-2" />
              בואו נקבע את המטרה הראשונה
            </Button>
          </div>
        </Card>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={() => navigate(createPageUrl('ClientDashboard'))}
            variant="outline"
            className="h-11"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            חזרה למרכז הניהול
          </Button>
        </div>
      </motion.div>
    </div>
  );
}