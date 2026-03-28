import { supabase } from '@/api/supabaseClient';

export const creditsService = {
  async getCredits() {
    const { data, error } = await supabase.from('user_accounts').select('logo_credits, download_credits, total_logo_runs').single();
    if (error) throw error;
    return data;
  },

  async checkAndReserve() {
    const { data, error } = await supabase.functions.invoke('checkAndReserveCredit');
    if (error) throw error;
    return data;
  },

  async addCredits(target_user_id, amount) {
    const { data, error } = await supabase.functions.invoke('addCredits', { body: { target_user_id, amount } });
    if (error) throw error;
    return data;
  }
};
