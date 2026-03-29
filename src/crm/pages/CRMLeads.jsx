import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search, Download, ChevronDown, ChevronUp, UserPlus, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

import StatusBadge from '../components/shared/StatusBadge';
import TemperatureBadge from '../components/shared/TemperatureBadge';
import SLAIndicator from '../components/shared/SLAIndicator';
import CreateLeadDialog from '../components/CreateLeadDialog';
import DeleteLeadDialog from '../components/DeleteLeadDialog';
import { usePipelineLeads, useAgents, useUpdateLeadStage, useBulkAction, useExportLeads } from '../hooks/useCRM';
import { PIPELINE_STAGES, TEMPERATURE_OPTIONS } from '../constants/pipeline';
import { toast } from 'sonner';

export default function CRMLeads() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterTemp, setFilterTemp] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAgent, setBulkAgent] = useState('');
  const [bulkStage, setBulkStage] = useState('');
  const [bulkTemp, setBulkTemp] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: leads = [], isLoading } = usePipelineLeads({});
  const { data: agents = [] } = useAgents();
  const updateStage = useUpdateLeadStage();
  const bulkAction = useBulkAction();
  const exportLeads = useExportLeads();

  // Filter + sort
  const filtered = useMemo(() => {
    let result = leads;

    if (filterStage !== 'all') result = result.filter(l => l.pipeline_stage === filterStage);
    if (filterAgent !== 'all') result = result.filter(l => l.agent_id === filterAgent);
    if (filterTemp !== 'all') result = result.filter(l => l.temperature === filterTemp);
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
  }, [leads, filterStage, filterAgent, filterTemp, search, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
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
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(l => l.id)));
    }
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

  const handleBulkTemp = () => {
    if (!bulkTemp || selectedIds.size === 0) return;
    bulkAction.mutate(
      { action: 'change_temperature', lead_ids: [...selectedIds], temperature: bulkTemp },
      {
        onSuccess: () => {
          toast.success(`טמפרטורה עודכנה ל-${selectedIds.size} לידים`);
          setSelectedIds(new Set());
          setBulkTemp('');
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
      {
        onError: (err) => toast.error(`שגיאה בייצוא: ${err.message}`),
      }
    );
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש..."
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
        <Select value={filterTemp} onValueChange={setFilterTemp}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="טמפרטורה" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            {TEMPERATURE_OPTIONS.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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

          <Select value={bulkTemp} onValueChange={setBulkTemp}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="טמפרטורה..." /></SelectTrigger>
            <SelectContent>
              {TEMPERATURE_OPTIONS.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 text-xs" onClick={handleBulkTemp} disabled={!bulkTemp || bulkAction.isPending}>
            עדכן
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

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-auto">
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
              <th className="p-3 text-right">טמפרטורה</th>
              <th className="p-3 text-right">SLA</th>
              <th className="p-3 text-right">נציג</th>
              <th className="p-3 text-right">מקור</th>
              <th className="p-3 text-right">שירות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => (
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
                <td className="p-3"><StatusBadge stage={lead.pipeline_stage} /></td>
                <td className="p-3">{lead.temperature && <TemperatureBadge temperature={lead.temperature} />}</td>
                <td className="p-3"><SLAIndicator deadline={lead.sla_deadline} /></td>
                <td className="p-3 text-xs text-slate-500">{lead.agent_name}</td>
                <td className="p-3 text-xs text-slate-400 truncate max-w-[120px]" title={lead.source_page}>{lead.source_page}</td>
                <td className="p-3 text-xs text-slate-500">{lead.service_type}</td>
              </tr>
            ))}
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
    </div>
  );
}
