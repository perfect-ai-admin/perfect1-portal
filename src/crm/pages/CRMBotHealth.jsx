import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Send, MessageSquare,
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Phone, ArrowUpRight,
  Zap, Clock, Users, Target, Workflow,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/api/supabaseClient';

// =====================================================================
// Data fetching — all queries in parallel against Supabase via JS client
// =====================================================================
async function fetchBotHealth() {
  const now = new Date();
  const since30m = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const since2h = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const todayIso = startOfToday.toISOString();
  const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const yesterdayIso = startOfYesterday.toISOString();

  const [
    msgs30mRes, msgs24hRes, sampleMsgsRes,
    sessionsTodayRes, sessionsYesterdayRes,
    leadsTodayRes, leadsYesterdayRes,
    inboundTodayRes, inboundYesterdayRes,
    abandonedRes,
    pipelineRes, leads7dRes,
    sequencesRes,
    failedAutoRes, failedMsgsRes,
    automationLogsRes,
    stageChangesRes,
  ] = await Promise.all([
    supabase.from('whatsapp_messages').select('delivery_status').eq('direction', 'outbound').gte('created_at', since30m),
    supabase.from('whatsapp_messages').select('delivery_status').eq('direction', 'outbound').gte('created_at', since24h),
    supabase.from('whatsapp_messages').select('phone, delivery_status, greenapi_message_id, created_at, message_text, lead_id, leads(name)')
      .eq('direction', 'outbound').gte('created_at', since24h).order('created_at', { ascending: false }).limit(10),

    // Today's bot activity
    supabase.from('bot_sessions').select('id, current_step, lead_id, completed_at, last_message_at, messages_count, created_at')
      .gte('created_at', todayIso),
    supabase.from('bot_sessions').select('id, current_step, completed_at, messages_count')
      .gte('created_at', yesterdayIso).lt('created_at', todayIso),

    // Today's leads
    supabase.from('leads').select('id, name, phone, pipeline_stage, source_page, created_at')
      .gte('created_at', todayIso).not('phone', 'is', null).neq('phone', ''),
    supabase.from('leads').select('id', { count: 'exact', head: true })
      .gte('created_at', yesterdayIso).lt('created_at', todayIso).not('phone', 'is', null).neq('phone', ''),

    supabase.from('whatsapp_messages').select('id', { count: 'exact', head: true })
      .eq('direction', 'inbound').gte('created_at', todayIso),
    supabase.from('whatsapp_messages').select('id', { count: 'exact', head: true })
      .eq('direction', 'inbound').gte('created_at', yesterdayIso).lt('created_at', todayIso),

    // Abandoned sessions — got greeting, never replied (in business hours, > 2h ago)
    supabase.from('bot_sessions').select('id, phone, current_step, lead_id, last_message_at, messages_count')
      .is('completed_at', null)
      .in('current_step', ['opening', 'entry_menu'])
      .lt('last_message_at', since2h)
      .gte('created_at', since7d),

    // Pipeline distribution — all leads with phone
    supabase.from('leads').select('pipeline_stage, do_not_contact, followup_paused')
      .not('phone', 'is', null).neq('phone', ''),

    // 7-day funnel: every lead created in last 7 days + their bot status
    supabase.from('leads').select('id, pipeline_stage, bot_current_step, bot_messages_count, created_at')
      .gte('created_at', since7d).not('phone', 'is', null).neq('phone', ''),

    // Active follow-up sequences
    supabase.from('leads').select('id, name, phone, followup_sequence_name, followup_sequence_step, next_followup_date, pipeline_stage, sub_status')
      .not('followup_sequence_name', 'is', null)
      .eq('followup_paused', false)
      .eq('do_not_contact', false)
      .order('next_followup_date', { ascending: true })
      .limit(20),

    // Failures with names
    supabase.from('automation_logs').select('rule_name, result, error_message, created_at, lead_id, leads(name, phone)')
      .in('result', ['failed', 'skipped_dnc', 'skipped_max'])
      .gte('created_at', since24h).order('created_at', { ascending: false }).limit(8),
    supabase.from('whatsapp_messages').select('phone, message_text, created_at, lead_id, leads(name)')
      .eq('direction', 'outbound').eq('delivery_status', 'failed').gte('created_at', since24h)
      .order('created_at', { ascending: false }).limit(8),

    // All automation logs for breakdown
    supabase.from('automation_logs').select('result').gte('created_at', since24h),

    // Status changes (proxy: leads with non-default stage updated today)
    supabase.from('leads').select('id', { count: 'exact', head: true })
      .gte('updated_at', todayIso).neq('pipeline_stage', 'new_lead'),
  ]);

  // ====================================================
  // Process — compute everything for the UI
  // ====================================================
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

  // Green API health inference
  const lastSent = (sampleMsgsRes?.data || []).find((m) => m.delivery_status === 'sent');
  const lastSentMinutesAgo = lastSent ? Math.floor((now - new Date(lastSent.created_at)) / 60000) : null;
  let healthStatus, healthLabel, healthHint;
  if (recent30.failed > 0 && recent30.sent === 0) {
    healthStatus = 'broken';
    healthLabel = 'הבוט תקול';
    healthHint = `${recent30.failed} ניסיונות שליחה נכשלו ב-30 דקות אחרונות`;
  } else if (lastSent && lastSentMinutesAgo <= 60) {
    healthStatus = 'good';
    healthLabel = 'הבוט עובד תקין';
    healthHint = `הודעה אחרונה נשלחה לפני ${lastSentMinutesAgo} דק'`;
  } else if (lastSent && lastSentMinutesAgo <= 1440) {
    healthStatus = 'idle';
    healthLabel = 'הבוט בהמתנה';
    healthHint = `הודעה אחרונה נשלחה לפני ${Math.round(lastSentMinutesAgo / 60)} שעות`;
  } else {
    healthStatus = 'unknown';
    healthLabel = 'אין פעילות אחרונה';
    healthHint = 'אף הודעה לא נשלחה ב-24 שעות אחרונות';
  }

  // === Today vs yesterday ===
  const sessionsToday = sessionsTodayRes?.data || [];
  const sessionsYesterday = sessionsYesterdayRes?.data || [];
  const leadsToday = leadsTodayRes?.data || [];
  const leadsYesterdayCount = leadsYesterdayRes?.count || 0;
  const inboundToday = inboundTodayRes?.count || 0;
  const inboundYesterday = inboundYesterdayRes?.count || 0;

  const todayStarted = sessionsToday.length;
  const yesterdayStarted = sessionsYesterday.length;
  const todayCompleted = sessionsToday.filter((s) => s.completed_at).length;
  const todayActive = sessionsToday.filter((s) => !s.completed_at && new Date(s.last_message_at) > new Date(now.getTime() - 30 * 60 * 1000)).length;

  // === Action items: who needs attention RIGHT NOW ===
  const abandoned = abandonedRes?.data || [];
  const failedAutomations = (failedAutoRes?.data || []).map((l) => ({
    ...l,
    lead_name: l.leads?.name,
    lead_phone: l.leads?.phone,
  }));
  const failedMessages = (failedMsgsRes?.data || []).map((m) => ({
    ...m,
    lead_name: m.leads?.name,
  }));

  // Enrich abandoned with lead names
  let actionItems = [];
  if (abandoned.length > 0) {
    const leadIds = abandoned.map((s) => s.lead_id).filter(Boolean);
    const { data: leadsForAbandoned } = leadIds.length > 0
      ? await supabase.from('leads').select('id, name, pipeline_stage').in('id', leadIds)
      : { data: [] };
    const leadMap = new Map((leadsForAbandoned || []).map((l) => [l.id, l]));
    abandoned.forEach((s) => {
      const lead = leadMap.get(s.lead_id);
      const minutesAgo = Math.floor((now - new Date(s.last_message_at)) / 60000);
      actionItems.push({
        type: 'abandoned',
        urgency: minutesAgo > 240 ? 'high' : 'medium',
        lead_id: s.lead_id,
        lead_name: lead?.name || '(אין שם)',
        lead_phone: s.phone,
        pipeline_stage: lead?.pipeline_stage,
        title: 'לא ענה לבוט',
        detail: `קיבל ברכה לפני ${formatDuration(minutesAgo)} — לא הגיב`,
        minutes_ago: minutesAgo,
      });
    });
  }

  failedMessages.forEach((m) => {
    const minutesAgo = Math.floor((now - new Date(m.created_at)) / 60000);
    actionItems.push({
      type: 'failed_msg',
      urgency: 'high',
      lead_id: m.lead_id,
      lead_name: m.lead_name || '(אין שם)',
      lead_phone: m.phone,
      title: 'שליחת WhatsApp נכשלה',
      detail: (m.message_text || '').slice(0, 60),
      minutes_ago: minutesAgo,
    });
  });

  failedAutomations.forEach((f) => {
    if (!f.lead_id) return;
    const minutesAgo = Math.floor((now - new Date(f.created_at)) / 60000);
    actionItems.push({
      type: 'failed_rule',
      urgency: f.result === 'failed' ? 'high' : 'low',
      lead_id: f.lead_id,
      lead_name: f.lead_name || '(אין שם)',
      lead_phone: f.lead_phone,
      title: `כלל "${f.rule_name}" נכשל (${f.result})`,
      detail: f.error_message || '',
      minutes_ago: minutesAgo,
    });
  });

  // Sort by urgency then recency
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  actionItems.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || a.minutes_ago - b.minutes_ago);
  // Dedup by lead_id (one item per lead)
  const seen = new Set();
  actionItems = actionItems.filter((i) => {
    if (seen.has(i.lead_id)) return false;
    seen.add(i.lead_id);
    return true;
  }).slice(0, 15);

  // === 7-day funnel ===
  const leads7d = leads7dRes?.data || [];
  const funnel = {
    total: leads7d.length,
    greeted: leads7d.filter((l) => l.bot_current_step !== null).length,
    replied: leads7d.filter((l) => (l.bot_messages_count || 0) > 1).length,
    qualified: leads7d.filter((l) => ['qualified', 'proposal_sent', 'negotiation', 'won'].includes(l.pipeline_stage)).length,
    won: leads7d.filter((l) => l.pipeline_stage === 'won').length,
    lost: leads7d.filter((l) => l.pipeline_stage === 'lost' || l.pipeline_stage === 'disqualified').length,
  };

  // === Pipeline distribution ===
  const allLeads = pipelineRes?.data || [];
  const pipelineCounts = {};
  let dncCount = 0, pausedCount = 0;
  allLeads.forEach((l) => {
    const stage = l.pipeline_stage || 'unknown';
    pipelineCounts[stage] = (pipelineCounts[stage] || 0) + 1;
    if (l.do_not_contact) dncCount++;
    if (l.followup_paused) pausedCount++;
  });

  // === Sequences ===
  const sequences = sequencesRes?.data || [];
  const sequenceCounts = {};
  sequences.forEach((l) => {
    const key = l.followup_sequence_name || 'אחר';
    sequenceCounts[key] = (sequenceCounts[key] || 0) + 1;
  });

  // === Automation log breakdown ===
  const allLogs = automationLogsRes?.data || [];
  const logBreakdown = {};
  allLogs.forEach((l) => {
    logBreakdown[l.result] = (logBreakdown[l.result] || 0) + 1;
  });

  return {
    generated_at: now.toISOString(),
    health: { status: healthStatus, label: healthLabel, hint: healthHint, last_sent_minutes_ago: lastSentMinutesAgo },
    today: {
      new_leads: leadsToday.length,
      new_leads_yesterday: leadsYesterdayCount,
      bot_started: todayStarted,
      bot_started_yesterday: yesterdayStarted,
      bot_completed: todayCompleted,
      replies_received: inboundToday,
      replies_received_yesterday: inboundYesterday,
      action_items_count: actionItems.length,
      active_now: todayActive,
    },
    funnel,
    action_items: actionItems,
    pipeline: { total: allLeads.length, counts: pipelineCounts, do_not_contact: dncCount, followup_paused: pausedCount },
    sequences: { total: sequences.length, by_name: sequenceCounts, next_up: sequences.slice(0, 6) },
    automation: { total_runs_24h: allLogs.length, breakdown: logBreakdown, status_changes_today: stageChangesRes?.count || 0 },
    technical: {
      recent_messages: (sampleMsgsRes?.data || []).map((m) => ({ ...m, lead_name: m.leads?.name })),
      failed_automations: failedAutomations,
      failed_messages: failedMessages,
    },
  };
}

