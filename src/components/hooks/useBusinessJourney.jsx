import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
export const JOURNEY_QUERY_KEY = ['businessJourney', 'active'];

/**
 * Fetches business journey data from the customers table.
 * Accepts either email (preferred) or userId. Since auth user ID ≠ customer ID,
 * we query by email to match the customer record.
 */
export function useBusinessJourney(userIdOrEmail) {
  return useQuery({
    queryKey: [...JOURNEY_QUERY_KEY, userIdOrEmail],
    queryFn: async () => {
      if (!userIdOrEmail) return null;

      // Determine if this is an email or UUID
      const isEmail = typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@');

      let query = supabase
        .from('customers')
        .select('id, business_state, client_tasks, business_plan, business_journey_answers, business_journey_completed_at');

      if (isEmail) {
        query = query.eq('email', userIdOrEmail);
      } else {
        query = query.eq('id', userIdOrEmail);
      }

      const { data, error } = await query.limit(1).single();

      if (error || !data) return null;

      // Return null if journey hasn't been completed yet
      if (!data.business_journey_completed_at) return null;

      return {
        customer_id: data.id,
        business_state: data.business_state,
        tasks: data.client_tasks || [],
        plan: data.business_plan || {},
        answers: data.business_journey_answers,
        completed_at: data.business_journey_completed_at,
        status: 'active',
      };
    },
    enabled: !!userIdOrEmail,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Resolves the customer_id from the auth user's email.
 * Use this when you need the customer table ID for queries (e.g., customer_goals).
 */
export function useCustomerId(userEmail) {
  return useQuery({
    queryKey: ['customerId', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .eq('email', userEmail)
        .limit(1)
        .single();
      if (error || !data) return null;
      return data.id;
    },
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 30, // 30 minutes - customer ID doesn't change
  });
}