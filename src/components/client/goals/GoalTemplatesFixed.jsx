import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Clock, BookOpen, Heart, Plus, Target, TrendingUp, X, Check, Zap } from 'lucide-react';
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
    defaultTarget: 20,
    unit: 'לקוחות',
    description: 'הגדל את מספר הלקוחות הפעילים שלך',
    examples: [
      { title: 'להגיע ל־5 לקוחות פעילים', target: 5, timeframe: 'quarter' },
      { title: 'להגיע ל־20 לקוחות פעילים', target: 20, timeframe: 'quarter' },
      { title: 'להגיע ל־50 לקוחות פעילים', target: 50, timeframe: 'year' }
    ]
  },
  {
    id: 'monthly_income',
    name: 'הגדלת הכנסה חודשית',
    icon: DollarSign,
    color: 'from-green-400 to-green-600',
    defaultTarget: 30000,
    unit: '₪',
    description: 'הגדל את ההכנסה החודשית שלך',
    examples: [
      { title: 'הכנסה חודשית של 10,000 ₪', target: 10000, timeframe: 'month' },
      { title: 'הכנסה חודשית של 30,000 ₪', target: 30000, timeframe: 'month' },
      { title: 'הכנסה חודשית של 70,000 ₪', target: 70000, timeframe: 'month' }
    ]
  },
  {
    id: 'cashflow_stability',
    name: 'יציבות בתזרים מזומנים',
    icon: Heart,
    color: 'from-pink-400 to-pink-600',
    defaultTarget: 3,
    unit: 'חודשים',
    description: 'שפר את היציבות הפיננסית',
    examples: [
      { title: 'לדעת שכל ההוצאות החודשיות מכוסות', target: 1, timeframe: 'month' },
      { title: 'להישאר חיובי כל חודש בלי מינוס', target: 3, timeframe: 'quarter' },
      { title: 'כרית ביטחון של 2–3 חודשי פעילות', target: 3, timeframe: 'quarter' }
    ]
  },
  {
    id: 'quality_leads',
    name: 'יותר פניות / לידים איכותיים',
    icon: Users,
    color: 'from-cyan-400 to-cyan-600',
    defaultTarget: 20,
    unit: 'פניות',
    description: 'הגדל את כמות הפניות האיכותיות',
    examples: [
      { title: '5 פניות איכותיות בחודש', target: 5, timeframe: 'month' },
      { title: '20 פניות איכותיות בחודש', target: 20, timeframe: 'month' },
      { title: '50 פניות איכותיות בחודש', target: 50, timeframe: 'month' }
    ]
  },
  {
    id: 'conversion_rate',
    name: 'שיפור אחוזי סגירה',
    icon: TrendingUp,
    color: 'from-purple-400 to-purple-600',
    defaultTarget: 33,
    unit: '%',
    description: 'שפר את אחוז הסגירה מפניות',
    examples: [
      { title: 'לסגור 1 מכל 5 פניות', target: 20, timeframe: 'quarter' },
      { title: 'לסגור 1 מכל 3 פניות', target: 33, timeframe: 'quarter' },
      { title: 'לסגור 50% מהפניות', target: 50, timeframe: 'quarter' }
    ]
  },
  {
    id: 'deal_value',
    name: 'העלאת מחיר / ערך עסקה',
    icon: TrendingUp,
    color: 'from-amber-400 to-amber-600',
    defaultTarget: 10,
    unit: '%',
    description: 'הגדל את הערך הממוצע של עסקה',
    examples: [
      { title: 'העלאת מחיר ב־10%', target: 10, timeframe: 'quarter' },
      { title: 'מכירה של חבילה/שירות יקר יותר', target: 25, timeframe: 'quarter' },
      { title: 'מעבר ללקוחות פרימיום בלבד', target: 50, timeframe: 'year' }
    ]
  },
  {
    id: 'time_saving',
    name: 'חיסכון בזמן עבודה',
    icon: Clock,
    color: 'from-indigo-400 to-indigo-600',
    defaultTarget: 40,
    unit: 'שעות/שבוע',
    description: 'עבוד פחות ובצורה חכמה יותר',
    examples: [
      { title: 'לחסוך 5 שעות עבודה בשבוע', target: 45, timeframe: 'month' },
      { title: 'לעבוד עד 40 שעות בשבוע', target: 40, timeframe: 'quarter' },
      { title: 'לעבוד פחות מ־30 שעות בשבוע', target: 30, timeframe: 'quarter' }
    ]
  },
  {
    id: 'business_control',
    name: 'סדר ושליטה בעסק',
    icon: BookOpen,
    color: 'from-teal-400 to-teal-600',
    defaultTarget: 100,
    unit: '% השלמה',
    description: 'שלוט במה שקורה בעסק',
    examples: [
      { title: 'לדעת בכל רגע מה צריך לעשות השבוע', target: 100, timeframe: 'month' },
      { title: 'לסיים שבוע בלי משימות פתוחות', target: 100, timeframe: 'quarter' },
      { title: 'לעבוד לפי סדר יום קבוע וברור', target: 100, timeframe: 'quarter' }
    ]
  },
  {
    id: 'marketing_engine',
    name: 'בניית מנגנון שיווק קבוע',
    icon: TrendingUp,
    color: 'from-rose-400 to-rose-600',
    defaultTarget: 1,
    unit: 'ערוצים',
    description: 'בנה מנגנון שיווק שעובד בעצמו',
    examples: [
      { title: 'ערוץ שיווק אחד שעובד קבוע', target: 1, timeframe: 'quarter' },
      { title: 'מערכת שמביאה פניות כל חודש', target: 1, timeframe: 'quarter' },
      { title: 'שיווק שעובד גם כשלא עובדים', target: 1, timeframe: 'year' }
    ]
  },
  {
    id: 'retention',
    name: 'שימור והחזרת לקוחות',
    icon: Heart,
    color: 'from-fuchsia-400 to-fuchsia-600',
    defaultTarget: 5,
    unit: 'לקוחות',
    description: 'החזר לקוחות ומכור להם שוב',
    examples: [
      { title: 'להחזיר לקוחות עבר', target: 5, timeframe: 'quarter' },
      { title: 'למכור שוב ללקוחות קיימים', target: 10, timeframe: 'quarter' },
      { title: 'לייצור הכנסה חוזרת מאותו לקוח', target: 15, timeframe: 'quarter' }
    ]
  },
  {
    id: 'reduce_stress',
    name: 'פחות לחץ ושחיקה',
    icon: Heart,
    color: 'from-emerald-400 to-emerald-600',
    defaultTarget: 100,
    unit: '% שיפור',
    description: 'הפחת לחץ ושחיקה עסקית',
    examples: [
      { title: 'לסיים חודש בלי תחושת רדיפה', target: 100, timeframe: 'quarter' },
      { title: 'להרגיש שליטה ולא כיבוי שריפות', target: 100, timeframe: 'quarter' },
      { title: 'לשמור על אנרגיה לאורך זמן', target: 100, timeframe: 'quarter' }
    ]
  },
  {
    id: 'focus_direction',
    name: 'מיקוד וכיוון עסקי ברור',
    icon: Target,
    color: 'from-violet-400 to-violet-600',
    defaultTarget: 1,
    unit: 'שירות',
    description: 'התמקד במה שחשוב',
    examples: [
      { title: 'לבחור שירות אחד מרכזי', target: 1, timeframe: 'quarter' },
      { title: 'לוותר על לקוחות לא מתאימים', target: 100, timeframe: 'quarter' },
      { title: 'לדעת על מה אומרים "לא"', target: 100, timeframe: 'quarter' }
    ]
  }
];

