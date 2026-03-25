import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Users, Clock, BookOpen, Heart, Plus, Target, TrendingUp, X, Check, Zap, ChevronLeft, Phone, Loader2, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client'; // Keep for direct entity check
import SimpleDialog from '@/components/client/SimpleDialog';
import { useUpdateUserPhone } from '@/components/hooks/useAppAuth';

// Goal Templates
export const GOAL_TEMPLATES = [
  {
    id: 'active_customers',
    name: 'הגדלת כמות לקוחות פעילים',
    icon: Users,
    color: 'from-blue-400 to-blue-600',
    description: 'הגדל את מספר הלקוחות הפעילים שלך',
    examples: [
      { title: 'להגיע ל־5 לקוחות פעילים' },
      { title: 'להגיע ל־20 לקוחות פעילים' },
      { title: 'להגיע ל־50 לקוחות פעילים' }
    ],
    questions: [
      { id: 'q1', label: 'כמה לקוחות פעילים יש לך היום?', placeholder: 'לדוגמה: 3' },
      { id: 'q2', label: 'מה מקור הלקוחות העיקרי שלך כרגע?', placeholder: 'לדוגמה: המלצות מפה לאוזן' }
    ]
  },
  {
    id: 'monthly_income',
    name: 'הגדלת הכנסה חודשית',
    icon: DollarSign,
    color: 'from-green-400 to-green-600',
    description: 'הגדל את ההכנסה החודשית שלך',
    examples: [
      { title: 'הכנסה חודשית של 10,000 ₪' },
      { title: 'הכנסה חודשית של 30,000 ₪' },
      { title: 'הכנסה חודשית של 70,000 ₪' }
    ],
    questions: [
      { id: 'q1', label: 'מה ההכנסה החודשית הממוצעת שלך היום?', placeholder: 'לדוגמה: ₪5,000' },
      { id: 'q2', label: 'איזה שירות/מוצר יביא את הגידול בהכנסה?', placeholder: 'לדוגמה: חבילת ליווי פרימיום' }
    ]
  },
  {
    id: 'cashflow_stability',
    name: 'יציבות בתזרים מזומנים',
    icon: Heart,
    color: 'from-pink-400 to-pink-600',
    description: 'שפר את היציבות הפיננסית',
    examples: [
      { title: 'לדעת שכל ההוצאות החודשיות מכוסות' },
      { title: 'להישאר חיובי כל חודש בלי מינוס' },
      { title: 'כרית ביטחון של 2–3 חודשי פעילות' }
    ],
    questions: [
      { id: 'q1', label: 'מה ההוצאה החודשית הקבועה הכי גדולה שלך?', placeholder: 'לדוגמה: שכירות קליניקה' },
      { id: 'q2', label: 'האם יש לך כרגע רזרבה בצד? כמה?', placeholder: 'לדוגמה: כן, כ-10,000 ש״ח' }
    ]
  },
  {
    id: 'quality_leads',
    name: 'יותר פניות / לידים איכותיים',
    icon: Users,
    color: 'from-cyan-400 to-cyan-600',
    description: 'הגדל את כמות הפניות האיכותיות',
    examples: [
      { title: '5 פניות איכותיות בחודש' },
      { title: '20 פניות איכותיות בחודש' },
      { title: '50 פניות איכותיות בחודש' }
    ],
    questions: [
      { id: 'q1', label: 'כמה פניות (לידים) מגיעות אליך בחודש ממוצע?', placeholder: 'לדוגמה: 2-3 בשבוע' },
      { id: 'q2', label: 'מה מגדיר "ליד איכותי" עבורך?', placeholder: 'לדוגמה: לקוח שמוכן לשלם מראש' }
    ]
  },
  {
    id: 'conversion_rate',
    name: 'שיפור אחוזי סגירה',
    icon: TrendingUp,
    color: 'from-purple-400 to-purple-600',
    description: 'שפר את אחוז הסגירה מפניות',
    examples: [
      { title: 'לסגור 1 מכל 5 פניות' },
      { title: 'לסגור 1 מכל 3 פניות' },
      { title: 'לסגור 50% מהפניות' }
    ],
    questions: [
      { id: 'q1', label: 'מתוך 10 שיחות, כמה נסגרות בערך?', placeholder: 'לדוגמה: 1 או 2' },
      { id: 'q2', label: 'מה הסיבה העיקרית שלקוחות אומרים "לא"?', placeholder: 'לדוגמה: יקר להם' }
    ]
  },
  {
    id: 'deal_value',
    name: 'העלאת מחיר / ערך עסקה',
    icon: TrendingUp,
    color: 'from-amber-400 to-amber-600',
    description: 'הגדל את הערך הממוצע של עסקה',
    examples: [
      { title: 'העלאת מחיר ב־10%' },
      { title: 'מכירה של חבילה/שירות יקר יותר' },
      { title: 'מעבר ללקוחות פרימיום בלבד' }
    ],
    questions: [
      { id: 'q1', label: 'מתי בפעם האחרונה העלית מחירים?', placeholder: 'לדוגמה: לפני שנה' },
      { id: 'q2', label: 'איזה ערך נוסף אתה יכול לתת כדי להצדיק מחיר גבוה?', placeholder: 'לדוגמה: זמינות גבוהה יותר בוואטסאפ' }
    ]
  },
  {
    id: 'time_saving',
    name: 'חיסכון בזמן עבודה',
    icon: Clock,
    color: 'from-indigo-400 to-indigo-600',
    description: 'עבוד פחות ובצורה חכמה יותר',
    examples: [
      { title: 'לחסוך 5 שעות עבודה בשבוע' },
      { title: 'לעבוד עד 40 שעות בשבוע' },
      { title: 'לעבוד פחות מ־30 שעות בשבוע' }
    ],
    questions: [
      { id: 'q1', label: 'מהן המשימות שגוזלות ממך הכי הרבה זמן?', placeholder: 'לדוגמה: הצעות מחיר וגבייה' },
      { id: 'q2', label: 'כמה שעות היית רוצה לעבוד בשבוע אידיאלי?', placeholder: 'לדוגמה: 30 שעות נטו' }
    ]
  },
  {
    id: 'business_control',
    name: 'סדר ושליטה בעסק',
    icon: BookOpen,
    color: 'from-teal-400 to-teal-600',
    description: 'שלוט במה שקורה בעסק',
    examples: [
      { title: 'לדעת בכל רגע מה צריך לעשות השבוע' },
      { title: 'לסיים שבוע בלי משימות פתוחות' },
      { title: 'לעבוד לפי סדר יום קבוע וברור' }
    ],
    questions: [
      { id: 'q1', label: 'איזה תחום בעסק מרגיש הכי מבולגן כרגע?', placeholder: 'לדוגמה: המשימות והפניות בוואטסאפ' },
      { id: 'q2', label: 'באילו כלים אתה משתמש כרגע לניהול?', placeholder: 'לדוגמה: מחברת ופתקים' }
    ]
  },
  {
    id: 'marketing_engine',
    name: 'בניית מנגנון שיווק קבוע',
    icon: TrendingUp,
    color: 'from-rose-400 to-rose-600',
    description: 'בנה מנגנון שיווק שעובד בעצמו',
    examples: [
      { title: 'ערוץ שיווק אחד שעובד קבוע' },
      { title: 'מערכת שמביאה פניות כל חודש' },
      { title: 'שיווק שעובד גם כשלא עובדים' }
    ],
    questions: [
      { id: 'q1', label: 'איזה ערוץ שיווקי עבד לך הכי טוב בעבר?', placeholder: 'לדוגמה: פייסבוק אורגני' },
      { id: 'q2', label: 'מה התקציב או הזמן שאתה מוכן להשקיע בשיווק?', placeholder: 'לדוגמה: 500 ש״ח בחודש' }
    ]
  },
  {
    id: 'retention',
    name: 'שימור והחזרת לקוחות',
    icon: Heart,
    color: 'from-fuchsia-400 to-fuchsia-600',
    description: 'החזר לקוחות ומכור להם שוב',
    examples: [
      { title: 'להחזיר לקוחות עבר' },
      { title: 'למכור שוב ללקוחות קיימים' },
      { title: 'לייצור הכנסה חוזרת מאותו לקוח' }
    ],
    questions: [
      { id: 'q1', label: 'כל כמה זמן אתה יוצר קשר עם לקוחות עבר?', placeholder: 'לדוגמה: כמעט אף פעם' },
      { id: 'q2', label: 'מה יש לך להציע להם כרגע?', placeholder: 'לדוגמה: שירות תחזוקה חדש' }
    ]
  },
  {
    id: 'reduce_stress',
    name: 'פחות לחץ ושחיקה',
    icon: Heart,
    color: 'from-emerald-400 to-emerald-600',
    description: 'הפחת לחץ ושחיקה עסקית',
    examples: [
      { title: 'לסיים חודש בלי תחושת רדיפה' },
      { title: 'להרגיש שליטה ולא כיבוי שריפות' },
      { title: 'לשמור על אנרגיה לאורך זמן' }
    ],
    questions: [
      { id: 'q1', label: 'מה גורם לך להכי הרבה לחץ בעסק?', placeholder: 'לדוגמה: חוסר ודאות לגבי החודש הבא' },
      { id: 'q2', label: 'מה הדבר שהכי היה מרגיע אותך עכשיו?', placeholder: 'לדוגמה: לדעת שיש הכנסה קבועה' }
    ]
  },
  {
    id: 'focus_direction',
    name: 'מיקוד וכיוון עסקי ברור',
    icon: Target,
    color: 'from-violet-400 to-violet-600',
    description: 'התמקד במה שחשוב',
    examples: [
      { title: 'לבחור שירות אחד מרכזי' },
      { title: 'לוותר על לקוחות לא מתאימים' },
      { title: 'לדעת על מה אומרים "לא"' }
    ],
    questions: [
      { id: 'q1', label: 'האם יש לך יותר מדי שירותים? מהו "מוצר הדגל"?', placeholder: 'לדוגמה: כן, הטיפול הזוגי הוא העיקרי' },
      { id: 'q2', label: 'מי הלקוח האידיאלי שאתה רוצה לעבוד רק איתו?', placeholder: 'לדוגמה: זוגות צעירים לפני חתונה' }
    ]
  }
];

