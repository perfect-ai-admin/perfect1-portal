import React from 'react';
import { EditorField, EditorCard } from './EditorField';
import EditorItemList from './EditorItemList';
import { ListOrdered } from 'lucide-react';

export default function HowItWorksEditor({ section, onChange }) {
  const update = (field, value) => onChange({ ...section, [field]: value });

  return (
    <EditorCard title="איך זה עובד / שלבים" icon={ListOrdered} color="green">
      <EditorField label="כותרת" value={section.title} onChange={(v) => update('title', v)} />
      
      <div className="pt-2">
        <p className="text-xs font-bold text-slate-500 mb-2">שלבים:</p>
        <EditorItemList
          items={section.steps || []}
          onUpdate={(steps) => update('steps', steps)}
          createNew={() => ({ step: String((section.steps?.length || 0) + 1), title: '', description: '' })}
          addLabel="הוסף שלב"
          maxItems={8}
          renderItem={(item, idx, onItemChange) => (
            <>
              <div className="grid grid-cols-[60px_1fr] gap-3">
                <EditorField label="מספר" value={item.step} onChange={(v) => onItemChange({ step: v })} />
                <EditorField label="כותרת" value={item.title} onChange={(v) => onItemChange({ title: v })} />
              </div>
              <EditorField label="תיאור" value={item.description} onChange={(v) => onItemChange({ description: v })} type="textarea" rows={2} />
            </>
          )}
        />
      </div>
    </EditorCard>
  );
}