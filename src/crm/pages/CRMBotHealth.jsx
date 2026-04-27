import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Send, Inbox,
  Phone, ExternalLink, Zap, MessageSquare, Workflow, ArrowRightLeft,
} from 'lucide-react';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const HEALTHCHECK_URL = `${SUPABASE_URL}/functions/v1/botHealthCheck`;

async function fetchBotHealth(testInvoke = false) {
  const url = testInvoke ? `${HEALTHCHECK_URL}?test_invoke=1` : HEALTHCHECK_URL;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

function StatusBadge({ ok, okLabel = 'תקין', failLabel = 'בעיה' }) {
  return ok ? (
    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
      <CheckCircle2 className="ml-1 h-3 w-3" />
      {okLabel}
    </Badge>
  ) : (
    <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
      <XCircle className="ml-1 h-3 w-3" />
      {failLabel}
    </Badge>
  );
}

function MetricCard({ icon: Icon, label, value, hint, tone = 'default' }) {
  const tones = {
    default: 'border-slate-200',
    good: 'border-emerald-200 bg-emerald-50/30',
    warn: 'border-amber-200 bg-amber-50/30',
    bad: 'border-red-200 bg-red-50/30',
  };
  return (
    <div className={`p-4 rounded-lg border ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('he-IL', { hour12: false });
}

export default function CRMBotHealth() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['bot-health'],
    queryFn: () => fetchBotHealth(false),
    refetchInterval: 30000,
  });

  const handleTestInvoke = async () => {
    try {
      toast.info('מריץ botStartFlow על ליד תקוע...');
      const result = await fetchBotHealth(true);
      const t = result.test_invoke;
      if (!t) {
        toast.success('אין לידים תקועים — הכל תקין');
      } else if (t.http_status === 200) {
        toast.success(`נשלחה ברכה ל-${t.target_phone}`);
      } else {
        toast.error(`נכשל: HTTP ${t.http_status}`);
      }
      refetch();
    } catch (e) {
      toast.error(`שגיאה: ${e.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500">טוען בריאות בוט...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            <span className="font-semibold">לא הצלחנו לטעון את בריאות הבוט</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error.message}</p>
          <Button onClick={() => refetch()} className="mt-3" size="sm" variant="outline">
            נסה שוב
          </Button>
        </CardContent>
      </Card>
    );
  }

  const greenAuth = data.green_api?.instance_state === 'authorized';
  const recent30 = data.recent_outbound_messages?.last_30_min || { sent: 0, failed: 0, total: 0 };
  const recent24 = data.recent_outbound_messages?.last_24_hours || { sent: 0, failed: 0, total: 0 };
  const stuckCount = data.stuck_leads?.count_no_bot_started || 0;
  const sample = data.recent_outbound_messages?.sample || [];
  const stuckSample = data.stuck_leads?.sample || [];
  const phoneChecks = data.green_api_phone_checks || [];
  const diagnosis = data.diagnosis || [];
  const inboundCount = data.inbound_messages?.last_24h_count || 0;
  const activeSessions = data.active_sessions || { count: 0, sample: [] };
  const automationLogs = data.automation_logs || { last_24h_count: 0, breakdown_by_result: {}, recent_sample: [] };
  const statusChanges = data.recent_status_changes || { last_24h_count: 0, sample: [] };

  // Tone calculations
  const recent30Tone = recent30.failed > 0 ? 'bad' : recent30.sent > 0 ? 'good' : 'default';
  const recent24Tone = recent24.failed > 0 ? 'warn' : recent24.sent > 0 ? 'good' : 'default';
  const stuckTone = stuckCount > 0 ? 'warn' : 'good';

  return (
    <div className="space-y-6" dir="rtl">
      <Helmet>
        <title>בריאות הבוט — CRM</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#1E3A5F]" />
            בריאות הבוט
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            עדכון אוטומטי כל 30 שניות · נטען לאחרונה: {formatTime(data.generated_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isFetching}>
            <RefreshCw className={`ml-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            רענן
          </Button>
          <Button onClick={handleTestInvoke} size="sm" variant="default" className="bg-[#1E3A5F] hover:bg-[#2C5282]">
            <Zap className="ml-2 h-4 w-4" />
            בדוק שליחה (ליד תקוע)
          </Button>
          <a href={HEALTHCHECK_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <ExternalLink className="ml-2 h-4 w-4" />
              JSON גולמי
            </Button>
          </a>
        </div>
      </div>

      {/* Diagnosis banner */}
      {diagnosis.length > 0 && (
        <Card className={diagnosis.some(d => d.startsWith('🔴')) ? 'border-red-200 bg-red-50' : diagnosis.some(d => d.startsWith('⚠️')) ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}>
          <CardContent className="pt-4">
            {diagnosis.map((d, i) => (
              <div key={i} className="text-sm font-medium text-slate-800">{d}</div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Top metrics — Row 1: WhatsApp pulse */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Green API</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{data.green_api?.instance_state || 'unknown'}</span>
              <StatusBadge ok={greenAuth} okLabel="מחובר" failLabel="מנותק" />
            </div>
            {data.green_api?.error && <div className="text-xs text-red-600 mt-1">{data.green_api.error}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <MetricCard
              icon={Send}
              label="הודעות 30 דק׳ אחרונות"
              value={`${recent30.sent}/${recent30.total}`}
              hint={recent30.failed > 0 ? `${recent30.failed} נכשלו` : 'אין כשלים'}
              tone={recent30Tone}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <MetricCard
              icon={Inbox}
              label="הודעות 24 שעות אחרונות"
              value={`${recent24.sent}/${recent24.total}`}
              hint={recent24.failed > 0 ? `${recent24.failed} נכשלו` : 'אין כשלים'}
              tone={recent24Tone}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <MetricCard
              icon={AlertTriangle}
              label="לידים תקועים (ללא בוט)"
              value={stuckCount}
              hint={stuckCount > 0 ? 'catchup ינסה שוב כל דקה' : 'הכל זרים'}
              tone={stuckTone}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top metrics — Row 2: Engagement + automation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <MetricCard
              icon={MessageSquare}
              label="הודעות נכנסות 24ש'"
              value={inboundCount}
              hint={inboundCount > 0 ? 'לידים מגיבים' : 'אין תגובות'}
              tone={inboundCount > 0 ? 'good' : 'default'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <MetricCard
              icon={Workflow}
              label="שיחות פעילות עכשיו"
              value={activeSessions.count}
              hint="bot_sessions פתוחות"
              tone={activeSessions.count > 0 ? 'good' : 'default'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <MetricCard
              icon={Zap}
              label="כללי automation 24ש'"
              value={automationLogs.last_24h_count}
              hint={
                Object.keys(automationLogs.breakdown_by_result).length > 0
                  ? Object.entries(automationLogs.breakdown_by_result).map(([k, v]) => `${k}:${v}`).join(' · ')
                  : 'אין הפעלות'
              }
              tone={
                (automationLogs.breakdown_by_result.failed || 0) > 3 ? 'warn'
                  : automationLogs.last_24h_count > 0 ? 'good' : 'default'
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <MetricCard
              icon={ArrowRightLeft}
              label="שינויי סטטוס 24ש'"
              value={statusChanges.last_24h_count}
              hint="trigger ל-followupDispatch"
              tone={statusChanges.last_24h_count > 0 ? 'good' : 'default'}
            />
          </CardContent>
        </Card>
      </div>

      {/* Stuck leads table */}
      {stuckSample.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              לידים אחרונים — סטטוס בוט
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-right text-slate-500">
                    <th className="p-2 font-medium">שם</th>
                    <th className="p-2 font-medium">טלפון</th>
                    <th className="p-2 font-medium">מקור</th>
                    <th className="p-2 font-medium">flow_type</th>
                    <th className="p-2 font-medium">bot_step</th>
                    <th className="p-2 font-medium">session</th>
                    <th className="p-2 font-medium">נכנס</th>
                  </tr>
                </thead>
                <tbody>
                  {stuckSample.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{lead.name || '—'}</td>
                      <td className="p-2 font-mono text-xs">{lead.phone || '—'}</td>
                      <td className="p-2 text-xs text-slate-600 max-w-[150px] truncate">{lead.source_page || '—'}</td>
                      <td className="p-2">
                        {lead.flow_type ? (
                          <Badge variant="outline" className="text-xs">{lead.flow_type}</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">∅ NULL</Badge>
                        )}
                      </td>
                      <td className="p-2">
                        {lead.bot_current_step ? (
                          <span className="text-xs text-slate-700">{lead.bot_current_step}</span>
                        ) : (
                          <span className="text-xs text-amber-600">∅</span>
                        )}
                      </td>
                      <td className="p-2">
                        {lead._session ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                            {lead._session.completed ? 'closed' : lead._session.step}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 text-xs">לא נוצר</Badge>
                        )}
                      </td>
                      <td className="p-2 text-xs text-slate-500">{formatTime(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent outbound sample */}
      {sample.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-[#1E3A5F]" />
              הודעות יוצאות אחרונות (8)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-right text-slate-500">
                    <th className="p-2 font-medium">טלפון</th>
                    <th className="p-2 font-medium">סטטוס</th>
                    <th className="p-2 font-medium">תוכן</th>
                    <th className="p-2 font-medium">Green ID</th>
                    <th className="p-2 font-medium">מתי</th>
                  </tr>
                </thead>
                <tbody>
                  {sample.map((m, i) => (
                    <tr key={i} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-mono text-xs">{m.phone}</td>
                      <td className="p-2">
                        <Badge
                          className={
                            m.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-700 text-xs'
                              : m.status === 'failed'
                              ? 'bg-red-100 text-red-700 text-xs'
                              : 'bg-slate-100 text-slate-700 text-xs'
                          }
                        >
                          {m.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-xs text-slate-700 max-w-[300px] truncate">{m.preview || '—'}</td>
                      <td className="p-2 font-mono text-[10px] text-slate-500 max-w-[120px] truncate">
                        {m.greenapi_id || '—'}
                      </td>
                      <td className="p-2 text-xs text-slate-500">{formatTime(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phone validation */}
      {phoneChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-slate-600" />
              בדיקת מספרי טלפון ב-Green API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {phoneChecks.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded border border-slate-200">
                  <span className="font-mono text-sm">{c.phone}</span>
                  <StatusBadge
                    ok={c.response?.existsWhatsapp === true}
                    okLabel="WhatsApp רשום"
                    failLabel="לא נמצא ב-WhatsApp"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
