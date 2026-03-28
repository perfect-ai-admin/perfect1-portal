// Migrated from Base44: googleAuthStart
// Start Google OAuth flow

import { corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    if (!clientId) {
      return errorResponse('GOOGLE_CLIENT_ID is not configured', 500);
    }

    const body = await req.json();
    const redirect_uri: string = body.redirect_uri;

    if (!redirect_uri) {
      return errorResponse('redirect_uri is required', 400);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return jsonResponse({ url: googleOAuthUrl });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('googleAuthStart error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
