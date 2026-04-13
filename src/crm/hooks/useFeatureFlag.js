import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';

// Fetch a single feature flag from system_settings
export function useFeatureFlag(key) {
  const { data, isLoading } = useQuery({
    queryKey: ['feature-flag', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();
      if (error) return false;
      return data?.value === true || data?.value === 'true';
    },
    staleTime: 60_000, // cache 1 minute
    retry: false,
  });
  return { enabled: !!data, isLoading };
}
