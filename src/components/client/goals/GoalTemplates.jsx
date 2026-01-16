import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Clock, BookOpen, Heart, Plus, X, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Goal Templates (section 4.4.2)
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
      { title: 'לייצר הכנסה חוזרת מאותו לקוח', target: 15, timeframe: 'quarter' }
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

export default function GoalTemplates({ onCreateGoal, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [timeframe, setTimeframe] = useState('month');
  const drawerRef = useRef(null);
  const initialFocusRef = useRef(null);

  // Focus trap implementation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || [];

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    drawerRef.current?.addEventListener('keydown', handleKeyDown);
    initialFocusRef.current?.focus();

    return () => {
      drawerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTargetValue(template.defaultTarget.toString());
    
    // Auto-generate title based on first example
    if (template.examples && template.examples.length > 0) {
      setGoalTitle(template.examples[0].title);
      setTimeframe(template.examples[0].timeframe);
    } else if (template.id === 'revenue') {
      setGoalTitle(`הכנסה חודשית של ${template.unit}${template.defaultTarget.toLocaleString()}`);
    } else if (template.id === 'clients') {
      setGoalTitle(`${template.defaultTarget} לקוחות פעילים`);
    } else {
      setGoalTitle(template.name);
    }
  };

  const handleExampleSelect = (example) => {
    setGoalTitle(example.title);
    setTargetValue(example.target.toString());
    setTimeframe(example.timeframe);
  };

  const handleCreate = () => {
    if (!selectedTemplate || !goalTitle || !targetValue) return;

    const newGoal = {
      id: Date.now().toString(),
      category: selectedTemplate.id,
      title: goalTitle,
      description: selectedTemplate.description,
      current: 0,
      target: parseFloat(targetValue),
      currentDisplay: `0 ${selectedTemplate.unit}`,
      targetDisplay: `${targetValue} ${selectedTemplate.unit}`,
      deadline: deadline || null,
      timeframe: timeframe,
      aiInsight: 'מטרה חדשה נוצרה - התחל לעבוד לקראתה!'
    };

    onCreateGoal(newGoal);
    onClose();
  };

  return (
    <Drawer open={true} onOpenChange={onClose}>
      <DrawerContent 
        className="max-h-[90vh] overflow-y-auto" 
        ref={drawerRef}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="goal-title"
      >
        <DrawerHeader className="hidden md:block">
          <DrawerTitle id="goal-title" className="text-2xl" ref={initialFocusRef} tabIndex="-1">הוסף מטרה חדשה 🎯</DrawerTitle>
        </DrawerHeader>
        <div className="md:hidden px-4 py-3 border-b">
          <h2 id="goal-title" className="text-xl font-bold text-gray-900" ref={initialFocusRef} tabIndex="-1">הוסף מטרה חדשה 🎯</h2>
        </div>
        <div className="px-4 md:px-6 py-4">

        {!selectedTemplate ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">הוסף מטרה חדשה</h3>
              </div>
              <p className="text-gray-600">בחר סוג מטרה או צור מטרה מותאמת אישית:</p>
            </div>
            
            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {GOAL_TEMPLATES.map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTemplateSelect(template)}
                  className="text-right bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg rounded-2xl p-4 md:p-5 transition-all group"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <template.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 text-base md:text-lg leading-tight">{template.name}</h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{template.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full py-6 text-base font-semibold border-2 hover:border-purple-400 hover:bg-purple-50"
              onClick={() => setSelectedTemplate({ id: 'custom', name: 'מטרה מותאמת', unit: '' })}
            >
              <Plus className="w-5 h-5 ml-2" />
              צור מטרה מותאמת אישית
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedTemplate(null)}
              className="mb-2"
            >
              ← חזור לבחירת תבנית
            </Button>

            <div className="space-y-4">
              {/* Examples from Template */}
              {selectedTemplate.examples && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">דוגמאות מוכנות:</Label>
                  <div className="space-y-2">
                    {selectedTemplate.examples.map((example, i) => (
                      <button
                        key={i}
                        onClick={() => handleExampleSelect(example)}
                        className="w-full text-right px-3 py-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all text-sm"
                      >
                        {example.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="goalTitle">שם המטרה</Label>
                <Input
                  id="goalTitle"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="למשל: הגעה ל-10 לקוחות חדשים"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="targetValue">ערך יעד</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="targetValue"
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="0"
                    className="flex-1"
                  />
                  {selectedTemplate.unit && (
                    <div className="px-4 py-2 bg-gray-100 rounded-md flex items-center text-gray-700">
                      {selectedTemplate.unit}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="timeframe">מסגרת זמן</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">שבועי</SelectItem>
                    <SelectItem value="month">חודשי</SelectItem>
                    <SelectItem value="quarter">רבעוני</SelectItem>
                    <SelectItem value="year">שנתי</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deadline">תאריך יעד (אופציונלי)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Tips from Template */}
              {selectedTemplate.tips && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">💡 טיפים להצלחה:</p>
                  <ul className="space-y-1 text-sm text-blue-800">
                    {selectedTemplate.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreate} className="flex-1" disabled={!goalTitle || !targetValue}>
                  צור מטרה
                </Button>
                <Button variant="outline" onClick={onClose}>
                  ביטול
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}