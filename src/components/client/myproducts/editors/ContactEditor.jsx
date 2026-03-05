import React from 'react';
import { EditorField, EditorCard } from './EditorField';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone } from 'lucide-react';

const FORM_FIELDS_OPTIONS = [
  { id: 'name', label: 'שם מלא' },
  { id: 'phone', label: 'טלפון' },
  { id: 'email', label: 'אימייל' },
  { id: 'message', label: 'הודעה' },
];

export default function ContactEditor({ section, onChange }) {
  const update = (field, value) => onChange({ ...section, [field]: value });

  const toggleFormField = (fieldId) => {
    const current = section.form_fields || [];
    const updated = current.includes(fieldId)
      ? current.filter(f => f !== fieldId)
      : [...current, fieldId];
    update('form_fields', updated);
  };

  return (
    <EditorCard title="טופס יצירת קשר" icon={Phone} color="slate">
      <EditorField label="כותרת" value={section.title} onChange={(v) => update('title', v)} placeholder="בואו נדבר" />
      <EditorField label="תיאור" value={section.subtitle} onChange={(v) => update('subtitle', v)} type="textarea" rows={2} />
      <div className="grid grid-cols-2 gap-3">
        <EditorField label="טלפון שמוצג" value={section.phone} onChange={(v) => update('phone', v)} dir="ltr" />
        <EditorField label="WhatsApp" value={section.whatsapp} onChange={(v) => update('whatsapp', v)} dir="ltr" />
      </div>
      <EditorField label="טקסט כפתור שליחה" value={section.ctaText} onChange={(v) => update('ctaText', v)} placeholder="שליחת פרטים" />

      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">שדות בטופס</Label>
        <div className="grid grid-cols-2 gap-2">
          {FORM_FIELDS_OPTIONS.map(opt => (
            <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg hover:bg-slate-50">
              <Checkbox
                checked={(section.form_fields || []).includes(opt.id)}
                onCheckedChange={() => toggleFormField(opt.id)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </EditorCard>
  );
}