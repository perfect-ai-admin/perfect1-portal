// Shared Supabase client for Edge Functions
// Replaces: createClientFromRequest from @base44/sdk

import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Admin client (service role) — bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Create user-scoped client from request Authorization header
export function createUserClient(req: Request) {
  const authHeader = req.headers.get('Authorization') || '';
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });
}

// Get authenticated user from request (auth.users)
export async function getUser(req: Request) {
  const userClient = createUserClient(req);
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) return null;
  return user;
}

// Get customer record for an authenticated user (by email)
export async function getCustomer(req: Request) {
  const user = await getUser(req);
  if (!user) return null;
  const { data } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('email', user.email)
    .limit(1)
    .single();
  return data;
}

// Find customer by ID or phone (for service role / webhook contexts)
export async function findCustomer(identifier: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(identifier)) {
    const { data } = await supabaseAdmin.from('customers').select('*').eq('id', identifier).single();
    return data;
  }
  const { data } = await supabaseAdmin.from('customers').select('*').eq('phone_e164', identifier).single();
  return data;
}

// Require admin customer — returns customer or throws Response
export async function requireAdmin(req: Request) {
  const customer = await getCustomer(req);
  if (!customer || customer.role !== 'admin') {
    throw errorResponse('Forbidden: Admin access required', 403);
  }
  return customer;
}

// CORS headers for Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Standard response helpers
export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 500) {
  return jsonResponse({ error: message }, status);
}
