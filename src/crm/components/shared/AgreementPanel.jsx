import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileText, Send, Eye, CheckCircle, XCircle, Clock, AlertTriangle,
  RefreshCw, ExternalLink, Copy, Plus, Link2, Phone,
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import { useLeadAgreements, useResendAgreement, useAddCommunication } from '../../hooks/useCRM';
import SendAgreementDialog from './SendAgreementDialog';

const STATUS_CONFIG = {
  pending: { label: 'ממתין', color: 'bg-slate-100 text-slate-600', icon: Clock },
  sent: { label: 'נשלח', color: 'bg-blue-100 text-blue-700', icon: Send },
  opened: { label: 'נפתח', color: 'bg-amber-100 text-amber-700', icon: Eye },
  signed: { label: 'נחתם', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  failed: { label: 'נכשל', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'פג תוקף', color: 'bg-slate-100 text-slate-500', icon: AlertTriangle },
};

function fmtDate(dateStr) {
  if (!dateStr) return null;
  try { return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: he }); }
  catch { return null; }
}

export default function AgreementPanel({ lead }) {
  const { data: agreements = [], isLoading, isError } = useLeadAgreements(lead?.id);
  const resend = useResendAgreement();
  const addComm = useAddCommunication();
  const [showDialog, setShowDialog] = useState(false);

  if (isLoading) return null;

  const latestAgreement = agreements[0];
  const hasUnsigned = latestAgreement && latestAgreement.status !== 'signed';
  const hasSigned = latestAgreement?.status === 'signed';
  const missingPhone = !lead?.phone;

  // --- action handlers ---

  const handleCopyLink = (link, agreementId) => {
    navigator.clipboard.writeText(link);
    toast.success('קישור הועתק ללוח');
    logAction(agreementId, 'agreement_link_copied');
  };

  const handleOpenLink = (link, agreementId) => {
    window.open(link, '_blank');
    logAction(agreementId, 'agreement_link_opened_by_agent');
  };

  const handleOpenPdf = (url, agreementId) => {
    window.open(url, '_blank');
    logAction(agreementId, 'agreement_pdf_opened');
  };

  const handleResend = (agreement) => {
    resend.mutate(
      { agreement_id: agreement.id, lead_id: lead.id },
      {
        onSuccess: () => toast.success('תזכורת נשלחה ב-WhatsApp'),
        onError: (err) => toast.error(err.message || 'שגיאה בשליחת תזכורת'),
      }
    );
  };

  function logAction(agreementId, action) {
    if (!lead?.id) return;
    addComm.mutate({
      lead_id: lead.id,
      type: 'note',
      notes: action,
      source: 'sales_portal',
    });
  }

  // --- main CTA logic ---
  function renderMainCTA() {
    if (missingPhone) {
      return (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 mt-3">
          <Phone size={12} />
          לא ניתן לשלוח הסכם ללא מספר טלפון תקין
        </div>
      );
    }

    if (hasSigned) {
      return (
        <div className="space-y-2 mt-3">
          {latestAgreement.signed_pdf_url && (
            <Button
              size="sm"
              className="w-full text-xs bg-green-600 hover:bg-green-700"
              onClick={() => handleOpenPdf(latestAgreement.signed_pdf_url, latestAgreement.id)}
            >
              <ExternalLink size={12} className="ml-1" />
              פתח PDF חתום
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDialog(true)}
            className="w-full text-xs"
          >
            <Plus size={12} className="ml-1" />
            שלח הסכם נוסף
          </Button>
        </div>
      );
    }

    if (hasUnsigned && latestAgreement.submission_link) {
      return (
        <div className="space-y-2 mt-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => handleCopyLink(latestAgreement.submission_link, latestAgreement.id)}
            >
              <Copy size={12} className="ml-1" />
              העתק קישור
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => handleResend(latestAgreement)}
              disabled={resend.isPending}
            >
              {resend.isPending ? <RefreshCw size={12} className="animate-spin ml-1" /> : <Send size={12} className="ml-1" />}
              שלח שוב
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDialog(true)}
            className="w-full text-xs text-slate-500"
          >
            <Plus size={12} className="ml-1" />
            הסכם חדש
          </Button>
        </div>
      );
    }

    // No agreements at all
    return (
      <Button
        size="sm"
        onClick={() => setShowDialog(true)}
        className="w-full mt-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
      >
        <FileText size={12} className="ml-1" />
        שלח הסכם ראשון לחתימה
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-1.5">
        <FileText size={14} />
        הסכמים
        {agreements.length > 0 && (
          <span className="text-[10px] text-slate-400 font-normal">({agreements.length})</span>
        )}
      </h3>

      {isError && (
        <p className="text-xs text-red-500 mb-2">שגיאה בטעינת הסכמים</p>
      )}

      {/* Empty state */}
      {!isError && agreements.length === 0 && !missingPhone && (
        <div className="text-center py-3">
          <FileText size={24} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-400">לא נשלחו הסכמים עדיין</p>
        </div>
      )}

      {/* Agreement cards */}
      <div className="space-y-2">
        {agreements.map((ag) => {
          const config = STATUS_CONFIG[ag.status] || STATUS_CONFIG.pending;
          const StatusIcon = config.icon;
          const canResend = (ag.status === 'sent' || ag.status === 'opened') && ag.submission_link;
          const canOpenLink = ag.submission_link && ag.status !== 'signed';
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
                {ag.last_opened_at && ag.last_opened_at !== ag.first_opened_at && (
                  <p>נצפה לאחרונה: {fmtDate(ag.last_opened_at)}</p>
                )}
                {ag.signed_at && (
                  <p className="text-green-600 font-medium">נחתם: {fmtDate(ag.signed_at)}</p>
                )}
              </div>

              {/* Actions row */}
              <div className="flex gap-1 flex-wrap">
                {isSigned && ag.signed_pdf_url && (
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-green-600"
                    onClick={() => handleOpenPdf(ag.signed_pdf_url, ag.id)}>
                    <ExternalLink size={10} className="ml-1" />
                    PDF חתום
                  </Button>
                )}
                {canOpenLink && (
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2"
                    onClick={() => handleOpenLink(ag.submission_link, ag.id)}>
                    <Link2 size={10} className="ml-1" />
                    פתח קישור
                  </Button>
                )}
                {ag.submission_link && (
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2"
                    onClick={() => handleCopyLink(ag.submission_link, ag.id)}>
                    <Copy size={10} className="ml-1" />
                    העתק
                  </Button>
                )}
                {canResend && (
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-amber-600"
                    onClick={() => handleResend(ag)} disabled={resend.isPending}>
                    {resend.isPending
                      ? <RefreshCw size={10} className="animate-spin ml-1" />
                      : <Send size={10} className="ml-1" />}
                    תזכורת
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main CTA */}
      {renderMainCTA()}

      <SendAgreementDialog lead={lead} open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
