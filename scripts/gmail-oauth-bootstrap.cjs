#!/usr/bin/env node
/**
 * Gmail OAuth Bootstrap
 * Runs ONCE to obtain a Gmail-scoped refresh token for yosi5919@gmail.com.
 * Usage: node scripts/gmail-oauth-bootstrap.cjs
 */

const http = require('http');
const { URL } = require('url');
const { exec } = require('child_process');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars before running.');
  process.exit(1);
}
const REDIRECT_URI = 'http://localhost:3456/oauth/callback';
const SCOPE = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
].join(' ');

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&access_type=offline` +
  `&prompt=consent`;

async function exchangeCode(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  return res.json();
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:3456`);
  if (u.pathname !== '/oauth/callback') {
    res.writeHead(404).end();
    return;
  }
  const code = u.searchParams.get('code');
  const err = u.searchParams.get('error');
  if (err) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>OAuth error: ${err}</h1>`);
    console.error('OAuth error:', err);
    process.exit(1);
  }
  const tokens = await exchangeCode(code);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<html dir="rtl"><body style="font-family:sans-serif;padding:40px">
    <h1>✓ האישור הושלם</h1>
    <p>אפשר לסגור את החלון ולחזור ל-Claude.</p></body></html>`);

  console.log('\n========== GMAIL REFRESH TOKEN ==========');
  console.log(tokens.refresh_token || 'NO REFRESH TOKEN — try again with prompt=consent');
  console.log('=========================================\n');
  console.log('Full response:', JSON.stringify(tokens, null, 2));
  setTimeout(() => process.exit(0), 1000);
});

server.listen(3456, () => {
  console.log('\n🔗 פתח את הקישור הבא בדפדפן (אם לא נפתח אוטומטית):\n');
  console.log(authUrl);
  console.log('\nממתין לאישור...\n');
  const cmd = process.platform === 'win32' ? `start "" "${authUrl}"`
            : process.platform === 'darwin' ? `open "${authUrl}"`
            : `xdg-open "${authUrl}"`;
  exec(cmd);
});
