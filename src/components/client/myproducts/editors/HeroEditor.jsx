import React from 'react';
import { EditorField, EditorCard } from './EditorField';
import { Sparkles } from 'lucide-react';

export default function HeroEditor({ section, onChange }) {
  const update = (field, value) => onChange({ ...section, [field]: value });

  return (
    <EditorCard title="סקציית Hero - כותרת ראשית" icon={Sparkles} color="purple">
      <EditorField label="כותרת ראשית" value={section.title} onChange={(v) => update('title', v)} placeholder="הכותרת הראשית של הדף" />
      <EditorField label="כותרת משנה" value={section.subtitle} onChange={(v) => update('subtitle', v)} type="textarea" rows={2} placeholder="תיאור קצר מתחת לכותרת" />
      <EditorField label="תג (Badge)" value={section.badge} onChange={(v) => update('badge', v)} placeholder="למשל: המובילים בתחום" />
      <EditorField label="טקסט כפתור" value={section.ctaText} onChange={(v) => update('ctaText', v)} placeholder="התחל עכשיו" />
      <EditorField label="תיאור תמונת רקע (AI)" value={section.image_prompt} onChange={(v) => update('image_prompt', v)} type="textarea" rows={2} hint="תיאור באנגלית ליצירת תמונת רקע אוטומטית" />
    </EditorCard>
  );
}