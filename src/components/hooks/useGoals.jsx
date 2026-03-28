import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './useQueryKeys';
import { entities, invokeFunction } from '@/api/supabaseClient';

// --- Query: List Goals ---
export function useGoals(filters = {}) {
  return useQuery({
    queryKey: queryKeys.goals.list(filters),
    queryFn: () => entities.UserGoal.filter(filters),
    staleTime: 1000 * 60, // 1 minute
  });
}

// --- Mutation: Create Goal ---
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalData) => entities.UserGoal.create(goalData),
    onMutate: async (newGoal) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['goals', 'list'] });

      // Snapshot the previous value
      const previousGoals = queryClient.getQueriesData({ queryKey: ['goals', 'list'] });

      // Optimistically update to the new value
      const optimisticGoal = { 
        ...newGoal, 
        id: 'temp_' + Date.now(), 
        created_date: new Date().toISOString(),
        isOptimistic: true 
      };

      queryClient.setQueriesData({ queryKey: ['goals', 'list'] }, (old) => {
        return old ? [optimisticGoal, ...old] : [optimisticGoal];
      });

      return { previousGoals };
    },
    onError: (err, newGoal, context) => {
      // Rollback to the previous value
      if (context?.previousGoals) {
        context.previousGoals.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}

// --- Mutation: Generate Goal Plan (AI Function) ---
export function useGenerateGoalPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalData) => {
      const response = await invokeFunction('generateGoalPlan', { goalData });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
    onError: (err, variables) => {
      console.error("Failed to generate goal plan:", err);
      // We can update the UI to show error state if needed, but since it's background, logging is key
      // and maybe invalidating to ensure we don't show stale loading state if possible
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

// --- Mutation: Update Goal ---
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => entities.UserGoal.update(id, data),
    onMutate: async ({ id, ...newData }) => {
      await queryClient.cancelQueries({ queryKey: ['goals', 'list'] });
      const previousGoals = queryClient.getQueriesData({ queryKey: ['goals', 'list'] });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: ['goals', 'list'] }, (old) => {
        if (!old) return old;
        return old.map(goal => goal.id === id ? { ...goal, ...newData } : goal);
      });

      return { previousGoals };
    },
    onError: (err, newData, context) => {
      if (context?.previousGoals) {
        context.previousGoals.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}

// --- Mutation: Delete Goal ---
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId) => entities.UserGoal.delete(goalId),
    onMutate: async (goalId) => {
      await queryClient.cancelQueries({ queryKey: ['goals', 'list'] });
      const previousGoals = queryClient.getQueriesData({ queryKey: ['goals', 'list'] });

      // Optimistically delete
      queryClient.setQueriesData({ queryKey: ['goals', 'list'] }, (old) => {
        if (!old) return old;
        return old.filter(goal => goal.id !== goalId);
      });

      return { previousGoals };
    },
    onError: (err, goalId, context) => {
      if (context?.previousGoals) {
        context.previousGoals.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}