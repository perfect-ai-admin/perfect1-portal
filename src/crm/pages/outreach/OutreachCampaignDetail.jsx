import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutreachCampaignDetail, useUpdateCampaign, useApproveMessage, useBulkApproveMessages, useGenerateDrafts } from '../../hooks/useOutreach';
import OutreachStatusBadge from '../../components/outreach/OutreachStatusBadge';
import { CAMPAIGN_TYPES } from '../../constants/outreach';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Check, CheckCheck, RefreshCw, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function OutreachCampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useOutreachCampaignDetail(id);
  const updateCampaign = useUpdateCampaign();
  const approveMessage = useApproveMessage();
  const bulkApprove = useBulkApproveMessages();
  const generateDrafts = useGenerateDrafts();

  const [selectedMsgs, setSelectedMsgs] = useState([]);

  if (isLoading || !campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  const typeInfo = CAMPAIGN_TYPES.find(t => t.value === campaign.campaign_type);
  const queuedMessages = (campaign.messages || []).filter(m => m.status === 'queued');
  const sentMessages = (campaign.messages || []).filter(m => ['sent', 'delivered', 'opened', 'replied'].includes(m.status));

  const handleTogglePause = () => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    updateCampaign.mutate({ id: campaign.id, status: newStatus }, {
      onSuccess: () => toast.success(newStatus === 'active' ? 'קמפיין הופעל' : 'קמפיין הושהה'),
    });
  };

  const handleApprove = (msgId) => {
    approveMessage.mutate({ messageId: msgId }, {
      onSuccess: () => toast.success('הודעה אושרה'),
    });
  };

  const handleBulkApprove = () => {
    if (selectedMsgs.length === 0) return;
    bulkApprove.mutate({ messageIds: selectedMsgs }, {
      onSuccess: () => { toast.success(`${selectedMsgs.length} הודעות אושרו`); setSelectedMsgs([]); },
    });
  };

  const handleGenerate = () => {
    generateDrafts.mutate({ campaign_id: campaign.id }, {
      onSuccess: (res) => toast.success(res?.message || 'טיוטות נוצרו'),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/CRM/outreach/campaigns')}>
          <ArrowRight size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">{campaign.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <OutreachStatusBadge value={campaign.status} type="campaign" />
            {typeInfo && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>
                {typeInfo.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {(campaign.status === 'active' || campaign.status === 'paused') && (
            <Button variant="outline" size="sm" onClick={handleTogglePause}>
              {campaign.status === 'active' ? <><Pause size={14} className="ml-1" /> השהה</> : <><Play size={14} className="ml-1" /> הפעל</>}
            </Button>
          )}
          <Button size="sm" onClick={handleGenerate} disabled={generateDrafts.isPending}>
            <RefreshCw size={14} className={`ml-1 ${generateDrafts.isPending ? 'animate-spin' : ''}`} /> צור טיוטות
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{campaign.messages?.length || 0}</p>
          <p className="text-xs text-slate-400">סה"כ הודעות</p>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{queuedMessages.length}</p>
          <p className="text-xs text-slate-400">ממתינות לאישור</p>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{sentMessages.length}</p>
          <p className="text-xs text-slate-400">נשלחו</p>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{(campaign.messages || []).filter(m => m.status === 'replied').length}</p>
          <p className="text-xs text-slate-400">ענו</p>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{(campaign.messages || []).filter(m => m.status === 'bounced').length}</p>
          <p className="text-xs text-slate-400">חזרו</p>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">הגדרות</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-slate-400">מייל שליחה:</span> <span className="font-medium">{campaign.sending_email}</span></div>
          <div><span className="text-slate-400">מגבלה יומית:</span> <span className="font-medium">{campaign.daily_send_limit}</span></div>
          <div><span className="text-slate-400">נישת יעד:</span> <span className="font-medium">{campaign.target_niche || '—'}</span></div>
          <div><span className="text-slate-400">השהיית מעקב:</span> <span className="font-medium">{campaign.followup1_delay_days}d / {campaign.followup2_delay_days}d</span></div>
        </div>
      </div>

      {/* Queued Messages */}
      {queuedMessages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">הודעות ממתינות לאישור ({queuedMessages.length})</h3>
            {selectedMsgs.length > 0 && (
              <Button size="sm" onClick={handleBulkApprove}>
                <CheckCheck size={14} className="ml-1" /> אשר {selectedMsgs.length} נבחרות
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {queuedMessages.map(m => (
              <div key={m.id} className="bg-white border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedMsgs.includes(m.id)}
                    onCheckedChange={(checked) => {
                      setSelectedMsgs(prev => checked ? [...prev, m.id] : prev.filter(x => x !== m.id));
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{m.outreach_websites?.domain || '—'}</span>
                      <span className="text-xs text-slate-400">{m.outreach_contacts?.email}</span>
                      <OutreachStatusBadge value={m.sequence_step === 'initial' ? 'queued' : m.sequence_step} type="message" />
                    </div>
                    <p className="text-sm text-slate-700 font-medium">{m.subject}</p>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">{m.body_text || m.body_html?.replace(/<[^>]*>/g, '').slice(0, 120)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleApprove(m.id)}>
                    <Check size={14} className="ml-1" /> אשר
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Messages */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">כל ההודעות ({campaign.messages?.length || 0})</h3>
        {(campaign.messages || []).length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-6">אין הודעות</p>
        ) : (
          <div className="bg-white border rounded-lg overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 text-right font-medium text-slate-600">אתר</th>
                  <th className="p-3 text-right font-medium text-slate-600">איש קשר</th>
                  <th className="p-3 text-right font-medium text-slate-600">נושא</th>
                  <th className="p-3 text-right font-medium text-slate-600">שלב</th>
                  <th className="p-3 text-right font-medium text-slate-600">סטטוס</th>
                  <th className="p-3 text-right font-medium text-slate-600">נשלח</th>
                </tr>
              </thead>
              <tbody>
                {(campaign.messages || []).map(m => (
                  <tr key={m.id} className="border-b">
                    <td className="p-3">{m.outreach_websites?.domain || '—'}</td>
                    <td className="p-3 text-xs">{m.outreach_contacts?.email || '—'}</td>
                    <td className="p-3">{m.subject}</td>
                    <td className="p-3 text-xs">{m.sequence_step}</td>
                    <td className="p-3"><OutreachStatusBadge value={m.status} type="message" /></td>
                    <td className="p-3 text-xs text-slate-400">{m.sent_at ? new Date(m.sent_at).toLocaleDateString('he-IL') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
