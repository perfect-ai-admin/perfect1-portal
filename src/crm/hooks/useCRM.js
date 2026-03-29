import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeFunction, entities } from '@/api/supabaseClient';

// ---- Queries ----

export function usePipelineLeads(filters = {}) {
  return useQuery({
    queryKey: ['crm-leads', filters],
    queryFn: () => invokeFunction('crmListLeads', filters),
    refetchInterval: 30000, // refresh every 30s
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
