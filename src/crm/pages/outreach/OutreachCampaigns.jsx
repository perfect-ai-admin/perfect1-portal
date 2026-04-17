import React, { useState } from 'react';
import { useOutreachCampaigns, useCreateCampaign, useUpdateCampaign, useOutreachTemplates } from '../../hooks/useOutreach';
import OutreachStatusBadge from '../../components/outreach/OutreachStatusBadge';
import { CAMPAIGN_TYPES, CAMPAIGN_STATUSES } from '../../constants/outreach';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pause, Play, Send, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function OutreachCampaigns() {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: campaigns = [], isLoading } = useOutreachCampaigns({ status: statusFilter });
  const { data: templates = [] } = useOutreachTemplates();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', campaign_type: 'collaboration', target_niche: '',
    sending_email: 'noreply@one-pai.com', daily_send_limit: 15,
    initial_template_id: '', followup1_template_id: '', followup2_template_id: '',
    followup1_delay_days: 4, followup2_delay_days: 8,
  });

  const handleCreate = () => {
    if (!form.name) return toast.error('חובה להזין שם');
    const payload = { ...form };
    if (!payload.initial_template_id) delete payload.initial_template_id;
    if (!payload.followup1_template_id) delete payload.followup1_template_id;
    if (!payload.followup2_template_id) delete payload.followup2_template_id;
    createCampaign.mutate(payload, {
      onSuccess: () => { toast.success('קמפיין נוצר'); setShowCreate(false); },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleTogglePause = (campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    updateCampaign.mutate({ id: campaign.id, status: newStatus }, {
      onSuccess: () => toast.success(newStatus === 'active' ? 'קמפיין הופעל' : 'קמפיין הושהה'),
      onError: (e) => toast.error(e.message),
    });
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
        <h1 className="text-2xl font-bold text-[#1E3A5F]">קמפיינים</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} className="ml-1" /> קמפיין חדש
        </Button>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="סטטוס" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">הכל</SelectItem>
          {CAMPAIGN_STATUSES.map(s => <SelectItem key={s.slug} value={s.slug}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {campaigns.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Target size={40} className="mx-auto mb-2 text-slate-300" />
          <p>אין קמפיינים עדיין</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(c => {
            const typeInfo = CAMPAIGN_TYPES.find(t => t.value === c.campaign_type);
            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => navigate(`/CRM/outreach/campaigns/${c.id}`)}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">{c.name}</h3>
                  <OutreachStatusBadge value={c.status} type="campaign" />
                </div>
                {typeInfo && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium mb-3 inline-block"
                    style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>
                    {typeInfo.label}
                  </span>
                )}
                <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-3 border-t">
                  <div>
                    <p className="text-lg font-bold text-slate-800">{c.stats?.sent || 0}</p>
                    <p className="text-[10px] text-slate-400">נשלחו</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{c.stats?.replied || 0}</p>
                    <p className="text-[10px] text-slate-400">ענו</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-500">{c.stats?.bounced || 0}</p>
                    <p className="text-[10px] text-slate-400">חזרו</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-xs text-slate-400">מגבלה: {c.daily_send_limit}/יום</span>
                  {(c.status === 'active' || c.status === 'paused') && (
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleTogglePause(c); }}>
                      {c.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>קמפיין חדש</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="שם הקמפיין *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Select value={form.campaign_type} onValueChange={v => setForm(f => ({ ...f, campaign_type: v }))}>
              <SelectTrigger><SelectValue placeholder="סוג קמפיין" /></SelectTrigger>
              <SelectContent>
                {CAMPAIGN_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="נישת יעד" value={form.target_niche} onChange={e => setForm(f => ({ ...f, target_niche: e.target.value }))} />
            <Input placeholder="מייל שליחה" value={form.sending_email} onChange={e => setForm(f => ({ ...f, sending_email: e.target.value }))} />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500">מגבלת שליחה יומית</label>
                <Input type="number" min={1} max={100} value={form.daily_send_limit} onChange={e => setForm(f => ({ ...f, daily_send_limit: parseInt(e.target.value) || 15 }))} />
              </div>
            </div>
            <div className="border-t pt-3 space-y-2">
              <p className="text-sm font-medium text-slate-600">תבניות</p>
              <Select value={form.initial_template_id} onValueChange={v => setForm(f => ({ ...f, initial_template_id: v }))}>
                <SelectTrigger><SelectValue placeholder="תבנית ראשונית" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ללא</SelectItem>
                  {templates.filter(t => t.is_active).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.followup1_template_id} onValueChange={v => setForm(f => ({ ...f, followup1_template_id: v }))}>
                <SelectTrigger><SelectValue placeholder="תבנית מעקב 1" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ללא</SelectItem>
                  {templates.filter(t => t.is_active).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-500">השהיה מעקב 1 (ימים)</label>
                  <Input type="number" min={1} max={30} value={form.followup1_delay_days} onChange={e => setForm(f => ({ ...f, followup1_delay_days: parseInt(e.target.value) || 4 }))} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500">השהיה מעקב 2 (ימים)</label>
                  <Input type="number" min={1} max={30} value={form.followup2_delay_days} onChange={e => setForm(f => ({ ...f, followup2_delay_days: parseInt(e.target.value) || 8 }))} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>ביטול</Button>
            <Button onClick={handleCreate} disabled={createCampaign.isPending}>
              {createCampaign.isPending ? 'יוצר...' : 'צור קמפיין'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
