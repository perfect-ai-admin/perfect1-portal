import { supabase } from '@/api/supabaseClient';

export const paymentsService = {
  async list() {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByUser() {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createCheckout(payload) {
    const { data, error } = await supabase.functions.invoke('createCheckoutSession', { body: payload });
    if (error) throw error;
    return data;
  }
};
