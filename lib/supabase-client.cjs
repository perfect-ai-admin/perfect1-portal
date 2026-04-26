/**
 * Supabase REST + RPC helper. Native https — no extra deps.
 * Used by every script that touches seo_* tables.
 */
const https = require('https');
const { SUPABASE_URL } = require('../config/site.config.cjs');

function getKey() {
  const k = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '').trim();
  if (!k) throw new Error('SUPABASE_SERVICE_KEY not set');
  return k;
}

function request(method, p, body, opts = {}) {
  const key = opts.allowMissingKey ? (process.env.SUPABASE_SERVICE_KEY || '').trim() : getKey();
  const data = body ? JSON.stringify(body) : null;
  const u = new URL(`${SUPABASE_URL}${p}`);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...(opts.prefer ? { Prefer: opts.prefer } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: d ? JSON.parse(d) : null }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Convenience wrappers
function get(p) {
  return request('GET', `/rest/v1${p}`).then(r => Array.isArray(r.body) ? r.body : []);
}

function insert(table, row) {
  return request('POST', `/rest/v1/${table}`, row, { prefer: 'return=representation' });
}

function update(table, filter, fields) {
  return request('PATCH', `/rest/v1/${table}?${filter}`, fields, { prefer: 'return=minimal' });
}

function rpc(fn, args) {
  return request('POST', `/rest/v1/rpc/${fn}`, args || {});
}

function callFunction(fnName, payload) {
  // For Supabase Edge Functions (e.g. sendEmail).
  const key = getKey();
  const u = new URL(`${SUPABASE_URL}/functions/v1/${fnName}`);
  const data = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = { request, get, insert, update, rpc, callFunction };
