import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

// Hash password with SHA-256 + salt using Web Crypto API
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time comparison to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { username, password } = await req.json();
    if (!username || !password) return errorResponse('Username and password required', 400);

    // Fetch agent by username only — never compare password in SQL query
    const { data: agent } = await supabaseAdmin
      .from('ai_agents')
      .select('id, name, username, password_hash, password_salt, role, status')
      .eq('username', username)
      .single();

    if (!agent) return errorResponse('Invalid credentials', 401);

    // --- Migration path: support both hashed and legacy plaintext passwords ---
    if (agent.password_hash && agent.password_salt) {
      // New secure path: compare hashed password
      const inputHash = await hashPassword(password, agent.password_salt);
      if (!safeCompare(inputHash, agent.password_hash)) {
        return errorResponse('Invalid credentials', 401);
      }
    } else {
      // Legacy fallback: read plaintext password and compare
      // TODO: migrate all agents to hashed passwords, then remove this block
      const { data: legacyAgent } = await supabaseAdmin
        .from('ai_agents')
        .select('id, password')
        .eq('id', agent.id)
        .single();

      if (!legacyAgent || legacyAgent.password !== password) {
        return errorResponse('Invalid credentials', 401);
      }

      // Auto-migrate: hash the password and store it
      const salt = crypto.randomUUID();
      const hash = await hashPassword(password, salt);
      await supabaseAdmin
        .from('ai_agents')
        .update({ password_hash: hash, password_salt: salt })
        .eq('id', agent.id);
    }

    // Return agent info without sensitive fields
    const { password_hash, password_salt, ...safeAgent } = agent;
    return jsonResponse({ agent: safeAgent });
  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
