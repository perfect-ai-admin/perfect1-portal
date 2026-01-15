import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const MILESTONES = [
  {
    id: 'registration',
    title: 'רישום עוסק פטור',
    description: 'פתיחת תיק במס הכנסה וביטוח לאומי',
    order: 1
  },
  {
    id: 'first_invoice',
    title: 'חשבונית ראשונה',
    description: 'יצירה והנפקה של החשבונית הראשונה שלך',
    order: 2
  },
  {
    id: 'first_client_payment',
    title: 'תשלום ראשון מלקוח',
    description: 'קבלת התשלום הראשון על העבודה שלך',
    order: 3
  },
  {
    id: 'monthly_report',
    title: 'דיווח חודשי ראשון',
    description: 'השלמת דיווח חודשי ראשון לרשויות',
    order: 4
  },
  {
    id: 'steady_income',
    title: 'הכנסה קבועה',
    description: '3 חודשים רצופים עם הכנסה',
    order: 5
  },
  {
    id: 'annual_report',
    title: 'דוח שנתי ראשון',
    description: 'השלמת דוח שנתי ראשון לרשויות המס',
    order: 6
  }
];

export default function JourneyTimeline({ completedMilestones = [], currentMilestone = 'registration' }) {
  const getMilestoneStatus = (milestone) => {
    if (completedMilestones.includes(milestone.id)) return 'completed';
    if (milestone.id === currentMilestone) return 'current';
    return 'locked';
  };

  return (
    <div className="space-y-3">
      {MILESTONES.map((milestone, index) => {
        const status = getMilestoneStatus(milestone);
        const isCompleted = status === 'completed';
        const isCurrent = status === 'current';
        const isLocked = status === 'locked';

        return (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="relative"
          >
            {/* Connector Line */}
            {index < MILESTONES.length - 1 && (
              <div 
                className={cn(
                  "absolute right-5 top-12 w-0.5 h-8",
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                )}
              />
            )}

            <div
              className={cn(
                "bg-white rounded-lg p-4 border transition-all",
                isCurrent && "border-blue-500 ring-2 ring-blue-100 bg-blue-50",
                isCompleted && "border-green-500 bg-green-50",
                isLocked && "border-gray-200 opacity-50"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                    isCompleted && "bg-green-500",
                    isCurrent && "bg-blue-500",
                    isLocked && "bg-gray-300"
                  )}
                >
                  {isCompleted && <CheckCircle className="w-5 h-5 text-white" />}
                  {isCurrent && <Circle className="w-5 h-5 text-white" />}
                  {isLocked && <Lock className="w-5 h-5 text-gray-500" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {milestone.title}
                    </h3>
                    {isCompleted && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex-shrink-0">
                        ✓
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex-shrink-0">
                        עכשיו
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{milestone.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export { MILESTONES };