import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Download document PDF from Finbot
 * Input: {document_id} (local document ID)
 */
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
            return Response.json({ error: 'Document ID is required' }, { status: 400 });
        }

        // Find local document
        const documents = await base44.entities.FinbotDocument.filter({
            user_id: user.id,
            id: document_id
        });

        if (!documents || documents.length === 0) {
            return Response.json({ error: 'Document not found' }, { status: 404 });
        }

        const document = documents[0];

        // If we already have a PDF URL, return it
        if (document.pdf_url) {
            return Response.json({ file_url: document.pdf_url });
        }

        // Otherwise, try to fetch from Finbot
        const connections = await base44.entities.FinbotConnection.filter({ user_id: user.id });
        
        if (!connections || connections.length === 0 || connections[0].status !== 'connected') {
            return Response.json({ error: 'Not connected to Finbot' }, { status: 400 });
        }

        const connection = connections[0];
        const baseUrl = Deno.env.get('FINBOT_BASE_URL') || 'https://api.finbot.co.il';
        
        let authHeader;
        if (connection.api_key_ref) {
            authHeader = `Bearer ${connection.api_key_ref}`;
        } else if (connection.access_token_ref) {
            authHeader = `Bearer ${connection.access_token_ref}`;
        } else {
            return Response.json({ error: 'No valid credentials' }, { status: 400 });
        }

        // TODO: Adjust endpoint based on actual Finbot API documentation
        const downloadUrl = `${baseUrl}/documents/${document.finbot_document_id}/download`;
        
        const response = await fetch(downloadUrl, {
            headers: { 'Authorization': authHeader }
        });

        if (!response.ok) {
            return Response.json({ error: 'Failed to download document' }, { status: 500 });
        }

        // Get the PDF URL from response (might be a redirect or direct file)
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
            const data = await response.json();
            const pdfUrl = data.url || data.pdf_url || data.download_url;
            
            // Update local document with PDF URL
            await base44.entities.FinbotDocument.update(document.id, { pdf_url: pdfUrl });
            
            return Response.json({ file_url: pdfUrl });
        }

        // If it's a direct file, we'd need to upload to our storage
        // For now, return the Finbot URL
        return Response.json({ file_url: downloadUrl });

    } catch (error) {
        console.error('Error downloading document:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});