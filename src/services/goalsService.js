import { supabase } from '@/api/supabaseClient';

export const goalsService = {
  async listGoals() {
    const { data, error } = await supabase.from('goals').select('*, goal_steps(*)').order('created_at');
    if (error) throw error;
    return data;
  },

  async getUserGoals(customerId) {
    const { data, error } = await supabase.from('customer_goals').select('*, goals(*, goal_steps(*))').eq('customer_id', customerId);
    if (error) throw error;
    return data;
  },

  async activateGoal(user_goal_id) {
    const { data, error } = await supabase.functions.invoke('activateGoal', { body: { user_goal_id } });
    if (error) throw error;
    return data;
  },

  async completeGoal(goalId) {
    const { data, error } = await supabase.functions.invoke('completeGoal', { body: { goalId } });
    if (error) throw error;
    return data;
  },

  async selectGoal(goalId) {
    const { data, error } = await supabase.functions.invoke('selectGoal', { body: { goalId } });
    if (error) throw error;
    return data;
  },

  subscribe(callback) {
    return supabase.channel('customer_goals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_goals' }, callback)
      .subscribe();
  }
};
