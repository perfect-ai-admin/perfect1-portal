import { supabase } from '@/api/supabaseClient';

export const landingPagesService = {
  async list() {
    const { data, error } = await supabase.from('landing_pages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getBySlug(slug) {
    const { data, error } = await supabase.from('landing_pages').select('*').eq('slug', slug).eq('is_published', true).single();
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase.from('landing_pages').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(page) {
    const { data, error } = await supabase.from('landing_pages').insert(page).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('landing_pages').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async publish(id) {
    const { data, error } = await supabase.functions.invoke('publishLandingPage', { body: { id } });
    if (error) throw error;
    return data;
  }
};
