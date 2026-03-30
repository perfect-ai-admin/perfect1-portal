/**
 * Portal Lead Submission — writes to the MAIN database so leads appear in CRM.
 * Previously used a separate portal DB, but that caused leads to be invisible in CRM.
 */
import { supabaseAdmin } from './supabaseClient';

/**
 * Submit a lead to the main database (visible in CRM).
 * Uses supabaseAdmin to bypass RLS.
 */
export async function submitPortalLead(leadData) {
  const { error } = await supabaseAdmin
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
