import React, { useState } from 'react';
import { useOutreachTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '../../hooks/useOutreach';
import { TEMPLATE_TYPES } from '../../constants/outreach';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_VARS = { name: 'דני כהן', niche: 'פיננסים', domain: 'example.co.il', signature: 'יוסי, פרפקט וואן', value_proposition: 'אזכור הדדי במאמרים רלוונטיים' };

export default function OutreachTemplates() {
  const { data: templates = [], isLoading } = useOutreachTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'initial', subject_template: '', body_template: '', is_active: true });

  const openEditor = (template = null) => {
    if (template) {
      setEditing(template);
      setForm({ name: template.name, type: template.type, subject_template: template.subject_template, body_template: template.body_template, is_active: template.is_active });
    } else {
      setEditing(null);
      setForm({ name: '', type: 'initial', subject_template: '', body_template: '', is_active: true });
    }
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!form.name || !form.subject_template || !form.body_template) return toast.error('מלא את כל השדות');
    const variables = [...new Set((form.body_template + form.subject_template).match(/\{\{(\w+)\}\}/g)?.map(v => v.replace(/[{}]/g, '')) || [])];
    const payload = { ...form, variables_json: variables };

    if (editing) {
      updateTemplate.mutate({ id: editing.id, ...payload }, {
        onSuccess: () => { toast.success('תבנית עודכנה'); setShowEditor(false); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      createTemplate.mutate(payload, {
        onSuccess: () => { toast.success('תבנית נוצרה'); setShowEditor(false); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  const handleDelete = (id) => {
    if (!confirm('למחוק את התבנית?')) return;
    deleteTemplate.mutate({ id }, {
      onSuccess: () => toast.success('תבנית נמחקה'),
    });
  };

  const handleToggleActive = (template) => {
    updateTemplate.mutate({ id: template.id, is_active: !template.is_active });
  };

  const renderPreview = (text) => {
    let rendered = text;
    Object.entries(SAMPLE_VARS).forEach(([key, val]) => {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
    });
    return rendered;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">תבניות מייל</h1>
        <Button size="sm" onClick={() => openEditor()}>
          <Plus size={14} className="ml-1" /> תבנית חדשה
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText size={40} className="mx-auto mb-2 text-slate-300" />
          <p>אין תבניות עדיין</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-800">{t.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {TEMPLATE_TYPES.find(tt => tt.value === t.type)?.label || t.type}
                  </span>
                  {!t.is_active && <span className="text-xs text-red-400">לא פעיל</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={t.is_active} onCheckedChange={() => handleToggleActive(t)} />
                  <Button size="sm" variant="ghost" onClick={() => setPreview(preview === t.id ? null : t.id)}>
                    <Eye size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEditor(t)}>
                    <Pencil size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(t.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-600">נושא: {t.subject_template}</p>
              {t.variables_json?.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {(Array.isArray(t.variables_json) ? t.variables_json : []).map(v => (
                    <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono">{`{{${v}}}`}</span>
                  ))}
                </div>
              )}
              {preview === t.id && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border">
                  <p className="text-xs text-slate-400 mb-1">תצוגה מקדימה:</p>
                  <p className="text-sm font-medium text-slate-700 mb-2">נושא: {renderPreview(t.subject_template)}</p>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap">{renderPreview(t.body_template)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Template Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editing ? 'ערוך תבנית' : 'תבנית חדשה'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="שם התבנית *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue placeholder="סוג" /></SelectTrigger>
              <SelectContent>
                {TEMPLATE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div>
              <label className="text-xs text-slate-500">נושא (תומך ב-{'{{variables}}'})</label>
              <Input value={form.subject_template} onChange={e => setForm(f => ({ ...f, subject_template: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-500">גוף ההודעה (תומך ב-{'{{variables}}'})</label>
              <textarea
                className="w-full h-48 border rounded-lg p-3 text-sm"
                value={form.body_template}
                onChange={e => setForm(f => ({ ...f, body_template: e.target.value }))}
              />
            </div>
            <p className="text-xs text-slate-400">
              משתנים זמינים: {`{{name}}, {{niche}}, {{domain}}, {{signature}}, {{value_proposition}}`}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>ביטול</Button>
            <Button onClick={handleSave} disabled={createTemplate.isPending || updateTemplate.isPending}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
