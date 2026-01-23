import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  Wallet, 
  Target, 
  TrendingUp, 
  Megaphone, 
  Shield, 
  Lock,
  Check,
  ChevronLeft,
  X,
  Circle,
  Lightbulb,
  Users,
  DollarSign,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function JourneyTimeline() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => await base44.auth.me(),
  });

  const clientTasks = user?.client_tasks || [];
  const businessState = user?.business_state || {};

  // Map task to icon based on keywords
  const getIconForTask = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('רעיון') || lowerTitle.includes('גיבוש')) return Lightbulb;
    if (lowerTitle.includes('לקוח') || lowerTitle.includes('גיוס')) return Users;
    if (lowerTitle.includes('עוסק') || lowerTitle.includes('תיק')) return Shield;
    if (lowerTitle.includes('חשבונית') || lowerTitle.includes('מחיר')) return DollarSign;
    if (lowerTitle.includes('שיווק') || lowerTitle.includes('קמפיין')) return Megaphone;
    if (lowerTitle.includes('מטרה') || lowerTitle.includes('יעד')) return Target;
    if (lowerTitle.includes('הכנסה') || lowerTitle.includes('הוצאות')) return Wallet;
    if (lowerTitle.includes('צמיחה') || lowerTitle.includes('הגדלה')) return TrendingUp;
    return Rocket;
  };

  // First step is always the snapshot (completed)
  const snapshotStep = {
    id: 'snapshot',
    title: 'תמונת מצב העסק שלך',
    description: 'מבינים איפה אתה עומד היום ומה באמת קורה בעסק',
    icon: Map,
    status: 'completed',
    details: {
      done: ['ניתחנו את המצב העסקי שלך', 'זיהינו את נקודות החוזק והאתגרים'],
      todo: [],
      nextAction: 'צפה בסיכום'
    }
  };

  // Convert client_tasks to steps format (these are the AI-generated tasks)
  const dynamicSteps = clientTasks.length > 0 
    ? clientTasks.map((task, index) => {
        const isCompleted = task.status === 'completed';
        const isCurrent = task.status === 'in_progress' || (index === 0 && !isCompleted);
        const isLocked = !isCompleted && !isCurrent;

        return {
          id: task.id,
          title: task.title,
          description: task.description,
          icon: getIconForTask(task.title),
          status: isCompleted ? 'completed' : isCurrent ? 'current' : 'locked',
          is_milestone: task.is_milestone,
          details: {
            done: isCompleted ? [task.description] : [],
            todo: !isCompleted ? ['השלם משימה זו כדי להמשיך'] : [],
            nextAction: 'התחל עכשיו'
          }
        };
      })
    : [];

  // Combine snapshot with dynamic steps
  const steps = [snapshotStep, ...dynamicSteps];

  const [selectedStep, setSelectedStep] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);

  const handleStepClick = (step) => {
    // Allow clicking all steps to view details/expectations
    setSelectedStep(step);
  };

  return (
    <div className="relative min-h-[300px] p-4 pb-6 bg-gray-50/50 rounded-3xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-3">
          <Map className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          מסע העסק שלך
        </h2>
        <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
          מבוסס על התשובות שלך – זה המסלול שבנינו עבורך
        </p>
        

      </div>

      {/* Timeline */}
      <div className="relative max-w-md mx-auto space-y-4">
        {/* Vertical Line */}
        <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-gray-200 z-0" />

        {steps.map((step, index) => {
          const isCurrent = step.status === 'current';
          const isCompleted = step.status === 'completed';
          const isLocked = step.status === 'locked';
          const Icon = step.icon;

          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative z-10"
            >
              <div 
                onClick={() => handleStepClick(step)}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden bg-white",
                  isCurrent 
                    ? "border-blue-100 shadow-lg scale-[1.02] ring-1 ring-blue-50"
                    : "border-transparent hover:border-gray-100 shadow-sm",
                  isLocked && "opacity-60 grayscale bg-gray-50/50"
                )}
              >
                {/* Timeline Node */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-14 h-14 rounded-full border-4 flex-shrink-0 transition-all duration-500",
                  isCurrent ? "bg-blue-600 border-blue-50 text-white shadow-blue-200 shadow-xl" : 
                  isCompleted ? "bg-green-500 border-green-50 text-white" : 
                  "bg-white border-gray-100 text-gray-300"
                )}>
                  {isCompleted ? <Check className="w-6 h-6" /> : 
                   isLocked ? <Lock className="w-5 h-5" /> : 
                   <Icon className="w-6 h-6" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-right">
                  <h3 className={cn(
                    "font-bold text-base mb-1 leading-tight",
                    isCurrent ? "text-blue-900" : "text-gray-900"
                  )}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Chevron / Indicator */}
                {!isLocked && (
                  <ChevronLeft className={cn(
                    "w-5 h-5 transition-transform flex-shrink-0",
                    isCurrent ? "text-blue-400" : "text-gray-300"
                  )} />
                )}

                {/* Active Indicator Glow */}
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-transparent pointer-events-none opacity-20" />
                )}

                {/* Locked Tooltip Overlay */}
                <AnimatePresence>
                  {showTooltip === step.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gray-900/90 flex items-center justify-center text-white text-xs font-medium rounded-xl z-20 backdrop-blur-sm"
                    >
                      ייפתח לאחר השלמת השלב הקודם
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>


    </div>
  );
}