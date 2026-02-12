import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      user_id: user.id, status: 'connected', provider: 'morning',
    });
    if (!connections?.length) return Response.json({ error: 'No morning connection' }, { status: 400 });
    const conn = connections[0];

    const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: conn.api_key_enc, secret: conn.api_secret_enc }),
    });
    const { token } = await tokenResp.json();

    // Fetch just 3 docs to see the structure
    const resp = await fetch(`${MORNING_BASE}/documents/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromDate: '2025-01-01', toDate: '2025-12-31', page: 1, pageSize: 3 }),
    });
    const data = await resp.json();
    
    // Also fetch 1 expense
    const expResp = await fetch(`${MORNING_BASE}/expenses/search`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromDate: '2025-01-01', toDate: '2025-12-31', page: 1, pageSize: 2 }),
    });
    const expData = await expResp.json();

    return Response.json({ 
      documents_sample: data.items?.slice(0, 3),
      expenses_sample: expData.items?.slice(0, 2),
      doc_keys: data.items?.[0] ? Object.keys(data.items[0]) : [],
      expense_keys: expData.items?.[0] ? Object.keys(expData.items[0]) : [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});