export default function GoalTemplatesFixed({ onCreateGoal, onClose, hasPrimaryGoal = false, editingGoal = null }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [timeframe, setTimeframe] = useState('month');
  const [isPrimary, setIsPrimary] = useState(editingGoal?.isPrimary || false);
  const drawerRef = useRef(null);
  const initialFocusRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize form with editing goal data
  React.useEffect(() => {
    if (editingGoal) {
      setGoalTitle(editingGoal.title);
      setTargetValue(editingGoal.target?.toString() || '');
      setDeadline(editingGoal.deadline || '');
      setTimeframe(editingGoal.timeframe || 'month');
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

  // Prevent page scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, []);

  // Focus management
  useEffect(() => {
    initialFocusRef.current?.focus();
  }, [selectedTemplate]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTargetValue(template.defaultTarget.toString());
    if (template.examples?.length > 0) {
      setGoalTitle(template.examples[0].title);
      setTimeframe(template.examples[0].timeframe);
    }
  };

  const handleExampleSelect = (example) => {
    setGoalTitle(example.title);
    setTargetValue(example.target.toString());
    setTimeframe(example.timeframe);
  };

  const handleCreate = () => {
    if (!selectedTemplate || !goalTitle || !targetValue) return;

    const goalData = {
      id: editingGoal?.id || Date.now().toString(),
      category: selectedTemplate.id,
      title: goalTitle,
      description: selectedTemplate.description,
      current: editingGoal?.current || 0,
      target: parseFloat(targetValue),
      currentDisplay: editingGoal?.currentDisplay || `0 ${selectedTemplate.unit}`,
      targetDisplay: `${targetValue} ${selectedTemplate.unit}`,
      deadline: deadline || null,
      timeframe: timeframe,
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
          </div>

          {/* Body */}
          <div className="mobile-sheet-body">
            <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* All templates grid */}
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">בחר מטרה:</p>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_TEMPLATES.map((template, idx) => (
                    <motion.button
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => handleTemplateSelect(template)}
                      className={cn(
                        "text-right bg-white border-2 rounded-xl p-2 transition-all",
                        selectedTemplate?.id === template.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0`}>
                          <template.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-xs leading-tight text-right line-clamp-2">{template.name}</h3>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Form section */}
              {selectedTemplate && selectedTemplate.id !== 'custom' && (
                <div className="space-y-2 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-2.5 border border-purple-200">
                  <Label className="text-xs font-bold text-gray-700">דוגמאות מהירות:</Label>
                  <div className="space-y-1">
                    {selectedTemplate.examples?.map((example, i) => (
                      <button
                        key={i}
                        onClick={() => handleExampleSelect(example)}
                        className="w-full text-right px-2 py-1 bg-white hover:bg-blue-100 border border-gray-200 rounded text-xs font-medium text-gray-900"
                      >
                        {example.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom goal option */}
              <Button
                variant="outline"
                className="w-full py-2 text-xs font-semibold border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                onClick={() => setSelectedTemplate({ id: 'custom', name: 'מטרה מותאמת', unit: '' })}
              >
                <Plus className="w-4 h-4 ml-2" />
                מטרה משלי
              </Button>

              {/* Input fields */}
              <div className="space-y-2">
                <div>
                  <Label htmlFor="goalTitle" className="text-xs font-bold text-gray-700 block mb-0.5">מה המטרה?</Label>
                  <Input
                    id="goalTitle"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="למשל: 10 לקוחות חדשים"
                    className="text-xs h-8"
                  />
                </div>

                {selectedTemplate && (
                  <>
                    <div>
                      <Label htmlFor="targetValue" className="text-xs font-bold text-gray-700 block mb-0.5">כמה?</Label>
                      <div className="flex gap-1.5">
                        <Input
                          id="targetValue"
                          type="number"
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          placeholder="0"
                          className="flex-1 text-xs h-8"
                        />
                        {selectedTemplate.unit && (
                          <div className="px-2 py-1.5 bg-gray-100 rounded text-gray-700 text-xs font-medium border border-gray-200 whitespace-nowrap">
                            {selectedTemplate.unit}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timeframe" className="text-xs font-bold text-gray-700 block mb-0.5">תוך כמה זמן?</Label>
                      <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">שבוע</SelectItem>
                          <SelectItem value="month">חודש</SelectItem>
                          <SelectItem value="quarter">רבעון</SelectItem>
                          <SelectItem value="year">שנה</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="deadline" className="text-xs font-bold text-gray-700 block mb-0.5">תאריך יעד (לא חובה)</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>

                    {!hasPrimaryGoal && (
                      <div className="flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                        <input
                          id="isPrimary"
                          type="checkbox"
                          checked={isPrimary}
                          onChange={(e) => setIsPrimary(e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <label htmlFor="isPrimary" className="text-xs font-semibold text-gray-700 cursor-pointer">
                          זו המטרה הראשית
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          {selectedTemplate && (
            <div className="mobile-sheet-footer">
              <Button 
                onClick={handleCreate} 
                disabled={!goalTitle || !targetValue}
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
      <DialogContent className="p-0 border-0 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" ref={drawerRef}>
        <div className="flex flex-col h-full w-full min-w-0">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <h2 ref={initialFocusRef} tabIndex="-1" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                {editingGoal ? 'עריכת מטרה' : 'מטרה חדשה'}
              </h2>
              <div className="w-5" />
            </div>
            {!selectedTemplate && <p className="text-center text-sm text-gray-600 font-medium mt-2">בחר מטרה שמשפיעה על העסק</p>}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
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
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setGoalTitle('');
                    setTargetValue('');
                  }}
                  className="text-gray-600 h-8 text-sm"
                >
                  ← חזור
                </Button>

                {selectedTemplate.examples && (
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-3 border border-purple-100">
                    <p className="text-sm font-bold text-gray-700 mb-2">דוגמאות</p>
                    <div className="space-y-2">
                      {selectedTemplate.examples.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => handleExampleSelect(example)}
                          className="w-full text-right px-3 py-2 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900"
                        >
                          {example.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="goalTitle" className="text-sm font-bold block mb-1">מה המטרה?</Label>
                    <Input
                      id="goalTitle"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      placeholder="למשל: 10 לקוחות חדשים"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetValue" className="text-sm font-bold block mb-1">כמה?</Label>
                    <div className="flex gap-2">
                      <Input
                        id="targetValue"
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        placeholder="0"
                        className="flex-1 text-sm"
                      />
                      {selectedTemplate.unit && (
                        <div className="px-3 py-2 bg-gray-100 rounded-lg flex items-center text-gray-700 text-sm font-medium">
                          {selectedTemplate.unit}
                        </div>
                      )}
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
                disabled={!goalTitle || !targetValue}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}