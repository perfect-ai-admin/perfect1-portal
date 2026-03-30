import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeFunction, entities, supabase, supabaseAdmin } from '@/api/supabaseClient';

// ---- Queries ----

export function usePipelineLeads(filters = {}) {
  return useQuery({
    queryKey: ['crm-leads', filters],
    queryFn: () => invokeFunction('crmListLeads', filters),
    refetchInterval: 30000,
  });
}

export function useLeadDetail(leadId) {
  return useQuery({
    queryKey: ['crm-lead', leadId],
    queryFn: () => invokeFunction('crmGetLead', { lead_id: leadId }),
    enabled: !!leadId,
  });
}

export function useCRMDashboard() {
  return useQuery({
    queryKey: ['crm-dashboard'],
    queryFn: () => invokeFunction('crmGetDashboard', {}),
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

// ---- Mutations (direct DB via admin client — bypasses Edge Functions CORS) ----

export function useUpdateLeadStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { lead_id, new_stage, change_reason, lost_reason_id, lost_reason_note, follow_up_date } = payload;

      // Get current lead
      const { data: lead, error: getErr } = await supabaseAdmin
        .from('leads')
        .select('pipeline_stage')
        .eq('id', lead_id)
        .eq('source', 'sales_portal')
        .single();
      if (getErr || !lead) throw new Error('ליד לא נמצא');

      const old_stage = lead.pipeline_stage;
      const closedStages = ['not_interested', 'disqualified', 'duplicate', 'spam', 'converted'];
      const newStatus = new_stage === 'converted' ? 'converted'
        : closedStages.includes(new_stage) ? 'closed' : 'active';

      // Update lead
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

      const { error: updateErr } = await supabaseAdmin
        .from('leads')
        .update(updates)
        .eq('id', lead_id)
        .eq('source', 'sales_portal');
      if (updateErr) throw new Error(updateErr.message);

      // Write status history
      await supabaseAdmin.from('status_history').insert({
        entity_type: 'lead',
        entity_id: lead_id,
        old_stage,
        new_stage,
        old_status: old_stage,
        new_status: new_stage,
        change_reason: change_reason || null,
        source: 'sales_portal',
        metadata: { lost_reason_id, lost_reason_note, follow_up_date },
      });

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
    mutationFn: (payload) => invokeFunction('crmCreateLead', payload),
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

      // Verify lead exists
      const { data: lead, error: getErr } = await supabaseAdmin
        .from('leads')
        .select('id, pipeline_stage')
        .eq('id', lead_id)
        .eq('source', 'sales_portal')
        .single();
      if (getErr || !lead) throw new Error('ליד לא נמצא');

      if (hard_delete) {
        // Delete related data first
        await supabaseAdmin.from('communications').delete().eq('lead_id', lead_id).eq('source', 'sales_portal');
        await supabaseAdmin.from('tasks').delete().eq('lead_id', lead_id).eq('source', 'sales_portal');
        await supabaseAdmin.from('status_history').delete().eq('entity_id', lead_id).eq('entity_type', 'lead').eq('source', 'sales_portal');
        // Delete the lead
        const { error } = await supabaseAdmin.from('leads').delete().eq('id', lead_id).eq('source', 'sales_portal');
        if (error) throw new Error(error.message);
      } else {
        // Soft delete
        const { error } = await supabaseAdmin
          .from('leads')
          .update({ pipeline_stage: 'disqualified', status: 'closed', updated_at: new Date().toISOString(), sla_deadline: null })
          .eq('id', lead_id)
          .eq('source', 'sales_portal');
        if (error) throw new Error(error.message);

        await supabaseAdmin.from('status_history').insert({
          entity_type: 'lead',
          entity_id: lead_id,
          old_stage: lead.pipeline_stage,
          new_stage: 'disqualified',
          change_reason: 'נמחק מה-CRM',
          source: 'sales_portal',
        });
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
        const closedStages = ['converted', 'not_interested', 'disqualified', 'duplicate', 'spam'];
        const { error } = await supabaseAdmin
          .from('leads')
          .update({
            pipeline_stage: new_stage,
            status: closedStages.includes(new_stage) ? (new_stage === 'converted' ? 'converted' : 'closed') : 'active',
            pipeline_entered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .in('id', lead_ids)
          .eq('source', 'sales_portal');
        if (error) throw new Error(error.message);
      } else if (action === 'assign_agent') {
        const agent_id = payload.agent_id || payload.value;
        const { error } = await supabaseAdmin
          .from('leads')
          .update({ agent_id: agent_id || null, updated_at: new Date().toISOString() })
          .in('id', lead_ids)
          .eq('source', 'sales_portal');
        if (error) throw new Error(error.message);
      } else if (action === 'delete') {
        const { error } = await supabaseAdmin
          .from('leads')
          .update({ pipeline_stage: 'disqualified', status: 'closed', updated_at: new Date().toISOString(), sla_deadline: null })
          .in('id', lead_ids)
          .eq('source', 'sales_portal');
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(
        `https://fnsnnezhikgqajdbtwoa.supabase.co/functions/v1/crmExportLeads`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filters || {}),
        }
      );
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
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
      const { data, error } = await supabaseAdmin
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

      // Update lead timestamp
      if (payload.lead_id) {
        await supabaseAdmin
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
    mutationFn: (payload) => invokeFunction('crmAddTask', payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['crm-lead', variables.lead_id] });
      qc.invalidateQueries({ queryKey: ['crm-tasks'] });
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => invokeFunction('crmCompleteTask', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-lead'] });
      qc.invalidateQueries({ queryKey: ['crm-tasks'] });
    },
  });
}
