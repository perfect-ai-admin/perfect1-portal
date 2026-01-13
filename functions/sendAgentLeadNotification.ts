import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log('🚀 הפונקציה sendAgentLeadNotification התחילה');
  
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    console.log('📦 Body שהתקבל:', body);
    
    const { agentEmail, agentName, leadName, leadPhone, leadProfession } = body;
    
    console.log('📧 פרטים:', { agentEmail, agentName, leadName, leadPhone, leadProfession });

    if (!agentEmail || !leadName) {
      console.error('❌ חסרים שדות חובה');
      return Response.json({ 
        success: false,
        error: 'Missing required fields: agentEmail or leadName' 
      }, { status: 400 });
    }

    // שליחת מייל לנציג עם service role
    const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
      to: agentEmail,
      subject: `ליד חדש נכנס למערכת - ${leadName}`,
      body: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E3A5F;">שלום ${agentName},</h2>
          <p style="font-size: 16px;">נכנס לך ליד חדש למערכת:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>שם:</strong> ${leadName}</p>
            <p style="margin: 10px 0;"><strong>טלפון:</strong> ${leadPhone || 'לא צוין'}</p>
            ${leadProfession ? `<p style="margin: 10px 0;"><strong>מקצוע:</strong> ${leadProfession}</p>` : ''}
          </div>

          <p style="font-size: 14px; color: #666;">
            היכנס למערכת ה-CRM כדי לראות את מלוא הפרטים ולטפל בליד.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
            <p>Perfect One - מערכת ניהול לידים</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ מייל נשלח בהצלחה:', emailResult);
    return Response.json({ 
      success: true, 
      message: 'Email sent successfully', 
      result: emailResult,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('❌ שגיאה בשליחת מייל לנציג:', error);
    console.error('Error details:', error.stack);
    return Response.json({ 
      error: error.message, 
      details: error.stack,
      success: false 
    }, { status: 500 });
  }
});