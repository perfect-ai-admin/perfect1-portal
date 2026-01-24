import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const JOURNEY_QUERY_KEY = ['businessJourney', 'active'];

export function useBusinessJourney(userId) {
  return useQuery({
    queryKey: [...JOURNEY_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return null;
      // Fetch the active journey for this user
      const journeys = await base44.entities.BusinessJourney.filter({ 
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