import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    // Create email content
    const roleText = role === 'admin' ? 'מנהל מערכת' : 'משתמש';
    const subject = 'הזמנה להצטרף למערכת Perfect One';
    const htmlBody = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F8F9FA;">
        <div style="background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Perfect One</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #1E3A5F; font-size: 24px; margin-bottom: 20px;">שלום,</h2>
          
          <p style="color: #2C3E50; font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
            קיבלת הזמנה להצטרף למערכת Perfect One בתור <strong>${roleText}</strong>.
          </p>
          
          <p style="color: #2C3E50; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
            כדי להתחיל, לחץ על הכפתור למטה והגדר את הסיסמה שלך:
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${Deno.env.get('BASE_URL') || 'https://perfect1.co.il'}" 
               style="display: inline-block; background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(30, 58, 95, 0.3);">
              היכנס למערכת
            </a>
          </div>
          
          <div style="background: #E8F4FD; padding: 20px; border-radius: 8px; margin-top: 30px; border-right: 4px solid #1E3A5F;">
            <p style="color: #1E3A5F; font-size: 14px; margin: 0; line-height: 1.6;">
              <strong>טיפ:</strong> בפעם הראשונה שתיכנס, תתבקש להגדיר סיסמה. שמור אותה במקום בטוח!
              <br/>
              אפשר גם להיכנס דרך חשבון Google אם יש לך.
            </p>
          </div>
          
          <p style="color: #7F8C8D; font-size: 14px; margin-top: 30px; text-align: center;">
            נתראה במערכת,<br/>
            <strong>צוות Perfect One</strong>
          </p>
        </div>
      </div>
    `;

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Perfect One <onboarding@resend.dev>',
        to: email,
        subject: subject,
        html: htmlBody
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await response.json();

    return Response.json({ 
      success: true, 
      message: 'Invitation email sent successfully',
      emailId: result.id
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});