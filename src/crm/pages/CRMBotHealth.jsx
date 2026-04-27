import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Send, Inbox,
  ExternalLink, Zap, MessageSquare, Workflow, ArrowRightLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/api/supabaseClient';

// All data is fetched directly from Supabase (DB tables) so no edge-function
// CORS dance is needed. Green API state is INFERRED from recent message stats
// (if any 'sent' in last X minutes, Green API is working). For deeper checks
// hit the raw endpoint via the "JSON גולמי" link.

async function fetchBotHealth() {
  const now = new Date();
  const since30m = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const since2h = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const before30s = new Date(now.getTime() - 30 * 1000).toISOString();
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const todayIso = startOfToday.toISOString();

  // Run all queries in parallel — fail individually rather than all-or-nothing.
  const [
    msgs30mRes, msgs24hRes, sampleMsgsRes,
    inboundRes, sessionsRes, logsRes, stageChangesRes,
    stuckCountRes, stuckSampleRes,
    sessionsTodayRes, sessionsCompletedTodayRes, sessionsAbandonedRes,
    pipelineRes, followupSeqRes, recentFailedLogsRes, failedMsgsRes,
  ] = await Promise.all([
    supabase.from('whatsapp_messages').select('delivery_status').eq('direction', 'outbound').gte('created_at', since30m),
    supabase.from('whatsapp_messages').select('delivery_status').eq('direction', 'outbound').gte('created_at', since24h),
    supabase.from('whatsapp_messages').select('phone, delivery_status, greenapi_message_id, created_at, message_text')
      .eq('direction', 'outbound').gte('created_at', since24h).order('created_at', { ascending: false }).limit(8),
    supabase.from('whatsapp_messages').select('id', { count: 'exact', head: true }).eq('direction', 'inbound').gte('created_at', since24h),
    supabase.from('bot_sessions').select('id, phone, current_step, flow_type, last_message_at, messages_count')
      .is('completed_at', null).gte('last_message_at', since24h).order('last_message_at', { ascending: false }).limit(8),
    supabase.from('automation_logs').select('rule_name, result, lead_id, created_at, error_message')
      .gte('created_at', since24h).order('created_at', { ascending: false }).limit(10),
    supabase.from('leads').select('id, name, pipeline_stage, updated_at')
      .gte('updated_at', since24h).neq('pipeline_stage', 'new_lead').order('updated_at', { ascending: false }).limit(5),
    supabase.from('leads').select('id', { count: 'exact', head: true })
      .is('flow_type', null).is('bot_current_step', null).not('phone', 'is', null).neq('phone', '')
      .gte('created_at', since2h).lte('created_at', before30s).eq('source', 'sales_portal'),
    supabase.from('leads').select('id, name, phone, flow_type, bot_current_step, source_page, created_at')
      .not('phone', 'is', null).neq('phone', '').gte('created_at', since24h).order('created_at', { ascending: false }).limit(8),

    // === Today's funnel ===
    supabase.from('bot_sessions').select('id, current_step, lead_id, flow_type, created_at, completed_at, last_message_at, messages_count')
      .gte('created_at', todayIso).order('created_at', { ascending: false }),
    supabase.from('bot_sessions').select('id', { count: 'exact', head: true })
      .gte('completed_at', todayIso),
    // Sessions stuck on opening/entry_menu for > 2h with no further activity = lead never replied
    supabase.from('bot_sessions').select('id, phone, current_step, lead_id, last_message_at, messages_count')
      .is('completed_at', null)
      .in('current_step', ['opening', 'entry_menu'])
      .lt('last_message_at', since2h)
      .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()),

    // === Pipeline distribution ===
    supabase.from('leads').select('pipeline_stage, status, sub_status, do_not_contact, followup_paused, followup_sequence_step')
      .not('phone', 'is', null).neq('phone', ''),

    // === Followup sequences active ===
    supabase.from('leads').select('id, name, phone, followup_sequence_name, followup_sequence_step, next_followup_date, sub_status, pipeline_stage')
      .not('followup_sequence_name', 'is', null)
      .eq('followup_paused', false)
      .eq('do_not_contact', false)
      .order('next_followup_date', { ascending: true })
      .limit(15),

    // === Failures with lead names ===
    supabase.from('automation_logs').select('rule_name, result, error_message, created_at, lead_id, leads(name, phone)')
      .in('result', ['failed', 'skipped_dnc', 'skipped_max', 'skipped_quiet_hours'])
      .gte('created_at', since24h)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('whatsapp_messages').select('phone, message_text, created_at, lead_id, leads(name)')
      .eq('direction', 'outbound').eq('delivery_status', 'failed').gte('created_at', since24h)
      .order('created_at', { ascending: false }).limit(8),
  ]);

  const tally = (rows) => {
    const arr = rows?.data || [];
    return {
      total: arr.length,
      sent: arr.filter((m) => m.delivery_status === 'sent').length,
      failed: arr.filter((m) => m.delivery_status === 'failed').length,
    };
  };

  const recent30 = tally(msgs30mRes);
  const recent24 = tally(msgs24hRes);

  // Look up sessions for stuck-sample leads in one shot
  const stuckSample = stuckSampleRes?.data || [];
  let sessByLead = new Map();
  if (stuckSample.length > 0) {
    const ids = stuckSample.map((l) => l.id);
    const { data: ses } = await supabase.from('bot_sessions')
      .select('lead_id, current_step, completed_at, created_at').in('lead_id', ids);
    sessByLead = new Map((ses || []).map((s) => [s.lead_id, s]));
  }

  const logCounts = {};
  (logsRes?.data || []).forEach((l) => {
    logCounts[l.result] = (logCounts[l.result] || 0) + 1;
  });

  // Infer Green API health: if we sent something successfully in the last hour,
  // it's authorized. If recent attempts are all 'failed', it's offline.
  const lastSent = (sampleMsgsRes?.data || []).find((m) => m.delivery_status === 'sent');
  const lastSentMinutesAgo = lastSent ? Math.floor((now - new Date(lastSent.created_at)) / 60000) : null;
  let greenApiState;
  if (recent30.failed > 0 && recent30.sent === 0) greenApiState = 'failing';
  else if (lastSent && lastSentMinutesAgo <= 60) greenApiState = 'authorized';
  else if (lastSent && lastSentMinutesAgo <= 1440) greenApiState = 'idle';
  else greenApiState = 'unknown';

  // Diagnosis
  const diagnosis = [];
  if (greenApiState === 'failing') diagnosis.push('🔴 Green API דוחה הודעות אחרונות. בדוק QR code.');
  else if (greenApiState === 'unknown') diagnosis.push('⚠️ אין הודעות יוצאות ב-24 שעות אחרונות.');
  else diagnosis.push('✅ Green API נראה פעיל (הודעה אחרונה לפני ' + lastSentMinutesAgo + ' דקות).');
  if (stuckCountRes?.count > 0) {
    diagnosis.push(`⚠️ ${stuckCountRes.count} לידים תקועים — catchup ינסה שוב כל דקה.`);
  }
  if ((logCounts.failed || 0) > 3) {
    diagnosis.push(`⚠️ ${logCounts.failed} כללי automation נכשלו ב-24 שעות.`);
  }
  if ((stageChangesRes?.data?.length || 0) > 0 && (logsRes?.data?.length || 0) === 0) {
    diagnosis.push('⚠️ קרו שינויי סטטוס אבל אף כלל automation לא הופעל. ייתכן שה-trigger DB לא מגיע ל-followupDispatch.');
  }

  // === Today's funnel processing ===
  const sessionsToday = sessionsTodayRes?.data || [];
  const todayStarted = sessionsToday.length;
  const todayCompleted = sessionsCompletedTodayRes?.count || 0;
  const todayActive = sessionsToday.filter((s) => !s.completed_at && new Date(s.last_message_at) > new Date(now.getTime() - 30 * 60 * 1000)).length;
  const todayNoReply = sessionsToday.filter((s) => !s.completed_at && (s.messages_count || 0) <= 1 && s.current_step === 'entry_menu').length;
  const todayByStep = {};
  sessionsToday.forEach((s) => {
    const step = s.completed_at ? '✓ closed' : s.current_step || 'unknown';
    todayByStep[step] = (todayByStep[step] || 0) + 1;
  });

  // Abandoned sessions (stuck on early step > 2h with no reply)
  const abandoned = sessionsAbandonedRes?.data || [];

  // === Pipeline distribution ===
  const allLeads = pipelineRes?.data || [];
  const pipelineCounts = {};
  let dncCount = 0, pausedCount = 0, inSequenceCount = 0;
  allLeads.forEach((l) => {
    const stage = l.pipeline_stage || 'unknown';
    pipelineCounts[stage] = (pipelineCounts[stage] || 0) + 1;
    if (l.do_not_contact) dncCount++;
    if (l.followup_paused) pausedCount++;
    if (l.followup_sequence_step !== null) inSequenceCount++;
  });

  // === Followup sequences ===
  const followupSeq = followupSeqRes?.data || [];
  const followupByStep = {};
  followupSeq.forEach((l) => {
    const key = `${l.followup_sequence_name || 'default'} · step ${l.followup_sequence_step ?? '?'}`;
    followupByStep[key] = (followupByStep[key] || 0) + 1;
  });

  // === Failures ===
  const failedAutomations = (recentFailedLogsRes?.data || []).map((l) => ({
    ...l,
    lead_name: l.leads?.name,
    lead_phone: l.leads?.phone,
  }));
  const failedMsgs = (failedMsgsRes?.data || []).map((m) => ({
    ...m,
    lead_name: m.leads?.name,
  }));

  // Add stuck-session context to abandoned: get lead names
  let abandonedWithNames = [];
  if (abandoned.length > 0) {
    const leadIds = abandoned.map((s) => s.lead_id).filter(Boolean);
    if (leadIds.length > 0) {
      const { data: leadsData } = await supabase.from('leads').select('id, name, pipeline_stage').in('id', leadIds);
      const leadMap = new Map((leadsData || []).map((l) => [l.id, l]));
      abandonedWithNames = abandoned.map((s) => ({
        ...s,
        lead_name: leadMap.get(s.lead_id)?.name,
        lead_pipeline_stage: leadMap.get(s.lead_id)?.pipeline_stage,
      })).slice(0, 10);
    }
  }

  return {
    generated_at: now.toISOString(),
    green_api: { instance_state: greenApiState, last_sent_minutes_ago: lastSentMinutesAgo },
    recent_outbound_messages: {
      last_30_min: recent30,
      last_24_hours: recent24,
      sample: sampleMsgsRes?.data || [],
    },
    inbound_messages: { last_24h_count: inboundRes?.count || 0 },
    active_sessions: { count: sessionsRes?.data?.length || 0, sample: sessionsRes?.data || [] },
    automation_logs: { last_24h_count: logsRes?.data?.length || 0, breakdown_by_result: logCounts },
    recent_status_changes: { last_24h_count: stageChangesRes?.data?.length || 0 },
    today: {
      started: todayStarted,
      completed: todayCompleted,
      active_now: todayActive,
      no_reply_yet: todayNoReply,
      by_step: todayByStep,
    },
    abandoned_sessions: {
      count: abandoned.length,
      sample: abandonedWithNames,
    },
    pipeline: {
      total: allLeads.length,
      counts: pipelineCounts,
      do_not_contact: dncCount,
      followup_paused: pausedCount,
      in_sequence: inSequenceCount,
    },
    followup_sequences: {
      active_count: followupSeq.length,
      by_step: followupByStep,
      next_up: followupSeq.slice(0, 8),
    },
    failures: {
      automations: failedAutomations,
      messages: failedMsgs,
    },
    stuck_leads: {
      count_no_bot_started: stuckCountRes?.count || 0,
      sample: stuckSample.map((l) => ({
        ...l,
        _session: sessByLead.get(l.id)
          ? { step: sessByLead.get(l.id).current_step, completed: sessByLead.get(l.id).completed_at !== null }
          : null,
      })),
    },
    diagnosis,
  };
}

