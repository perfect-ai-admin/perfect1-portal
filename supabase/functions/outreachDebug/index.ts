import { getCorsHeaders, jsonResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  const resendKey = Deno.env.get('RESEND_API_KEY')!;
  const body = await req.json().catch(() => ({}));
  const action = body.action || 'domains';

  if (action === 'domains') {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { 'Authorization': `Bearer ${resendKey}` },
    });
    const data = await res.json();
    return jsonResponse(data, 200, req);
  }

  if (action === 'domain_detail') {
    const res = await fetch(`https://api.resend.com/domains/${body.domain_id}`, {
      headers: { 'Authorization': `Bearer ${resendKey}` },
    });
    const data = await res.json();
    return jsonResponse(data, 200, req);
  }

  if (action === 'verify') {
    const res = await fetch(`https://api.resend.com/domains/${body.domain_id}/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}` },
    });
    const data = await res.json();
    return jsonResponse(data, 200, req);
  }

  if (action === 'add_domain') {
    const res = await fetch('https://api.resend.com/domains', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: body.domain }),
    });
    const data = await res.json();
    return jsonResponse(data, 200, req);
  }

  return jsonResponse({ error: 'unknown action' }, 400, req);
});
