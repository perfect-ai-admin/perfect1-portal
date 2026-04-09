import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search, Download, ChevronDown, ChevronUp, UserPlus, Trash2,
  MessageSquare, Save, X, Phone, MessageCircle, Mail, ExternalLink,
  Calendar, AlertCircle, Clock
} from 'lucide-react';
import { format, isToday, isBefore, startOfDay, endOfDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

import StatusBadge from '../components/shared/StatusBadge';
import LostReasonDialog from '../components/shared/LostReasonDialog';
import CreateLeadDialog from '../components/CreateLeadDialog';
import DeleteLeadDialog from '../components/DeleteLeadDialog';
import { usePipelineLeads, useAgents, useUpdateLeadStage, useAddLeadNote, useBulkAction, useExportLeads, useUpdateFollowupDate } from '../hooks/useCRM';
import { PIPELINE_STAGES } from '../constants/pipeline';
import { toast } from 'sonner';

// Source labels
const SOURCE_LABELS = {
  website: 'אתר',
  whatsapp: 'WhatsApp',
  phone: 'טלפון',
  facebook: 'פייסבוק',
  google: 'גוגל',
  referral: 'הפניה',
  manual: 'ידני',
  bot: 'בוט',
};

// Follow-up date color logic
function getFollowupColor(dateStr) {
  if (!dateStr) return null;
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  const today = startOfDay(new Date());
  if (isBefore(date, today)) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'באיחור' };
  if (isToday(date)) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', label: 'היום' };
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  if (isBefore(date, weekEnd)) return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: 'השבוע' };
  return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: '' };
}

