// Migrated from Base44: updateUserPhone
// Update current user's phone number — normalizes to E.164 format (Israel)

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

/**
 * Normalize an Israeli phone number to E.164 format.
 * Examples:
 *   0521234567  → +972521234567
 *   972521234567 → +972521234567
 *   +972521234567 → +972521234567
 */
function normalizeIsraeliPhone(phone: string): string {
  // Remove all non-digit characters except leading +
  const cleaned = phone.trim();

  if (cleaned.startsWith('+')) {
    // Already has country code — keep as is, strip non-digits after +
    return '+' + cleaned.slice(1).replace(/\D/g, '');
  }

  const digits = cleaned.replace(/\D/g, '');

  if (digits.startsWith('972')) {
    return '+' + digits;
  }

  if (digits.startsWith('0')) {
    // Israeli local format: remove leading 0, add +972
    return '+972' + digits.slice(1);
  }

  // Assume Israeli number without leading 0
  return '+972' + digits;
}

function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const { phone } = await req.json();
    if (!phone) return errorResponse('phone is required', 400);

    const normalized = normalizeIsraeliPhone(phone);

    if (!isValidE164(normalized)) {
      return errorResponse(`Invalid phone number: "${phone}" — could not normalize to E.164`, 400);
    }

    // Check uniqueness
    const { data: existing } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone_e164', normalized)
      .neq('id', customer.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return errorResponse('This phone number is already in use by another account', 409);
    }

    const { error } = await supabaseAdmin
      .from('customers')
      .update({ phone_e164: normalized, updated_at: new Date().toISOString() })
      .eq('id', customer.id);

    if (error) return errorResponse(error.message);

    return jsonResponse({ success: true, phone_e164: normalized });
  } catch (error) {
    console.error('updateUserPhone error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
