import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Clock, AlertCircle } from 'lucide-react';
import PriorityBadge from '../shared/PriorityBadge';
import { useCompleteTask } from '../../hooks/useCRM';
import { toast } from 'sonner';

export default function TaskList({ tasks = [] }) {
  const completeTask = useCompleteTask();

  const handleComplete = (taskId) => {
    completeTask.mutate(
      { task_id: taskId },
      {
        onSuccess: () => toast.success('המשימה הושלמה'),
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Clock size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">אין משימות</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pendingTasks.map(task => (
        <TaskItem key={task.id} task={task} onComplete={handleComplete} />
      ))}

      {completedTasks.length > 0 && (
        <div className="pt-3 mt-3 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-400 mb-2">הושלמו ({completedTasks.length})</p>
          {completedTasks.map(task => (
            <TaskItem key={task.id} task={task} onComplete={handleComplete} completed />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskItem({ task, onComplete, completed }) {
  const isOverdue = !completed && task.due_date && new Date(task.due_date) < new Date();

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${
      completed
        ? 'bg-slate-50 border-slate-100 opacity-60'
        : isOverdue
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-slate-200'
    }`}>
      <Checkbox
        checked={completed}
        onCheckedChange={() => !completed && onComplete(task.id)}
        disabled={completed}
        className="mt-0.5"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
            {task.title}
          </span>
          <PriorityBadge priority={task.priority} />
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 mt-1 truncate">{task.description}</p>
        )}

        <div className="flex items-center gap-3 mt-1">
          {task.due_date && (
            <span className={`text-xs flex items-center gap-1 ${
              isOverdue ? 'text-red-600 font-medium' : 'text-slate-400'
            }`}>
              {isOverdue && <AlertCircle size={10} />}
              {format(new Date(task.due_date), 'dd/MM HH:mm', { locale: he })}
            </span>
          )}
          <span className="text-xs text-slate-300">
            {task.task_type}
          </span>
        </div>
      </div>
    </div>
  );
}
