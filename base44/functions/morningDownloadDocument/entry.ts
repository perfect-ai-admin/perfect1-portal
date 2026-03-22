import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

/**
 * Morning (Green Invoice) — get document download links.
 * Input: { document_id } (our local AccountingDocument id)
 * 
 * Morning API: GET /documents/{id}/download returns { file: "url" }
 * Also GET /documents/{id} returns url.origin, url.he, url.en
 */
async function getJWT(base44, userId) {
  const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
    user_id: userId, status: 'connected', provider: 'morning',
  });
  if (!connections?.length) throw new Error('אין חיבור פעיל ל-Morning');
  const conn = connections[0];
  
  const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: conn.api_key_enc, secret: conn.api_secret_enc }),
  });
  if (!tokenResp.ok) throw new Error('שגיאה בהתחברות ל-Morning');
  const { token } = await tokenResp.json();
  return token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { document_id } = await req.json();
    if (!document_id) return Response.json({ error: 'חסר document_id' }, { status: 400 });

    // Get our local document
    const docs = await base44.asServiceRole.entities.AccountingDocument.filter({
      user_id: user.id, provider: 'morning',
    });
    const doc = docs?.find(d => d.id === document_id);
    if (!doc) return Response.json({ error: 'מסמך לא נמצא' }, { status: 404 });

    // If we already have a PDF URL, return it
    if (doc.pdf_url) {
      return Response.json({ status: 'success', pdf_url: doc.pdf_url });
    }

    if (!doc.provider_document_id) {
      return Response.json({ error: 'חסר מזהה מסמך ב-Morning' }, { status: 400 });
    }

    const jwt = await getJWT(base44, user.id);

    // First try: GET /documents/{id} to get the url object
    const docResp = await fetch(`${MORNING_BASE}/documents/${doc.provider_document_id}`, {
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    });

    if (docResp.ok) {
      const docData = await docResp.json();
      const pdfUrl = docData.url?.origin || docData.url?.he || docData.url?.en || null;
      if (pdfUrl) {
        await base44.asServiceRole.entities.AccountingDocument.update(doc.id, { pdf_url: pdfUrl });
        return Response.json({ status: 'success', pdf_url: pdfUrl });
      }
    }

    // Fallback: try /documents/{id}/download
    const dlResp = await fetch(`${MORNING_BASE}/documents/${doc.provider_document_id}/download`, {
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    });

    if (dlResp.ok) {
      const dlData = await dlResp.json();
      const pdfUrl = dlData.file || dlData.url || dlData.link || null;
      if (pdfUrl) {
        await base44.asServiceRole.entities.AccountingDocument.update(doc.id, { pdf_url: pdfUrl });
        return Response.json({ status: 'success', pdf_url: pdfUrl });
      }
    }

    return Response.json({ error: 'לא ניתן להוריד את המסמך' }, { status: 400 });
  } catch (error) {
    console.log('morningDownloadDocument error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});