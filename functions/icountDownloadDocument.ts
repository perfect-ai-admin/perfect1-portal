import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

async function ensureSession(base44, userId) {
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({ user_id: userId, provider: 'icount' });
  if (!connections?.length) throw new Error('לא נמצא חיבור ל-iCount');
  const conn = connections[0];
  if (conn.status !== 'connected') throw new Error('החיבור ל-iCount אינו פעיל');

  const sidExpiry = conn.sid_expires_at ? new Date(conn.sid_expires_at) : null;
  if (conn.sid && sidExpiry && sidExpiry > new Date()) {
    return { sid: conn.sid, conn };
  }

  const loginRes = await fetch(`${ICOUNT_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cid: conn.provider_account_id, user: conn.username, pass: conn.password_ref })
  });
  const loginData = await loginRes.json();
  if (!loginData.status) throw new Error(loginData.error_description || 'שגיאת התחברות');

  await base44.asServiceRole.entities.AccountingConnection.update(conn.id, {
    sid: loginData.sid, sid_expires_at: new Date(Date.now() + 25 * 60 * 1000).toISOString()
  });
  return { sid: loginData.sid, conn };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { document_id } = body;

    if (!document_id) return Response.json({ error: 'document_id is required' }, { status: 400 });

    // Get local document to find provider details
    const docs = await base44.asServiceRole.entities.FinbotDocument.filter({ id: document_id });
    if (!docs?.length) return Response.json({ error: 'מסמך לא נמצא' }, { status: 404 });

    const doc = docs[0];

    // If we already have a PDF URL, return it
    if (doc.pdf_url) {
      return Response.json({ status: 'success', file_url: doc.pdf_url });
    }

    // Parse provider document ID (format: "doctype_docnum")
    const providerDocId = doc.finbot_document_id;
    if (!providerDocId || !providerDocId.includes('_')) {
      return Response.json({ error: 'מזהה מסמך ב-iCount לא תקין' }, { status: 400 });
    }

    const [doctype, docnum] = providerDocId.split('_');

    const { sid } = await ensureSession(base44, user.id);

    // Get PDF link from iCount
    const res = await fetch(`${ICOUNT_BASE_URL}/doc/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sid, doctype, docnum: parseInt(docnum), get_pdf_link: true })
    });

    const data = await res.json();

    if (!data.status || !data.pdf_link) {
      return Response.json({ error: 'לא ניתן להוריד את המסמך מ-iCount' });
    }

    // Update local record with pdf_url
    await base44.asServiceRole.entities.FinbotDocument.update(doc.id, { pdf_url: data.pdf_link });

    return Response.json({ status: 'success', file_url: data.pdf_link });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});