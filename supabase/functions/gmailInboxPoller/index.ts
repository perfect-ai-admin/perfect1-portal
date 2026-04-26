/**
 * gmailInboxPoller — בודק תיבת Gmail כל 2 דקות ומעביר תשובות outreach ל-outreachInboundReply
 */

const GMAIL_REFRESH_TOKEN = Deno.env.get('GMAIL_REFRESH_TOKEN')!;
const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID')!;
const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
// Use service role key for internal function-to-function calls (bypasses JWT validation)
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: GMAIL_REFRESH_TOKEN,
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OAuth token exchange failed: ${err}`);
  }
  const data = await res.json();
  return data.access_token;
}

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

function extractBody(payload: any): { text: string; html: string } {
  let text = '';
  let html = '';

  function traverse(part: any) {
    if (!part) return;
    const mime = part.mimeType || '';
    const data = part.body?.data;

    if (mime === 'text/plain' && data) {
      text = decodeBase64Url(data);
    } else if (mime === 'text/html' && data) {
      html = decodeBase64Url(data);
    }

    if (part.parts) {
      for (const p of part.parts) traverse(p);
    }
  }

  traverse(payload);
  return { text, html };
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const results: Array<{ messageId: string; status: string; error?: string }> = [];

  try {
    const accessToken = await getAccessToken();

    // חיפוש הודעות: נשלח ל-yosi5919+outreach-* וטרם נקרא
    const query = 'to:yosi5919+outreach- is:unread';
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`;

    const listRes = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listRes.ok) {
      const err = await listRes.text();
      return Response.json({ ok: false, error: `Gmail list failed: ${err}` }, { status: 500 });
    }

    const listData = await listRes.json();
    const messages: Array<{ id: string }> = listData.messages || [];

    console.log(`[gmailPoller] Found ${messages.length} unread outreach messages`);

    for (const { id } of messages) {
      try {
        // קבל את פרטי ההודעה המלאים
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!msgRes.ok) {
          results.push({ messageId: id, status: 'error', error: `fetch failed: ${msgRes.status}` });
          continue;
        }

        const msg = await msgRes.json();
        const headers = msg.payload?.headers || [];

        const to = getHeader(headers, 'To');
        const from = getHeader(headers, 'From');
        const subject = getHeader(headers, 'Subject');
        const { text, html } = extractBody(msg.payload);

        // וידוא שזה אכן מייל outreach
        if (!to.match(/yosi5919\+outreach-[a-f0-9-]{36}@gmail\.com/i)) {
          // סמן כנקרא ודלג
          await markRead(id, accessToken);
          results.push({ messageId: id, status: 'skipped_no_uuid' });
          continue;
        }

        // העבר ל-outreachInboundReply
        const replyRes = await fetch(
          `${SUPABASE_URL}/functions/v1/outreachInboundReply`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({ to, from, subject, text, html }),
          }
        );

        const replyData = await replyRes.json();
        console.log(`[gmailPoller] outreachInboundReply for ${id}:`, replyRes.status, JSON.stringify(replyData));

        // סמן כנקרא — גם אם הפונקציה החזירה skipped
        await markRead(id, accessToken);
        results.push({ messageId: id, status: replyRes.ok ? 'processed' : 'reply_error', ...replyData });
      } catch (err) {
        console.error(`[gmailPoller] Error processing ${id}:`, err);
        results.push({ messageId: id, status: 'exception', error: String(err) });
      }
    }

    const processed = results.filter((r) => r.status === 'processed').length;
    const skipped = results.filter((r) => r.status.startsWith('skipped')).length;
    const errors = results.filter((r) => r.status === 'error' || r.status === 'exception' || r.status === 'reply_error').length;

    return Response.json({
      ok: true,
      total: messages.length,
      processed,
      skipped,
      errors,
      results,
    });
  } catch (err) {
    console.error('[gmailPoller] Fatal error:', err);
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});

async function markRead(messageId: string, accessToken: string): Promise<void> {
  try {
    await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
      }
    );
  } catch (err) {
    console.error(`[gmailPoller] Failed to mark ${messageId} as read:`, err);
  }
}
