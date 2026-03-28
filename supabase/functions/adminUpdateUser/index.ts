// Migrated from Base44: adminUpdateUser
// Updates a customer record or deletes a customer_goal — admin only

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const customer = await getCustomer(req);
    if (!customer || customer.role !== 'admin') {
      return errorResponse('Unauthorized - Admin only', 403);
    }

    const { user_id, updates, delete_goal_id } = await req.json();

    // Handle goal deletion from admin
    if (delete_goal_id) {
      if (!user_id) {
        return errorResponse('Missing user_id', 400);
      }
      const { error } = await supabaseAdmin
        .from('customer_goals')
        .delete()
        .eq('id', delete_goal_id);
      if (error) throw new Error(error.message);
      return jsonResponse({ success: true, deleted_goal: delete_goal_id });
    }

    if (!user_id || !updates) {
      return errorResponse('Missing user_id or updates', 400);
    }

    // Sync role with is_admin
    if (typeof updates.is_admin === 'boolean') {
      updates.role = updates.is_admin ? 'admin' : 'user';
    }

    // Update customer using service role
    const { error } = await supabaseAdmin
      .from('customers')
      .update(updates)
      .eq('id', user_id);
    if (error) throw new Error(error.message);

    return jsonResponse({ success: true });

  } catch (error) {
    console.error('Error updating user:', error);
    return errorResponse((error as Error).message);
  }
});