async function triggerTestSend() {
  const { data: lead } = await supabase.from('leads')
    .select('id, name, phone, source_page')
    .is('bot_current_step', null).not('phone', 'is', null).neq('phone', '')
    .order('created_at', { ascending: false }).limit(1).single();
  if (!lead) return { skipped: true };
  const { data, error } = await supabase.functions.invoke('botStartFlow', {
    body: { lead_id: lead.id, lead_name: lead.name || 'Test', phone: lead.phone, page_slug: lead.source_page || 'open-osek-patur' },
  });
  if (error) throw error;
  return { ok: true, lead_phone: lead.phone, response: data };
}

// =====================================================================
// UI helpers
// =====================================================================
function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} דק'`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} שעות`;
  return `${Math.floor(hours / 24)} ימים`;
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('he-IL', { hour12: false });
}

function TrendArrow({ today, yesterday }) {
  if (yesterday === 0 && today === 0) return null;
  if (yesterday === 0) return <span className="text-emerald-600 text-xs font-medium">חדש</span>;
  const pct = Math.round(((today - yesterday) / yesterday) * 100);
  if (pct === 0) return <span className="inline-flex items-center text-slate-500 text-xs"><Minus size={12} /> ללא שינוי</span>;
  if (pct > 0) return <span className="inline-flex items-center text-emerald-600 text-xs font-medium"><TrendingUp size={12} className="ml-1" /> +{pct}%</span>;
  return <span className="inline-flex items-center text-red-600 text-xs font-medium"><TrendingDown size={12} className="ml-1" /> {pct}%</span>;
}

