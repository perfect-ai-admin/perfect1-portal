const https = require('https');

const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'n8n.perfect-1.one', path: '/api/v1' + path, method,
      headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))); });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const w = await apiCall('GET', '/workflows/1OxdM_TyMM44VATmedDUn');

  // Fix "Is Sales Bot?" condition: check $json.id exists (not empty)
  const isSalesNode = w.nodes.find(n => n.name === 'Is Sales Bot?');
  isSalesNode.parameters = {
    conditions: {
      options: { version: 2, leftValue: '', caseSensitive: true, typeValidation: 'loose' },
      conditions: [{
        id: 'sales-bot-check',
        leftValue: '={{ $json.id }}',
        rightValue: '',
        operator: { type: 'string', operation: 'exists', singleValue: true }
      }],
      combinator: 'and'
    }
  };

  const payload = {
    name: w.name, nodes: w.nodes, connections: w.connections,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner' }
  };

  const result = await apiCall('PUT', '/workflows/1OxdM_TyMM44VATmedDUn', payload);
  console.log('Active:', result.active, '| Nodes:', result.nodes?.length);

  // Verify
  const isNode = result.nodes.find(n => n.name === 'Is Sales Bot?');
  console.log('Condition:', JSON.stringify(isNode.parameters.conditions.conditions[0]));
}

main().catch(console.error);
