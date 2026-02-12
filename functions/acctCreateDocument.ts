import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Unified create-document function.
 * Reads the user's active AccountingConnection, then delegates to the correct provider.
 * Input: same payload as individual provider functions (type, items, customer_id, etc.)
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
      icount: 'icountCreateDocument',
      finbot: 'finbotCreateDocument',
    };

    const createFn = providerFnMap[provider];
    if (!createFn) {
      return Response.json({ error: `יצירת מסמכים עדיין לא נתמכת עבור ${provider}` }, { status: 400 });
    }

    const result = await base44.asServiceRole.functions.invoke(createFn, body);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});