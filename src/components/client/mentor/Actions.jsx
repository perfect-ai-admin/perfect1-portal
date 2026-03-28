import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import MentorHeader from './shared/MentorHeader';
import OutcomeTracker from './shared/OutcomeTracker';

const mockActions = {
  today: [
    {
      id: 1,
      title: 'שלח פולואפ ל-3 לידים',
      why: 'לא שלחת פולואפ בשבוע האחרון',
      estimatedTime: '15 דק',
      status: 'pending'
    },
    {
      id: 2,
      title: 'בדוק את תקציב הגוגל',
      why: 'הוצאות עלו ללא תוצאה',
      estimatedTime: '10 דק',
      status: 'pending'
    }
  ],
  week: [
    {
      id: 3,
      title: 'הפעל קמפיין גוגל חדש',
      why: 'לידים ירדו כי הקמפיין הישן סיים',
      estimatedTime: '30 דק',
      status: 'pending'
    },
    {
      id: 4,
      title: 'כתוב תסריט שיחה חדש',
      why: 'סגירות נמוכות בגלל טעויות בפתיחה',
      estimatedTime: '20 דק',
      status: 'pending'
    }
  ],
  later: [
    {
      id: 5,
      title: 'בנה דף נחיתה חדשה',
      why: 'שיעור קליק נמוך מגוגל',
      estimatedTime: '120 דק',
      status: 'pending'
    }
  ]
};

export default function Actions() {
  const [actions, setActions] = useState(mockActions);
  const [completionFeedback, setCompletionFeedback] = useState({});

  const handleActionComplete = (actionId, status) => {
    // Update action status
    Object.keys(actions).forEach(category => {
      actions[category] = actions[category].map(action =>
        action.id === actionId ? { ...action, status } : action
      );
    });
    setActions({ ...actions });

    // Show feedback form if completed
    if (status === 'done') {
      setCompletionFeedback({
        ...completionFeedback,
        [actionId]: { difficulty: null, result: null }
      });
    }
  };

  const ActionCard = ({ action, category }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{action.title}</h3>
          <p className="text-xs text-gray-600 mt-1">{action.why}</p>
        </div>
        <span className="text-xs text-gray-500 flex-shrink-0">{action.estimatedTime}</span>
      </div>

      <OutcomeTracker actionId={action.id} onComplete={handleActionComplete} />

      {/* Completion Feedback */}
      {completionFeedback[action.id] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-gray-100 space-y-2"
        >
          <p className="text-xs text-gray-600 font-medium">איך היה?</p>
          <div className="flex gap-2">
            {['קל', 'בינוני', 'קשה'].map((level) => (
              <button
                key={level}
                onClick={() => setCompletionFeedback({
                  ...completionFeedback,
                  [action.id]: { ...completionFeedback[action.id], difficulty: level }
                })}
                className="flex-1 text-xs px-2 py-1.5 rounded border border-gray-200 hover:bg-gray-50"
              >
                {level}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const pendingCount = [
    ...actions.today,
    ...actions.week,
    ...actions.later
  ].filter(a => a.status === 'pending').length;

  return (
    <div className="flex flex-col h-full bg-white">
      <MentorHeader 
        title="פעולות"
        subtitle={`${pendingCount} פעולות פתוחות`}
        icon={CheckCircle2}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Today */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-gray-900">היום</h2>
          </div>
          <div className="space-y-2 ml-6">
            <AnimatePresence>
              {actions.today.map(action => (
                <ActionCard key={action.id} action={action} category="today" />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Week */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-gray-900">השבוע</h2>
          </div>
          <div className="space-y-2 ml-6">
            <AnimatePresence>
              {actions.week.map(action => (
                <ActionCard key={action.id} action={action} category="week" />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Later */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-900">מאוחר יותר</h2>
          </div>
          <div className="space-y-2 ml-6">
            <AnimatePresence>
              {actions.later.map(action => (
                <ActionCard key={action.id} action={action} category="later" />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}