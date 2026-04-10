import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeFunction, entities, supabase } from '@/api/supabaseClient';

// SECURITY: All queries use authenticated supabase client (respects RLS)
// ---- Queries (direct DB via supabase) ----

export function usePipelineLeads(filters = {}) {
  return useQuery({
    queryKey: ['crm-leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('source', 'sales_portal')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters.pipeline_stage && filters.pipeline_stage !== 'all') {
        query = query.eq('pipeline_stage', filters.pipeline_stage);
      }
      if (filters.agent_id && filters.agent_id !== 'all') {
        query = query.eq('agent_id', filters.agent_id);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data: leads, error } = await query;
      if (error) throw new Error(error.message);

      // Fetch agents for joining
      const { data: agents } = await supabase
        .from('ai_agents')
        .select('id, name')
        .eq('source', 'sales_portal');

      const agentMap = {};
      (agents || []).forEach(a => { agentMap[a.id] = a.name; });

      // Fetch last note per lead from lead_notes table
      const leadIds = (leads || []).map(l => l.id);
      const noteMap = {};
      if (leadIds.length > 0) {
        const { data: notes } = await supabase
          .from('lead_notes')
          .select('lead_id, note')
          .in('lead_id', leadIds)
          .order('created_at', { ascending: false });

        (notes || []).forEach(n => {
          if (!noteMap[n.lead_id] && n.note) {
            noteMap[n.lead_id] = n.note;
          }
        });
      }

      return (leads || []).map(lead => ({
        ...lead,
        agent_name: lead.agent_id ? agentMap[lead.agent_id] || null : null,
        last_note: noteMap[lead.id] || null,
      }));
    },
    refetchInterval: 30000,
  });
}

export function useLeadDetail(leadId) {
  return useQuery({
    queryKey: ['crm-lead', leadId],
    queryFn: async () => {
      // Fetch lead
      const { data: lead, error: leadErr } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('source', 'sales_portal')
        .single();
      if (leadErr || !lead) throw new Error(leadErr?.message || 'Lead not found');

      // Fetch related data in parallel
      const [commsResult, tasksResult, historyResult, agentResult, paymentsResult, botEventsResult] = await Promise.all([
        supabase.from('communications').select('*')
          .eq('lead_id', leadId).eq('source', 'sales_portal')
          .order('created_at', { ascending: false }),
        supabase.from('tasks').select('*')
          .eq('lead_id', leadId).eq('source', 'sales_portal')
          .order('due_date', { ascending: true }),
        supabase.from('status_history').select('*')
          .eq('entity_type', 'lead').eq('entity_id', leadId).eq('source', 'sales_portal')
          .order('created_at', { ascending: false }),
        lead.agent_id
          ? supabase.from('ai_agents').select('id, name, phone, email').eq('id', lead.agent_id).single()
          : Promise.resolve({ data: null }),
        supabase.from('payments').select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false }),
        supabase.from('bot_events').select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false }),
      ]);

      return {
        lead,
        agent: agentResult.data || null,
        communications: commsResult.data || [],
        tasks: tasksResult.data || [],
        status_history: historyResult.data || [],
        payments: paymentsResult.data || [],
        bot_events: botEventsResult.data || [],
      };
    },
    enabled: !!leadId,
  });
}

