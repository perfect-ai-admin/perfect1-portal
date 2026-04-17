import React, { useState } from 'react';
import { useOutreachWebsites, useCreateWebsite, useBulkUpdateWebsites, useImportWebsitesCSV } from '../../hooks/useOutreach';
import OutreachStatusBadge from '../../components/outreach/OutreachStatusBadge';
import { WEBSITE_STATUSES } from '../../constants/outreach';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Upload, Globe, Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function OutreachWebsites() {
  const [filters, setFilters] = useState({ status: 'all', search: '', niche: '' });
  const { data: websites = [], isLoading } = useOutreachWebsites(filters);
  const createWebsite = useCreateWebsite();
  const bulkUpdate = useBulkUpdateWebsites();
  const importCSV = useImportWebsitesCSV();
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newSite, setNewSite] = useState({ domain: '', name: '', niche: '', country: 'IL', language: 'he', notes: '' });
  const [csvText, setCsvText] = useState('');

  const allSelected = websites.length > 0 && selected.length === websites.length;

  const handleToggleAll = () => {
    setSelected(allSelected ? [] : websites.map(w => w.id));
  };

  const handleToggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkAction = (status) => {
    if (selected.length === 0) return;
    bulkUpdate.mutate({ ids: selected, updates: { status } }, {
      onSuccess: () => { toast.success(`${selected.length} אתרים עודכנו`); setSelected([]); },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleAddSite = () => {
    if (!newSite.domain) return toast.error('חובה להזין דומיין');
    createWebsite.mutate(newSite, {
      onSuccess: () => {
        toast.success('אתר נוסף');
        setShowAdd(false);
        setNewSite({ domain: '', name: '', niche: '', country: 'IL', language: 'he', notes: '' });
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleImportCSV = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      return obj;
    }).filter(r => r.domain);

    importCSV.mutate(rows, {
      onSuccess: (data) => { toast.success(`${data?.length || 0} אתרים יובאו`); setShowImport(false); setCsvText(''); },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">אתרים</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowImport(true)}>
            <Upload size={14} className="ml-1" /> ייבוא CSV
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} className="ml-1" /> הוסף אתר
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="חפש דומיין..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="pr-9"
          />
        </div>
        <Select value={filters.status} onValueChange={v => setFilters(f => ({ ...f, status: v }))}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="סטטוס" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            {WEBSITE_STATUSES.map(s => <SelectItem key={s.slug} value={s.slug}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          placeholder="נישה..."
          value={filters.niche}
          onChange={e => setFilters(f => ({ ...f, niche: e.target.value }))}
          className="w-[150px]"
        />
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
          <span className="text-sm font-medium text-blue-700">{selected.length} נבחרו</span>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction('approved')}>אשר</Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction('rejected')}>דחה</Button>
          <Button size="sm" variant="destructive" onClick={() => handleBulkAction('do_not_contact')}>אל תפנה</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>בטל בחירה</Button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
        </div>
      ) : websites.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Globe size={40} className="mx-auto mb-2 text-slate-300" />
          <p>אין אתרים עדיין</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 text-right w-10">
                    <Checkbox checked={allSelected} onCheckedChange={handleToggleAll} />
                  </th>
                  <th className="p-3 text-right font-medium text-slate-600">דומיין</th>
                  <th className="p-3 text-right font-medium text-slate-600">נישה</th>
                  <th className="p-3 text-right font-medium text-slate-600">סטטוס</th>
                  <th className="p-3 text-right font-medium text-slate-600">רלוונטיות</th>
                  <th className="p-3 text-right font-medium text-slate-600">אנשי קשר</th>
                  <th className="p-3 text-right font-medium text-slate-600">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {websites.map(w => (
                  <tr key={w.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/CRM/outreach/websites/${w.id}`)}>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <Checkbox checked={selected.includes(w.id)} onCheckedChange={() => handleToggle(w.id)} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{w.domain}</span>
                        <a href={`https://${w.domain}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                          <ExternalLink size={12} className="text-slate-400 hover:text-blue-500" />
                        </a>
                      </div>
                      {w.name && <p className="text-xs text-slate-400">{w.name}</p>}
                    </td>
                    <td className="p-3 text-slate-600">{w.niche || '—'}</td>
                    <td className="p-3"><OutreachStatusBadge value={w.status} type="website" /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${w.relevance_score}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{w.relevance_score}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{w.outreach_contacts?.length || 0}</td>
                    <td className="p-3 text-xs text-slate-400">{new Date(w.created_at).toLocaleDateString('he-IL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {websites.map(w => (
              <div key={w.id} className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer" onClick={() => navigate(`/CRM/outreach/websites/${w.id}`)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800 text-sm">{w.domain}</span>
                  <OutreachStatusBadge value={w.status} type="website" />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {w.niche && <span>{w.niche}</span>}
                  <span>רלוונטיות: {w.relevance_score}</span>
                  <span>{w.outreach_contacts?.length || 0} אנשי קשר</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Website Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>הוסף אתר</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="דומיין *" value={newSite.domain} onChange={e => setNewSite(s => ({ ...s, domain: e.target.value }))} />
            <Input placeholder="שם האתר" value={newSite.name} onChange={e => setNewSite(s => ({ ...s, name: e.target.value }))} />
            <Input placeholder="נישה" value={newSite.niche} onChange={e => setNewSite(s => ({ ...s, niche: e.target.value }))} />
            <Input placeholder="הערות" value={newSite.notes} onChange={e => setNewSite(s => ({ ...s, notes: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>ביטול</Button>
            <Button onClick={handleAddSite} disabled={createWebsite.isPending}>
              {createWebsite.isPending ? 'מוסיף...' : 'הוסף'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>ייבוא אתרים מ-CSV</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">הדביקו CSV עם עמודות: domain, name, niche, country, language</p>
          <textarea
            className="w-full h-40 border rounded-lg p-3 text-sm font-mono"
            placeholder={"domain,name,niche\nexample.com,Example Site,finance"}
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>ביטול</Button>
            <Button onClick={handleImportCSV} disabled={importCSV.isPending}>
              {importCSV.isPending ? 'מייבא...' : 'ייבא'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
