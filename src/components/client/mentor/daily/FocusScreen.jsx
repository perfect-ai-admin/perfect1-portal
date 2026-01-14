import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

export default function FocusScreen({ focus, onSave }) {
  const [weeklyFocus, setWeeklyFocus] = useState(focus?.weekly_focus || '');
  const [secondaryTasks, setSecondaryTasks] = useState(focus?.secondary_tasks || []);

  const handleSave = () => {
    onSave({
      weekly_focus: weeklyFocus,
      secondary_tasks: secondaryTasks
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-4xl font-bold text-gray-900">הפוקוס שלי</h2>
        <p className="text-lg text-gray-600">מה באמת מכניס כסף השבוע?</p>
      </div>

      {/* Primary Focus */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200 space-y-6">
        <label>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            ✨ מה הדבר האחד שמכניס כסף השבוע?
          </p>
          <Textarea
            placeholder="למשל: להסיים את הפרויקט עם לקוח X כדי לקבל תשלום"
            value={weeklyFocus}
            onChange={(e) => setWeeklyFocus(e.target.value)}
            className="h-20 text-lg bg-white"
          />
        </label>
      </div>

      {/* Secondary Tasks (Deferred) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 דברים שנדחו</h3>
          <p className="text-sm text-gray-600 mb-4">
            לא הכול חשוב עכשיו. כתוב מה שאתה דוחה, ולמה.
          </p>
        </div>

        <div className="space-y-2">
          {secondaryTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg p-4 border-2 border-gray-200 flex items-start justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{task.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {task.status === 'deferred' ? '⏸️ נדחה' : '❌ בוטל'}
                </p>
              </div>
              <button
                onClick={() =>
                  setSecondaryTasks(secondaryTasks.filter((t) => t.id !== task.id))
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <label className="block">
          <p className="text-sm text-gray-700 mb-2">הוסף משימה נדחית:</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="מה אתה דוחה?"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  setSecondaryTasks([
                    ...secondaryTasks,
                    {
                      id: Date.now().toString(),
                      title: e.target.value,
                      status: 'deferred'
                    }
                  ]);
                  e.target.value = '';
                }
              }}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
            />
          </div>
        </label>
      </div>

      {/* Message */}
      <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
        <p className="text-yellow-900 text-sm">
          💬 "לא הכול חשוב עכשיו" - זה בסדר. בואו נדחה ונתמקד.
        </p>
      </div>

      <Button onClick={handleSave} size="lg" className="w-full">
        שמור פוקוס
      </Button>
    </motion.div>
  );
}