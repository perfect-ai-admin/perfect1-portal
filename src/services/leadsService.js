import { supabase } from '@/api/supabaseClient';

export const leadsService = {
  async list(options = {}) {
    const { limit = 100, orderBy = 'created_at', ascending = false, filters = {} } = options;
    let query = supabase.from('leads').select('*').order(orderBy, { ascending }).limit(limit);
    Object.entries(filters).forEach(([key, value]) => { query = query.eq(key, value); });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(lead) {
    const { data, error } = await supabase.from('leads').insert(lead).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('leads').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
  },

  async getById(id) {
    const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async submit(leadData) {
    const { data, error } = await supabase.functions.invoke('submitLead', { body: leadData });
    if (error) throw error;
    return data;
  }
};
