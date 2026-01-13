import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log('🚀 הפונקציה sendAgentNotification התחילה');
  
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    console.log('📦 Body שהתקבל:', JSON.stringify(body));
    
    const { agentPhone, agentName, leadName, leadPhone, leadProfession } = body;
    
    console.log('📱 פרטים:', JSON.stringify({ agentPhone, agentName, leadName, leadPhone, leadProfession }));

    if (!agentPhone || !leadName) {
      console.error('❌ חסרים שדות חובה');
      return Response.json({ 
        success: false,
        error: 'Missing required fields: agentPhone or leadName' 
      }, { status: 400 });
    }

    // קבלת credentials של Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhone) {
      console.error('❌ חסרים credentials של Twilio');
      return Response.json({ 
        success: false,
        error: 'Twilio credentials not configured' 
      }, { status: 500 });
    }

    // הכנת ההודעה
    const message = `היי ${agentName},\n\nליד חדש נכנס למערכת!\n\nשם: ${leadName}\nטלפון: ${leadPhone || 'לא צוין'}\n${leadProfession ? `מקצוע: ${leadProfession}` : ''}\n\nכנס למערכת ה-CRM לטיפול 💼`;

    console.log('📱 שולח SMS...');

    // שליחת SMS דרך Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = 'Basic ' + btoa(`${accountSid}:${authToken}`);
    
    const formData = new URLSearchParams();
    formData.append('To', agentPhone.startsWith('+') ? agentPhone : `+972${agentPhone.replace(/^0/, '')}`);
    formData.append('From', twilioPhone);
    formData.append('Body', message);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ שגיאה מ-Twilio:', result);
      return Response.json({ 
        success: false,
        error: result.message || 'SMS sending failed',
        details: result
      }, { status: response.status });
    }

    console.log('✅ SMS נשלח בהצלחה:', result.sid);
    
    // יצירת קישור WhatsApp
    const whatsappUrl = `https://wa.me/${agentPhone.replace(/^0/, '972').replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
    
    return Response.json({ 
      success: true, 
      message: 'SMS sent successfully',
      sms: {
        sid: result.sid,
        status: result.status
      },
      whatsapp: {
        url: whatsappUrl
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ שגיאה בשליחת הודעה:', error);
    console.error('Error details:', error.stack);
    return Response.json({ 
      error: error.message, 
      details: error.stack,
      success: false 
    }, { status: 500 });
  }
});