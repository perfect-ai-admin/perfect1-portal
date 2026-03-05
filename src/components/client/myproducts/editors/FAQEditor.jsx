import React from 'react';
import { EditorField, EditorCard } from './EditorField';
import EditorItemList from './EditorItemList';
import { HelpCircle } from 'lucide-react';

export default function FAQEditor({ section, onChange }) {
  const update = (field, value) => onChange({ ...section, [field]: value });

  return (
    <EditorCard title="שאלות נפוצות" icon={HelpCircle} color="green">
      <EditorField label="כותרת" value={section.title} onChange={(v) => update('title', v)} />
      
      <div className="pt-2">
        <p className="text-xs font-bold text-slate-500 mb-2">שאלות ותשובות:</p>
        <EditorItemList
          items={section.items || []}
          onUpdate={(items) => update('items', items)}
          createNew={() => ({ question: '', answer: '' })}
          addLabel="הוסף שאלה"
          maxItems={15}
          renderItem={(item, idx, onItemChange) => (
            <>
              <EditorField label="שאלה" value={item.question} onChange={(v) => onItemChange({ question: v })} />
              <EditorField label="תשובה" value={item.answer} onChange={(v) => onItemChange({ answer: v })} type="textarea" rows={3} />
            </>
          )}
        />
      </div>
    </EditorCard>
  );
}