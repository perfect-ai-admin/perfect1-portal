import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log('🚀 הפונקציה sendAgentNotification התחילה');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    console.log('📦 Body שהתקבל:', JSON.stringify(body));
    
    const { agentPhone, agentEmail, agentName, leadName, leadPhone, leadProfession, notificationPreferences = ['whatsapp'] } = body;
    
    console.log('📱 פרטים:', JSON.stringify({ agentPhone, agentEmail, agentName, leadName, leadPhone, leadProfession, notificationPreferences }));

    if (!leadName || (!agentPhone && !agentEmail)) {
      console.error('❌ חסרים שדות חובה');
      return Response.json({ 
        success: false,
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // הכנת ההודעה
    const appUrl = 'https://perfect-1.one';
    const crmLink = `${appUrl}/AgentCRM`;
    
    const message = `היי ${agentName},\n\nליד חדש נכנס למערכת! 🎯\n\nשם: ${leadName}\nטלפון: ${leadPhone || 'לא צוין'}\n${leadProfession ? `מקצוע: ${leadProfession}` : ''}\n\n👉 כנס לטיפול: ${crmLink}\n\n💼 Perfect One CRM`;
    
    const results = {
      whatsapp: null,
      email: null,
      sms: null
    };

    // שליחת WhatsApp
    if (notificationPreferences.includes('whatsapp') && agentPhone) {
      const phoneFormatted = agentPhone.replace(/^0/, '972').replace(/\+/g, '').replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(message)}`;
      results.whatsapp = {
        url: whatsappUrl,
        phone: phoneFormatted,
        message: message
      };
      console.log('✅ קישור WhatsApp נוצר');
    }

    // שליחת Email
    if (notificationPreferences.includes('email') && agentEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'Perfect One CRM',
          to: agentEmail,
          subject: `ליד חדש - ${leadName}`,
          body: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1E3A5F;">שלום ${agentName},</h2>
              <p style="font-size: 16px;">ליד חדש נכנס למערכת! 🎯</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>שם:</strong> ${leadName}</p>
                <p style="margin: 10px 0;"><strong>טלפון:</strong> ${leadPhone || 'לא צוין'}</p>
                ${leadProfession ? `<p style="margin: 10px 0;"><strong>מקצוע:</strong> ${leadProfession}</p>` : ''}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${crmLink}" style="background-color: #1E3A5F; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  👉 כנס לטיפול
                </a>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
                <p>Perfect One CRM - מערכת ניהול לידים</p>
              </div>
            </div>
          `
        });
        results.email = { sent: true, to: agentEmail };
        console.log('✅ אימייל נשלח');
      } catch (error) {
        console.error('❌ שגיאה בשליחת אימייל:', error);
        results.email = { sent: false, error: error.message };
      }
    }

    // שליחת SMS דרך Twilio
    if (notificationPreferences.includes('sms') && agentPhone) {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (accountSid && authToken && twilioPhone) {
        try {
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
          
          if (response.ok) {
            results.sms = { sent: true, sid: result.sid, status: result.status };
            console.log('✅ SMS נשלח בהצלחה');
          } else {
            results.sms = { sent: false, error: result.message };
            console.error('❌ שגיאה מ-Twilio:', result);
          }
        } catch (error) {
          console.error('❌ שגיאה בשליחת SMS:', error);
          results.sms = { sent: false, error: error.message };
        }
      } else {
        results.sms = { sent: false, error: 'Twilio credentials not configured' };
        console.warn('⚠️ Twilio לא מוגדר');
      }
    }
    
    return Response.json({ 
      success: true, 
      message: 'Notifications processed',
      results,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ שגיאה כללית:', error);
    console.error('Error details:', error.stack);
    return Response.json({ 
      error: error.message, 
      details: error.stack,
      success: false 
    }, { status: 500 });
  }
});