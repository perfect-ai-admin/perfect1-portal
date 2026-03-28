import React from 'react';
import { 
  Target, 
  Map, 
  Trophy, 
  ArrowLeft,
  CheckCircle2,
  Brain,
  Zap,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const PLAN_STAGES = [
  { 
    id: 1, 
    title: "מודעות ומיפוי", 
    description: "נבין איפה אנחנו עומדים, מה עובד ומה תוקע אותנו.",
    icon: Brain,
    color: "bg-blue-100 text-blue-600"
  },
  { 
    id: 2, 
    title: "שיקוף ודיוק", 
    description: "נעשה סדר במחשבות ונזקק את האתגר האמיתי.",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600"
  },
  { 
    id: 3, 
    title: "בחירת פעולה", 
    description: "נבחר צעד אחד קטן ומדויק להתנעה מיידית.",
    icon: Zap,
    color: "bg-amber-100 text-amber-600"
  },
  { 
    id: 4, 
    title: "יציאה לדרך", 
    description: "ביצוע, תובנות וסגירת מעגל ראשון של הצלחה.",
    icon: Trophy,
    color: "bg-green-100 text-green-600"
  }
];

export default function GoalSuccessPlan({ goal, onStart }) {
  return (
    <div className="space-y-8 animate-fade-in-up" dir="rtl">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          תוכנית העבודה שלך: {goal.title}
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          בנינו עבורך תהליך מובנה ומדויק שיעזור לך להשיג את המטרה הזו בצעדים קטנים ובטוחים.
        </p>
      </div>

      {/* Success Strategy */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-full shrink-0">
            <Target className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-indigo-900 mb-2">איך נגרום לזה לקרות?</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              הסוד להצלחה במטרה הזו הוא לא "לעבוד קשה יותר", אלא לעבוד מדויק יותר. 
              אנחנו נפרק את האתגר הגדול לצעדים קטנים, ננטרל את החסמים המנטליים, וניצור מומנטום של עשייה חיובית.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-indigo-200 text-xs font-medium text-indigo-700 shadow-sm">
                🎯 מיקוד לייזר
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-indigo-200 text-xs font-medium text-indigo-700 shadow-sm">
                🧠 עבודה מנטלית
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-indigo-200 text-xs font-medium text-indigo-700 shadow-sm">
                ⚡ פעולות קטנות
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stages Timeline */}
      <div>
        <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
          <Map className="w-5 h-5 text-gray-500" />
          שלבי התהליך
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLAN_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = (goal.flow_step || 1) > idx * 2; // Rough mapping to flow steps
            
            return (
              <div 
                key={stage.id} 
                className={`relative p-5 rounded-2xl border transition-all ${
                  isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-3 left-3 bg-green-100 text-green-600 rounded-full p-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stage.color} bg-opacity-50`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h4 className="font-bold text-gray-900 mb-2">{stage.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={onStart}
          size="lg"
          className="bg-gray-900 hover:bg-black text-white px-8 h-14 text-lg rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          בוא נתחיל לעבוד
          <ArrowLeft className="w-5 h-5 mr-2" />
        </Button>
      </div>

    </div>
  );
}