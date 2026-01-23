import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, AlertCircle, Target, Sparkles, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Summary() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin('/Summary');
          return;
        }

        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin('/Summary');
          return;
        }

        // Fetch full user data
        const users = await base44.entities.User.filter({ id: currentUser.id });
        if (users && users.length > 0) {
          setUser(users[0]);
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('שגיאה בטעינת הנתונים');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const generateSummary = () => {
    if (!user) return null;

    const stage = user.business_state?.stage;
    const challenge = user.business_state?.primary_challenge;
    const journeyAnswers = user.business_journey_answers || {};

    // Generate dynamic summary based on stage
    const summaries = {
      pre_revenue: {
        title: "אתה בשלב ההקמה של העסק",
        description: "זה הזמן להניח את הבסיס הנכון - הרעיון טוב, ועכשיו צריך לתכנן את המהלכים הראשונים.",
        insights: [
          "הרעיון שלך יש פוטנציאל, אבל זה רק ההתחלה",
          "כרגע אתה ב-15% מהדרך - עוד הרבה מה ללמוד",
          "הצעדים הבאים הם קריטיים להצלחה"
        ]
      },
      early_revenue: {
        title: "אתה בשלב הראשון - עם לקוחות ראשונים!",
        description: "זה מעניין! כבר יש לך הוכחה שאנשים מעוניינים. עכשיו צריך לייצב את זה ולהגדיל.",
        insights: [
          "אתה הוכחת קונספט - זה נכון מאוד",
          "אתה ב-25% מהדרך - עוד הרבה צמיחה לפניך",
          "המיקוד עכשיו צריך להיות על חזרה לקוחות והמלצות"
        ]
      },
      growing: {
        title: "העסק שלך גדל - מצוין!",
        description: "יש לך דינמיקה חיובית. השאלה עכשיו היא איך לשמור על המומנטום והגדל בצורה חכמה.",
        insights: [
          "אתה ב-50% מהדרך - נקודת חציון חשובה",
          "עכשיו זה הזמן להנקות את התהליכים",
          "הפוקוס צריך להיות על יעילות ולא רק על גדילה"
        ]
      },
      stable: {
        title: "העסק שלך יציב - בשלב הואה טוב",
        description: "יש לך בסיס מוצק. השאלה המרכזית היא: האם אתה מסתפק או רוצה להגדיל?",
        insights: [
          "אתה ב-70% מהדרך",
          "הזמן לחשוב על סקלביליות או אוטומציה",
          "אתה יכול להתחיל לחשוב על עתיד ארוך טווח"
        ]
      },
      declining: {
        title: "העסק שלך במצב קשה - צריך פעולה",
        description: "זה לא הרגע הקל, אבל זה בדיוק הזמן לתקן את כיוון הספינה.",
        insights: [
          "זה ההזדמנות לחזור לבסיסים",
          "צריך להבין מה השתנה",
          "פעולה מהירה יכולה לשנות את כל דברים"
        ]
      },
      crisis: {
        title: "זה זמן למשבר - אבל גם להשקפת חדשה",
        description: "מצב קריטי, אבל אתה כאן כדי לפתור את זה. צריך להיות פוקוס וקביעות.",
        insights: [
          "זה הזמן לדברים דרסטיים",
          "צריך לזהות את הבעיה האמיתית",
          "העזרה זו הצעד הנכון"
        ]
      }
    };

    return summaries[stage] || {
      title: "בואו ניתחן את המצב שלך",
      description: "על בסיס התשובות שלך, אנחנו בנינו תמונה חדה על היכן אתה נמצא בעסק.",
      insights: [
        "כל עסק הוא ייחודי - בואו נמצא את הדרך שלך",
        "הטעיות הם חלק מהתהליך",
        "אתה לא לבד - אנחנו כאן"
      ]
    };
  };

  const handleStartFirstGoal = () => {
    navigate(createPageUrl('ClientDashboard?tab=goals'));
  };

  const handleBackToDashboard = () => {
    navigate(createPageUrl('ClientDashboard'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">טוען את הסיכום שלך...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-bold mb-2">שגיאה</p>
            <p className="text-sm mb-4">{error || 'לא ניתן לטעון את הנתונים'}</p>
            <button 
              onClick={handleBackToDashboard}
              className="text-sm font-medium underline hover:no-underline"
            >
              חזור לדשבורד
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const summary = generateSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6" dir="rtl">
      <Helmet>
        <title>סיכום העסק שלך | Perfect One</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToDashboard}
            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-gray-900"
            aria-label="חזור"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">סיכום העסק שלך</h1>
          <div className="w-10" />
        </div>

        {/* Main Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg mb-6"
        >
          {/* Summary Title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{summary.title}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{summary.description}</p>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mt-8 space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">תובנות מרכזיות</h3>
            {summary.insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                className="flex gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mentor Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-3xl p-6 sm:p-8 mb-6"
        >
          <div className="flex gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <h3 className="text-lg font-bold text-purple-900">מילה ממנטור עסקי</h3>
          </div>
          <p className="text-purple-900 text-lg leading-relaxed mb-4">
            שלום {user.full_name}, אני פה בשביל ללוות אותך בכל צעד של הדרך.
          </p>
          <p className="text-purple-800 leading-relaxed">
            לא משנה איפה אתה נמצא עכשיו - בשלב הרעיון, עם הלקוחות הראשונים, או כשאתה רוצה לגדול - אנחנו ניתן לך את הכלים, התוכנית, והתמיכה לעבור לשלב הבא.
          </p>
          <p className="text-purple-800 leading-relaxed mt-4">
            צעד אחד בכל פעם. זה הכל שצריך.
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 mb-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-gray-900">מה הלאה?</h3>
          </div>
          <p className="text-gray-600 mb-6">
            בואו נתחיל עם מטרה ראשונה שתקחת אותך לשלב הבא. זה יהיה מטרה קטנה, ברורה, וישגת - משהו שתוכל להשלים בחודש אחד.
          </p>
          <Button
            onClick={handleStartFirstGoal}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg"
          >
            <Target className="w-5 h-5 ml-2" />
            בואו נתחיל את המטרה הראשונה
          </Button>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button
            onClick={handleBackToDashboard}
            variant="outline"
            className="w-full h-10 border-gray-300"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            חזור לדשבורד
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}