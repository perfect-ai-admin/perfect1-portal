import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

// Questions Configuration
const QUESTIONS = [
  {
    id: 1,
    question: "איפה אתה נמצא היום ביחס לעסק?",
    subtext: "בחר את מה שהכי קרוב למצב שלך",
    options: [
      { id: 'idea', label: "אני עדיין בשלב הרעיון / חושב לפתוח עסק" },
      { id: 'new', label: "פתחתי עסק לאחרונה" },
      { id: 'active', label: "העסק כבר פעיל ויש הכנסות" },
      { id: 'stable', label: "העסק עובד באופן יציב" },
      { id: 'scaling', label: "העסק רץ הרבה זמן ואני מחפש לייעל / לגדול" }
    ]
  },
  {
    id: 2,
    question: "כמה זמן אתה עוסק בזה בפועל?",
    subtext: "לא חייב להיות מדויק – רק תחושה כללית",
    options: [
      { id: 'not_started', label: "עוד לא התחלתי" },
      { id: 'under_6m', label: "עד חצי שנה" },
      { id: '6m_to_2y', label: "בין חצי שנה לשנתיים" },
      { id: '2y_to_5y', label: "בין שנתיים לחמש שנים" },
      { id: 'over_5y', label: "מעל חמש שנים" }
    ]
  },
  {
    id: 3,
    question: "מה הדבר שהכי מעסיק אותך עכשיו?",
    subtext: "מה מרגיש לך ה”כאב” המרכזי",
    options: [
      { id: 'viability', label: "להבין אם העסק בכלל כדאי לי" },
      { id: 'first_customers', label: "להביא לקוחות ראשונים" },
      { id: 'order', label: "לעשות סדר (כסף / תמחור / ניהול)" },
      { id: 'focus', label: "לגדול בלי להתפזר" },
      { id: 'efficiency', label: "לייעל ולחסוך זמן" },
      { id: 'stability', label: "לבנות משהו יציב לטווח ארוך" }
    ]
  },
  {
    id: 4,
    question: "איך העסק מתנהל היום?",
    subtext: "בחר את מה שהכי נכון עבורך",
    options: [
      { id: 'not_managed', label: "עדיין לא באמת מתנהל" },
      { id: 'solo_messy', label: "אני עושה הכול לבד ודי מבולגן" },
      { id: 'customers_no_system', label: "יש לי לקוחות אבל אין שיטה" },
      { id: 'system_inconsistent', label: "יש שיטה, אבל היא לא תמיד עובדת" },
      { id: 'system_improve', label: "יש מערכת, אבל אני רוצה לשפר אותה" }
    ]
  },
  {
    id: 5,
    question: "מה הכי חשוב לך עכשיו?",
    subtext: "אין תשובה נכונה או לא נכונה",
    options: [
      { id: 'certainty', label: "ביטחון וודאות" },
      { id: 'income', label: "הכנסה ראשונה / יותר הכנסה" },
      { id: 'order_quiet', label: "סדר ושקט" },
      { id: 'time', label: "זמן פנוי" },
      { id: 'growth', label: "צמיחה והתרחבות" }
    ]
  },
  {
    id: 6,
    question: "איך היית רוצה שהמערכת תעזור לך?",
    subtext: "(בחירה אחת)",
    options: [
      { id: 'guide', label: "להכווין אותי צעד־צעד" },
      { id: 'pace', label: "לעזור לי להתקדם בקצב שלי" },
      { id: 'tools', label: "לתת לי כלים ולעבוד לבד" },
      { id: 'avoid_mistakes', label: "לעשות לי סדר ולחסוך טעויות" }
    ]
  }
];

export default function BusinessJourneyQuestionnaire({ onComplete, userId }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (optionId) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: optionId };
    setAnswers(newAnswers);

    // Auto advance after short delay for better UX
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 250);
    } else {
      // Last question - submit
      handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setIsSubmitting(true);
    try {
      if (userId) {
        await base44.entities.User.update(userId, {
          business_journey_completed: true,
          business_journey_answers: finalAnswers
        });
      }
      
      // Artificial delay for "processing" effect
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error("Error saving answers:", error);
      setIsSubmitting(false);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[500px]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">בונה לך את התיק העסקי...</h2>
          <p className="text-gray-500">אנחנו מנתחים את התשובות שלך ומתאימים את המערכת</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6" dir="rtl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>שאלה {currentStep + 1} מתוך {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
              {currentQuestion.question}
            </h2>
            {currentQuestion.subtext && (
              <p className="text-gray-500">{currentQuestion.subtext}</p>
            )}
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-right transition-all duration-200 flex items-center justify-between group",
                  answers[currentQuestion.id] === option.id
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50 text-gray-700"
                )}
              >
                <span className="font-medium text-lg">{option.label}</span>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  answers[currentQuestion.id] === option.id
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 group-hover:border-blue-300"
                )}>
                  {answers[currentQuestion.id] === option.id && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
          className={cn("text-gray-400 hover:text-gray-600", currentStep === 0 && "opacity-0")}
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          חזור
        </Button>
      </div>
    </div>
  );
}