export default function CRMLeads() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterFollowup, setFilterFollowup] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAgent, setBulkAgent] = useState('');
  const [bulkStage, setBulkStage] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [pendingLostLead, setPendingLostLead] = useState(null);
  const [pendingLostStage, setPendingLostStage] = useState(null);
  const [editingFollowup, setEditingFollowup] = useState(null);

  const { data: leads = [], isLoading } = usePipelineLeads({});
  const { data: agents = [] } = useAgents();
  const updateStage = useUpdateLeadStage();
  const addNote = useAddLeadNote();
  const bulkAction = useBulkAction();
  const exportLeads = useExportLeads();
  const updateFollowup = useUpdateFollowupDate();

  // Inline stage change
  const handleInlineStageChange = (leadId, newStage) => {
    const closedLostStages = ['not_interested', 'disqualified'];
    if (closedLostStages.includes(newStage)) {
      setPendingLostLead(leadId);
      setPendingLostStage(newStage);
      setShowLostDialog(true);
      return;
    }
    updateStage.mutate(
      { lead_id: leadId, new_stage: newStage },
      {
        onSuccess: () => toast.success('שלב עודכן'),
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  const handleLostConfirm = (lostData) => {
    updateStage.mutate(
      { lead_id: pendingLostLead, new_stage: pendingLostStage, ...lostData },
      {
        onSuccess: () => {
          toast.success('הליד נסגר');
          setShowLostDialog(false);
          setPendingLostLead(null);
          setPendingLostStage(null);
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  // Save note to lead_notes table
  const handleSaveNote = (leadId) => {
    if (!noteText.trim()) return;
    addNote.mutate(
      { lead_id: leadId, note: noteText.trim() },
      {
        onSuccess: () => {
          toast.success('הערה נשמרה');
          setEditingNote(null);
          setNoteText('');
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  // Save follow-up date
  const handleSaveFollowup = (leadId, date) => {
    updateFollowup.mutate(
      { lead_id: leadId, next_followup_date: date || null },
      {
        onSuccess: () => {
          toast.success('תאריך חזרה עודכן');
          setEditingFollowup(null);
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  // Filter + sort
  const filtered = useMemo(() => {
    let result = leads;

    if (filterStage !== 'all') result = result.filter(l => l.pipeline_stage === filterStage);
    if (filterAgent !== 'all') result = result.filter(l => l.agent_id === filterAgent);
    if (filterSource !== 'all') result = result.filter(l => l.lead_source === filterSource);

    // Follow-up filter
    if (filterFollowup !== 'all') {
      const today = startOfDay(new Date());
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
      if (filterFollowup === 'overdue') {
        result = result.filter(l => l.next_followup_date && isBefore(parseISO(l.next_followup_date), today));
      } else if (filterFollowup === 'today') {
        result = result.filter(l => l.next_followup_date && isToday(parseISO(l.next_followup_date)));
      } else if (filterFollowup === 'week') {
        result = result.filter(l => {
          if (!l.next_followup_date) return false;
          const d = parseISO(l.next_followup_date);
          return !isBefore(d, today) && isBefore(d, weekEnd);
        });
      }
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l =>
        (l.name || '').toLowerCase().includes(s) ||
        (l.phone || '').includes(s) ||
        (l.email || '').toLowerCase().includes(s)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [leads, filterStage, filterAgent, filterSource, filterFollowup, search, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(l => l.id)));
  };

  const handleBulkAssign = async () => {
    if (!bulkAgent || selectedIds.size === 0) return;
    bulkAction.mutate(
      { action: 'assign_agent', lead_ids: [...selectedIds], agent_id: bulkAgent },
      {
        onSuccess: () => {
          toast.success(`${selectedIds.size} לידים שויכו`);
          setSelectedIds(new Set());
          setBulkAgent('');
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  const handleBulkStage = () => {
    if (!bulkStage || selectedIds.size === 0) return;
    bulkAction.mutate(
      { action: 'change_stage', lead_ids: [...selectedIds], new_stage: bulkStage },
      {
        onSuccess: () => {
          toast.success(`שלב עודכן ל-${selectedIds.size} לידים`);
          setSelectedIds(new Set());
          setBulkStage('');
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    bulkAction.mutate(
      { action: 'delete', lead_ids: [...selectedIds] },
      {
        onSuccess: () => {
          toast.success(`${selectedIds.size} לידים נמחקו`);
          setSelectedIds(new Set());
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const handleExport = () => {
    exportLeads.mutate(
      { stage: filterStage !== 'all' ? filterStage : undefined },
      { onError: (err) => toast.error(`שגיאה בייצוא: ${err.message}`) }
    );
  };

  // Unique sources from leads
  const availableSources = useMemo(() => {
    const sources = new Set(leads.map(l => l.lead_source).filter(Boolean));
    return [...sources];
  }, [leads]);

  // Follow-up stats
  const followupStats = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    let overdue = 0, todayCount = 0, weekCount = 0;
    leads.forEach(l => {
      if (!l.next_followup_date) return;
      const d = parseISO(l.next_followup_date);
      if (isBefore(d, today)) overdue++;
      else if (isToday(d)) todayCount++;
      else if (isBefore(d, weekEnd)) weekCount++;
    });
    return { overdue, today: todayCount, week: weekCount };
  }, [leads]);

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
        <h1 className="text-xl font-bold text-[#1E3A5F]">לידים ({filtered.length})</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exportLeads.isPending}>
            <Download size={14} className="ml-1" /> {exportLeads.isPending ? 'מייצא...' : 'ייצוא CSV'}
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)} className="bg-[#1E3A5F] hover:bg-[#16324f]">
            <UserPlus size={14} className="ml-1" /> ליד חדש
          </Button>
        </div>
      </div>

      {/* Follow-up summary bar */}
      {(followupStats.overdue > 0 || followupStats.today > 0) && (
        <div className="flex flex-wrap gap-2">
          {followupStats.overdue > 0 && (
            <button
              onClick={() => setFilterFollowup(filterFollowup === 'overdue' ? 'all' : 'overdue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterFollowup === 'overdue' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
              }`}
            >
              <AlertCircle size={12} /> {followupStats.overdue} באיחור
            </button>
          )}
          {followupStats.today > 0 && (
            <button
              onClick={() => setFilterFollowup(filterFollowup === 'today' ? 'all' : 'today')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterFollowup === 'today' ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
              }`}
            >
              <Clock size={12} /> {followupStats.today} לחזרה היום
            </button>
          )}
          {followupStats.week > 0 && (
            <button
              onClick={() => setFilterFollowup(filterFollowup === 'week' ? 'all' : 'week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterFollowup === 'week' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <Calendar size={12} /> {followupStats.week} השבוע
            </button>
          )}
          {filterFollowup !== 'all' && (
            <button
              onClick={() => setFilterFollowup('all')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-slate-500 hover:text-slate-700"
            >
              <X size={12} /> נקה סינון
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם או טלפון..."
            className="pr-9"
          />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="שלב" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל השלבים</SelectItem>
            {PIPELINE_STAGES.map(s => (
              <SelectItem key={s.slug} value={s.slug}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="נציג" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הנציגים</SelectItem>
            {agents.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="מקור" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל המקורות</SelectItem>
            {availableSources.map(s => (
              <SelectItem key={s} value={s}>{SOURCE_LABELS[s] || s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="text-sm font-semibold text-blue-800 ml-1">{selectedIds.size} נבחרו</span>

          <Select value={bulkAgent} onValueChange={setBulkAgent}>
            <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="שייך לנציג..." /></SelectTrigger>
            <SelectContent>
              {agents.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 text-xs" onClick={handleBulkAssign} disabled={!bulkAgent || bulkAction.isPending}>
            שייך
          </Button>

          <Select value={bulkStage} onValueChange={setBulkStage}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="שנה שלב..." /></SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGES.map(s => (
                <SelectItem key={s.slug} value={s.slug}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 text-xs" onClick={handleBulkStage} disabled={!bulkStage || bulkAction.isPending}>
            עדכן שלב
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50"
            onClick={handleBulkDelete}
            disabled={bulkAction.isPending}
          >
            <Trash2 size={12} className="ml-1" /> מחק
          </Button>

          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setSelectedIds(new Set())}>
            בטל
          </Button>
        </div>
      )}

      {/* Mobile Card List */}
      <div className="md:hidden space-y-2">
        {filtered.map(lead => {
          const phone = (lead.phone || '').replace(/\D/g, '');
          const intlPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
          const followupColor = getFollowupColor(lead.next_followup_date);
          return (
            <div
              key={lead.id}
              className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer active:bg-slate-50"
              onClick={() => navigate(`/CRM/leads/${lead.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-slate-900 truncate">{lead.name || 'ללא שם'}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">{lead.phone}</p>
                </div>
                <StatusBadge stage={lead.pipeline_stage} />
              </div>
              {followupColor && (
                <div className={`text-xs px-2 py-1 rounded mb-2 ${followupColor.bg} ${followupColor.text}`}>
                  {followupColor.label} — {format(parseISO(lead.next_followup_date), 'dd/MM')}
                </div>
              )}
              {lead.last_note && (
                <p className="text-xs text-slate-400 truncate mb-2">{lead.last_note}</p>
              )}
              {/* UTM info */}
              {lead.utm_source && (
                <p className="text-xs text-slate-400 mb-2">מקור: {lead.utm_source} {lead.utm_campaign ? `/ ${lead.utm_campaign}` : ''}</p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {lead.phone && (
                  <button
                    onClick={e => { e.stopPropagation(); window.open(`tel:${lead.phone}`, '_self'); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 min-h-[44px] text-sm"
                  >
                    <Phone size={16} /> התקשר
                  </button>
                )}
                {lead.phone && (
                  <button
                    onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${intlPhone}`, '_blank'); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 min-h-[44px] text-sm"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                )}
                {lead.email && (
                  <button
                    onClick={e => { e.stopPropagation(); window.open(`mailto:${lead.email}`, '_self'); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 min-h-[44px] text-sm"
                  >
                    <Mail size={16} /> מייל
                  </button>
                )}
                <button
                  onClick={e => { e.stopPropagation(); setDeleteTarget(lead); }}
                  className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-400">אין לידים מתאימים</div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 w-10">
                <Checkbox
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onCheckedChange={toggleAll}
                />
              </th>
              <th className="p-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('created_at')}>
                <span className="flex items-center gap-1">תאריך <SortIcon field="created_at" /></span>
              </th>
              <th className="p-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('name')}>
                <span className="flex items-center gap-1">שם <SortIcon field="name" /></span>
              </th>
              <th className="p-3 text-right">טלפון</th>
              <th className="p-3 text-right">שלב</th>
              <th className="p-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('next_followup_date')}>
                <span className="flex items-center gap-1">חזרה <SortIcon field="next_followup_date" /></span>
              </th>
              <th className="p-3 text-right">הערה אחרונה</th>
              <th className="p-3 text-right">מקור</th>
              <th className="p-3 text-right">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => {
              const phone = (lead.phone || '').replace(/\D/g, '');
              const intlPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
              const followupColor = getFollowupColor(lead.next_followup_date);

              return (
                <tr
                  key={lead.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate(`/CRM/leads/${lead.id}`)}
                >
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(lead.id)}
                      onCheckedChange={() => toggleSelect(lead.id)}
                    />
                  </td>
                  <td className="p-3 text-xs text-slate-500">
                    {lead.created_at ? format(new Date(lead.created_at), 'dd/MM HH:mm') : ''}
                  </td>
                  <td className="p-3 font-medium">{lead.name || 'ללא שם'}</td>
                  <td className="p-3 text-slate-600 font-mono text-xs" dir="ltr">{lead.phone}</td>
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <Select
                      value={lead.pipeline_stage || 'new_lead'}
                      onValueChange={(val) => handleInlineStageChange(lead.id, val)}
                    >
                      <SelectTrigger className="h-7 text-xs w-[130px] border-none bg-transparent hover:bg-slate-100 px-1">
                        <StatusBadge stage={lead.pipeline_stage} />
                      </SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STAGES.map(s => (
                          <SelectItem key={s.slug} value={s.slug}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  {/* Follow-up date */}
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    {editingFollowup === lead.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          defaultValue={lead.next_followup_date || ''}
                          className="h-7 text-xs border border-slate-200 rounded px-1"
                          autoFocus
                          onChange={e => handleSaveFollowup(lead.id, e.target.value)}
                          onBlur={() => setEditingFollowup(null)}
                          onKeyDown={e => { if (e.key === 'Escape') setEditingFollowup(null); }}
                        />
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={() => setEditingFollowup(lead.id)}
                      >
                        {lead.next_followup_date ? (
                          <span className={`text-xs px-2 py-0.5 rounded border ${followupColor?.bg} ${followupColor?.text} ${followupColor?.border}`}>
                            {followupColor?.label ? `${followupColor.label} ` : ''}
                            {format(parseISO(lead.next_followup_date), 'dd/MM')}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300 hover:text-slate-500">+ חזרה</span>
                        )}
                      </div>
                    )}
                  </td>
                  {/* Note */}
                  <td className="p-3 max-w-[200px]" onClick={e => e.stopPropagation()}>
                    {editingNote === lead.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="כתוב הערה..."
                          className="h-7 text-xs"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveNote(lead.id);
                            if (e.key === 'Escape') { setEditingNote(null); setNoteText(''); }
                          }}
                        />
                        <button
                          onClick={() => handleSaveNote(lead.id)}
                          className="text-green-600 hover:text-green-700 p-0.5"
                          disabled={addNote.isPending}
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => { setEditingNote(null); setNoteText(''); }}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-1 group"
                        onClick={() => { setEditingNote(lead.id); setNoteText(''); }}
                      >
                        {lead.last_note ? (
                          <span className="text-xs text-slate-500 truncate max-w-[160px]" title={lead.last_note}>
                            {lead.last_note}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300 group-hover:text-slate-500">
                            + הוסף הערה
                          </span>
                        )}
                        <MessageSquare size={12} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                      </div>
                    )}
                  </td>
                  {/* Source with landing page link */}
                  <td className="p-3 text-xs" onClick={e => e.stopPropagation()}>
                    <div className="flex flex-col gap-0.5">
                      {(() => {
                        // Build the actual landing page URL
                        const landingUrl = lead.landing_url;
                        const sourcePage = lead.source_page;

                        if (landingUrl) {
                          // Full URL stored — use as-is
                          const href = landingUrl.startsWith('http') ? landingUrl : 'https://' + landingUrl;
                          const label = (() => { try { return new URL(href).pathname || '/'; } catch { return landingUrl; } })();
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
                              title={href}>
                              <ExternalLink size={10} className="flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{label === '/' ? 'דף הבית' : label}</span>
                            </a>
                          );
                        }

                        if (sourcePage && sourcePage !== 'portal' && sourcePage !== 'main' && sourcePage !== 'הוספה ידנית') {
                          // source_page is a slug like "osek-patur" — build link to perfect1.co.il
                          const href = `https://perfect1.co.il/${sourcePage}`;
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
                              title={href}>
                              <ExternalLink size={10} className="flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{sourcePage}</span>
                            </a>
                          );
                        }

                        return <span className="text-slate-400">{SOURCE_LABELS[lead.lead_source] || sourcePage || lead.lead_source || '—'}</span>;
                      })()}
                      {lead.utm_source && (
                        <span className="text-slate-400 truncate max-w-[120px]" title={`${lead.utm_source}${lead.utm_campaign ? ' / ' + lead.utm_campaign : ''}`}>
                          {lead.utm_source}{lead.utm_campaign ? ` / ${lead.utm_campaign}` : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Quick actions */}
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-0.5">
                      {lead.phone && (
                        <button
                          onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Phone size={12} /> חייג
                        </button>
                      )}
                      {lead.phone && (
                        <button
                          onClick={() => window.open(`https://wa.me/${intlPhone}`, '_blank')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <MessageCircle size={12} />
                        </button>
                      )}
                      {lead.email && (
                        <button
                          onClick={() => window.open(`mailto:${lead.email}`, '_self')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          <Mail size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-400">אין לידים מתאימים</div>
        )}
      </div>

      <CreateLeadDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      {deleteTarget && (
        <DeleteLeadDialog
          open={!!deleteTarget}
          onOpenChange={(v) => !v && setDeleteTarget(null)}
          lead={deleteTarget}
          onDeleted={() => setDeleteTarget(null)}
        />
      )}

      <LostReasonDialog
        open={showLostDialog}
        onOpenChange={(v) => {
          setShowLostDialog(v);
          if (!v) { setPendingLostLead(null); setPendingLostStage(null); }
        }}
        onConfirm={handleLostConfirm}
        isLoading={updateStage.isPending}
      />
    </div>
  );
}
