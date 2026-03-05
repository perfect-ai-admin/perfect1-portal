import React from 'react';
import { EditorField, EditorCard } from './EditorField';
import EditorItemList from './EditorItemList';
import { BarChart3 } from 'lucide-react';

export default function StatsEditor({ section, onChange }) {
  const update = (field, value) => onChange({ ...section, [field]: value });

  return (
    <EditorCard title="מספרים / סטטיסטיקות" icon={BarChart3} color="blue">
      <EditorItemList
        items={section.items || []}
        onUpdate={(items) => update('items', items)}
        createNew={() => ({ value: '', label: '' })}
        addLabel="הוסף מספר"
        maxItems={8}
        renderItem={(item, idx, onItemChange) => (
          <div className="grid grid-cols-2 gap-3">
            <EditorField label="מספר" value={item.value} onChange={(v) => onItemChange({ value: v })} placeholder="500+" />
            <EditorField label="תיאור" value={item.label} onChange={(v) => onItemChange({ label: v })} placeholder="לקוחות מרוצים" />
          </div>
        )}
      />
    </EditorCard>
  );
}