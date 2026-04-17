import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutreachWebsiteDetail, useUpdateWebsite, useCreateContact, useCompleteOutreachTask } from '../../hooks/useOutreach';
import OutreachStatusBadge from '../../components/outreach/OutreachStatusBadge';
import { WEBSITE_STATUSES, CONTACT_SOURCES, OUTREACH_TASK_TYPES } from '../../constants/outreach';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowRight, ExternalLink, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { key: 'contacts', label: 'אנשי קשר' },
  { key: 'messages', label: 'הודעות' },
  { key: 'replies', label: 'תשובות' },
  { key: 'tasks', label: 'משימות' },
];

export default function OutreachWebsiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: website, isLoading } = useOutreachWebsiteDetail(id);
  const updateWebsite = useUpdateWebsite();
  const createContact = useCreateContact();
  const completeTask = useCompleteOutreachTask();

  const [tab, setTab] = useState('contacts');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ full_name: '', email: '', role: '', contact_source: 'manual', source_url: '' });

  if (isLoading || !website) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  const handleStatusChange = (status) => {
    updateWebsite.mutate({ id: website.id, status }, {
      onSuccess: () => toast.success('סטטוס עודכן'),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleScoreChange = (field, value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 100) return;
    updateWebsite.mutate({ id: website.id, [field]: num });
  };

  const handleAddContact = () => {
    if (!newContact.email) return toast.error('חובה להזין מייל');
    createContact.mutate({ ...newContact, website_id: website.id }, {
      onSuccess: () => {
        toast.success('איש קשר נוסף');
        setShowAddContact(false);
        setNewContact({ full_name: '', email: '', role: '', contact_source: 'manual', source_url: '' });
      },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/CRM/outreach/websites')}>
          <ArrowRight size={18} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1E3A5F]">{website.domain}</h1>
            <a href={`https://${website.domain}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} className="text-slate-400 hover:text-blue-500" />
            </a>
          </div>
          {website.name && <p className="text-sm text-slate-500">{website.name}</p>}
        </div>
        <Select value={website.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {WEBSITE_STATUSES.map(s => <SelectItem key={s.slug} value={s.slug}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border p-3">
          <span className="text-xs text-slate-400">סטטוס</span>
          <div className="mt-1"><OutreachStatusBadge value={website.status} type="website" /></div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <span className="text-xs text-slate-400">רלוונטיות</span>
          <Input
            type="number"
            min={0}
            max={100}
            className="mt-1 h-8"
            defaultValue={website.relevance_score}
            onBlur={e => handleScoreChange('relevance_score', e.target.value)}
          />
        </div>
        <div className="bg-white rounded-lg border p-3">
          <span className="text-xs text-slate-400">נישה</span>
          <p className="mt-1 text-sm font-medium">{website.niche || '—'}</p>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <span className="text-xs text-slate-400">שפה / מדינה</span>
          <p className="mt-1 text-sm font-medium">{website.language} / {website.country}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-[#1E3A5F] text-[#1E3A5F]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label} ({website[t.key]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'contacts' && (
        <div>
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => setShowAddContact(true)}>
              <Plus size={14} className="ml-1" /> הוסף איש קשר
            </Button>
          </div>
          {website.contacts.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">אין אנשי קשר</p>
          ) : (
            <div className="bg-white border rounded-lg overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3 text-right font-medium text-slate-600">שם</th>
                    <th className="p-3 text-right font-medium text-slate-600">מייל</th>
                    <th className="p-3 text-right font-medium text-slate-600">תפקיד</th>
                    <th className="p-3 text-right font-medium text-slate-600">מקור</th>
                    <th className="p-3 text-right font-medium text-slate-600">סטטוס מייל</th>
                  </tr>
                </thead>
                <tbody>
                  {website.contacts.map(c => (
                    <tr key={c.id} className="border-b">
                      <td className="p-3">
                        {c.full_name || '—'}{' '}
                        {c.is_primary && <span className="text-xs text-blue-500">(ראשי)</span>}
                      </td>
                      <td className="p-3 font-mono text-xs">{c.email}</td>
                      <td className="p-3 text-slate-500">{c.role || '—'}</td>
                      <td className="p-3 text-xs">
                        {CONTACT_SOURCES.find(s => s.value === c.contact_source)?.label || c.contact_source}
                      </td>
                      <td className="p-3">
                        <OutreachStatusBadge value={c.verified_email_status} type="message" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'messages' && (
        <div className="space-y-2">
          {website.messages.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">אין הודעות</p>
          ) : website.messages.map(m => (
            <div key={m.id} className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{m.subject}</span>
                <OutreachStatusBadge value={m.status} type="message" />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{m.sequence_step}</span>
                <span>{m.outreach_campaigns?.name || '—'}</span>
                {m.sent_at && <span>נשלח: {new Date(m.sent_at).toLocaleDateString('he-IL')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'replies' && (
        <div className="space-y-2">
          {website.replies.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">אין תשובות</p>
          ) : website.replies.map(r => (
            <div key={r.id} className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{r.subject || 'ללא נושא'}</span>
                <div className="flex gap-2">
                  <OutreachStatusBadge value={r.intent} type="intent" />
                  <OutreachStatusBadge value={r.sentiment} type="sentiment" />
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{r.body}</p>
              {r.ai_summary && <p className="text-xs text-blue-600 mt-1">AI: {r.ai_summary}</p>}
              <p className="text-xs text-slate-400 mt-1">{new Date(r.received_at).toLocaleDateString('he-IL')}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-2">
          {website.tasks.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">אין משימות</p>
          ) : website.tasks.map(t => (
            <div key={t.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">
                  {OUTREACH_TASK_TYPES.find(tt => tt.value === t.type)?.label || t.type}
                </span>
                {t.due_date && (
                  <span className="text-xs text-slate-400 mr-3">
                    {new Date(t.due_date).toLocaleDateString('he-IL')}
                  </span>
                )}
                {t.notes && <p className="text-xs text-slate-500 mt-1">{t.notes}</p>}
              </div>
              {t.status !== 'done' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => completeTask.mutate({ taskId: t.id }, { onSuccess: () => toast.success('משימה הושלמה') })}
                >
                  <Check size={14} className="ml-1" /> בוצע
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>הוסף איש קשר</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="שם מלא" value={newContact.full_name} onChange={e => setNewContact(c => ({ ...c, full_name: e.target.value }))} />
            <Input placeholder="מייל *" type="email" value={newContact.email} onChange={e => setNewContact(c => ({ ...c, email: e.target.value }))} />
            <Input placeholder="תפקיד" value={newContact.role} onChange={e => setNewContact(c => ({ ...c, role: e.target.value }))} />
            <Select value={newContact.contact_source} onValueChange={v => setNewContact(c => ({ ...c, contact_source: v }))}>
              <SelectTrigger><SelectValue placeholder="מקור" /></SelectTrigger>
              <SelectContent>
                {CONTACT_SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="URL מקור" value={newContact.source_url} onChange={e => setNewContact(c => ({ ...c, source_url: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddContact(false)}>ביטול</Button>
            <Button onClick={handleAddContact} disabled={createContact.isPending}>
              {createContact.isPending ? 'מוסיף...' : 'הוסף'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
