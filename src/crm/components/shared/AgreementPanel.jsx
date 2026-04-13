import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileText, Send, Eye, CheckCircle, XCircle, Clock, AlertTriangle,
  RefreshCw, ExternalLink, Copy, Plus, Link2, Phone, Edit3,
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import { useLeadAgreements, useGenerateAgreementLink, useSendAgreementWhatsApp, useAddCommunication } from '../../hooks/useCRM';
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
  const generateLink = useGenerateAgreementLink();
  const sendWA = useSendAgreementWhatsApp();
  const addComm = useAddCommunication();
  const [showDialog, setShowDialog] = useState(false);

  if (isLoading) return null;

  const handleCopyLink = (link, agId) => {
    navigator.clipboard.writeText(link);
    toast.success('קישור הועתק');
    logAction(agId, 'agreement_link_copied');
  };

  const handleOpenLink = (link, agId) => {
    window.open(link, '_blank');
    logAction(agId, 'agreement_link_opened_by_agent');
  };

  const handleGenerateLink = (ag) => {
    generateLink.mutate(
      { agreement_id: ag.id, lead_id: lead.id },
      {
        onSuccess: (data) => {
          if (data?.submission_link) {
            toast.success('קישור חתימה נוצר');
            navigator.clipboard.writeText(data.submission_link);
            toast.info('הקישור הועתק ללוח');
          } else {
            toast.error('לא התקבל קישור — נסה שוב');
          }
        },
        onError: (err) => toast.error(err.message || 'שגיאה ביצירת קישור'),
      }
    );
  };

  const handleSendWA = (ag) => {
    sendWA.mutate(
      { agreement_id: ag.id, lead_id: lead.id },
      {
        onSuccess: (data) => {
          if (data?.whatsapp_sent) toast.success('נשלח ב-WhatsApp');
          else toast.error(data?.error || 'שליחת WhatsApp נכשלה — הקישור עדיין זמין');
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
          const config = STATUS_CONFIG[ag.status] || STATUS_CONFIG.draft;
          const StatusIcon = config.icon;
          const hasLink = !!ag.submission_link;
          const isDraft = ag.status === 'draft';
          const isLinkReady = ag.status === 'link_ready';
          const isSent = ag.status === 'sent' || ag.status === 'opened';
          const isSigned = ag.status === 'signed';
          const isFailed = ag.status === 'failed';

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

              {/* Status message */}
              {isDraft && !hasLink && (
                <p className="text-[10px] text-slate-400">ההסכם נשמר. עדיין לא נוצר קישור חתימה.</p>
              )}
              {isLinkReady && (
                <p className="text-[10px] text-blue-500">הקישור נוצר ומוכן לשליחה.</p>
              )}
              {isFailed && ag.last_error && (
                <p className="text-[10px] text-red-500">{ag.last_error}</p>
              )}
              {ag.delivery_status === 'send_failed' && (
                <p className="text-[10px] text-red-500">שליחת WhatsApp נכשלה — הקישור עדיין זמין.</p>
              )}

              {/* Dates */}
              <div className="text-[10px] text-slate-400 space-y-0.5">
                {ag.sent_at && <p>נשלח: {fmtDate(ag.sent_at)}</p>}
                {ag.first_opened_at && <p>נפתח: {fmtDate(ag.first_opened_at)}</p>}
                {ag.signed_at && <p className="text-green-600 font-medium">נחתם: {fmtDate(ag.signed_at)}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-wrap">
                {/* Draft → Generate Link */}
                {(isDraft || isFailed) && !hasLink && (
                  <Button size="sm" className="h-7 text-[10px] px-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleGenerateLink(ag)} disabled={generateLink.isPending}>
                    {generateLink.isPending ? <RefreshCw size={10} className="animate-spin ml-1" /> : <Link2 size={10} className="ml-1" />}
                    צור קישור
                  </Button>
                )}

                {/* Has Link → Copy / Open / Send WA */}
                {hasLink && (
                  <>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2"
                      onClick={() => handleCopyLink(ag.submission_link, ag.id)}>
                      <Copy size={10} className="ml-1" />
                      העתק
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2"
                      onClick={() => handleOpenLink(ag.submission_link, ag.id)}>
                      <ExternalLink size={10} className="ml-1" />
                      פתח
                    </Button>
                  </>
                )}

                {/* Link ready or sent → Send/Resend WA */}
                {hasLink && !isSigned && lead?.phone && (
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-green-600"
                    onClick={() => handleSendWA(ag)} disabled={sendWA.isPending}>
                    {sendWA.isPending ? <RefreshCw size={10} className="animate-spin ml-1" /> : <Send size={10} className="ml-1" />}
                    {isSent ? 'שלח שוב' : 'שלח WA'}
                  </Button>
                )}

                {/* Signed → PDF */}
                {isSigned && ag.signed_pdf_url && (
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-green-600"
                    onClick={() => { window.open(ag.signed_pdf_url, '_blank'); logAction(ag.id, 'agreement_pdf_opened'); }}>
                    <ExternalLink size={10} className="ml-1" />
                    PDF חתום
                  </Button>
                )}
              </div>
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
