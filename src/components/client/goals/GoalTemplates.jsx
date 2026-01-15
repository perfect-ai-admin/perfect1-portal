import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Clock, BookOpen, Heart, Plus, X } from 'lucide-react';
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
    id: 'revenue',
    name: 'מטרת הכנסה',
    icon: DollarSign,
    color: 'from-green-400 to-green-600',
    defaultTarget: 15000,
    unit: '₪',
    description: 'הגדר יעד הכנסה חודשי או שנתי',
    examples: [
      { title: 'הכנסה חודשית של ₪15,000', target: 15000, timeframe: 'month' },
      { title: 'הכנסה שנתית של ₪180,000', target: 180000, timeframe: 'year' },
      { title: 'הכפל הכנסה תוך רבעון', target: 30000, timeframe: 'quarter' }
    ],
    tips: [
      'מטרות הכנסה צריכות להיות מבוססות על נתונים היסטוריים',
      'התחל עם יעד שאתגר אבל ריאלי - 20-30% צמיחה',
      'עקוב אחרי ההתקדמות שבועית כדי לזהות מגמות'
    ]
  },
  {
    id: 'clients',
    name: 'מטרת לקוחות',
    icon: Users,
    color: 'from-blue-400 to-blue-600',
    defaultTarget: 10,
    unit: 'לקוחות',
    description: 'כמה לקוחות אתה רוצה להגיע?',
    examples: [
      { title: '10 לקוחות פעילים', target: 10, timeframe: 'month' },
      { title: '5 לקוחות חדשים החודש', target: 5, timeframe: 'month' },
      { title: '50 לקוחות עד סוף השנה', target: 50, timeframe: 'year' }
    ],
    tips: [
      'לקוחות איכותיים עדיפים על כמות גדולה',
      'הגדר מה "לקוח פעיל" אצלך - רכישה בחודש? בחצי שנה?',
      'עקוב אחרי שיעור הנטישה - לקוח שעזב = צריך 2 חדשים'
    ]
  },
  {
    id: 'worklife',
    name: 'איזון עבודה-חיים',
    icon: Clock,
    color: 'from-purple-400 to-purple-600',
    defaultTarget: 40,
    unit: 'שעות/שבוע',
    description: 'הגבל את שעות העבודה השבועיות',
    examples: [
      { title: 'עבודה של 40 שעות בשבוע', target: 40, timeframe: 'week' },
      { title: 'סיום עבודה ב-18:00 כל יום', target: 45, timeframe: 'week' },
      { title: 'יום אחד ללא עבודה בשבוע', target: 35, timeframe: 'week' }
    ],
    tips: [
      'עצמאים נוטים לעבוד יותר מדי - הגדר גבולות ברורים',
      'שעות פחות לא אומר הכנסה פחות - דווקא להיפך לפעמים',
      'תזמן זמן למשפחה, תחביבים ומנוחה - זה חלק מההצלחה'
    ]
  },
  {
    id: 'skill',
    name: 'פיתוח מיומנויות',
    icon: BookOpen,
    color: 'from-orange-400 to-orange-600',
    defaultTarget: 100,
    unit: '% השלמה',
    description: 'למד מיומנות חדשה או קורס',
    examples: [
      { title: 'קורס שיווק דיגיטלי', target: 100, timeframe: 'quarter' },
      { title: 'קריאת 12 ספרים עסקיים', target: 12, timeframe: 'year' },
      { title: 'למידת כלי עבודה חדש', target: 100, timeframe: 'month' }
    ],
    tips: [
      'השקע 5% מזמנך בלמידה - זה משתלם לטווח ארוך',
      'למד מיומנויות שישפרו את השירות/המוצר שלך',
      'בחר קורסים עם תעודה - זה יוסיף אמינות'
    ]
  },
  {
    id: 'financial',
    name: 'בריאות פיננסית',
    icon: Heart,
    color: 'from-pink-400 to-pink-600',
    defaultTarget: 20000,
    unit: '₪',
    description: 'שפר את המצב הפיננסי של העסק',
    examples: [
      { title: 'חסכון של ₪20,000 למקרי חירום', target: 20000, timeframe: 'year' },
      { title: 'צמצום הוצאות ב-15%', target: 15, timeframe: 'quarter' },
      { title: 'שיפור רווחיות ל-40%', target: 40, timeframe: 'quarter' }
    ],
    tips: [
      'קרן חירום עסקית = 3-6 חודשי הוצאות',
      'צמצום הוצאות לא אומר להפסיק להשקיע - להיות יעיל',
      'רווחיות גבוהה > מחזור גבוה - תמיד'
    ]
  }
];

export default function GoalTemplates({ onCreateGoal, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [timeframe, setTimeframe] = useState('month');

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
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="hidden md:block">
          <DrawerTitle className="text-2xl">הוסף מטרה חדשה 🎯</DrawerTitle>
        </DrawerHeader>
        <div className="md:hidden px-4 py-3 border-b">
          <h2 className="text-xl font-bold text-gray-900">הוסף מטרה חדשה 🎯</h2>
        </div>
        <div className="px-4 md:px-6 py-4">

        {!selectedTemplate ? (
          <div className="space-y-4">
            <p className="text-gray-600">בחר סוג מטרה או צור מטרה מותאמת אישית:</p>
            
            {/* Templates Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {GOAL_TEMPLATES.map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTemplateSelect(template)}
                  className="text-right bg-white border-2 border-gray-200 hover:border-blue-400 rounded-xl p-4 transition-all"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${template.color} flex items-center justify-center mb-3`}>
                    <template.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </motion.button>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedTemplate({ id: 'custom', name: 'מטרה מותאמת', unit: '' })}
            >
              <Plus className="w-4 h-4 ml-2" />
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