export function useCRMDashboard() {
  return useQuery({
    queryKey: ['crm-dashboard'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      const now = new Date().toISOString();

      const { data: allLeads } = await supabase
        .from('leads')
        .select('id, pipeline_stage, temperature, agent_id, sla_deadline, created_at, converted_at, estimated_value, contact_attempts')
        .eq('source', 'sales_portal')
        .limit(2000);

      const leads = allLeads || [];
      const closedStages = ['converted', 'not_interested', 'disqualified', 'duplicate', 'spam'];

      const stageCounts = {};
      leads.forEach(l => {
        const stage = l.pipeline_stage || 'new_lead';
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      });

      const newToday = leads.filter(l => l.created_at >= todayISO).length;
      const converted = leads.filter(l => l.pipeline_stage === 'converted').length;
      const activeLeads = leads.filter(l => !closedStages.includes(l.pipeline_stage));
      const slaBreaches = activeLeads.filter(l => l.sla_deadline && l.sla_deadline < now).length;
      const noActivity = activeLeads.filter(l => (l.contact_attempts || 0) === 0).length;
      const totalProcessed = leads.filter(l => closedStages.includes(l.pipeline_stage)).length;
      const conversionRate = totalProcessed > 0 ? Math.round((converted / totalProcessed) * 100) : 0;

      // Agent performance
      const agentStats = {};
      leads.forEach(l => {
        if (!l.agent_id) return;
        if (!agentStats[l.agent_id]) agentStats[l.agent_id] = { total: 0, active: 0, converted: 0 };
        agentStats[l.agent_id].total++;
        if (!closedStages.includes(l.pipeline_stage)) agentStats[l.agent_id].active++;
        if (l.pipeline_stage === 'converted') agentStats[l.agent_id].converted++;
      });

      const { data: agents } = await supabase
        .from('ai_agents').select('id, name').eq('source', 'sales_portal');
      const agentMap = {};
      (agents || []).forEach(a => { agentMap[a.id] = a.name; });

      const topAgents = Object.entries(agentStats)
        .map(([id, stats]) => ({ id, name: agentMap[id] || 'לא ידוע', ...stats }))
        .sort((a, b) => b.converted - a.converted)
        .slice(0, 5);

      const { data: todayTasks } = await supabase
        .from('tasks').select('id, title, lead_id, assigned_to, priority, due_date')
        .eq('source', 'sales_portal').eq('status', 'pending')
        .lte('due_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('due_date', { ascending: true }).limit(20);

      return {
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
      };
    },
    refetchInterval: 60000,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => entities.AiAgent.filter({ is_active: true }, 'name'),
  });
}

export function useServiceCatalog() {
  return useQuery({
    queryKey: ['service-catalog'],
    queryFn: () => entities.ServiceCatalog.filter({ is_active: true }, 'sort_order'),
  });
}

export function useLostReasons() {
  return useQuery({
    queryKey: ['lost-reasons'],
    queryFn: () => entities.LostReason.filter({ is_active: true }, 'sort_order'),
  });
}

// ---- Mutations (direct DB via supabase) ----

export function useUpdateLeadStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { lead_id, new_stage, change_reason, lost_reason_id, lost_reason_note, follow_up_date, agent_id } = payload;

      const { data: lead, error: getErr } = await supabase
        .from('leads')
        .select('pipeline_stage')
        .eq('id', lead_id)
        .eq('source', 'sales_portal')
        .single();
      if (getErr || !lead) throw new Error(getErr?.message || 'ליד לא נמצא');

      const old_stage = lead.pipeline_stage;
      // Valid status values: new, contacted, qualified, converted, closed
      const closedStages = ['not_interested', 'disqualified', 'duplicate', 'spam'];
      const contactedStages = ['contacted', 'no_answer', 'qualifying'];
      const qualifiedStages = ['qualified', 'proposal_sent', 'follow_up', 'awaiting_docs'];

      let newStatus = 'new';
      if (new_stage === 'converted') newStatus = 'converted';
      else if (closedStages.includes(new_stage)) newStatus = 'closed';
      else if (qualifiedStages.includes(new_stage)) newStatus = 'qualified';
      else if (contactedStages.includes(new_stage)) newStatus = 'contacted';

      const updates = {
        pipeline_stage: new_stage,
        status: newStatus,
        pipeline_entered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sla_deadline: null,
      };
      if (new_stage === 'converted') updates.converted_at = new Date().toISOString();
      if (new_stage === 'spam') updates.is_spam = true;
      if (lost_reason_note) updates.lost_reason_note = lost_reason_note;
      if (agent_id !== undefined) updates.agent_id = agent_id || null;

      const { error: updateErr } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', lead_id)
        .eq('source', 'sales_portal');
      if (updateErr) throw new Error(updateErr.message);

      // Write status history (non-blocking)
      supabase.from('status_history').insert({
        entity_type: 'lead',
        entity_id: lead_id,
        old_stage,
        new_stage,
        old_status: old_stage,
        new_status: new_stage,
        change_reason: change_reason || null,
        source: 'sales_portal',
        metadata: { lost_reason_id, lost_reason_note, follow_up_date },
      }).then(({ error }) => { if (error) console.warn('status_history:', error.message); });

      return { success: true, new_stage };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-leads'] });
      qc.invalidateQueries({ queryKey: ['crm-lead'] });
      qc.invalidateQueries({ queryKey: ['crm-dashboard'] });
    },
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // Check for duplicate by phone
      if (payload.phone && !payload.force_create) {
        const { data: existing } = await supabase
          .from('leads')
          .select('id, name, phone')
          .eq('phone', payload.phone)
          .eq('source', 'sales_portal')
          .limit(1)
          .maybeSingle();
        if (existing) {
          return { warning: 'duplicate_found', duplicate: existing };
        }
      }

      const insertData = {
        name: payload.name || null,
        phone: payload.phone || null,
        email: payload.email || null,
        service_type: payload.service_type || null,
        pipeline_stage: 'new_lead',
        status: 'new',
        source: 'sales_portal',
        interaction_type: 'manual',
        notes: payload.notes || null,
      };

      // Optional fields only if provided
      if (payload.city) insertData.city = payload.city;
      if (payload.temperature) insertData.temperature = payload.temperature;
      if (payload.agent_id) insertData.agent_id = payload.agent_id;
      if (payload.estimated_value) insertData.estimated_value = payload.estimated_value;

      const { data, error } = await supabase
        .from('leads')
        .insert(insertData)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-leads'] });
      qc.invalidateQueries({ queryKey: ['crm-dashboard'] });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { lead_id, hard_delete } = payload;

      const { data: lead, error: getErr } = await supabase
        .from('leads')
        .select('id, pipeline_stage')
        .eq('id', lead_id)
        .eq('source', 'sales_portal')
        .single();
      if (getErr || !lead) throw new Error(getErr?.message || 'ליד לא נמצא');

      if (hard_delete) {
        await Promise.allSettled([
          supabase.from('communications').delete().eq('lead_id', lead_id).eq('source', 'sales_portal'),
          supabase.from('tasks').delete().eq('lead_id', lead_id).eq('source', 'sales_portal'),
          supabase.from('status_history').delete().eq('entity_id', lead_id).eq('entity_type', 'lead').eq('source', 'sales_portal'),
        ]);
        const { error } = await supabase.from('leads').delete().eq('id', lead_id).eq('source', 'sales_portal');
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from('leads')
          .update({ pipeline_stage: 'disqualified', status: 'closed', updated_at: new Date().toISOString(), sla_deadline: null })
          .eq('id', lead_id)
          .eq('source', 'sales_portal');
        if (error) throw new Error(error.message);
      }

      return { success: true, deleted: lead_id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-leads'] });
      qc.invalidateQueries({ queryKey: ['crm-lead'] });
      qc.invalidateQueries({ queryKey: ['crm-dashboard'] });
    },
  });
}