function HeroStatus({ health }) {
  const config = {
    good: { bg: 'from-emerald-500 to-emerald-600', icon: CheckCircle2, text: 'הבוט עובד תקין' },
    broken: { bg: 'from-red-500 to-red-600', icon: XCircle, text: 'הבוט תקול' },
    idle: { bg: 'from-amber-500 to-amber-600', icon: Clock, text: 'הבוט בהמתנה' },
    unknown: { bg: 'from-slate-500 to-slate-600', icon: AlertTriangle, text: 'אין מידע' },
  };
  const c = config[health.status] || config.unknown;
  const Icon = c.icon;
  return (
    <div className={`bg-gradient-to-l ${c.bg} text-white rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-lg">
          <Icon className="h-10 w-10" />
        </div>
        <div className="flex-1">
          <div className="text-3xl font-bold">{health.label}</div>
          <div className="text-white/90 text-sm mt-1">{health.hint}</div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, today, yesterday, accent = 'slate', onClick, urgent = false }) {
  const accents = {
    slate: 'border-slate-200',
    blue: 'border-blue-200',
    emerald: 'border-emerald-200',
    amber: 'border-amber-200',
    red: 'border-red-200 bg-red-50',
  };
  return (
    <div
      className={`p-5 rounded-xl border ${accents[accent]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className={`h-5 w-5 text-${accent}-600`} />
        {urgent && value > 0 && <Badge className="bg-red-100 text-red-700 text-xs animate-pulse">דחוף</Badge>}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-600 mt-1">{label}</div>
      {(today !== undefined || yesterday !== undefined) && (
        <div className="mt-2"><TrendArrow today={today} yesterday={yesterday} /> <span className="text-xs text-slate-400">vs אתמול</span></div>
      )}
    </div>
  );
}

function FunnelStage({ label, value, prevValue, color }) {
  const conversion = prevValue > 0 ? Math.round((value / prevValue) * 100) : null;
  return (
    <div className="flex-1 min-w-0">
      <div className={`p-3 rounded-lg border-r-4 ${color} bg-slate-50`}>
        <div className="text-xs text-slate-500 truncate">{label}</div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {conversion !== null && (
          <div className="text-xs text-slate-500 mt-1">
            {conversion}% המרה
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Main component
// =====================================================================
export default function CRMBotHealth() {
  const navigate = useNavigate();
  const [showTechnical, setShowTechnical] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['bot-health-v2'],
    queryFn: fetchBotHealth,
    refetchInterval: 30000,
  });

  const handleTestSend = async () => {
    try {
      toast.info('מריץ ברכה...');
      const r = await triggerTestSend();
      if (r.skipped) toast.success('אין לידים תקועים — הכל תקין');
      else toast.success(`נשלחה ברכה ל-${r.lead_phone}`);
      refetch();
    } catch (e) {
      toast.error(`שגיאה: ${e.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500">טוען...</p>
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
            <span className="font-semibold">שגיאה בטעינה</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error.message}</p>
          <Button onClick={() => refetch()} className="mt-3" size="sm" variant="outline">נסה שוב</Button>
        </CardContent>
      </Card>
    );
  }

  const { health, today, funnel, action_items, pipeline, sequences, automation, technical } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      <Helmet><title>בריאות הבוט — CRM</title></Helmet>

      {/* === Header === */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">בריאות הבוט</h1>
          <p className="text-sm text-slate-500 mt-1">
            עדכון אוטומטי כל 30 שניות · {formatTime(data.generated_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isFetching}>
            <RefreshCw className={`ml-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            רענן
          </Button>
          <Button onClick={handleTestSend} size="sm" className="bg-[#1E3A5F] hover:bg-[#2C5282]">
            <Zap className="ml-2 h-4 w-4" />
            בדוק שליחה
          </Button>
        </div>
      </div>

      {/* === Hero status === */}
      <HeroStatus health={health} />

      {/* === Today's KPIs (the 4 numbers a CEO needs in 5 sec) === */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">היום</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={Users} label="לידים חדשים" value={today.new_leads}
                   today={today.new_leads} yesterday={today.new_leads_yesterday} accent="blue" />
          <KpiCard icon={Send} label="קיבלו ברכה מהבוט" value={today.bot_started}
                   today={today.bot_started} yesterday={today.bot_started_yesterday} accent="blue" />
          <KpiCard icon={MessageSquare} label="הגיבו לבוט" value={today.replies_received}
                   today={today.replies_received} yesterday={today.replies_received_yesterday} accent="emerald" />
          <KpiCard icon={AlertTriangle} label="דורשים טיפול ידני" value={today.action_items_count}
                   accent={today.action_items_count > 0 ? 'red' : 'emerald'} urgent />
        </div>
      </div>

      {/* === Action Items — most actionable section === */}
      {action_items.length > 0 && (
        <Card className="border-amber-300 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5" />
              דורשים את תשומת ליבך — {action_items.length} לידים
            </CardTitle>
            <p className="text-sm text-slate-500">לחץ על שם הליד כדי לפתוח את הכרטיס שלו</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {action_items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => item.lead_id && navigate(`/CRM/leads/${item.lead_id}`)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition ${
                    item.urgency === 'high' ? 'border-red-200 bg-red-50/30' : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.urgency === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{item.lead_name}</span>
                        <span className="font-mono text-xs text-slate-500">{item.lead_phone}</span>
                        {item.pipeline_stage && (
                          <Badge variant="outline" className="text-xs">{item.pipeline_stage}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-slate-700 mt-0.5">
                        <span className="font-medium">{item.title}</span>
                        {item.detail && <span className="text-slate-500"> · {item.detail}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-500">{formatDuration(item.minutes_ago)}</span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* === 7-day funnel === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#1E3A5F]" />
            משפך לידים — 7 ימים אחרונים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <FunnelStage label="לידים חדשים" value={funnel.total} prevValue={null} color="border-blue-500" />
            <FunnelStage label="קיבלו ברכה" value={funnel.greeted} prevValue={funnel.total} color="border-blue-400" />
            <FunnelStage label="הגיבו" value={funnel.replied} prevValue={funnel.greeted} color="border-amber-400" />
            <FunnelStage label="התקדמו" value={funnel.qualified} prevValue={funnel.replied} color="border-emerald-400" />
            <FunnelStage label="עסקאות סגורות" value={funnel.won} prevValue={funnel.qualified} color="border-emerald-600" />
          </div>
          {funnel.lost > 0 && (
            <div className="mt-3 text-xs text-slate-500">
              {funnel.lost} לידים סווגו כלא רלוונטיים בתקופה זו
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Pipeline & Sequences (2-col) === */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Workflow className="h-5 w-5 text-[#1E3A5F]" />
              חלוקה לפי שלב ב-pipeline
            </CardTitle>
            <p className="text-sm text-slate-500">{pipeline.total} לידים סה"כ</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(pipeline.counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([stage, count]) => {
                const pct = Math.round((count / pipeline.total) * 100);
                return (
                  <div key={stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{stage}</span>
                      <span className="font-semibold text-slate-900">{count} <span className="text-xs text-slate-400">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#1E3A5F] h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t text-xs">
              <Badge className="bg-amber-100 text-amber-700">מושהים: {pipeline.followup_paused}</Badge>
              <Badge className="bg-red-100 text-red-700">DNC: {pipeline.do_not_contact}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-[#1E3A5F]" />
              סדרות מעקב פעילות
            </CardTitle>
            <p className="text-sm text-slate-500">{sequences.total} לידים בסדרות (שעות פעילות 8:00-18:00)</p>
          </CardHeader>
          <CardContent>
            {sequences.total === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">אין סדרות פעילות כרגע</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(sequences.by_name).map(([name, count]) => (
                    <Badge key={name} variant="outline" className="text-xs">
                      {name}: <span className="font-bold mr-1">{count}</span>
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-500">הבאים לתור:</div>
                  {sequences.next_up.map((l) => (
                    <div key={l.id}
                         onClick={() => navigate(`/CRM/leads/${l.id}`)}
                         className="flex items-center justify-between p-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{l.name || '—'}</span>
                        <Badge variant="outline" className="text-xs">step {l.followup_sequence_step ?? '?'}</Badge>
                      </div>
                      <span className="text-xs text-slate-500">{formatTime(l.next_followup_date)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === Automation summary === */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-[#1E3A5F]" />
            פעילות אוטומציה (24 שעות)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 rounded border border-slate-200">
              <div className="text-2xl font-bold">{automation.total_runs_24h}</div>
              <div className="text-xs text-slate-500">הפעלות סה"כ</div>
            </div>
            <div className="text-center p-3 rounded border border-emerald-200 bg-emerald-50/30">
              <div className="text-2xl font-bold text-emerald-700">{automation.breakdown.sent || 0}</div>
              <div className="text-xs text-slate-500">הודעות נשלחו</div>
            </div>
            <div className="text-center p-3 rounded border border-red-200 bg-red-50/30">
              <div className="text-2xl font-bold text-red-700">{automation.breakdown.failed || 0}</div>
              <div className="text-xs text-slate-500">נכשלו</div>
            </div>
            <div className="text-center p-3 rounded border border-amber-200 bg-amber-50/30">
              <div className="text-2xl font-bold text-amber-700">{automation.status_changes_today}</div>
              <div className="text-xs text-slate-500">שינויי סטטוס היום</div>
            </div>
          </div>
          {Object.keys(automation.breakdown).length > 0 && (
            <div className="mt-4 pt-3 border-t flex flex-wrap gap-2 text-xs">
              {Object.entries(automation.breakdown).map(([k, v]) => (
                <Badge key={k} variant="outline" className="text-xs">{k}: {v}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Technical details (collapsed) === */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowTechnical(!showTechnical)}>
          <CardTitle className="flex items-center justify-between text-base text-slate-600">
            <span className="flex items-center gap-2">
              {showTechnical ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              נתונים טכניים מלאים
            </span>
            <span className="text-xs font-normal text-slate-400">לדיבוג ומעקב פרטני</span>
          </CardTitle>
        </CardHeader>
        {showTechnical && (
          <CardContent className="space-y-4">
            {technical.recent_messages.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">10 הודעות יוצאות אחרונות</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-right text-slate-500">
                        <th className="p-2 font-medium">ליד</th>
                        <th className="p-2 font-medium">סטטוס</th>
                        <th className="p-2 font-medium">תוכן</th>
                        <th className="p-2 font-medium">מתי</th>
                      </tr>
                    </thead>
                    <tbody>
                      {technical.recent_messages.map((m, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2"><span className="font-medium">{m.lead_name || '—'}</span><br /><span className="font-mono text-[10px] text-slate-500">{m.phone}</span></td>
                          <td className="p-2"><Badge className={m.delivery_status === 'sent' ? 'bg-emerald-100 text-emerald-700 text-xs' : 'bg-red-100 text-red-700 text-xs'}>{m.delivery_status}</Badge></td>
                          <td className="p-2 text-xs max-w-[300px] truncate">{(m.message_text || '').slice(0, 80)}</td>
                          <td className="p-2 text-xs text-slate-500">{formatTime(m.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {technical.failed_automations.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">כללי automation שנכשלו/דולגו</div>
                <div className="space-y-1">
                  {technical.failed_automations.map((f, i) => (
                    <div key={i} className="text-xs p-2 border border-red-100 rounded bg-red-50/30">
                      <span className="font-medium">{f.lead_name}</span> · {f.rule_name} · <Badge className="bg-red-100 text-red-700 text-xs">{f.result}</Badge>
                      {f.error_message && <div className="text-slate-600 mt-1">{f.error_message}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
