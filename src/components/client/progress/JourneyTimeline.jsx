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
    <div className="space-y-6">
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
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Connector Line */}
            {index < MILESTONES.length - 1 && (
              <div 
                className={cn(
                  "absolute right-6 top-16 w-0.5 h-12",
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                )}
              />
            )}

            <div
              className={cn(
                "bg-white rounded-xl p-6 shadow-lg border-2 transition-all",
                isCurrent && "border-blue-500 ring-4 ring-blue-100",
                isCompleted && "border-green-500",
                isLocked && "border-gray-200 opacity-60"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                    isCompleted && "bg-green-500",
                    isCurrent && "bg-blue-500 animate-pulse",
                    isLocked && "bg-gray-300"
                  )}
                >
                  {isCompleted && <CheckCircle className="w-6 h-6 text-white" />}
                  {isCurrent && <Circle className="w-6 h-6 text-white" />}
                  {isLocked && <Lock className="w-6 h-6 text-gray-500" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {milestone.title}
                    </h3>
                    {isCompleted && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        הושלם ✓
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold animate-pulse">
                        בתהליך
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{milestone.description}</p>
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