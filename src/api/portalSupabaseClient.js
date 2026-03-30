/**
 * Portal Supabase Client — separate database for perfect1.co.il
 * Used only for lead submissions from the portal/landing pages.
 */
import { createClient } from '@supabase/supabase-js';

const portalSupabaseUrl = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
const portalSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Njc0NjMsImV4cCI6MjA5MDQ0MzQ2M30.NceenXJ43_B3NN9MVz4b5wR4t1Si0hRfYedfmtoujXQ';

export const portalSupabase = createClient(portalSupabaseUrl, portalSupabaseAnonKey);

/**
 * Submit a lead to the portal database.
 * Direct insert — no Edge Function needed.
 */
export async function submitPortalLead(leadData) {
  const { error } = await portalSupabase
    .from('leads')
    .insert({
      name: leadData.name,
      phone: leadData.phone,
      profession: leadData.profession || null,
      source: leadData.source || 'sales_portal',
      source_page: leadData.source_page || null,
      utm_source: leadData.utm_source || null,
      utm_medium: leadData.utm_medium || null,
      utm_campaign: leadData.utm_campaign || null,
      utm_term: leadData.utm_term || null,
      utm_content: leadData.utm_content || null,
      referrer: leadData.referrer || null,
    });

  if (error) {
    console.error('[submitPortalLead] Failed:', error.message);
    throw new Error(error.message);
  }
}
