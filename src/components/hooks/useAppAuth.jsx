import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, invokeFunction } from '@/api/supabaseClient';
import { queryKeys } from './useQueryKeys';

// --- Query: Get Current User ---
export function useAppAuth() {
  return useQuery({
    queryKey: queryKeys.user.me,
    queryFn: async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;
        return { id: user.id, email: user.email, ...user.user_metadata };
      } catch (error) {
        console.error("Auth check failed:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// --- Mutation: Update User (Generic) ---
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase.auth.updateUser({ data });
      if (error) throw error;
      return result.user;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me });
      const previousUser = queryClient.getQueryData(queryKeys.user.me);
      queryClient.setQueryData(queryKeys.user.me, (old) => ({ ...old, ...newData }));
      return { previousUser };
    },
    onError: (err, newData, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.user.me, context.previousUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}

// --- Mutation: Update Phone ---
export function useUpdateUserPhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phone }) => {
      // First backend function if needed
      await invokeFunction('updateUserPhone', { phone });
      const { data, error } = await supabase.auth.updateUser({ data: { phone } });
      if (error) throw error;
      return data.user;
    },
    onMutate: async ({ phone }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me });
      const previousUser = queryClient.getQueryData(queryKeys.user.me);
      queryClient.setQueryData(queryKeys.user.me, (old) => ({ ...old, phone }));
      return { previousUser };
    },
    onError: (err, vars, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.user.me, context.previousUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  });
}

// --- Helper: Logout ---
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => supabase.auth.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.user.me, null);
      queryClient.clear();
    }
  });
}