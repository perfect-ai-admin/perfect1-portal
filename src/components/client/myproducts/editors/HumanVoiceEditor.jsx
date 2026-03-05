import React from 'react';
import { EditorField, EditorCard } from './EditorField';
import EditorItemList from './EditorItemList';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart } from 'lucide-react';

export default function HumanVoiceEditor({ section, onChange }) {
  const update = (field, value) => onChange({ ...section, [field]: value });

  return (
    <EditorCard title="קולות אנושיים / סיפורים" icon={Heart} color="rose">
      <EditorField label="כותרת" value={section.title} onChange={(v) => update('title', v)} />
      
      <div className="pt-2">
        <p className="text-xs font-bold text-slate-500 mb-2">סיפורים:</p>
        <EditorItemList
          items={section.items || []}
          onUpdate={(items) => update('items', items)}
          createNew={() => ({ type: 'testimonial', content: '', author: '', role: '' })}
          addLabel="הוסף סיפור"
          maxItems={6}
          renderItem={(item, idx, onItemChange) => (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">סוג</Label>
                <Select value={item.type || 'testimonial'} onValueChange={(v) => onItemChange({ type: v })}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="testimonial">לקוח</SelectItem>
                    <SelectItem value="founder_message">מייסד</SelectItem>
                    <SelectItem value="story">סיפור</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <EditorField label="תוכן" value={item.content} onChange={(v) => onItemChange({ content: v })} type="textarea" rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <EditorField label="שם" value={item.author} onChange={(v) => onItemChange({ author: v })} />
                <EditorField label="תפקיד" value={item.role} onChange={(v) => onItemChange({ role: v })} />
              </div>
            </>
          )}
        />
      </div>
    </EditorCard>
  );
}