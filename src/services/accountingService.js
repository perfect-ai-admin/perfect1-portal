import { supabase } from '@/api/supabaseClient';

export const accountingService = {
  async getConnectionStatus() {
    const { data, error } = await supabase.from('accounting_connections').select('*');
    if (error) throw error;
    return data;
  },

  async connectProvider(provider, credentials) {
    const { data, error } = await supabase.functions.invoke('acctConnectProvider', { body: { provider, credentials } });
    if (error) throw error;
    return data;
  },

  async reconnectProvider(provider) {
    const { data, error } = await supabase.functions.invoke('acctConnectProvider', { body: { provider, reconnect: true } });
    if (error) throw error;
    return data;
  },

  async disconnectProvider(provider) {
    const { data, error } = await supabase.functions.invoke('acctDisconnectProvider', { body: { provider } });
    if (error) throw error;
    return data;
  },

  async createDocument(payload) {
    const { data, error } = await supabase.functions.invoke('acctCreateDocument', { body: payload });
    if (error) throw error;
    return data;
  },

  async fetchReports(provider) {
    const { data, error } = await supabase.functions.invoke('acctFetchReports', { body: { provider } });
    if (error) throw error;
    return data;
  },

  async getDocuments(filters = {}) {
    let query = supabase.from('accounting_documents').select('*').order('created_at', { ascending: false });
    if (filters.provider) query = query.eq('provider', filters.provider);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getCustomers() {
    const { data, error } = await supabase.from('accounting_customers').select('*').order('name');
    if (error) throw error;
    return data;
  }
};
