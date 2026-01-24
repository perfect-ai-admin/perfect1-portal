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
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function JourneyTimeline() {
  const navigate = useNavigate();
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
      nextAction: 'צפה בסיכום',
      action: (closeModal) => {
        closeModal(null);
        setTimeout(() => {
          window.location.href = createPageUrl('Summary');
        }, 100);
      }
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

  // Calculate progress
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

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
        
        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-gray-600">התקדמות: {completedSteps}/{totalSteps}</span>
            <span className="text-xs font-semibold text-blue-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-green-400 to-blue-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative max-w-md mx-auto space-y-4">
        {/* Vertical Line - Gradient */}
        <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-gray-200 z-0" />

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
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      isCurrent ? "bg-blue-100 text-blue-700" : 
                      isCompleted ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-500"
                    )}>
                      שלב {index + 1}/{steps.length}
                    </span>
                  </div>
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

      {/* Bottom Sheet Drawer */}
      <AnimatePresence>
        {selectedStep && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStep(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[9999] p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[90vh] overflow-y-auto"
              drag="y"
              dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setSelectedStep(null);
              }}
            >
              {/* Handle */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    selectedStep.status === 'completed' ? "bg-green-100 text-green-600" : 
                    selectedStep.status === 'locked' ? "bg-gray-100 text-gray-500" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    {selectedStep.status === 'locked' ? <Lock className="w-6 h-6" /> : React.createElement(selectedStep.icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedStep.title}</h3>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      selectedStep.status === 'completed' ? "bg-green-100 text-green-700" : 
                      selectedStep.status === 'locked' ? "bg-gray-100 text-gray-600" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {selectedStep.status === 'completed' ? 'הושלם' : 
                       selectedStep.status === 'locked' ? 'טרם נפתח' : 'בתהליך'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStep(null)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {selectedStep.details.done && selectedStep.details.done.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">מה עשינו עד עכשיו</h4>
                    <div className="space-y-2">
                      {selectedStep.details.done.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-700">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStep.details.todo && selectedStep.details.todo.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">מה נשאר לעשות</h4>
                    <div className="space-y-2">
                      {selectedStep.details.todo.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-700">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          </div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStep.status !== 'locked' ? (
                  <Button 
                    className="w-full h-14 text-lg font-bold rounded-2xl mt-4 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    onClick={() => {
                      if (selectedStep.details.action) {
                        selectedStep.details.action(setSelectedStep, navigate);
                      } else {
                        setSelectedStep(null);
                      }
                    }}
                  >
                    {selectedStep.details.nextAction || 'המשך לשלב הבא'}
                  </Button>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl text-center text-sm text-gray-500 border border-gray-100">
                    השלב הזה ייפתח אוטומטית כשתסיים את השלבים הקודמים
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}