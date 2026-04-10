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
    throw errorResponse('Forbidden: Admin access required', 403, req);
  }
  return customer;
}

// --- HTML escaping helper (prevents XSS / HTML injection) ---
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- CORS ---
const ALLOWED_ORIGINS = [
  'https://perfect1.co.il',
  'https://www.perfect1.co.il',
  'https://perfect-dashboard.com',
  'https://www.perfect-dashboard.com',
  'https://one-pai.com',
  'https://www.one-pai.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

// בדוק האם origin מותר — כולל Vercel preview domains
function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // אפשר את כל דומיינים של Vercel
  if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) return true;
  return false;
}

// החזר CORS headers מותאמים ל-origin של הבקשה
// IMPORTANT: `Access-Control-Allow-Methods` must be present in the preflight
// response — without it, strict browsers (recent Chrome/Safari) may reject
// the preflight for POST+JSON requests with a generic "Failed to fetch".
export function getCorsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers?.get('Origin') || '';
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// corsHeaders — ברירת מחדל (backwards compatibility, ל-OPTIONS בלי req)
export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
};

// --- Rate limiting (in-memory, per Edge Function instance) ---
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}

// --- Input validation helpers ---
const ISRAELI_PHONE_RE = /^(\+972|972|0)(5[0-9]|7[2-9])\d{7}$/;

export function validatePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (ISRAELI_PHONE_RE.test(cleaned)) return cleaned;
  return null;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function sanitizeString(str: string, maxLen = 500): string {
  if (!str) return '';
  return str.slice(0, maxLen).replace(/[<>]/g, '');
}

// --- Security logging ---
export function logSecurityEvent(event: string, details: Record<string, unknown>) {
  console.warn(`[SECURITY] ${event}`, JSON.stringify(details));
}

// Standard response helpers
export function jsonResponse(data: unknown, status = 200, req?: Request) {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 500, req?: Request) {
  return jsonResponse({ error: message }, status, req);
}
