import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Download document PDF from Finbot
 * Input: {document_id} (local document ID)
 * 
 * If the document has a pdf_url from the Finbot API response, returns it directly.
 * Otherwise tries to fetch it from Finbot API.
 */

const FINBOT_API_BASE = 'https://api.finbot.co.il/api/v2';

async function getFinbotAuth(base44, userId) {
    const connections = await base44.entities.FinbotConnection.filter({ user_id: userId });
    
    if (connections && connections.length > 0 && connections[0].status === 'connected') {
        const connection = connections[0];
        if (connection.api_key_ref) return connection.api_key_ref;
        if (connection.access_token_ref) return connection.access_token_ref;
    }

    const globalToken = Deno.env.get('FINBOT_API_TOKEN');
    if (globalToken) return globalToken;

    throw new Error('לא נמצא טוקן Finbot.');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { document_id } = body;

        if (!document_id) {
            return Response.json({ error: 'מזהה מסמך הוא שדה חובה' }, { status: 400 });
        }

        // Find local document
        const documents = await base44.entities.FinbotDocument.filter({
            user_id: user.id,
            id: document_id
        });

        if (!documents || documents.length === 0) {
            return Response.json({ error: 'מסמך לא נמצא' }, { status: 404 });
        }

        const document = documents[0];

        // If we already have a PDF URL, return it
        if (document.pdf_url) {
            return Response.json({ file_url: document.pdf_url });
        }

        // Check if raw response has a link
        if (document.raw?.pdf_link || document.raw?.link) {
            const pdfUrl = document.raw.pdf_link || document.raw.link;
            await base44.entities.FinbotDocument.update(document.id, { pdf_url: pdfUrl });
            return Response.json({ file_url: pdfUrl });
        }

        // Try to fetch from Finbot API
        if (document.finbot_document_id) {
            const apiToken = await getFinbotAuth(base44, user.id);
            
            const response = await fetch(`${FINBOT_API_BASE}/income/${document.finbot_document_id}`, {
                headers: { 
                    'Content-Type': 'application/json',
                    'secret': apiToken 
                }
            });

            if (response.ok) {
                const data = await response.json();
                const pdfUrl = data.pdf_link || data.pdf_url || data.link;
                
                if (pdfUrl) {
                    await base44.entities.FinbotDocument.update(document.id, { pdf_url: pdfUrl });
                    return Response.json({ file_url: pdfUrl });
                }
            }
        }

        return Response.json({ error: 'לא נמצא קישור PDF למסמך זה' }, { status: 404 });

    } catch (error) {
        console.error('Error downloading document:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});