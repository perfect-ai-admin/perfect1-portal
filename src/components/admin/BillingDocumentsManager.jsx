import React, { useState, useEffect } from 'react';
import { invokeFunction } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, RefreshCw, RotateCcw, Mail, ExternalLink, 
  CheckCircle2, XCircle, Clock, AlertTriangle, Loader2, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  issued:    { label: 'הופק', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  sent:      { label: 'נשלח', icon: Mail, color: 'bg-blue-100 text-blue-700' },
  failed:    { label: 'נכשל', icon: XCircle, color: 'bg-red-100 text-red-700' },
  pending:   { label: 'ממתין', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  processing:{ label: 'מעבד', icon: Loader2, color: 'bg-orange-100 text-orange-700' },
  requires_manual_review: { label: 'דורש בדיקה', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  already_processed: { label: 'כבר טופל', icon: CheckCircle2, color: 'bg-gray-100 text-gray-600' },
  not_sent:  { label: 'לא נשלח', icon: Mail, color: 'bg-gray-100 text-gray-600' },
  sending:   { label: 'שולח', icon: Loader2, color: 'bg-blue-100 text-blue-600' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, icon: Clock, color: 'bg-gray-100 text-gray-600' };
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} gap-1 text-xs font-medium`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

export default function BillingDocumentsManager() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [retrying, setRetrying] = useState(null);

  const loadDocs = async () => {
    setLoading(true);
   
    const data = [];
    setDocs(data || []);
    setLoading(false);
  };

  useEffect(() => { loadDocs(); }, []);

  const handleRetryIssue = async (doc) => {
    setRetrying(doc.id);
    try {
      const res = await invokeFunction('retryBillingDocument', {
        billing_document_id: doc.id,
        action: 'retry_issue',
      });
      if (res?.status === 'already_issued') {
        toast.info('המסמך כבר הופק');
      } else if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('הפקה חוזרת נשלחה');
      }
      await loadDocs();
    } catch (err) {
      toast.error('שגיאה: ' + err.message);
    }
    setRetrying(null);
  };

  const handleResendEmail = async (doc) => {
    setRetrying(doc.id);
    try {
      const res = await invokeFunction('retryBillingDocument', {
        billing_document_id: doc.id,
        action: 'resend_email',
      });
      if (res?.status === 'email_sent') {
        toast.success(`מייל נשלח ל-${res.email}`);
      } else if (res?.error) {
        toast.error(res.error);
      }
      await loadDocs();
    } catch (err) {
      toast.error('שגיאה: ' + err.message);
    }
    setRetrying(null);
  };

  const filtered = docs.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      d.customer_name?.toLowerCase().includes(s) ||
      d.customer_email?.toLowerCase().includes(s) ||
      d.document_number?.includes(s) ||
      d.payment_id?.includes(s) ||
      d.transaction_id?.includes(s)
    );
  });

  const stats = {
    total: docs.length,
    issued: docs.filter(d => d.issue_status === 'issued').length,
    failed: docs.filter(d => d.issue_status === 'failed').length,
    emailFailed: docs.filter(d => d.send_status === 'failed').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="סה״כ מסמכים" value={stats.total} icon={FileText} color="text-blue-600" />
        <StatCard label="הופקו" value={stats.issued} icon={CheckCircle2} color="text-green-600" />
        <StatCard label="נכשלו" value={stats.failed} icon={XCircle} color="text-red-600" />
        <StatCard label="שליחה נכשלה" value={stats.emailFailed} icon={Mail} color="text-orange-600" />
      </div>

      {/* Search & Refresh */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, מייל, מספר מסמך, transaction_id..."
            className="pr-10 h-9 text-sm"
          />
        </div>
        <Button variant="outline" size="sm" onClick={loadDocs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-right font-medium text-gray-600">תאריך</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">לקוח</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">מוצר</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">סכום</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">מסמך</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">הפקה</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">שליחה</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center py-8 text-gray-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-8 text-gray-400">אין מסמכים</td></tr>
            ) : (
              filtered.map(doc => (
                <tr key={doc.id} className="border-b hover:bg-gray-50/50">
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {doc.created_date ? new Date(doc.created_date).toLocaleDateString('he-IL') : '-'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs font-medium">{doc.customer_name || '-'}</div>
                    <div className="text-[10px] text-gray-400">{doc.customer_email || ''}</div>
                  </td>
                  <td className="px-3 py-2 text-xs">{doc.product_name || '-'}</td>
                  <td className="px-3 py-2 text-xs font-medium">₪{doc.amount_total?.toFixed(2) || '0'}</td>
                  <td className="px-3 py-2">
                    {doc.document_number ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono">#{doc.document_number}</span>
                        {doc.pdf_url && (
                          <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ) : <span className="text-xs text-gray-400">-</span>}
                  </td>
                  <td className="px-3 py-2"><StatusBadge status={doc.issue_status} /></td>
                  <td className="px-3 py-2"><StatusBadge status={doc.send_status} /></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {doc.issue_status === 'failed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleRetryIssue(doc)}
                          disabled={retrying === doc.id}
                        >
                          {retrying === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                        </Button>
                      )}
                      {doc.issue_status === 'issued' && doc.send_status !== 'sent' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleResendEmail(doc)}
                          disabled={retrying === doc.id}
                        >
                          {retrying === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                        </Button>
                      )}
                    </div>
                    {doc.error_message && (
                      <div className="text-[10px] text-red-500 max-w-[200px] truncate mt-0.5" title={doc.error_message}>
                        {doc.error_message}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border p-3 flex items-center gap-3">
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
        <div className="text-lg font-bold">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}