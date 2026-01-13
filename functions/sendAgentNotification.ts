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

    // הכנת ההודעה
    const appUrl = 'https://perfect-1.one';
    const crmLink = `${appUrl}/AgentCRM`;
    
    const message = `היי ${agentName},\n\nליד חדש נכנס למערכת! 🎯\n\nשם: ${leadName}\nטלפון: ${leadPhone || 'לא צוין'}\n${leadProfession ? `מקצוע: ${leadProfession}` : ''}\n\n👉 כנס לטיפול: ${crmLink}\n\n💼 Perfect One CRM`;
    
    // יצירת קישור WhatsApp
    const phoneFormatted = agentPhone.replace(/^0/, '972').replace(/\+/g, '').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(message)}`;
    
    console.log('✅ קישור WhatsApp נוצר:', whatsappUrl);
    
    return Response.json({ 
      success: true, 
      message: 'WhatsApp link created successfully',
      whatsapp: {
        url: whatsappUrl,
        phone: phoneFormatted,
        message: message
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ שגיאה ביצירת הודעה:', error);
    console.error('Error details:', error.stack);
    return Response.json({ 
      error: error.message, 
      details: error.stack,
      success: false 
    }, { status: 500 });
  }
});