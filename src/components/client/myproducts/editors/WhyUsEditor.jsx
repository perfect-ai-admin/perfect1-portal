import React from 'react';
import { EditorField, EditorCard } from './EditorField';
import EditorItemList from './EditorItemList';
import { Award } from 'lucide-react';

export default function WhyUsEditor({ section, onChange }) {
  const update = (field, value) => onChange({ ...section, [field]: value });

  return (
    <EditorCard title="למה אנחנו" icon={Award} color="purple">
      <EditorField label="כותרת" value={section.title} onChange={(v) => update('title', v)} />
      <EditorField label="תיאור" value={section.description} onChange={(v) => update('description', v)} type="textarea" rows={2} />
      
      <div className="pt-2">
        <p className="text-xs font-bold text-slate-500 mb-2">יתרונות:</p>
        <EditorItemList
          items={section.items || []}
          onUpdate={(items) => update('items', items)}
          createNew={() => ({ title: '', description: '' })}
          addLabel="הוסף יתרון"
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