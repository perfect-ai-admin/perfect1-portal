import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { queryKeys } from './useQueryKeys';

// --- Query: Get Current User ---
export function useAppAuth() {
  return useQuery({
    queryKey: queryKeys.user.me,
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return user || null;
      } catch (error) {
        console.error("Auth check failed:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    retry: 1,
  });
}

// --- Mutation: Update User (Generic) ---
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
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
      await base44.functions.invoke('updateUserPhone', { phone });
      // Then update auth state
      return base44.auth.updateMe({ phone });
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
    mutationFn: () => base44.auth.logout(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.user.me, null);
      queryClient.clear();
    }
  });
}