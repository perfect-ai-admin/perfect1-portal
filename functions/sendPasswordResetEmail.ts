import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("gmail");
    
    if (!accessToken) {
      return Response.json({ error: 'Gmail not connected' }, { status: 500 });
    }

    // Create password reset email content
    const subject = 'איפוס סיסמה - Perfect One';
    const resetUrl = `${Deno.env.get('BASE_URL') || 'https://perfect1.co.il'}/login`;
    
    const htmlBody = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F8F9FA;">
        <div style="background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Perfect One</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #1E3A5F; font-size: 24px; margin-bottom: 20px;">איפוס סיסמה</h2>
          
          <p style="color: #2C3E50; font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
            קיבלת בקשה לאיפוס סיסמה למערכת Perfect One.
          </p>
          
          <p style="color: #2C3E50; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
            לחץ על הכפתור למטה כדי לאפס את הסיסמה שלך:
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(30, 58, 95, 0.3);">
              איפוס סיסמה
            </a>
          </div>
          
          <div style="background: #FFF3CD; padding: 20px; border-radius: 8px; margin-top: 30px; border-right: 4px solid #FFC107;">
            <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
              <strong>לידיעתך:</strong> אם לא ביקשת איפוס סיסמה, אנא התעלם מהודעה זו והסיסמה שלך תישאר ללא שינוי.
            </p>
          </div>
          
          <p style="color: #7F8C8D; font-size: 14px; margin-top: 30px; text-align: center;">
            בברכה,<br/>
            <strong>צוות Perfect One</strong>
          </p>
        </div>
      </div>
    `;

    // Create raw email in RFC 2822 format
    const emailLines = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `To: ${email}`,
      `Subject: ${subject}`,
      '',
      htmlBody
    ];
    const rawEmail = emailLines.join('\r\n');
    
    // Base64url encode
    const base64Email = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64Email
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail API error: ${error}`);
    }

    const result = await response.json();

    return Response.json({ 
      success: true, 
      message: 'Password reset email sent successfully',
      messageId: result.id
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});