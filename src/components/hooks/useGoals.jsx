import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { queryKeys } from './useQueryKeys';

// --- Query: List Goals ---
export function useGoals(filters = {}) {
  return useQuery({
    queryKey: queryKeys.goals.list(filters),
    queryFn: () => base44.entities.UserGoal.filter(filters),
    staleTime: 1000 * 60, // 1 minute
  });
}

// --- Mutation: Create Goal (Simple Entity Create) ---
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalData) => base44.entities.UserGoal.create(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}

// --- Mutation: Generate Goal Plan (AI Function) ---
export function useGenerateGoalPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalData) => {
      const response = await base44.functions.invoke('generateGoalPlan', { goalData });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}

// --- Mutation: Update Goal ---
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => base44.entities.UserGoal.update(id, data),
    onMutate: async ({ id, ...newData }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.all });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}

// --- Mutation: Delete Goal ---
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId) => base44.entities.UserGoal.delete(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}