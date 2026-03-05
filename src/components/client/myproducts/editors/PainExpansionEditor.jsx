import React from 'react';
import { EditorField, EditorCard } from './EditorField';
import EditorItemList from './EditorItemList';
import { AlertCircle } from 'lucide-react';

export default function PainExpansionEditor({ section, onChange }) {
  const update = (field, value) => onChange({ ...section, [field]: value });

  return (
    <EditorCard title="הרחבת בעיות" icon={AlertCircle} color="amber">
      <EditorField label="כותרת" value={section.title} onChange={(v) => update('title', v)} />
      <EditorField label="תיאור" value={section.description} onChange={(v) => update('description', v)} type="textarea" rows={3} />
      
      <div className="pt-2">
        <p className="text-xs font-bold text-slate-500 mb-2">פריטים:</p>
        <EditorItemList
          items={section.items || []}
          onUpdate={(items) => update('items', items)}
          createNew={() => ({ title: '', description: '' })}
          addLabel="הוסף פריט"
          maxItems={8}
          renderItem={(item, idx, onItemChange) => (
            <>
              <EditorField label="כותרת" value={item.title} onChange={(v) => onItemChange({ title: v })} />
              <EditorField label="תיאור" value={item.description} onChange={(v) => onItemChange({ description: v })} type="textarea" rows={2} />
            </>
          )}
        />
      </div>
    </EditorCard>
  );
}