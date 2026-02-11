import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Download document PDF from Finbot
 * Input: {document_id} (local document ID)
 * 
 * The PDF link is returned in the `data` field of the create response,
 * or can be found in the raw response object.
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { document_id } = await req.json();
        if (!document_id) return Response.json({ error: 'מזהה מסמך חסר' }, { status: 400 });

        const documents = await base44.entities.FinbotDocument.filter({ user_id: user.id, id: document_id });
        if (!documents?.length) return Response.json({ error: 'מסמך לא נמצא' }, { status: 404 });

        const doc = documents[0];

        // Check existing PDF URL
        if (doc.pdf_url) return Response.json({ file_url: doc.pdf_url });

        // Check raw response for link
        const rawLink = doc.raw?.data || doc.raw?.pdf_link || doc.raw?.link;
        if (rawLink) {
            await base44.entities.FinbotDocument.update(doc.id, { pdf_url: rawLink });
            return Response.json({ file_url: rawLink });
        }

        return Response.json({ error: 'לא נמצא קישור PDF למסמך' }, { status: 404 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});