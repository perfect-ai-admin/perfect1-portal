import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';

// Fetch a single feature flag from system_settings
// Falls back to true if table doesn't exist or query fails
export function useFeatureFlag(key) {
  const { data, isLoading } = useQuery({
    queryKey: ['feature-flag', key],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', key)
          .single();

        if (error) {
          console.warn('[useFeatureFlag] Query error for', key, ':', error.message, '— defaulting to true');
          return true;
        }

        const val = data?.value;
        return val === true || val === 'true' || val === '"true"';
      } catch (err) {
        console.warn('[useFeatureFlag] Exception for', key, ':', err, '— defaulting to true');
        return true;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  // Default to true while loading (fail-open)
  return { enabled: isLoading ? false : (data ?? true), isLoading };
}
