import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StateDataCollector({ onDataUpdate, businessState }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('marketing');

  const questions = {
    marketing: [
      {
        key: 'active_channel',
        label: 'איזה ערוץ שיווק אתה עובד איתו כרגע?',
        type: 'select',
        options: ['Google', 'Facebook', 'TikTok', 'Instagram', 'LinkedIn', 'WhatsApp', 'טלפון', 'אחר'],
        icon: '📢'
      },
      {
        key: 'last_action_date',
        label: 'מתי עשית פעולה שיווקית בפועל?',
        type: 'date',
        icon: '📅'
      },
      {
        key: 'monthly_leads',
        label: 'כמה הצעות / leads בחודש בממוצע?',
        type: 'number',
        icon: '📊'
      }
    ],
    sales: [
      {
        key: 'active_deals',
        label: 'כמה עסקות בהליך כרגע?',
        type: 'number',
        icon: '🤝'
      },
      {
        key: 'last_close_date',
        label: 'מתי סגרת עסקה אחרונה?',
        type: 'date',
        icon: '✅'
      },
      {
        key: 'conversion_rate',
        label: 'מ-100 אנשים שקרא לך - כמה הפכו ללקוחות?',
        type: 'number',
        icon: '📈'
      }
    ],
    operations: [
      {
        key: 'weekly_hours',
        label: 'כמה שעות בשבוע אתה משקיע בעסק?',
        type: 'number',
        icon: '⏰'
      },
      {
        key: 'workload_status',
        label: 'אתה בעומס או בקיבולת?',
        type: 'select',
        options: ['בקיבולת', 'בחצי קיבולת', 'בעומס', 'במצור'],
        icon: '⚙️'
      },
      {
        key: 'pending_work',
        label: 'כמה עבודה ממתינה לך?',
        type: 'select',
        options: ['לא', 'קצת', 'הרבה', 'מאוד הרבה'],
        icon: '📝'
      }
    ],
    performance: [
      {
        key: 'monthly_revenue',
        label: 'כמה הכנסות החודש שעבר?',
        type: 'number',
        icon: '💰'
      },
      {
        key: 'revenue_trend',
        label: 'ההכנסות עולות, יורדות או יציבות?',
        type: 'select',
        options: ['עולה חזק', 'עולה', 'יציב', 'יורד', 'יורד חזק'],
        icon: '📉'
      },
      {
        key: 'active_goals',
        label: 'כמה מטרות פעילות יש לך?',
        type: 'number',
        icon: '🎯'
      }
    ],
    focus: [
      {
        key: 'main_priority',
        label: 'מה הדבר החשוב ביותר בעסק עכשיו?',
        type: 'text',
        icon: '🔥'
      },
      {
        key: 'initiatives_count',
        label: 'כמה יוזמות / ניסויים בחודש האחרון?',
        type: 'number',
        icon: '🚀'
      },
      {
        key: 'deferred_ideas',
        label: 'אילו רעיונות אתה מחכה להם?',
        type: 'text',
        icon: '💡'
      }
    ]
  };

  const handleSubmit = (category, formData) => {
    // כשיהיה backend, זה יקרא ל-analyzeBusinessState
    console.log(`Submitting ${category} data:`, formData);
    onDataUpdate?.(category, formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Clock className="w-4 h-4" />
          עדכן נתונים
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>עדכן את מצב העסק שלך</DialogTitle>
          <DialogDescription>
            עדכון קצר שיעזור למערכת להבין היכן אתה עומד בדיוק
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="marketing">📢 שיווק</TabsTrigger>
            <TabsTrigger value="sales">🤝 מכירות</TabsTrigger>
            <TabsTrigger value="operations">⚙️ תפעול</TabsTrigger>
            <TabsTrigger value="performance">📊 ביצוע</TabsTrigger>
            <TabsTrigger value="focus">🎯 פוקוס</TabsTrigger>
          </TabsList>

          {Object.entries(questions).map(([category, qs]) => (
            <TabsContent key={category} value={category}>
              <QuestionForm
                category={category}
                questions={qs}
                onSubmit={(data) => handleSubmit(category, data)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function QuestionForm({ category, questions, onSubmit }) {
  const [answers, setAnswers] = useState({});

  const handleChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 py-4"
    >
      {questions.map((q) => (
        <div key={q.key} className="space-y-2">
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <span>{q.icon}</span>
            {q.label}
          </label>

          {q.type === 'select' && (
            <div className="grid grid-cols-2 gap-2">
              {q.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleChange(q.key, opt)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    answers[q.key] === opt
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === 'number' && (
            <input
              type="number"
              value={answers[q.key] || ''}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
              placeholder="הקלד מספר"
            />
          )}

          {q.type === 'date' && (
            <input
              type="date"
              value={answers[q.key] || ''}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
            />
          )}

          {q.type === 'text' && (
            <input
              type="text"
              value={answers[q.key] || ''}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
              placeholder="כתוב..."
            />
          )}
        </div>
      ))}

      <Button
        onClick={() => onSubmit(answers)}
        className="w-full gap-2"
      >
        <Check className="w-4 h-4" />
        שמור עדכון
      </Button>
    </motion.div>
  );
}