import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function EditorField({ label, value, onChange, placeholder, type = 'text', rows, dir, hint }) {
  const Component = type === 'textarea' ? Textarea : Input;
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <Component
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        rows={rows}
        className="text-sm"
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function EditorCard({ title, icon: Icon, children, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-50 to-blue-100/50 border-blue-200 text-blue-700',
    green: 'from-green-50 to-green-100/50 border-green-200 text-green-700',
    purple: 'from-purple-50 to-purple-100/50 border-purple-200 text-purple-700',
    amber: 'from-amber-50 to-amber-100/50 border-amber-200 text-amber-700',
    rose: 'from-rose-50 to-rose-100/50 border-rose-200 text-rose-700',
    slate: 'from-slate-50 to-slate-100/50 border-slate-200 text-slate-700',
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${colors[color]} overflow-hidden`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-inherit/50">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="font-bold text-sm">{title}</span>
      </div>
      <div className="p-4 space-y-4 bg-white/60">
        {children}
      </div>
    </div>
  );
}