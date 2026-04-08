// tranzilaHandshake — Creates Tranzila handshake token for public payment pages (no auth required)

import { getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const { sum } = await req.json();

    if (typeof sum !== 'number' || sum <= 0) {
      return errorResponse('Invalid sum', 400, req);
    }

    const supplier = Deno.env.get('TRANZILA_TERMINAL_NAME');
    const tranzilaPW = Deno.env.get('TRANZILA_TERMINAL_PASSWORD') || '';

    if (!supplier) return errorResponse('Terminal not configured', 500, req);

    // Create handshake with Tranzila API
    const url = `https://api.tranzila.com/v1/handshake/create?supplier=${encodeURIComponent(supplier)}&sum=${sum}&TranzilaPW=${encodeURIComponent(tranzilaPW)}`;

    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok) {
      console.error('[tranzilaHandshake] API error:', res.status, text);
      return errorResponse('Tranzila handshake failed', 502, req);
    }

    // Response format: "thtk=TOKEN_VALUE"
    const match = text.match(/thtk=(.+)/);
    if (!match || !match[1]) {
      console.error('[tranzilaHandshake] Unexpected response:', text);
      return errorResponse('Invalid handshake response', 502, req);
    }

    const thtk = match[1].trim();

    return jsonResponse({ thtk, supplier, sum }, 200, req);
  } catch (error) {
    console.error('tranzilaHandshake error:', (error as Error).message);
    return errorResponse('Internal error', 500, req);
  }
});
