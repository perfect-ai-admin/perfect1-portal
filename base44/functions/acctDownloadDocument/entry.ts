import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Unified download-document function.
 * Reads the user's active AccountingConnection, then delegates to the correct provider.
 * Input: { document_id }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Get active connection
    const connections = await base44.asServiceRole.entities.AccountingConnection.filter({
      user_id: user.id, status: 'connected'
    });
    if (!connections?.length) {
      return Response.json({ error: 'אין חיבור פעיל למערכת חשבונות' }, { status: 400 });
    }
    const provider = connections[0].provider;

    // Delegate to provider-specific function
    const providerFnMap = {
      icount: 'icountDownloadDocument',
      finbot: 'finbotDownloadDocument',
      morning: 'morningDownloadDocument',
    };

    const downloadFn = providerFnMap[provider];
    if (!downloadFn) {
      return Response.json({ error: `הורדת מסמכים עדיין לא נתמכת עבור ${provider}` }, { status: 400 });
    }

    const result = await base44.asServiceRole.functions.invoke(downloadFn, body);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});