import React from 'react';
import { EditorField, EditorCard } from './EditorField';
import EditorItemList from './EditorItemList';
import { Star } from 'lucide-react';

export default function TestimonialsEditor({ section, onChange }) {
  const update = (field, value) => onChange({ ...section, [field]: value });

  return (
    <EditorCard title="המלצות לקוחות" icon={Star} color="amber">
      <EditorField label="כותרת" value={section.title} onChange={(v) => update('title', v)} />
      
      <div className="pt-2">
        <p className="text-xs font-bold text-slate-500 mb-2">המלצות:</p>
        <EditorItemList
          items={section.items || []}
          onUpdate={(items) => update('items', items)}
          createNew={() => ({ name: '', text: '', role: '' })}
          addLabel="הוסף המלצה"
          maxItems={9}
          renderItem={(item, idx, onItemChange) => (
            <>
              <div className="grid grid-cols-2 gap-3">
                <EditorField label="שם" value={item.name} onChange={(v) => onItemChange({ name: v })} />
                <EditorField label="תפקיד" value={item.role} onChange={(v) => onItemChange({ role: v })} />
              </div>
              <EditorField label="ציטוט" value={item.text} onChange={(v) => onItemChange({ text: v })} type="textarea" rows={2} />
            </>
          )}
        />
      </div>
    </EditorCard>
  );
}