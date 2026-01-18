import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Clock, BookOpen, Heart, Plus, Target, TrendingUp, X, Check, Zap, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Goal Templates
const GOAL_TEMPLATES = [
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

export default function GoalTemplatesFixed({ onCreateGoal, onClose, hasPrimaryGoal = false, editingGoal = null }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [customAnswers, setCustomAnswers] = useState({ q1: '', q2: '' });
  const [urgency, setUrgency] = useState(editingGoal?.urgency || 'medium');
  const [isPrimary, setIsPrimary] = useState(editingGoal?.isPrimary || false);
  const drawerRef = useRef(null);
  const initialFocusRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize form with editing goal data
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
    }
  }, [editingGoal]);

  // Detect mobile
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);
    const handleChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Focus management
  useEffect(() => {
    initialFocusRef.current?.focus();
  }, [selectedTemplate]);

  // Scroll mobile sheet body to top when component mounts
  useEffect(() => {
    setTimeout(() => {
      const bodyElement = document.querySelector('.mobile-sheet-body');
      if (bodyElement) {
        bodyElement.scrollTop = 0;
      }
    }, 100);
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomAnswers({ q1: '', q2: '' }); // Reset answers
    if (template.examples?.length > 0) {
      setGoalTitle(template.examples[0].title);
    }
  };

  const handleExampleSelect = (example) => {
    setGoalTitle(example.title);
  };

  const handleCreate = () => {
    if (!selectedTemplate || !goalTitle) return;

    const goalData = {
      id: editingGoal?.id || Date.now().toString(),
      category: selectedTemplate.id,
      title: goalTitle,
      description: selectedTemplate.description,
      current: editingGoal?.current || 0,
      target: 100, // Default target for non-numeric goals
      customAnswers: customAnswers,
      urgency: urgency,
      status: editingGoal?.status || 'active',
      isPrimary: isPrimary && !hasPrimaryGoal,
      aiInsight: editingGoal?.aiInsight || 'מטרה חדשה נוצרה - התחל לעבוד לקראתה!'
    };

    onCreateGoal(goalData, !!editingGoal);
    onClose();
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="mobile-sheet-container" data-state="open">
        <div className="mobile-sheet-overlay" onClick={onClose} />
        <div className="mobile-sheet-content" ref={drawerRef}>
          {/* Header */}
          <div className="mobile-sheet-header">
            <div className="flex items-center justify-between">
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <h2 ref={initialFocusRef} tabIndex="-1" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                {editingGoal ? 'עריכת מטרה' : 'מטרה חדשה'}
              </h2>
              <div className="w-6" />
            </div>
            {!selectedTemplate && <p className="text-center text-xs text-gray-600 font-medium mt-2">בחר מטרה שמשפיעה על העסק</p>}
          </div>

          {/* Body */}
          <div className="mobile-sheet-body">
            {!selectedTemplate ? (
              <motion.div className="space-y-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-2 gap-2 auto-rows-max">
                  {GOAL_TEMPLATES.map((template, idx) => (
                    <motion.button
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-right bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md rounded-xl p-2.5 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <template.icon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-xs leading-tight text-right">{template.name}</h3>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full py-2 text-xs font-semibold border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                  onClick={() => setSelectedTemplate({ id: 'custom', name: 'מטרה מותאמת', unit: '' })}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  מטרה משלי
                </Button>
              </motion.div>
            ) : (
              <motion.div className="space-y-2.5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setGoalTitle('');
                    setCustomAnswers({ q1: '', q2: '' });
                  }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-8 text-xs"
                >
                  ← חזור
                </Button>

                {selectedTemplate.examples && (
                  <motion.div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-2.5 border border-purple-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      דוגמאות מהירות
                    </p>
                    <div className="space-y-1">
                      {selectedTemplate.examples.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => handleExampleSelect(example)}
                          className="w-full text-right px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-medium text-gray-900"
                        >
                          {example.title}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <div>
                    <Label htmlFor="goalTitle" className="text-xs font-bold text-gray-700 block mb-1">מה המטרה?</Label>
                    <Input
                      id="goalTitle"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      placeholder="למשל: 10 לקוחות חדשים"
                      className="text-xs h-8"
                      autoFocus
                    />
                  </div>

                  {selectedTemplate.questions?.map((q) => (
                    <div key={q.id}>
                      <Label htmlFor={q.id} className="text-xs font-bold text-gray-700 block mb-1">{q.label}</Label>
                      <Input
                        id={q.id}
                        value={customAnswers[q.id] || ''}
                        onChange={(e) => setCustomAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder={q.placeholder}
                        className="text-xs h-8"
                      />
                    </div>
                  ))}

                  <div>
                    <Label className="text-xs font-bold text-gray-700 block mb-2">דחיפות המשימה</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'low', label: 'נמוכה', desc: 'לא דחוף, בזמן שלי' },
                        { value: 'medium', label: 'בינונית', desc: 'חשוב, אבל בלי לחץ' },
                        { value: 'high', label: 'גבוהה', desc: 'דחוף מאוד, מעכשיו' }
                      ].map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setUrgency(level.value)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center h-full",
                            urgency === level.value
                              ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-200"
                              : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
                          )}
                        >
                          <span className="text-xs font-bold mb-0.5">{level.label}</span>
                          <span className="text-[9px] opacity-80 leading-tight">{level.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {!hasPrimaryGoal && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                      <input
                        id="isPrimary"
                        type="checkbox"
                        checked={isPrimary}
                        onChange={(e) => setIsPrimary(e.target.checked)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <label htmlFor="isPrimary" className="text-xs font-semibold text-gray-700 cursor-pointer">
                        זו המטרה הראשית שלי
                      </label>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {selectedTemplate && (
            <div className="mobile-sheet-footer">
              <Button 
                onClick={handleCreate} 
                disabled={!goalTitle}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold h-9 text-sm"
              >
                <Check className="w-4 h-4 ml-1.5" />
                {editingGoal ? 'שמור' : 'צור'}
              </Button>
              <Button variant="outline" onClick={onClose} className="px-3 h-9">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-0 border-0 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col gap-0" ref={drawerRef}>
          {/* Header */}
          <div className="flex-shrink-0 px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <h2 ref={initialFocusRef} tabIndex="-1" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                {selectedTemplate ? selectedTemplate.name : (editingGoal ? 'עריכת מטרה' : 'מטרה חדשה')}
              </h2>

              <div className="flex items-center gap-2">
                {selectedTemplate && (
                  <button 
                    onClick={() => {
                      setSelectedTemplate(null);
                      setGoalTitle('');
                      setTargetValue('');
                      setCustomAnswers({ q1: '', q2: '' });
                    }}
                    className="text-sm font-medium text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    חזור לבחירה
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {!selectedTemplate && <div className="w-5" />}
              </div>
            </div>
            {!selectedTemplate && <p className="text-center text-sm text-gray-600 font-medium mt-1">בחר מטרה שמשפיעה על העסק</p>}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {!selectedTemplate ? (
              <motion.div className="space-y-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_TEMPLATES.map((template, idx) => (
                    <motion.button
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-right bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md rounded-xl p-2.5 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0`}>
                          <template.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm text-right">{template.name}</h3>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                {/* Compact Examples */}
                {selectedTemplate.examples && (
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-2.5 border border-purple-100">
                    <p className="text-xs font-bold text-gray-700 mb-1.5 opacity-80">דוגמאות מהירות (לחץ לבחירה)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {selectedTemplate.examples.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => handleExampleSelect(example)}
                          className="w-full text-center px-2 py-1.5 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-medium text-gray-900 transition-colors truncate"
                          title={example.title}
                        >
                          {example.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Goal Title */}
                  <div>
                    <Label htmlFor="goalTitle" className="text-sm font-bold block mb-1 text-gray-800">מה המטרה שלך?</Label>
                    <Input
                      id="goalTitle"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      placeholder="הקלד כאן את המטרה..."
                      className="text-sm h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      autoFocus
                    />
                  </div>

                  {/* Two Custom Questions Side-by-Side */}
                  {selectedTemplate.questions && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedTemplate.questions.map((q) => (
                        <div key={q.id} className="space-y-1">
                          <Label htmlFor={q.id} className="text-xs font-semibold block text-gray-700">{q.label}</Label>
                          <Input
                            id={q.id}
                            value={customAnswers[q.id] || ''}
                            onChange={(e) => setCustomAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder={q.placeholder}
                            className="text-xs h-8 bg-gray-50 border-gray-200 focus:bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Urgency - Compact */}
                  <div>
                    <Label className="text-xs font-bold text-gray-700 block mb-1.5">דחיפות המשימה</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'low', label: 'נמוכה', desc: 'בזמן שלי' },
                        { value: 'medium', label: 'בינונית', desc: 'חשוב' },
                        { value: 'high', label: 'גבוהה', desc: 'דחוף!' }
                      ].map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setUrgency(level.value)}
                          className={cn(
                            "flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all text-center",
                            urgency === level.value
                              ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-200"
                              : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
                          )}
                        >
                          <span className="text-xs font-bold">{level.label}</span>
                          <span className="text-[10px] opacity-70">{level.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {selectedTemplate && (
            <div className="flex-shrink-0 flex gap-2 px-6 py-4 border-t border-gray-200">
              <Button 
                onClick={handleCreate} 
                disabled={!goalTitle}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white"
              >
                <Check className="w-4 h-4 ml-1" />
                {editingGoal ? 'שמור' : 'צור'}
              </Button>
              <Button variant="outline" onClick={onClose} className="px-4">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}