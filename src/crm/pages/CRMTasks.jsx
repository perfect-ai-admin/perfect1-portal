import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { AlertCircle, CheckCircle } from 'lucide-react';
import PriorityBadge from '../components/shared/PriorityBadge';
import { useCompleteTask, useAgents } from '../hooks/useCRM';
import { toast } from 'sonner';

export default function CRMTasks() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterAgent, setFilterAgent] = useState('all');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['crm-tasks', filterStatus],
    queryFn: async () => {
      const all = await entities.Task.list('-created_at', 200);
      return all;
    },
  });

  const { data: agents = [] } = useAgents();
  const completeTask = useCompleteTask();

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterAgent !== 'all' && t.assigned_to !== filterAgent) return false;
    return true;
  });

  const handleComplete = (taskId) => {
    completeTask.mutate(
      { task_id: taskId },
      {
        onSuccess: () => toast.success('הושלם'),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#1E3A5F]">משימות ({filtered.length})</h1>

      <div className="flex gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="pending">ממתינות</SelectItem>
            <SelectItem value="completed">הושלמו</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="כל הנציגים" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הנציגים</SelectItem>
            {agents.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(task => {
          const isOverdue = task.status === 'pending' && task.due_date && new Date(task.due_date) < new Date();
          const completed = task.status === 'completed';

          return (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
                isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200'
              } ${completed ? 'opacity-60' : ''}`}
            >
              <Checkbox
                checked={completed}
                onCheckedChange={() => !completed && handleComplete(task.id)}
                disabled={completed}
              />

              <div
                className="flex-1 cursor-pointer"
                onClick={() => task.lead_id && navigate(`/CRM/leads/${task.lead_id}`)}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${completed ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </span>
                  <PriorityBadge priority={task.priority} />
                  {isOverdue && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={10} /> באיחור
                    </span>
                  )}
                </div>
                <div className="flex gap-3 text-xs text-slate-400 mt-1">
                  {task.due_date && (
                    <span>{format(new Date(task.due_date), 'dd/MM HH:mm', { locale: he })}</span>
                  )}
                  <span>{task.task_type}</span>
                </div>
              </div>

              {completed && (
                <CheckCircle size={16} className="text-green-500" />
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-400">אין משימות</div>
        )}
      </div>
    </div>
  );
}
