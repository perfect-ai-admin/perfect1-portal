import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/supabaseClient';
export const JOURNEY_QUERY_KEY = ['businessJourney', 'active'];

export function useBusinessJourney(userId) {
  return useQuery({
    queryKey: [...JOURNEY_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return null;
      // Fetch the active journey for this user
      const journeys = await entities.BusinessJourney.filter({ 
        user_id: userId, 
        status: 'active' 
      });
      
      // Return the most recent active one if multiple exist (though logic prevents multiples)
      return journeys.length > 0 ? journeys[0] : null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}