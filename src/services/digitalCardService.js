import { supabase } from '@/api/supabaseClient';

export const digitalCardService = {
  async getMyCard() {
    const { data, error } = await supabase.from('digital_cards').select('*').single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(card) {
    const { data, error } = await supabase.from('digital_cards').insert(card).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('digital_cards').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getPublicCard(slug) {
    const { data, error } = await supabase.from('digital_cards').select('*').eq('slug', slug).eq('is_published', true).single();
    if (error) throw error;
    return data;
  }
};
