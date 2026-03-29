import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search, Download, Filter, ChevronDown, ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

import StatusBadge from '../components/shared/StatusBadge';
import TemperatureBadge from '../components/shared/TemperatureBadge';
import SLAIndicator from '../components/shared/SLAIndicator';
import { usePipelineLeads, useAgents, useUpdateLeadStage } from '../hooks/useCRM';
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

  const { data: leads = [], isLoading } = usePipelineLeads({});
  const { data: agents = [] } = useAgents();
  const updateStage = useUpdateLeadStage();

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
    for (const id of selectedIds) {
      await updateStage.mutateAsync({
        lead_id: id,
        new_stage: leads.find(l => l.id === id)?.pipeline_stage || 'new_lead',
        agent_id: bulkAgent,
      });
    }
    toast.success(`${selectedIds.size} לידים שויכו`);
    setSelectedIds(new Set());
    setBulkAgent('');
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const handleExport = () => {
    const headers = ['שם', 'טלפון', 'אימייל', 'שלב', 'טמפרטורה', 'נציג', 'תאריך'];
    const rows = filtered.map(l => [
      l.name, l.phone, l.email, l.pipeline_stage, l.temperature, l.agent_name, l.created_at
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download size={14} className="ml-1" /> ייצוא CSV
        </Button>
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
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="text-sm font-medium">{selectedIds.size} נבחרו</span>
          <Select value={bulkAgent} onValueChange={setBulkAgent}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="שייך לנציג..." /></SelectTrigger>
            <SelectContent>
              {agents.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleBulkAssign} disabled={!bulkAgent}>
            שייך
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
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
                <td className="p-3 text-xs text-slate-500">{lead.service_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-400">אין לידים מתאימים</div>
        )}
      </div>
    </div>
  );
}
