import React from 'react';
import { EditorField, EditorCard } from './EditorField';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

function StringList({ label, items = [], onChange, addLabel }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const updated = [...items];
              updated[i] = e.target.value;
              onChange(updated);
            }}
            className="text-sm"
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ''])} className="w-full border-dashed gap-1 text-xs">
        <Plus className="w-3 h-3" /> {addLabel}
      </Button>
    </div>
  );
}

export default function SuitedForEditor({ section, onChange }) {
  const update = (field, value) => onChange({ ...section, [field]: value });

  return (
    <EditorCard title="למי מתאים / לא מתאים" icon={Users} color="green">
      <EditorField label="כותרת" value={section.title} onChange={(v) => update('title', v)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <StringList label="✅ למי כן מתאים" items={section.suited || []} onChange={(v) => update('suited', v)} addLabel="הוסף פריט" />
        <StringList label="❌ למי לא מתאים" items={section.not_suited || []} onChange={(v) => update('not_suited', v)} addLabel="הוסף פריט" />
      </div>
    </EditorCard>
  );
}