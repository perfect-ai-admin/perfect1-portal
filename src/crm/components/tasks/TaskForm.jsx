import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TASK_TYPE_OPTIONS, PRIORITY_OPTIONS } from '../../constants/pipeline';
import { useAddTask, useAgents } from '../../hooks/useCRM';
import { toast } from 'sonner';

export default function TaskForm({ leadId, clientId, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const addTask = useAddTask();
  const { data: agents = [] } = useAgents();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('יש להזין כותרת');
      return;
    }

    addTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || null,
        task_type: taskType,
        lead_id: leadId || null,
        client_id: clientId || null,
        assigned_to: assignedTo || null,
        priority,
        due_date: dueDate || null,
      },
      {
        onSuccess: () => {
          toast.success('משימה נוצרה');
          setTitle('');
          setDescription('');
          setTaskType('general');
          setPriority('medium');
          setDueDate('');
          setAssignedTo('');
          onSuccess?.();
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-slate-200 rounded-lg p-4">
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="כותרת המשימה..."
      />

      <Textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="תיאור (אופציונלי)..."
        rows={2}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">סוג</label>
          <Select value={taskType} onValueChange={setTaskType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TASK_TYPE_OPTIONS.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">עדיפות</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">תאריך יעד</label>
          <Input
            type="datetime-local"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">משוייך ל</label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger><SelectValue placeholder="בחר נציג..." /></SelectTrigger>
            <SelectContent>
              {agents.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={addTask.isPending} className="bg-[#1E3A5F] hover:bg-[#152d4a]">
          {addTask.isPending ? 'שומר...' : 'צור משימה'}
        </Button>
      </div>
    </form>
  );
}
