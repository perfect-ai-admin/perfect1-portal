import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check, Sparkles, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// Configuration for specific task questions
const TASK_QUESTIONS = {
  'registration': {
    title: 'הכנה לרישום עוסק פטור',
    questions: [
      {
        id: 'id_ready',
        text: 'האם תעודת הזהות שלך זמינה ובתוקף?',
        type: 'select',
        options: [
          { id: 'yes', label: 'כן, היא עליי' },
          { id: 'no', label: 'צריך לחפש אותה' },
          { id: 'expired', label: 'פג תוקף / אבודה' }
        ]
      },
      {
        id: 'business_name',
        text: 'האם כבר חשבת על שם לעסק?',
        type: 'text',
        placeholder: 'לדוגמה: יוסי כהן - ייעוץ משכנתאות'
      },
      {
        id: 'urgency',
        text: 'מה רמת הדחיפות של המשימה?',
        type: 'select',
        options: [
          { id: 'low', label: 'נמוכה (בזמן שלי)' },
          { id: 'medium', label: 'בינונית (חשוב)' },
          { id: 'high', label: 'גבוהה (דחוף!)' }
        ]
      }
    ]
  },
  'first_invoice': {
    title: 'הפקת חשבונית ראשונה',
    questions: [
      {
        id: 'client_details',
        text: 'האם יש לך את פרטי הלקוח המלאים?',
        subtext: 'שם מלא, ח.פ/ת.ז, כתובת ומייל',
        type: 'select',
        options: [
          { id: 'yes', label: 'כן, יש לי הכל' },
          { id: 'partial', label: 'יש לי חלק מהפרטים' },
          { id: 'no', label: 'עדיין לא ביקשתי' }
        ]
      },
      {
        id: 'service_desc',
        text: 'מה השירות שעליו יוצאת החשבונית?',
        type: 'text',
        placeholder: 'לדוגמה: ייעוץ זוגי - פגישה ראשונה'
      },
      {
        id: 'urgency',
        text: 'מה רמת הדחיפות של המשימה?',
        type: 'select',
        options: [
          { id: 'low', label: 'נמוכה (בזמן שלי)' },
          { id: 'medium', label: 'בינונית (חשוב)' },
          { id: 'high', label: 'גבוהה (דחוף!)' }
        ]
      }
    ]
  },
  'first_client_payment': {
    title: 'קבלת תשלום ראשון',
    questions: [
      {
        id: 'payment_method',
        text: 'איך הלקוח צפוי לשלם?',
        type: 'select',
        options: [
          { id: 'bit_paybox', label: 'ביט / פייבוקס' },
          { id: 'transfer', label: 'העברה בנקאית' },
          { id: 'credit', label: 'כרטיס אשראי' },
          { id: 'cash', label: 'מזומן' }
        ]
      },
      {
        id: 'amount',
        text: 'מה סכום התשלום הצפוי?',
        type: 'text',
        placeholder: 'בשקלים'
      },
      {
        id: 'urgency',
        text: 'מה רמת הדחיפות של המשימה?',
        type: 'select',
        options: [
          { id: 'low', label: 'נמוכה (בזמן שלי)' },
          { id: 'medium', label: 'בינונית (חשוב)' },
          { id: 'high', label: 'גבוהה (דחוף!)' }
        ]
      }
    ]
  },
  'monthly_report': {
    title: 'דיווח חודשי',
    questions: [
      {
        id: 'expenses_collected',
        text: 'האם אספת את כל חשבוניות ההוצאה החודש?',
        type: 'select',
        options: [
          { id: 'yes', label: 'כן, הכל סרוק ומוכן' },
          { id: 'most', label: 'את הרוב' },
          { id: 'not_yet', label: 'צריך לעשות סדר בניירת' }
        ]
      },
      {
        id: 'revenue_sum',
        text: 'מה סך ההכנסות החודש (בערך)?',
        type: 'text',
        placeholder: 'לדוגמה: 8,500'
      },
      {
        id: 'urgency',
        text: 'מה רמת הדחיפות של המשימה?',
        type: 'select',
        options: [
          { id: 'low', label: 'נמוכה (בזמן שלי)' },
          { id: 'medium', label: 'בינונית (חשוב)' },
          { id: 'high', label: 'גבוהה (דחוף!)' }
        ]
      }
    ]
  },
  'default': {
    title: 'תכנון המשימה',
    questions: [
      {
        id: 'readiness',
        text: 'עד כמה אתה מרגיש מוכן למשימה הזו?',
        type: 'select',
        options: [
          { id: 'ready', label: 'מוכן לגמרי, בוא נתחיל' },
          { id: 'unsure', label: 'צריך קצת הכוונה' },
          { id: 'lost', label: 'לא יודע מאיפה להתחיל' }
        ]
      },
      {
        id: 'first_step',
        text: 'מה הצעד הראשון הקטן שתוכל לעשות היום?',
        type: 'text',
        placeholder: 'לדוגמה: לשלוח הודעה ללקוח...'
      },
      {
        id: 'urgency',
        text: 'מה רמת הדחיפות של המשימה?',
        type: 'select',
        options: [
          { id: 'low', label: 'נמוכה (בזמן שלי)' },
          { id: 'medium', label: 'בינונית (חשוב)' },
          { id: 'high', label: 'גבוהה (דחוף!)' }
        ]
      }
    ]
  }
};

export default function DynamicTaskQuestionnaire({ task, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textInput, setTextInput] = useState("");
  
  // Resolve configuration based on task ID or fallback to default
  const config = TASK_QUESTIONS[task?.id] || TASK_QUESTIONS['default'];
  const questions = config.questions;
  const currentQuestion = questions ? questions[currentStep] : null;

  if (!currentQuestion) return null;

  const handleNext = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    setTextInput("");

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 200);
    } else {
      // Completed
      onComplete(newAnswers);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100 text-center">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
          <Target className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">{config.title}</h2>
        <p className="text-sm text-gray-500">{task?.title || 'השלב הבא שלך'}</p>
      </div>

      {/* Progress */}
      <div className="px-6 mt-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
          <span>שאלה {currentStep + 1} מתוך {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 p-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {currentQuestion.text}
            </h3>
            {currentQuestion.subtext && (
              <p className="text-sm text-gray-500 mb-6">{currentQuestion.subtext}</p>
            )}
            
            <div className="flex-1" />

            <div className="space-y-3 mt-4">
              {currentQuestion.type === 'select' && currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleNext(option.id)}
                  className="w-full p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-right transition-all group flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700 group-hover:text-blue-700">{option.label}</span>
                  <div className="w-5 h-5 rounded-full border border-gray-300 group-hover:border-blue-500 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}

              {currentQuestion.type === 'text' && (
                <div className="space-y-4">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="h-12 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && textInput && handleNext(textInput)}
                  />
                  <Button 
                    onClick={() => handleNext(textInput)}
                    disabled={!textInput}
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-blue-100"
                  >
                    המשך <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}