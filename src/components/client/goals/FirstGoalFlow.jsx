import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles, Brain, Target, Flag } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import GoalSuccessPlan from './GoalSuccessPlan';
import { entities, invokeFunction } from '@/api/supabaseClient';

const steps = [
  { id: 1, title: "מודעות ראשונית" },
  { id: 2, title: "מיפוי מנטלי" },
  { id: 3, title: "שיקוף" },
  { id: 4, title: "מיקרו פעולה" },
  { id: 5, title: "תובנה" },
  { id: 6, title: "סגירת מעגל" },
  { id: 7, title: "סיכום" }
];

export default function FirstGoalFlow({ goal, onComplete }) {
  const [showPlanOverview, setShowPlanOverview] = useState(true);
  const [currentStep, setCurrentStep] = useState(goal.flow_step || 1);
  const [formData, setFormData] = useState(goal.flow_data || {
    awareness: { feeling: "", blocker: "" },
    mental_mapping: { positives: ["", "", ""], blocker: "" },
    micro_action: "",
    insight: "",
    rating: 3
  });
  
  const queryClient = useQueryClient();

  // Mutation to save progress
  const updateProgressMutation = useMutation({
    mutationFn: async (newData) => {
      // Merge new data with existing flow_data
      const updatedFlowData = { ...formData, ...newData };
      
      // If we are at the last step, mark goal as active/in_progress essentially
      const updates = {
        flow_step: currentStep,
        flow_data: updatedFlowData
      };

      await entities.UserGoal.update(goal.id, updates);
      return updatedFlowData;
    },
    onSuccess: (data) => {
      setFormData(data);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  if (showPlanOverview && goal.is_first_goal && currentStep < 2) {
    return <GoalSuccessPlan goal={goal} onStart={() => setShowPlanOverview(false)} />;
  }

  const handleNext = async () => {
    // Save current step data before moving
    await updateProgressMutation.mutateAsync();
    
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      // Save the *next* step index immediately so if they refresh they are on the new step
      entities.UserGoal.update(goal.id, { flow_step: currentStep + 1 });
    } else {
      if (onComplete) onComplete(formData);
    }
  };

  const updateAwareness = (key, value) => {
    setFormData(prev => ({ ...prev, awareness: { ...prev.awareness, [key]: value } }));
  };

  const updateMapping = (index, value, isBlocker = false) => {
    setFormData(prev => {
      if (isBlocker) {
        return { ...prev, mental_mapping: { ...prev.mental_mapping, blocker: value } };
      }
      const newPositives = [...prev.mental_mapping.positives];
      newPositives[index] = value;
      return { ...prev, mental_mapping: { ...prev.mental_mapping, positives: newPositives } };
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Awareness Questions
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">נתחיל בבדיקת דופק קצרה</h3>
              <p className="text-gray-600">שתי שאלות קצרות שיעזרו לנו להתפקס (לא מבחן!)</p>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">1. איך את/ה חווה את הנושא הזה כרגע?</label>
                <div className="grid grid-cols-2 gap-3">
                  {['מאתגר / מלחיץ', 'מבלבל / עמוס', 'בשליטה / ברור', 'מסקרן / מעניין'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateAwareness('feeling', option)}
                      className={`p-3 rounded-lg border text-right transition-all text-sm ${
                        formData.awareness?.feeling === option 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                 <label className="text-sm font-medium text-gray-700">2. מה מרגיש כרגע הכי תקוע או לא ברור?</label>
                 <div className="grid grid-cols-1 gap-2">
                  {['אין לי זמן לזה כרגע', 'חסר לי ידע איך לגשת לזה', 'יש יותר מדי אפשרויות', 'לא בטוח/ה שזה הזמן הנכון'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateAwareness('blocker', option)}
                      className={`p-3 rounded-lg border text-right transition-all text-sm ${
                        formData.awareness?.blocker === option 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                  <div className="relative">
                      <Input 
                        value={!['אין לי זמן לזה כרגע', 'חסר לי ידע איך לגשת לזה', 'יש יותר מדי אפשרויות', 'לא בטוח/ה שזה הזמן הנכון'].includes(formData.awareness?.blocker) ? formData.awareness?.blocker : ''}
                        onChange={(e) => updateAwareness('blocker', e.target.value)}
                        placeholder="אחר (כתוב במילים שלך)..."
                        className={`pr-3 text-sm ${!['אין לי זמן לזה כרגע', 'חסר לי ידע איך לגשת לזה', 'יש יותר מדי אפשרויות', 'לא בטוח/ה שזה הזמן הנכון'].includes(formData.awareness?.blocker) && formData.awareness?.blocker ? 'border-primary ring-1 ring-primary' : ''}`}
                        onClick={() => {
                            if (['אין לי זמן לזה כרגע', 'חסר לי ידע איך לגשת לזה', 'יש יותר מדי אפשרויות', 'לא בטוח/ה שזה הזמן הנכון'].includes(formData.awareness?.blocker)) {
                                updateAwareness('blocker', '');
                            }
                        }}
                      />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Mental Mapping
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">בוא נעשה רגע סדר בראש</h3>
            <p className="text-gray-600">זה תרגיל קצר למיפוי המצב. בלי לשפוט - פשוט לכתוב.</p>
            
            <div className="space-y-4 bg-green-50/50 p-4 rounded-xl border border-green-100">
              <label className="text-sm font-medium text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                3 דברים שעובדים / חיוביים / קיימים כבר:
              </label>
              {[0, 1, 2].map((i) => (
                <Input
                  key={i}
                  value={formData.mental_mapping?.positives[i] || ''}
                  onChange={(e) => updateMapping(i, e.target.value)}
                  placeholder={`דבר חיובי #${i + 1}`}
                  className="bg-white"
                />
              ))}
            </div>

            <div className="space-y-2 bg-red-50/50 p-4 rounded-xl border border-red-100">
              <label className="text-sm font-medium text-red-800 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                דבר אחד שעדיין מעכב או לא ברור:
              </label>
              <Input
                value={formData.mental_mapping?.blocker || ''}
                onChange={(e) => updateMapping(0, e.target.value, true)}
                placeholder="החסם העיקרי..."
                className="bg-white"
              />
            </div>
          </div>
        );

      case 3: // Smart Reflection (System -> User)
        return (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-6 animate-fade-in-up">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-primary mb-2 shadow-sm">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">נקודה למחשבה</h3>
                <p className="text-gray-500">שיקוף קצר עליך ועל המצב</p>
            </div>

            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              <p className="text-xl text-gray-800 leading-relaxed font-medium">
                "הרבה פעמים, מה שמעכב התקדמות בשלב כזה הוא לא ידע – אלא חוסר סדר, בהירות או מיקוד."
              </p>
              <p className="mt-4 text-gray-600 text-sm">
                אנחנו כאן בדיוק בשביל זה. לעשות סדר ולקחת צעד אחד קטן בכל פעם.
              </p>
            </div>
          </div>
        );

      case 4: // Small Task #2 (Micro Action)
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">יוצרים תנועה קטנה</h3>
            </div>
            
            <p className="text-gray-600">
              אנחנו לא מחפשים כרגע את הפתרון המלא. אנחנו מחפשים רק צעד אחד קטן שאפשר לעשות ב-10 הדקות הקרובות.
            </p>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                מה הצעד הקטן האחד שאת/ה בוחר/ת לעשות?
              </label>
              <Input
                value={formData.micro_action || ''}
                onChange={(e) => setFormData({...formData, micro_action: e.target.value})}
                placeholder="למשל: לשלוח הודעה ל..., לכתוב טיוטה, לפתוח מסמך..."
                className="text-lg py-6"
              />
              <p className="text-xs text-gray-400 mt-2">
                * אין צורך לבצע את זה עכשיו במערכת, רק להגדיר מה זה יהיה.
              </p>
            </div>
          </div>
        );

      case 5: // Insight Question
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">רגע של תובנה</h3>
            <p className="text-gray-600">
              כשמסתכלים על המיפוי שעשית ועל הצעד הקטן שבחרת - מה עולה לך?
            </p>
            <Textarea 
              value={formData.insight || ''}
              onChange={(e) => setFormData({...formData, insight: e.target.value})}
              placeholder="התובנה שלי היא..."
              className="min-h-[120px] text-lg leading-relaxed p-4"
            />
          </div>
        );

      case 6: // Small Task #3 (Closure)
        return (
          <div className="space-y-8 py-4 text-center">
            <h3 className="text-xl font-bold text-gray-900">איך ההרגשה עכשיו?</h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              עד כמה את/ה מרגיש/ה ברור/ה וממוקד/ת יותר עכשיו לעומת לפני שהתחלנו?
            </p>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto">
              <div className="flex justify-between text-xs text-gray-400 mb-4 px-2">
                <span>אותו דבר</span>
                <span>הרבה יותר טוב</span>
              </div>
              <Slider
                defaultValue={[3]}
                value={[formData.rating]}
                onValueChange={(vals) => setFormData({...formData, rating: vals[0]})}
                max={5}
                min={1}
                step={1}
                className="py-4"
              />
              <div className="flex justify-center mt-4">
                <span className="text-4xl font-bold text-primary">{formData.rating}</span>
                <span className="text-xl text-gray-400 self-end mb-1">/5</span>
              </div>
            </div>
          </div>
        );

      case 7: // Summary Card
        return (
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full mb-2 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">סיימנו את השלב הראשון!</h3>
                <p className="text-gray-500">זהו צעד ראשון ומשמעותי, לא שינוי מלא - וזה מצוין.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-right space-y-4 max-w-md mx-auto relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-green-400 to-blue-400"></div>
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-lg">מה עשינו עכשיו?</h4>
                <ul className="space-y-3 text-gray-600 text-sm">
                  <li className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>יצרנו מודעות ומיפינו את המצב בשטח</span>
                  </li>
                  <li className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>בחרנו מיקרו-פעולה אחת להתנעה</span>
                  </li>
                  <li className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>הבנו שצעדים קטנים מנצחים עומס גדול</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl text-sm text-blue-900 border border-blue-100 mt-4">
                <div className="font-bold mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    איך ממשיכים מפה?
                </div>
                המנטור ימשיך ללוות אותך בצעדים קטנים, מדויקים ומותאמים אישית. בלי לחץ, בלי עומס - רק התקדמות.
              </div>
            </div>
            
            <p className="text-gray-500 font-medium">מוכן להמשיך לשלב הבא?</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1: return !formData.awareness?.feeling;
      case 2: return !formData.mental_mapping?.positives[0] || !formData.mental_mapping?.blocker;
      case 3: return false; // Reflection is just reading
      case 4: return !formData.micro_action;
      case 5: return !formData.insight;
      case 6: return false; // Rating has default
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto min-h-[600px] flex flex-col">
      {/* Header / Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">צעד {currentStep} מתוך {steps.length}</span>
          {currentStep < 7 && (
            <Button variant="ghost" size="sm" onClick={onComplete} className="text-gray-400 hover:text-gray-600">
              דלג להמשך
            </Button>
          )}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Actions */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
        {currentStep > 1 && currentStep < 7 && (
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={updateProgressMutation.isPending}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור
          </Button>
        )}
        
        {currentStep === 1 && <div />} {/* Spacer */}

        <Button 
          onClick={handleNext}
          disabled={isNextDisabled() || updateProgressMutation.isPending}
          className={`${currentStep === 7 ? 'w-full' : 'px-8'} bg-primary hover:bg-primary/90 text-white`}
        >
          {updateProgressMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          {currentStep === 7 ? 'המשך לשלב הבא' : 'המשך'}
          {currentStep !== 7 && <ArrowLeft className="w-4 h-4 mr-2" />}
        </Button>
      </div>
    </div>
  );
}