// CRM: Dashboard statistics

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    await requireAdmin(req);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Fetch all active leads
    const { data: allLeads } = await supabaseAdmin
      .from('leads')
      .select('id, pipeline_stage, temperature, agent_id, sla_deadline, created_at, converted_at, estimated_value, contact_attempts')
      .eq('source', 'sales_portal')
      .limit(2000);

    const leads = allLeads || [];

    // Pipeline stage counts
    const stageCounts: Record<string, number> = {};
    leads.forEach((l: Record<string, unknown>) => {
      const stage = l.pipeline_stage as string || 'new_lead';
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    // Today's new leads
    const newToday = leads.filter((l: Record<string, unknown>) =>
      (l.created_at as string) >= todayISO
    ).length;

    // Converted leads (all time)
    const converted = leads.filter((l: Record<string, unknown>) =>
      l.pipeline_stage === 'converted'
    ).length;

    // Active leads (not closed)
    const closedStages = ['converted', 'not_interested', 'disqualified', 'duplicate', 'spam'];
    const activeLeads = leads.filter((l: Record<string, unknown>) =>
      !closedStages.includes(l.pipeline_stage as string)
    );

    // SLA breaches
    const now = new Date().toISOString();
    const slaBreaches = activeLeads.filter((l: Record<string, unknown>) =>
      l.sla_deadline && (l.sla_deadline as string) < now
    ).length;

    // Leads without any activity (contact_attempts = 0)
    const noActivity = activeLeads.filter((l: Record<string, unknown>) =>
      (l.contact_attempts as number || 0) === 0
    ).length;

    // Conversion rate
    const totalProcessed = leads.filter((l: Record<string, unknown>) =>
      closedStages.includes(l.pipeline_stage as string)
    ).length;
    const conversionRate = totalProcessed > 0
      ? Math.round((converted / totalProcessed) * 100)
      : 0;

    // Agent performance
    const agentStats: Record<string, { total: number; active: number; converted: number }> = {};
    leads.forEach((l: Record<string, unknown>) => {
      const aid = l.agent_id as string;
      if (!aid) return;
      if (!agentStats[aid]) agentStats[aid] = { total: 0, active: 0, converted: 0 };
      agentStats[aid].total++;
      if (!closedStages.includes(l.pipeline_stage as string)) agentStats[aid].active++;
      if (l.pipeline_stage === 'converted') agentStats[aid].converted++;
    });

    // Get agent names
    const { data: agents } = await supabaseAdmin
      .from('ai_agents')
      .select('id, name')
      .eq('source', 'sales_portal');

    const agentMap: Record<string, string> = {};
    (agents || []).forEach((a: { id: string; name: string }) => {
      agentMap[a.id] = a.name;
    });

    const topAgents = Object.entries(agentStats)
      .map(([id, stats]) => ({
        id,
        name: agentMap[id] || 'לא ידוע',
        ...stats,
      }))
      .sort((a, b) => b.converted - a.converted)
      .slice(0, 5);

    // Follow-ups due today
    const { data: todayTasks } = await supabaseAdmin
      .from('tasks')
      .select('id, title, lead_id, assigned_to, priority, due_date')
      .eq('source', 'sales_portal')
      .eq('status', 'pending')
      .lte('due_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .order('due_date', { ascending: true })
      .limit(20);

    return jsonResponse({
      kpis: {
        new_today: newToday,
        active_leads: activeLeads.length,
        converted,
        conversion_rate: conversionRate,
        sla_breaches: slaBreaches,
        no_activity: noActivity,
        total_leads: leads.length,
      },
      stage_counts: stageCounts,
      top_agents: topAgents,
      today_tasks: todayTasks || [],
    }, 200, req);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
