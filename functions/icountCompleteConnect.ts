import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ICOUNT_BASE_URL = Deno.env.get("ICOUNT_BASE_URL") || "https://api.icount.co.il/api/v3.php";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { cid, username, password } = body;

    if (!cid || !username || !password) {
      return Response.json({ error: 'נדרשים מזהה חברה, שם משתמש וסיסמה' }, { status: 400 });
    }

    // Try to login to iCount to verify credentials
    const loginRes = await fetch(`${ICOUNT_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cid,
        user: username,
        pass: password,
        get_company_info: true
      })
    });

    const loginData = await loginRes.json();

    if (!loginData.status) {
      // Log failed attempt
      await base44.asServiceRole.entities.FinbotAuditLog.create({
        user_id: user.id,
        action: 'icount.connect_failed',
        request_data: { cid, username },
        response_data: loginData,
        success: false
      });
      return Response.json({
        status: 'error',
        message: loginData.error_description || 'שגיאה בהתחברות ל-iCount. בדוק את הפרטים.'
      });
    }

    // Find or create connection
    const existing = await base44.asServiceRole.entities.AccountingConnection.filter({
      user_id: user.id,
      provider: 'icount'
    });

    const connectionData = {
      user_id: user.id,
      provider: 'icount',
      strategy: 'session',
      status: 'connected',
      provider_account_id: cid,
      sid: loginData.sid,
      sid_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min session
      username: username,
      password_ref: password, // stored securely in entity
      config: {
        company_name: loginData.company_info?.businessName || '',
        vat_id: loginData.company_info?.vat_id || '',
        is_tax_exempt: loginData.company_info?.is_tax_exempt || false,
        is_vat_exempt: loginData.company_info?.is_vat_exempt || false
      },
      last_error: null
    };

    if (existing && existing.length > 0) {
      await base44.asServiceRole.entities.AccountingConnection.update(existing[0].id, connectionData);
    } else {
      await base44.asServiceRole.entities.AccountingConnection.create(connectionData);
    }

    // Log success
    await base44.asServiceRole.entities.FinbotAuditLog.create({
      user_id: user.id,
      action: 'icount.connect_success',
      request_data: { cid, username },
      response_data: { sid: '***', company: loginData.company_info?.businessName },
      success: true
    });

    return Response.json({
      status: 'connected',
      message: `התחברת בהצלחה ל-iCount (${loginData.company_info?.businessName || cid})`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});