export function useBulkAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { lead_ids, action } = payload;
      if (!lead_ids?.length || !action) throw new Error('Missing lead_ids or action');

      if (action === 'change_stage') {
        const new_stage = payload.new_stage || payload.value;
        const closedStages = ['not_interested', 'disqualified', 'duplicate', 'spam'];
        const contactedStages = ['contacted', 'no_answer', 'qualifying'];
        const qualifiedStages = ['qualified', 'proposal_sent', 'follow_up', 'awaiting_docs'];
        let bulkStatus = 'new';
        if (new_stage === 'converted') bulkStatus = 'converted';
        else if (closedStages.includes(new_stage)) bulkStatus = 'closed';
        else if (qualifiedStages.includes(new_stage)) bulkStatus = 'qualified';
        else if (contactedStages.includes(new_stage)) bulkStatus = 'contacted';

        const { error } = await supabase
          .from('leads')
          .update({
            pipeline_stage: new_stage,
            status: bulkStatus,
            pipeline_entered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .in('id', lead_ids)
          .eq('source', 'sales_portal');
        if (error) throw new Error(error.message);
      } else if (action === 'assign_agent') {
        const agent_id = payload.agent_id || payload.value;
        const { error } = await supabase
          .from('leads')
          .update({ agent_id: agent_id || null, updated_at: new Date().toISOString() })
          .in('id', lead_ids)
          .eq('source', 'sales_portal');
        if (error) throw new Error(error.message);
      } else if (action === 'delete') {
        await Promise.allSettled([
          supabase.from('communications').delete().in('lead_id', lead_ids).eq('source', 'sales_portal'),
          supabase.from('tasks').delete().in('lead_id', lead_ids).eq('source', 'sales_portal'),
          supabase.from('status_history').delete().in('entity_id', lead_ids).eq('entity_type', 'lead').eq('source', 'sales_portal'),
        ]);
        const { error } = await supabase.from('leads').delete().in('id', lead_ids).eq('source', 'sales_portal');
        if (error) throw new Error(error.message);
      }

      return { success: true, action, affected: lead_ids.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-leads'] });
      qc.invalidateQueries({ queryKey: ['crm-dashboard'] });
    },
  });
}

