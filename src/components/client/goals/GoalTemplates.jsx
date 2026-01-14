import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Clock, BookOpen, Heart, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GOAL_TEMPLATES = [
  {
    id: 'revenue',
    name: 'מטרת הכנסה',
    icon: DollarSign,
    color: 'from-green-400 to-green-600',
    defaultTarget: 15000,
    unit: '₪',
    description: 'הגדר יעד הכנסה חודשי או שנתי'
  },
  {
    id: 'clients',
    name: 'מטרת לקוחות',
    icon: Users,
    color: 'from-blue-400 to-blue-600',
    defaultTarget: 10,
    unit: 'לקוחות',
    description: 'כמה לקוחות אתה רוצה להגיע?'
  },
  {
    id: 'worklife',
    name: 'איזון עבודה-חיים',
    icon: Clock,
    color: 'from-purple-400 to-purple-600',
    defaultTarget: 40,
    unit: 'שעות/שבוע',
    description: 'הגבל את שעות העבודה השבועיות'
  },
  {
    id: 'skill',
    name: 'פיתוח מיומנויות',
    icon: BookOpen,
    color: 'from-orange-400 to-orange-600',
    defaultTarget: 100,
    unit: '% השלמה',
    description: 'למד מיומנות חדשה או קורס'
  },
  {
    id: 'savings',
    name: 'חיסכון',
    icon: Heart,
    color: 'from-pink-400 to-pink-600',
    defaultTarget: 20000,
    unit: '₪',
    description: 'חסוך סכום מסוים לציוד או השקעה'
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
    
    // Auto-generate title
    if (template.id === 'revenue') {
      setGoalTitle(`הכנסה חודשית של ${template.unit}${template.defaultTarget.toLocaleString()}`);
    } else if (template.id === 'clients') {
      setGoalTitle(`${template.defaultTarget} לקוחות פעילים`);
    } else {
      setGoalTitle(template.name);
    }
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">הוסף מטרה חדשה 🎯</DialogTitle>
        </DialogHeader>

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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>טיפ:</strong> מטרות ספציפיות וניתנות למדידה נוטות להצליח יותר. 
                  המערכת תעקוב אחרי ההתקדמות ותספק המלצות.
                </p>
              </div>

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
      </DialogContent>
    </Dialog>
  );
}