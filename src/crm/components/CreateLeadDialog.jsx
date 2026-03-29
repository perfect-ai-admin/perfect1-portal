import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateLead, useAgents, useServiceCatalog } from '../hooks/useCRM';
import { TEMPERATURE_OPTIONS } from '../constants/pipeline';

export default function CreateLeadDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    service_type: '',
    temperature: '',
    agent_id: '',
    notes: '',
    estimated_value: '',
  });
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [forceCreate, setForceCreate] = useState(false);

  const createLead = useCreateLead();
  const { data: agents = [] } = useAgents();
  const { data: services = [] } = useServiceCatalog();

  const resetForm = () => {
    setForm({
      name: '', phone: '', email: '', city: '',
      service_type: '', temperature: '', agent_id: '',
      notes: '', estimated_value: '',
    });
    setDuplicateWarning(null);
    setForceCreate(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = (force = false) => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('שם וטלפון הם שדות חובה');
      return;
    }

    const payload = {
      ...form,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : undefined,
      agent_id: form.agent_id || undefined,
      force_create: force || forceCreate,
    };

    createLead.mutate(payload, {
      onSuccess: (res) => {
        if (res?.warning === 'duplicate_found' && !force && !forceCreate) {
          setDuplicateWarning(res);
          return;
        }
        toast.success('הליד נוצר בהצלחה');
        handleClose();
      },
      onError: (err) => toast.error(`שגיאה: ${err.message}`),
    });
  };

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת ליד חדש</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Duplicate warning */}
          {duplicateWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-amber-800 mb-1">ליד דומה כבר קיים במערכת</p>
                {duplicateWarning.duplicate && (
                  <p className="text-amber-700 text-xs">
                    {duplicateWarning.duplicate.name} — {duplicateWarning.duplicate.phone}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 text-amber-700 border-amber-300"
                  onClick={() => handleSubmit(true)}
                >
                  צור בכל זאת
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">שם <span className="text-red-500">*</span></label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="ישראל ישראלי" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">טלפון <span className="text-red-500">*</span></label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="050-0000000" dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">אימייל</label>
              <Input value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">עיר</label>
              <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="תל אביב" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">סוג שירות</label>
              <Select value={form.service_type} onValueChange={v => set('service_type', v)}>
                <SelectTrigger><SelectValue placeholder="בחר שירות..." /></SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">טמפרטורה</label>
              <Select value={form.temperature} onValueChange={v => set('temperature', v)}>
                <SelectTrigger><SelectValue placeholder="בחר..." /></SelectTrigger>
                <SelectContent>
                  {TEMPERATURE_OPTIONS.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.emoji} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">שיוך נציג</label>
              <Select value={form.agent_id} onValueChange={v => set('agent_id', v)}>
                <SelectTrigger><SelectValue placeholder="בחר נציג..." /></SelectTrigger>
                <SelectContent>
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">שווי מוערך (₪)</label>
              <Input
                type="number"
                value={form.estimated_value}
                onChange={e => set('estimated_value', e.target.value)}
                placeholder="0"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">הערות</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="הערות נוספות..."
              rows={3}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>ביטול</Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={createLead.isPending}
            className="bg-[#1E3A5F] hover:bg-[#16324f]"
          >
            {createLead.isPending ? 'יוצר...' : 'צור ליד'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