export function useExportLeads() {
  return useMutation({
    mutationFn: async (filters) => {
      // Export directly from DB
      let query = supabase
        .from('leads')
        .select('name, phone, email, pipeline_stage, status, service_type, lead_source, notes, created_at, updated_at')
        .eq('source', 'sales_portal')
        .order('created_at', { ascending: false });

      if (filters?.stage) query = query.eq('pipeline_stage', filters.stage);
      const { data, error } = await query;
      if (error) throw new Error(error.message);

      // Build CSV
      const headers = ['שם', 'טלפון', 'אימייל', 'שלב', 'סטטוס', 'סוג שירות', 'מקור', 'הערות', 'נוצר', 'עודכן'];
      const rows = (data || []).map(l => [
        l.name, l.phone, l.email, l.pipeline_stage, l.status,
        l.service_type, l.lead_source, l.notes, l.created_at, l.updated_at,
      ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));

      const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useAddCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('communications')
        .insert({
          lead_id: payload.lead_id || null,
          channel: payload.channel,
          direction: payload.direction || (payload.channel === 'note' ? 'internal' : null),
          content: payload.content || null,
          subject: payload.subject || null,
          outcome: payload.outcome || null,
          follow_up_needed: payload.follow_up_needed || false,
          follow_up_date: payload.follow_up_date || null,
          next_step: payload.next_step || null,
          source: 'sales_portal',
        })
        .select()
        .single();
      if (error) throw new Error(error.message);

      if (payload.lead_id) {
        await supabase
          .from('leads')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', payload.lead_id)
          .eq('source', 'sales_portal');
      }

      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['crm-lead', variables.lead_id] });
      qc.invalidateQueries({ queryKey: ['crm-leads'] });
    },
  });
}

export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: payload.title,
          description: payload.description || null,
          task_type: payload.task_type || 'general',
          lead_id: payload.lead_id || null,
          priority: payload.priority || 'medium',
          status: 'pending',
          due_date: payload.due_date || null,
          source: 'sales_portal',
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['crm-lead', variables.lead_id] });
      qc.invalidateQueries({ queryKey: ['crm-tasks'] });
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', payload.task_id)
        .eq('source', 'sales_portal');
      if (error) throw new Error(error.message);
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-lead'] });
      qc.invalidateQueries({ queryKey: ['crm-tasks'] });
    },
  });
}

// ---- Lead Notes ----

export function useLeadNotes(leadId) {
  return useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!leadId,
  });
}

export function useAddLeadNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: payload.lead_id,
          note: payload.note,
          created_by: payload.created_by || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['lead-notes', variables.lead_id] });
      qc.invalidateQueries({ queryKey: ['crm-leads'] });
      qc.invalidateQueries({ queryKey: ['crm-lead', variables.lead_id] });
    },
  });
}

// ---- WhatsApp Messages ----

export function useWhatsAppMessages(leadId) {
  return useQuery({
    queryKey: ['whatsapp-messages', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!leadId,
    refetchInterval: 10000,
  });
}

export function useSendWhatsAppMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ lead_id, message, message_type }) => {
      return invokeFunction('crmSendWhatsApp', { lead_id, message, message_type });
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['whatsapp-messages', variables.lead_id] });
      qc.invalidateQueries({ queryKey: ['crm-lead', variables.lead_id] });
    },
  });
}

// ---- Payment ----

export function useLeadPaymentStatus(leadId) {
  return useQuery({
    queryKey: ['lead-payment', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('payment_status, payment_id, payment_link_sent_at, paid_at')
        .eq('id', leadId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!leadId,
  });
}

export function useCreatePaymentLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ lead_id, amount, product_type, product_name, send_via_whatsapp }) => {
      return invokeFunction('crmCreatePaymentLink', {
        lead_id, amount, product_type, product_name,
        send_via_whatsapp: send_via_whatsapp !== false,
      });
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['crm-lead', variables.lead_id] });
      qc.invalidateQueries({ queryKey: ['lead-payment', variables.lead_id] });
      qc.invalidateQueries({ queryKey: ['whatsapp-messages', variables.lead_id] });
    },
  });
}

// ---- Follow-up Date ----

export function useUpdateFollowupDate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ lead_id, next_followup_date }) => {
      const { error } = await supabase
        .from('leads')
        .update({ next_followup_date, updated_at: new Date().toISOString() })
        .eq('id', lead_id)
        .eq('source', 'sales_portal');
      if (error) throw new Error(error.message);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['crm-leads'] });
      qc.invalidateQueries({ queryKey: ['crm-lead', variables.lead_id] });
    },
  });
}
