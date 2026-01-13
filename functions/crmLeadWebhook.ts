import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log('🚀 CRM Lead Webhook התחיל');
  console.log('📍 Method:', req.method);
  console.log('📍 URL:', req.url);
  
  // אפשר רק POST requests
  if (req.method !== 'POST') {
    console.error('❌ Method לא נתמך:', req.method);
    return Response.json({ 
      success: false,
      error: 'Only POST method is allowed' 
    }, { status: 405 });
  }
  
  try {
    const base44 = createClientFromRequest(req);
    
    // קריאת הגוף
    const body = await req.json();
    console.log('📦 Payload התקבל:', JSON.stringify(body, null, 2));
    
    const { full_name, phone, email, source, campaign, page_url, status } = body;
    
    // ולידציה - שדות חובה
    if (!full_name || !phone) {
      console.error('❌ חסרים שדות חובה');
      console.error('full_name:', full_name);
      console.error('phone:', phone);
      return Response.json({ 
        success: false,
        error: 'Missing required fields: full_name and phone are required',
        received: { full_name, phone }
      }, { status: 400 });
    }
    
    console.log('✅ שדות חובה אושרו');
    
    // בדיקה אם הליד כבר קיים לפי טלפון
    console.log('🔍 מחפש ליד קיים עם טלפון:', phone);
    const existingLeads = await base44.asServiceRole.entities.CRMLead.filter({ phone });
    
    let result;
    
    if (existingLeads && existingLeads.length > 0) {
      // עדכון ליד קיים
      const existingLead = existingLeads[0];
      console.log('♻️ מעדכן ליד קיים:', existingLead.id);
      
      result = await base44.asServiceRole.entities.CRMLead.update(existingLead.id, {
        full_name: full_name || existingLead.full_name,
        phone,
        email: email || existingLead.email,
        source: source || existingLead.source || 'Lead.im',
        campaign: campaign || existingLead.campaign,
        page_url: page_url || existingLead.page_url,
        status: status || existingLead.status
      });
      
      console.log('✅ ליד עודכן בהצלחה');
      return Response.json({ 
        success: true, 
        message: 'Lead updated successfully',
        lead_id: existingLead.id,
        action: 'updated'
      }, { status: 200 });
      
    } else {
      // יצירת ליד חדש
      console.log('➕ יוצר ליד חדש');
      
      result = await base44.asServiceRole.entities.CRMLead.create({
        full_name,
        phone,
        email: email || null,
        source: source || 'Lead.im',
        campaign: campaign || null,
        page_url: page_url || null,
        status: status || 'new'
      });
      
      console.log('✅ ליד נוצר בהצלחה:', result.id);
      return Response.json({ 
        success: true, 
        message: 'Lead created successfully',
        lead_id: result.id,
        action: 'created'
      }, { status: 200 });
    }
    
  } catch (error) {
    console.error('❌ שגיאה בטיפול בליד:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // בדיקה אם השגיאה היא בגלל parsing של JSON
    if (error instanceof SyntaxError) {
      return Response.json({ 
        success: false,
        error: 'Invalid JSON payload', 
        details: error.message
      }, { status: 400 });
    }
    
    return Response.json({ 
      success: false,
      error: error.message, 
      details: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
});