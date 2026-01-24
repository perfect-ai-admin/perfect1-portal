import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles, Brain, Target, Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

      await base44.entities.UserGoal.update(goal.id, updates);
      return updatedFlowData;
    },
    onSuccess: (data) => {
      setFormData(data);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  const handleNext = async () => {
    // Save current step data before moving
    await updateProgressMutation.mutateAsync();
    
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      // Save the *next* step index immediately so if they refresh they are on the new step
      base44.entities.UserGoal.update(goal.id, { flow_step: currentStep + 1 });
    } else {
      if (onComplete) onComplete();
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
              <p className="text-gray-600">איך את/ה חווה את הנושא הזה כרגע?</p>
              <div className="grid grid-cols-2 gap-3">
                {['מאתגר אותי', 'מבלבל', 'בשליטה', 'מסקרן/מעניין'].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateAwareness('feeling', option)}
                    className={`p-3 rounded-lg border text-right transition-all ${
                      formData.awareness?.feeling === option 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-600">מה הדבר האחד שמרגיש הכי לא ברור או מעכב כרגע?</p>
              <Textarea 
                value={formData.awareness?.blocker || ''}
                onChange={(e) => updateAwareness('blocker', e.target.value)}
                placeholder="למשל: אני לא בטוח מאיפה להתחיל..."
                className="min-h-[100px] resize-none"
              />
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
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-6 animate-fade-in-up">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary mb-4">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">נקודה למחשבה</h3>
            <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-lg text-gray-700 leading-relaxed">
                "הרבה פעמים, מה שמעכב התקדמות בשלב כזה הוא לא חוסר בידע מקצועי – אלא פשוט הצורך <strong>בסדר, בהירות ומיקוד</strong>."
              </p>
              <p className="mt-4 text-gray-600">
                כשמפרקים את העומס לחלקים קטנים וברורים, פתאום הדרך נראית אפשרית הרבה יותר.
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
            <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full mb-2">
              <Sparkles className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900">כל הכבוד! עשית את הצעד הראשון</h3>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-right space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 border-b pb-2">מה השגנו עכשיו?</h4>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>יצרנו מודעות למצב הקיים ולתחושות</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>מיפינו את החוזקות ואת החסמים</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>בחרנו מיקרו-פעולה אחת לביצוע מיידי</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mt-4">
                <strong>איך המנטור עובד?</strong>
                <br />
                בדיוק ככה - בצעדים קטנים, מדויקים ומותאמים אישית, שלא מעמיסים עלייך.
              </div>
            </div>
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