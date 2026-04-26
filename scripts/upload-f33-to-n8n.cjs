/**
 * Upload updated F33 workflow to n8n.
 * Run AFTER n8n is started: node scripts/upload-f33-to-n8n.cjs
 * Requires N8N_API_KEY env var or hardcoded below.
 */
const fs = require('fs');
const https = require('https');
const http = require('http');

const N8N_URL = process.env.N8N_URL || 'http://localhost:5678';
const API_KEY = process.env.N8N_API_KEY || '';
const WORKFLOW_ID = 'F33CbVflx4aApT71';

const parentDir = 'C:/Users/USER/Desktop/\u05e7\u05dc\u05d5\u05d0\u05d3 \u05e7\u05d5\u05d3';
const dirs = fs.readdirSync(parentDir);
const salesDir = dirs.find(d => d.includes('\u05de\u05db\u05d9\u05e8\u05d5\u05ea'));
const BASE = parentDir + '/' + salesDir;

const wf = JSON.parse(fs.readFileSync(BASE + '/docs/f33-live.json', 'utf8'));

const payload = JSON.stringify({
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: wf.settings,
  staticData: wf.staticData
});

const url = new URL(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`);
const lib = url.protocol === 'https:' ? https : http;

const req = lib.request({
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': API_KEY,
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      const resp = JSON.parse(data);
      console.log('OK - workflow updated, versionId:', resp.versionId);
    } else {
      console.error('FAIL status', res.statusCode, data.substring(0, 300));
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.write(payload);
req.end();
