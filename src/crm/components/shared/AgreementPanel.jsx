import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileText, Send, Eye, CheckCircle, Clock,
  RefreshCw, ExternalLink, Copy, Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import { useLeadAgreements, useSendAgreementWhatsApp } from '../../hooks/useCRM';
import SendAgreementDialog from './SendAgreementDialog';

const STATUS_CONFIG = {
  pending: { label: 'ממתין', color: 'bg-slate-100 text-slate-600', icon: Clock },
  sent: { label: 'נשלח', color: 'bg-blue-100 text-blue-700', icon: Send },
  opened: { label: 'נפתח', color: 'bg-amber-100 text-amber-700', icon: Eye },
  signed: { label: 'נחתם', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

function fmtDate(d) {
  if (!d) return null;
  try { return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: he }); } catch { return null; }
}

export default function AgreementPanel({ lead }) {
  const { data: agreements = [], isLoading } = useLeadAgreements(lead?.id);
  const resend = useSendAgreementWhatsApp();
  const [showDialog, setShowDialog] = useState(false);

  if (isLoading) return null;

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('קישור הועתק');
  };

  const handleResend = (ag) => {
    resend.mutate(
      { agreement_id: ag.id, lead_id: lead.id },
      {
        onSuccess: (data) => data?.whatsapp_sent ? toast.success('נשלח שוב') : toast.error('שליחה נכשלה'),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-1.5">
        <FileText size={14} />
        הסכמים
        {agreements.length > 0 && <span className="text-[10px] text-slate-400">({agreements.length})</span>}
      </h3>

      {agreements.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-2">אין הסכמים</p>
      )}

      <div className="space-y-2">
        {agreements.map((ag) => {
          const config = STATUS_CONFIG[ag.status] || STATUS_CONFIG.pending;
          const Icon = config.icon;
          const hasLink = !!ag.submission_link;

          return (
            <div key={ag.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">{ag.template_label || ag.template_key}</span>
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                  <Icon size={10} /> {config.label}
                </span>
              </div>

              {ag.sent_at && <p className="text-[10px] text-slate-400">נשלח: {fmtDate(ag.sent_at)}</p>}
              {ag.signed_at && <p className="text-[10px] text-green-600 font-medium">נחתם: {fmtDate(ag.signed_at)}</p>}

              {hasLink && (
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2"
                    onClick={() => handleCopy(ag.submission_link)}>
                    <Copy size={10} className="ml-1" /> העתק
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2"
                    onClick={() => window.open(ag.submission_link, '_blank')}>
                    <ExternalLink size={10} className="ml-1" /> פתח
                  </Button>
                  {lead?.phone && ag.status !== 'signed' && (
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-green-600"
                      onClick={() => handleResend(ag)} disabled={resend.isPending}>
                      {resend.isPending ? <RefreshCw size={10} className="animate-spin ml-1" /> : <Send size={10} className="ml-1" />}
                      שלח שוב
                    </Button>
                  )}
                  {ag.status === 'signed' && ag.signed_pdf_url && (
                    <Button size="sm" className="h-7 text-[10px] px-2 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => window.open(ag.signed_pdf_url, '_blank')}>
                      <FileText size={10} className="ml-1" /> PDF חתום
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button size="sm" variant="outline" onClick={() => setShowDialog(true)} className="w-full mt-3 text-xs">
        <Plus size={12} className="ml-1" /> שלח הסכם חדש
      </Button>

      <SendAgreementDialog lead={lead} open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
