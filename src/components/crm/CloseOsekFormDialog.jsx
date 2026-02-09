import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'טרם התחיל' },
  { value: 'power_of_attorney_sent', label: 'נשלח ייפוי כוח' },
  { value: 'in_process', label: 'בתהליך סגירה' },
  { value: 'completed', label: 'הושלם' },
];

const EMPTY_FORM = {
  full_name: '',
  phone: '',
  income_tax_status: 'not_started',
  vat_status: 'not_started',
  national_insurance_status: 'not_started',
  notes: '',
};

export default function CloseOsekFormDialog({ open, onOpenChange, record, onSave, isSaving }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (record) {
      setForm({
        full_name: record.full_name || '',
        phone: record.phone || '',
        income_tax_status: record.income_tax_status || 'not_started',
        vat_status: record.vat_status || 'not_started',
        national_insurance_status: record.national_insurance_status || 'not_started',
        notes: record.notes || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [record, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">{record ? 'עריכת לקוח' : 'הוספת לקוח חדש'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>שם מלא *</Label>
            <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} required placeholder="שם מלא" />
          </div>
          <div className="space-y-1.5">
            <Label>טלפון *</Label>
            <Input value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="050-1234567" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { key: 'income_tax_status', label: 'מס הכנסה' },
              { key: 'vat_status', label: 'מע"מ' },
              { key: 'national_insurance_status', label: 'ביטוח לאומי' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Select value={form[key]} onValueChange={val => set(key, val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>הערות</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="הערות..." rows={3} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? 'שומר...' : record ? 'עדכון' : 'הוספה'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}