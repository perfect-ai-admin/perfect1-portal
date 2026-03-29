import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeFunction, entities, supabase } from '@/api/supabaseClient';

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

// ---- Mutations ----

export function useUpdateLeadStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => invokeFunction('crmUpdateLeadStage', payload),
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
    mutationFn: (payload) => invokeFunction('crmDeleteLead', payload),
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
    mutationFn: (payload) => invokeFunction('crmBulkAction', payload),
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
    mutationFn: (payload) => invokeFunction('crmAddCommunication', payload),
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
