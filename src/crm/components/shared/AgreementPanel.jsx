import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText, Send, Eye, CheckCircle, XCircle, Clock, AlertTriangle,
  RefreshCw, ExternalLink, Copy, Plus, Link2, Phone, Edit3, Save,
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/api/supabaseClient';
import { useLeadAgreements, useSendAgreementWhatsApp, useAddCommunication } from '../../hooks/useCRM';
import { useQueryClient } from '@tanstack/react-query';
import SendAgreementDialog from './SendAgreementDialog';

const STATUS_CONFIG = {
  draft: { label: 'טיוטה', color: 'bg-slate-100 text-slate-600', icon: Edit3 },
  link_ready: { label: 'קישור מוכן', color: 'bg-blue-100 text-blue-700', icon: Link2 },
  pending: { label: 'ממתין', color: 'bg-slate-100 text-slate-600', icon: Clock },
  sent: { label: 'נשלח', color: 'bg-indigo-100 text-indigo-700', icon: Send },
  opened: { label: 'נפתח', color: 'bg-amber-100 text-amber-700', icon: Eye },
  signed: { label: 'נחתם', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  failed: { label: 'נכשל', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'פג תוקף', color: 'bg-slate-100 text-slate-500', icon: AlertTriangle },
};

function fmtDate(d) {
  if (!d) return null;
  try { return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: he }); } catch { return null; }
}

export default function AgreementPanel({ lead }) {
  const { data: agreements = [], isLoading } = useLeadAgreements(lead?.id);
  const sendWA = useSendAgreementWhatsApp();
  const addComm = useAddCommunication();
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [pasteLink, setPasteLink] = useState({});  // { [agreementId]: linkValue }
  const [savingLink, setSavingLink] = useState(null);

  if (isLoading) return null;

  // --- Save pasted link ---
  const handleSaveLink = async (ag) => {
    const link = pasteLink[ag.id]?.trim();
    if (!link || !link.startsWith('http')) {
      toast.error('יש להדביק קישור תקין (מתחיל ב-https://)');
      return;
    }

    setSavingLink(ag.id);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('agreements')
        .update({ submission_link: link, status: 'sent', sent_at: now, updated_at: now })
        .eq('id', ag.id);

      if (error) throw error;

      await supabase.from('leads').update({ agreement_status: 'sent', updated_at: now }).eq('id', lead.id);

      toast.success('קישור נשמר');
      setPasteLink(prev => ({ ...prev, [ag.id]: '' }));
      qc.invalidateQueries({ queryKey: ['lead-agreements', lead.id] });
      qc.invalidateQueries({ queryKey: ['crm-lead', lead.id] });
    } catch (err) {
      toast.error('שגיאה בשמירת קישור');
    } finally {
      setSavingLink(null);
    }
  };

  const handleCopyLink = (link, agId) => {
    navigator.clipboard.writeText(link);
    toast.success('קישור הועתק');
    logAction(agId, 'agreement_link_copied');
  };

  const handleSendWA = (ag) => {
    sendWA.mutate(
      { agreement_id: ag.id, lead_id: lead.id },
      {
        onSuccess: (data) => {
          if (data?.whatsapp_sent) toast.success('נשלח ב-WhatsApp');
          else toast.error(data?.error || 'שליחת WhatsApp נכשלה');
        },
        onError: (err) => toast.error(err.message || 'שגיאה בשליחה'),
      }
    );
  };

  function logAction(agId, action) {
    if (!lead?.id) return;
    addComm.mutate({ lead_id: lead.id, type: 'note', notes: action, source: 'sales_portal' });
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-1.5">
        <FileText size={14} />
        הסכמים
        {agreements.length > 0 && <span className="text-[10px] text-slate-400 font-normal">({agreements.length})</span>}
      </h3>

      {/* Empty state */}
      {agreements.length === 0 && (
        <div className="text-center py-3">
          <FileText size={24} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-400">אין הסכמים</p>
        </div>
      )}

      {/* Agreement cards */}
      <div className="space-y-2">
        {agreements.map((ag) => {
          const config = STATUS_CONFIG[ag.status] || STATUS_CONFIG.pending;
          const StatusIcon = config.icon;
          const hasLink = !!ag.submission_link;
          const isDraft = ag.status === 'draft' || (ag.status === 'pending' && !hasLink);
          const isSent = ag.status === 'sent' || ag.status === 'opened';
          const isSigned = ag.status === 'signed';

          return (
            <div key={ag.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 truncate">
                  {ag.template_label || ag.template_key}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                  <StatusIcon size={10} />
                  {config.label}
                </span>
              </div>

              {/* Dates */}
              <div className="text-[10px] text-slate-400 space-y-0.5">
                {ag.sent_at && <p>נשלח: {fmtDate(ag.sent_at)}</p>}
                {ag.first_opened_at && <p>נפתח: {fmtDate(ag.first_opened_at)}</p>}
                {ag.signed_at && <p className="text-green-600 font-medium">נחתם: {fmtDate(ag.signed_at)}</p>}
              </div>

              {/* Paste link section — for drafts without link */}
              {isDraft && !hasLink && (
                <div className="space-y-1.5 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-[10px] text-blue-600 font-medium">הדבק קישור חתימה מ-FillFaster:</p>
                  <div className="flex gap-1">
                    <Input
                      value={pasteLink[ag.id] || ''}
                      onChange={(e) => setPasteLink(prev => ({ ...prev, [ag.id]: e.target.value }))}
                      placeholder="https://fillfaster.com/fills/..."
                      className="text-[10px] h-7 flex-1 font-mono"
                    />
                    <Button
                      size="sm"
                      className="h-7 text-[10px] px-2 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleSaveLink(ag)}
                      disabled={savingLink === ag.id || !pasteLink[ag.id]?.trim()}
                    >
                      {savingLink === ag.id ? <RefreshCw size={10} className="animate-spin" /> : <Save size={10} />}
                    </Button>
                  </div>
                  <p className="text-[9px] text-blue-400">
                    צור קישור ב-FillFaster Dashboard → Send → Copy link → הדבק כאן
                  </p>
                </div>
              )}

              {/* Actions for agreements WITH link */}
              {hasLink && (
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2"
                    onClick={() => handleCopyLink(ag.submission_link, ag.id)}>
                    <Copy size={10} className="ml-1" />
                    העתק
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2"
                    onClick={() => { window.open(ag.submission_link, '_blank'); logAction(ag.id, 'agreement_link_opened'); }}>
                    <ExternalLink size={10} className="ml-1" />
                    פתח
                  </Button>
                  {!isSigned && lead?.phone && (
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-green-600"
                      onClick={() => handleSendWA(ag)} disabled={sendWA.isPending}>
                      {sendWA.isPending ? <RefreshCw size={10} className="animate-spin ml-1" /> : <Send size={10} className="ml-1" />}
                      {isSent ? 'שלח שוב' : 'שלח WA'}
                    </Button>
                  )}
                  {isSigned && ag.signed_pdf_url && (
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-green-600"
                      onClick={() => { window.open(ag.signed_pdf_url, '_blank'); logAction(ag.id, 'agreement_pdf_opened'); }}>
                      <ExternalLink size={10} className="ml-1" />
                      PDF חתום
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create new */}
      <Button size="sm" variant="outline" onClick={() => setShowDialog(true)} className="w-full mt-3 text-xs">
        <Plus size={12} className="ml-1" />
        הסכם חדש
      </Button>

      <SendAgreementDialog lead={lead} open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