export default function GoalTemplatesFixed({ onCreateGoal, onClose, hasPrimaryGoal = false, editingGoal = null, user, initialTemplate = null, existingGoals = [] }) {
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [goalTitle, setGoalTitle] = useState('');
  const [customAnswers, setCustomAnswers] = useState({ q1: '', q2: '' });
  const [urgency, setUrgency] = useState(editingGoal?.urgency || 'medium');
  const [isPrimary, setIsPrimary] = useState(editingGoal?.isPrimary || false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);
  
  const updateUserPhoneMutation = useUpdateUserPhone();
  const initialFocusRef = useRef(null);

  // Initialize form with editing goal data or initial template
  React.useEffect(() => {
    if (editingGoal) {
      setGoalTitle(editingGoal.title);
      setCustomAnswers(editingGoal.customAnswers || { q1: '', q2: '' });
      setUrgency(editingGoal.urgency || 'medium');
      setIsPrimary(editingGoal.isPrimary || false);
      const template = GOAL_TEMPLATES.find(t => t.id === editingGoal.category);
      if (template) {
        setSelectedTemplate(template);
      }
    } else if (initialTemplate) {
      setSelectedTemplate(initialTemplate);
      // Pre-fill title if it's a specific task-based template
      if (initialTemplate.defaultTitle) {
        setGoalTitle(initialTemplate.defaultTitle);
      }
    }
  }, [editingGoal, initialTemplate]);

  // Focus management
  useEffect(() => {
    if (!showPhonePrompt) {
      initialFocusRef.current?.focus();
    }
  }, [selectedTemplate, showPhonePrompt]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomAnswers({ q1: '', q2: '' }); // Reset answers
    // Set goal title as template name
    setGoalTitle(template.name);
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!selectedTemplate || !goalTitle) return;

    // Check if phone number is missing (only for new goals)
    if (!editingGoal && !showPhonePrompt) {
      try {
        const currentUser = await base44.auth.me();
        const hasPhone = currentUser?.phone || currentUser?.mobile || currentUser?.phoneNumber;
        
        if (!hasPhone) {
          setShowPhonePrompt(true);
          return;
        }
      } catch (error) {
        console.error('Error checking user phone:', error);
      }
    }
    
    const finalGoalTitle = goalTitle || selectedTemplate.name || 'מטרה חדשה';
    // Check if this is the first goal ever for this user
    const isFirstGoalEver = (!existingGoals || existingGoals.length === 0) && !editingGoal;

    const goalData = {
      id: editingGoal?.id,
      user_id: user?.id,
      category: selectedTemplate.id,
      title: finalGoalTitle,
      description: selectedTemplate.description,
      current: editingGoal?.current || 0,
      target: 100,
      customAnswers: customAnswers,
      urgency: urgency,
      status: editingGoal?.status || 'active',
      isPrimary: isPrimary && !hasPrimaryGoal,
      aiInsight: 'המטרה נוצרת... אנחנו בונים לך תוכנית עבודה מותאמת אישית 🚀',
      actionHint: 'המטרה נוצרת...',
      is_first_goal: isFirstGoalEver,
      flow_step: isFirstGoalEver ? 1 : undefined
    };

    // Check for duplicates before creating (Client Side Sync Check)
    let nextIndex = 1;
    if (!editingGoal) {
         // Check against existingGoals prop (synchronous, includes optimistic updates)
         const isDuplicateClient = existingGoals.some(g => 
           (g.title === finalGoalTitle || g.category === selectedTemplate.id) &&
           ['active', 'in_progress', 'selected'].includes(g.status)
         );
         
         if (isDuplicateClient) {
            alert('נראה שכבר יש לך מטרה כזו פעילה. כדאי להתמקד בה!');
            return;
         }

         // Calculate next index
         const maxIndex = existingGoals.reduce((max, g) => Math.max(max, g.goal_index || 0), 0);
         nextIndex = maxIndex + 1;
    }

    // Call parent handler immediately without waiting
    onCreateGoal({
        ...goalData,
        goal_index: editingGoal ? editingGoal.goal_index : nextIndex
    }, !!editingGoal);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 9) return;
    setIsSubmittingPhone(true);
    try {
      await updateUserPhoneMutation.mutateAsync({ phone: phoneNumber });

      // Check if this is the first goal ever
      const isFirstGoalEver = (!existingGoals || existingGoals.length === 0);

      // Calculate next index
      const maxIndex = (existingGoals || []).reduce((max, g) => Math.max(max, g.goal_index || 0), 0);

      // Proceed to create goal - with same logic as handleCreate
      const goalData = {
        user_id: user?.id,
        category: selectedTemplate.id,
        title: goalTitle || selectedTemplate.name || 'מטרה חדשה',
        description: selectedTemplate.description,
        current: 0,
        target: 100,
        customAnswers: customAnswers,
        urgency: urgency,
        status: 'active',
        isPrimary: isPrimary && !hasPrimaryGoal,
        aiInsight: 'המטרה נוצרת... אנחנו בונים לך תוכנית עבודה מותאמת אישית 🚀',
        actionHint: 'המטרה נוצרת...',
        is_first_goal: isFirstGoalEver,
        flow_step: isFirstGoalEver ? 1 : undefined,
        goal_index: maxIndex + 1
      };
      onCreateGoal(goalData, false);
    } catch (error) {
      console.error("Error updating phone:", error);
    } finally {
      setIsSubmittingPhone(false);
    }
  };

  if (showPhonePrompt) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">רגע לפני שמתחילים... 🚀</h2>
            <p className="text-gray-600 text-sm">כדי שנוכל לשלוח לך את הצעד הבא וללוות אותך בתהליך הדיגיטלי, אנחנו צריכים את המספר שלך.</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">למה זה חשוב?</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">אנחנו שולחים בוואטסאפ תובנות מותאמות אישית, תזכורות למשימות ועדכונים קריטיים על העסק.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-bold text-gray-700">מספר הנייד שלך</Label>
              <div className="relative">
                <Phone className="absolute top-3 right-3 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="050-0000000"
                  className="pr-10 h-12 text-lg"
                  type="tel"
                  autoFocus
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-3 space-y-3 border-t border-gray-100">
            <Button 
              onClick={handlePhoneSubmit} 
              disabled={!phoneNumber || isSubmittingPhone}
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
            >
              {isSubmittingPhone ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  שומר...
                </>
              ) : (
                'שמור וצור מטרה'
              )}
            </Button>
            <button 
              onClick={() => setShowPhonePrompt(false)} 
              className="w-full text-center text-gray-400 text-sm hover:text-gray-600 py-2"
            >
              חזור לעריכת המטרה
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Dialog UI
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white/70" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              {editingGoal ? 'עריכת מטרה' : 'מטרה עסקית חדשה'}
            </h2>
            <div className="w-5"></div>
          </div>
          {!selectedTemplate && <p className="text-center text-xs sm:text-sm text-white/70 mt-2">בחר/י את המטרה שלך — נבנה תוכנית מותאמת אישית</p>}
        </div>

        {/* Body - scrollable */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex-1 overflow-y-auto">
        {!selectedTemplate ? (
          <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 gap-2">
              {GOAL_TEMPLATES.map((template, idx) => {
                const isAlreadyActive = existingGoals?.some(g => 
                  g.category === template.id && ['active', 'in_progress', 'selected'].includes(g.status)
                );
                return (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => {
                    if (isAlreadyActive) return;
                    handleTemplateSelect(template);
                  }}
                  disabled={isAlreadyActive}
                  className={cn(
                    "text-right rounded-xl p-3.5 transition-all group relative overflow-hidden",
                    isAlreadyActive 
                      ? "bg-gray-50 border border-gray-200 opacity-50 cursor-not-allowed"
                      : "bg-white border border-gray-200/80 hover:border-[#D4AF37] hover:shadow-md hover:shadow-amber-50 active:scale-[0.98]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                      <template.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{template.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                    </div>
                    {isAlreadyActive ? (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                        <Check className="w-3 h-3" />
                        פעיל
                      </div>
                    ) : (
                      <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-[#D4AF37] transition-colors flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div className="space-y-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Selected Goal - Premium Hero */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F2439] via-[#1E3A5F] to-[#2C5282]" />
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(212,175,55,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)' }} />
              <div className="relative z-10 p-6 sm:p-8 text-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="w-20 h-20 mx-auto mb-5 relative"
                >
                  <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-2xl rotate-6" />
                  <div className="relative w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#C5A028] rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/30">
                    <selectedTemplate.icon className="w-9 h-9 text-white" />
                  </div>
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, y: 8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-extrabold text-white mb-2 tracking-tight"
                >
                  {selectedTemplate.name}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.3 }}
                  className="text-blue-200/80 text-sm max-w-xs mx-auto"
                >
                  {selectedTemplate.description}
                </motion.p>
              </div>
            </div>

            {/* Benefits - Stacked Cards */}
            <div className="space-y-2">
              {[
                { icon: Sparkles, text: 'תוכנית פעולה מותאמת אישית', sub: 'צעדים ברורים שמתקדמים אותך' },
                { icon: Target, text: 'מנטור AI שמלווה אותך', sub: 'ליווי אישי דרך וואטסאפ' },
                { icon: TrendingUp, text: 'מעקב התקדמות בזמן אמת', sub: 'תמיד יודע/ת איפה עומדים' },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F]/10 to-[#2C5282]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#1E3A5F]" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold text-gray-900">{item.text}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </motion.div>
              ))}
            </div>

            {/* Trust bar */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-1.5 text-gray-400"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="text-xs">ה-AI יבנה תוכנית מותאמת תוך שניות</span>
            </motion.div>
          </motion.div>
        )}
        </div>

        {/* Footer */}
        {selectedTemplate && (
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-50 bg-white rounded-b-2xl space-y-3 flex-shrink-0">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button 
                onClick={handleCreate} 
                disabled={!goalTitle || isCreating}
                className="w-full bg-gradient-to-l from-[#D4AF37] via-[#E5C04B] to-[#D4AF37] hover:brightness-105 text-[#1A1A2E] h-14 sm:h-16 font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-amber-300/30 transition-all border border-amber-400/30 tracking-wide"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    בונה תוכנית...
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    {editingGoal ? 'שמור שינויים' : 'התחל עכשיו'}
                  </span>
                )}
              </Button>
            </motion.div>
            <button 
              onClick={() => setSelectedTemplate(null)} 
              className="w-full text-center text-gray-400 text-xs hover:text-gray-500 py-1 transition-colors"
            >
              ← חזור לבחירת מטרה
            </button>
          </div>
        )}
      </div>
    </div>
  );
}