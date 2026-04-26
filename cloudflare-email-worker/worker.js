/**
 * Cloudflare Email Worker — Inbound Reply Router
 *
 * Receives emails sent to reply+UUID@perfect1.co.il
 * Forwards the payload to Supabase outreachInboundReply function.
 *
 * Deploy steps:
 * 1. Create worker in Cloudflare dashboard (Workers & Pages → Create)
 * 2. Paste this code
 * 3. Add secret: SUPABASE_URL = https://rtlpqjqdmomyptcdkmrq.supabase.co
 * 4. Add secret: SUPABASE_ANON_KEY = <your anon key>
 * 5. In Email Routing (perfect1.co.il) → Routing Rules:
 *    - Catch-all: "Send to Worker" → select this worker
 *    OR
 *    - Custom address: reply+* → Send to Worker (requires wildcard support)
 */

export default {
  async email(message, env, ctx) {
    const to = message.to || '';
    const from = message.from || '';

    // Only process reply+UUID emails
    if (!to.includes('reply+')) {
      console.log(`[email-worker] Ignoring email to ${to} — not a reply address`);
      return;
    }

    // Read email body (text)
    let bodyText = '';
    let bodyHtml = '';
    try {
      const reader = message.raw.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const rawEmail = new TextDecoder().decode(
        chunks.reduce((a, b) => {
          const c = new Uint8Array(a.length + b.length);
          c.set(a, 0);
          c.set(b, a.length);
          return c;
        }, new Uint8Array(0))
      );

      // Extract text body (simple extraction after blank line)
      const parts = rawEmail.split('\r\n\r\n');
      bodyText = parts.slice(1).join('\r\n\r\n').slice(0, 5000);
    } catch (err) {
      console.error('[email-worker] Failed to read email body:', err);
      bodyText = '(could not read body)';
    }

    const payload = {
      to: [to],
      from: from,
      subject: message.headers?.get('subject') || '',
      text: bodyText,
      html: bodyHtml,
    };

    try {
      const res = await fetch(
        `${env.SUPABASE_URL}/functions/v1/outreachInboundReply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      console.log(`[email-worker] Supabase response: ${res.status}`, JSON.stringify(data));
    } catch (err) {
      console.error('[email-worker] Failed to call Supabase:', err);
    }
  },
};
