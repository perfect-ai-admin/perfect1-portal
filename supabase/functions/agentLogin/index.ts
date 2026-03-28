import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { username, password } = await req.json();
    if (!username || !password) return errorResponse('Username and password required', 400);

    const { data: agent } = await supabaseAdmin
      .from('ai_agents')
      .select('id, name, username, role, status')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (!agent) return errorResponse('Invalid credentials', 401);

    return jsonResponse({ agent });
  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
