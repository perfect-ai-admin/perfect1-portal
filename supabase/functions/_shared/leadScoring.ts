// Lead Scoring + Event Logging
// Atomically increments lead_score and logs to lead_events table

import { SupabaseClient } from 'npm:@supabase/supabase-js@2';

// Score deltas per action (per spec)
export const SCORE_DELTAS = {
  payment_link_clicked: 30,
  payment_started_not_completed: 20,
  payment_completed: 50,
  identity_sent: 40,
  questionnaire_answered: 15,
  accountant_callback_requested: 25,
  asked_meaningful_question: 10,
  returned_after_followup: 15,
  cross_sell_clicked: 20,
} as const;

export type ScoreReason = keyof typeof SCORE_DELTAS;

// Atomically bump lead_score via the SQL function + log event
export async function addLeadScore(
  db: SupabaseClient,
  leadId: string | null,
  reason: ScoreReason,
  extraData: Record<string, unknown> = {},
): Promise<number | null> {
  if (!leadId) return null;

  const delta = SCORE_DELTAS[reason];

  try {
    const { data, error } = await db.rpc('increment_lead_score', {
      p_lead_id: leadId,
      p_delta: delta,
      p_reason: reason,
    });
    if (error) {
      console.warn('addLeadScore RPC failed:', error.message);
      return null;
    }

    // Also insert a richer event if extraData is provided
    if (Object.keys(extraData).length > 0) {
      await db.from('lead_events').insert({
        lead_id: leadId,
        event_type: reason,
        event_data: extraData,
        score_delta: delta,
        source: 'sales_portal',
      });
    }

    return data as number;
  } catch (e: any) {
    console.warn('addLeadScore exception:', e.message);
    return null;
  }
}

// Log an event without changing score
export async function logLeadEvent(
  db: SupabaseClient,
  leadId: string | null,
  eventType: string,
  eventData: Record<string, unknown> = {},
  stateTransition?: { from: string | null; to: string },
): Promise<void> {
  if (!leadId) return;
  try {
    await db.from('lead_events').insert({
      lead_id: leadId,
      event_type: eventType,
      event_data: eventData,
      previous_state: stateTransition?.from || null,
      new_state: stateTransition?.to || null,
      source: 'sales_portal',
    });
  } catch (e: any) {
    console.warn('logLeadEvent failed:', e.message);
  }
}