async function triggerBotForFirstStuckLead() {
  // Find first stuck lead with no session yet
  const { data: lead } = await supabase.from('leads')
    .select('id, name, phone, source_page')
    .is('bot_current_step', null).not('phone', 'is', null).neq('phone', '')
    .order('created_at', { ascending: false }).limit(1).single();
  if (!lead) return { skipped: true, reason: 'אין ליד תקוע' };

  // Call botStartFlow (it has CORS + --no-verify-jwt, accepts anon)
  const { data, error } = await supabase.functions.invoke('botStartFlow', {
    body: {
      lead_id: lead.id,
      lead_name: lead.name || 'Test',
      phone: lead.phone,
      page_slug: lead.source_page || 'open-osek-patur',
    },
  });
  if (error) throw error;
  return { ok: true, lead_phone: lead.phone, response: data };
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
    queryFn: fetchBotHealth,
    refetchInterval: 30000,
  });

  const handleTestInvoke = async () => {
    try {
      toast.info('מריץ botStartFlow על ליד תקוע...');
      const result = await triggerBotForFirstStuckLead();
      if (result.skipped) toast.success('אין לידים תקועים — הכל תקין');
      else toast.success(`נשלחה ברכה ל-${result.lead_phone}`);
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
  const recent30 = data.recent_outbound_messages.last_30_min;
  const recent24 = data.recent_outbound_messages.last_24_hours;
  const stuckCount = data.stuck_leads.count_no_bot_started || 0;
  const sample = data.recent_outbound_messages.sample;
  const stuckSample = data.stuck_leads.sample;
  const inboundCount = data.inbound_messages.last_24h_count;
  const activeSessions = data.active_sessions;
  const automationLogs = data.automation_logs;
  const statusChanges = data.recent_status_changes;
  const today = data.today;
  const abandoned = data.abandoned_sessions;
  const pipeline = data.pipeline;
  const sequences = data.followup_sequences;
  const failures = data.failures;
  const diagnosis = data.diagnosis || [];

  const recent30Tone = recent30.failed > 0 ? 'bad' : recent30.sent > 0 ? 'good' : 'default';
  const recent24Tone = recent24.failed > 0 ? 'warn' : recent24.sent > 0 ? 'good' : 'default';
  const stuckTone = stuckCount > 0 ? 'warn' : 'good';

  return (
    <div className="space-y-6" dir="rtl">
      <Helmet>
        <title>בריאות הבוט — CRM</title>
      </Helmet>

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
          <Button onClick={handleTestInvoke} size="sm" className="bg-[#1E3A5F] hover:bg-[#2C5282]">
            <Zap className="ml-2 h-4 w-4" />
            בדוק שליחה
          </Button>
          <a href="https://rtlpqjqdmomyptcdkmrq.supabase.co/functions/v1/botHealthCheck" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <ExternalLink className="ml-2 h-4 w-4" />
              JSON גולמי
            </Button>
          </a>
        </div>
      </div>

      {diagnosis.length > 0 && (
        <Card className={diagnosis.some((d) => d.startsWith('🔴')) ? 'border-red-200 bg-red-50' : diagnosis.some((d) => d.startsWith('⚠️')) ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}>
          <CardContent className="pt-4">
            {diagnosis.map((d, i) => (
              <div key={i} className="text-sm font-medium text-slate-800">{d}</div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Row 1: WhatsApp pulse */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Green API (מצב משוער)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{data.green_api.instance_state}</span>
              <StatusBadge ok={greenAuth} okLabel="פעיל" failLabel="בעיה" />
            </div>
            {data.green_api.last_sent_minutes_ago !== null && (
              <div className="text-xs text-slate-500 mt-1">הודעה אחרונה לפני {data.green_api.last_sent_minutes_ago} דק'</div>
            )}
          </CardContent>
        </Card>
        <Card><CardContent className="pt-6"><MetricCard icon={Send} label="הודעות 30 דק'" value={`${recent30.sent}/${recent30.total}`} hint={recent30.failed > 0 ? `${recent30.failed} נכשלו` : 'אין כשלים'} tone={recent30Tone} /></CardContent></Card>
        <Card><CardContent className="pt-6"><MetricCard icon={Inbox} label="הודעות 24 שעות" value={`${recent24.sent}/${recent24.total}`} hint={recent24.failed > 0 ? `${recent24.failed} נכשלו` : 'אין כשלים'} tone={recent24Tone} /></CardContent></Card>
        <Card><CardContent className="pt-6"><MetricCard icon={AlertTriangle} label="לידים תקועים" value={stuckCount} hint={stuckCount > 0 ? 'catchup ינסה כל דקה' : 'הכל זרים'} tone={stuckTone} /></CardContent></Card>
      </div>

      {/* Row 2: Engagement + automation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><MetricCard icon={MessageSquare} label="הודעות נכנסות 24ש'" value={inboundCount} hint={inboundCount > 0 ? 'לידים מגיבים' : 'אין תגובות'} tone={inboundCount > 0 ? 'good' : 'default'} /></CardContent></Card>
        <Card><CardContent className="pt-6"><MetricCard icon={Workflow} label="שיחות פעילות" value={activeSessions.count} hint="bot_sessions פתוחות" tone={activeSessions.count > 0 ? 'good' : 'default'} /></CardContent></Card>
        <Card><CardContent className="pt-6"><MetricCard icon={Zap} label="כללי automation 24ש'" value={automationLogs.last_24h_count} hint={Object.keys(automationLogs.breakdown_by_result).length > 0 ? Object.entries(automationLogs.breakdown_by_result).map(([k, v]) => `${k}:${v}`).join(' · ') : 'אין הפעלות'} tone={(automationLogs.breakdown_by_result.failed || 0) > 3 ? 'warn' : automationLogs.last_24h_count > 0 ? 'good' : 'default'} /></CardContent></Card>
        <Card><CardContent className="pt-6"><MetricCard icon={ArrowRightLeft} label="שינויי סטטוס 24ש'" value={statusChanges.last_24h_count} hint="trigger ל-followupDispatch" tone={statusChanges.last_24h_count > 0 ? 'good' : 'default'} /></CardContent></Card>
      </div>

      {/* === Today's funnel === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#1E3A5F]" />
            פעילות היום (מאז 00:00)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <MetricCard icon={Workflow} label="שיחות נפתחו" value={today.started} hint="bot_sessions היום" tone={today.started > 0 ? 'good' : 'default'} />
            <MetricCard icon={CheckCircle2} label="שיחות הסתיימו" value={today.completed} hint="completed_at היום" tone={today.completed > 0 ? 'good' : 'default'} />
            <MetricCard icon={Activity} label="פעילות עכשיו" value={today.active_now} hint="הודעה ב-30 דק' אחרונות" tone={today.active_now > 0 ? 'good' : 'default'} />
            <MetricCard icon={MessageSquare} label="לא ענו עדיין" value={today.no_reply_yet} hint="קיבלו ברכה, לא הגיבו" tone={today.no_reply_yet > 5 ? 'warn' : 'default'} />
          </div>
          {Object.keys(today.by_step).length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">פילוח לפי שלב נוכחי:</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(today.by_step).sort((a, b) => b[1] - a[1]).map(([step, count]) => (
                  <Badge key={step} variant="outline" className="text-xs">
                    {step}: <span className="font-bold mr-1">{count}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Pipeline distribution === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-[#1E3A5F]" />
            פילוח לידים לפי סטטוס pipeline ({pipeline.total} סה"כ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
            {Object.entries(pipeline.counts).sort((a, b) => b[1] - a[1]).map(([stage, count]) => (
              <div key={stage} className="p-3 rounded border border-slate-200 bg-slate-50">
                <div className="text-xs text-slate-500 truncate">{stage}</div>
                <div className="text-xl font-bold text-slate-900">{count}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge className="bg-slate-100 text-slate-700">בסדרת מעקב: {pipeline.in_sequence}</Badge>
            <Badge className="bg-amber-100 text-amber-700">מושהים: {pipeline.followup_paused}</Badge>
            <Badge className="bg-red-100 text-red-700">do_not_contact: {pipeline.do_not_contact}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* === Active follow-up sequences === */}
      {sequences.active_count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-[#1E3A5F]" />
              סדרות מעקב פעילות ({sequences.active_count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(sequences.by_step).length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-slate-500 mb-2">לפי סדרה ושלב:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(sequences.by_step).map(([key, count]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: <span className="font-bold mr-1">{count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-right text-slate-500">
                    <th className="p-2 font-medium">שם</th>
                    <th className="p-2 font-medium">טלפון</th>
                    <th className="p-2 font-medium">סדרה</th>
                    <th className="p-2 font-medium">step</th>
                    <th className="p-2 font-medium">מעקב הבא</th>
                    <th className="p-2 font-medium">pipeline</th>
                  </tr>
                </thead>
                <tbody>
                  {sequences.next_up.map((l) => (
                    <tr key={l.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{l.name || '—'}</td>
                      <td className="p-2 font-mono text-xs">{l.phone || '—'}</td>
                      <td className="p-2 text-xs">{l.followup_sequence_name || '—'}</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">{l.followup_sequence_step ?? '?'}</Badge></td>
                      <td className="p-2 text-xs text-slate-700">{formatTime(l.next_followup_date)}</td>
                      <td className="p-2 text-xs text-slate-600">{l.pipeline_stage || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* === Abandoned conversations (got greeting, never replied) === */}
      {abandoned.count > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-600" />
              שיחות נטושות — קיבלו ברכה ולא ענו ({abandoned.count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-right text-slate-500">
                    <th className="p-2 font-medium">שם</th>
                    <th className="p-2 font-medium">טלפון</th>
                    <th className="p-2 font-medium">שלב</th>
                    <th className="p-2 font-medium">pipeline</th>
                    <th className="p-2 font-medium">הודעה אחרונה</th>
                  </tr>
                </thead>
                <tbody>
                  {abandoned.sample.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{s.lead_name || '—'}</td>
                      <td className="p-2 font-mono text-xs">{s.phone || '—'}</td>
                      <td className="p-2"><Badge className="bg-amber-100 text-amber-700 text-xs">{s.current_step}</Badge></td>
                      <td className="p-2 text-xs text-slate-600">{s.lead_pipeline_stage || '—'}</td>
                      <td className="p-2 text-xs text-slate-500">{formatTime(s.last_message_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* === Failures with lead names === */}
      {(failures.automations.length > 0 || failures.messages.length > 0) && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              כשלים אחרונים (24 שעות)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {failures.automations.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2">כללי automation שנכשלו/דולגו:</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-right text-slate-500">
                        <th className="p-2 font-medium">ליד</th>
                        <th className="p-2 font-medium">כלל</th>
                        <th className="p-2 font-medium">תוצאה</th>
                        <th className="p-2 font-medium">שגיאה</th>
                        <th className="p-2 font-medium">מתי</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failures.automations.map((f, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="p-2">
                            <div className="font-medium">{f.lead_name || '—'}</div>
                            <div className="font-mono text-[10px] text-slate-500">{f.lead_phone || ''}</div>
                          </td>
                          <td className="p-2 text-xs">{f.rule_name}</td>
                          <td className="p-2"><Badge className="bg-red-100 text-red-700 text-xs">{f.result}</Badge></td>
                          <td className="p-2 text-xs text-slate-600 max-w-[200px] truncate">{f.error_message || '—'}</td>
                          <td className="p-2 text-xs text-slate-500">{formatTime(f.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {failures.messages.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2">הודעות WhatsApp שנכשלו:</div>
                <div className="space-y-1">
                  {failures.messages.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded border border-red-100 bg-red-50/30 text-xs">
                      <span><strong>{m.lead_name || m.phone}</strong> · {(m.message_text || '').slice(0, 50)}</span>
                      <span className="text-slate-500">{formatTime(m.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {stuckSample.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-600" />לידים אחרונים — סטטוס בוט</CardTitle></CardHeader>
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
                        {lead.flow_type
                          ? <Badge variant="outline" className="text-xs">{lead.flow_type}</Badge>
                          : <Badge className="bg-amber-100 text-amber-700 text-xs">∅ NULL</Badge>}
                      </td>
                      <td className="p-2">
                        {lead.bot_current_step
                          ? <span className="text-xs text-slate-700">{lead.bot_current_step}</span>
                          : <span className="text-xs text-amber-600">∅</span>}
                      </td>
                      <td className="p-2">
                        {lead._session
                          ? <Badge className="bg-emerald-100 text-emerald-700 text-xs">{lead._session.completed ? 'closed' : lead._session.step}</Badge>
                          : <Badge className="bg-red-100 text-red-700 text-xs">לא נוצר</Badge>}
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

      {sample.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-[#1E3A5F]" />הודעות יוצאות אחרונות (8)</CardTitle></CardHeader>
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
                        <Badge className={m.delivery_status === 'sent' ? 'bg-emerald-100 text-emerald-700 text-xs' : m.delivery_status === 'failed' ? 'bg-red-100 text-red-700 text-xs' : 'bg-slate-100 text-slate-700 text-xs'}>
                          {m.delivery_status}
                        </Badge>
                      </td>
                      <td className="p-2 text-xs text-slate-700 max-w-[300px] truncate">{(m.message_text || '').slice(0, 60) || '—'}</td>
                      <td className="p-2 font-mono text-[10px] text-slate-500 max-w-[120px] truncate">{m.greenapi_message_id || '—'}</td>
                      <td className="p-2 text-xs text-slate-500">{formatTime(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
