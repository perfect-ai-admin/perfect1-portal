/**
 * Webhook לטיפול בלידים חדשים
 * מופעל כל פעם שנוצר ליד חדש בעמוד
 */

export async function leadWebhook(req, res) {
  try {
    const body = req.body;
    
    // תמיכה בפורמט Google Ads Lead Form החדש
    let lead;
    
    if (body.user_column_data) {
      // פורמט חדש מ-Google Ads
      const fullNameObj = body.user_column_data.find(col => col.column_id === 'FULL_NAME');
      const phoneObj = body.user_column_data.find(col => col.column_id === 'PHONE_NUMBER');
      const emailObj = body.user_column_data.find(col => col.column_id === 'EMAIL');
      
      lead = {
        name: fullNameObj?.string_value || 'Unknown',
        phone: phoneObj?.string_value || '',
        email: emailObj?.string_value || '',
        source_page: `Google Ads - Campaign: ${body.campaign_id}`,
        interaction_type: 'form',
        status: 'new',
        consent: true,
        category: 'osek_patur',
        notes: `Lead ID: ${body.lead_id}\nForm ID: ${body.form_id}`
      };
    } else if (body.lead) {
      // פורמט ישן (backward compatibility)
      lead = body.lead;
    }

    if (!lead || (!lead.name && !lead.phone)) {
      return res.status(400).json({ error: 'No lead data provided' });
    }

    // ✅ שלח email לנציג
    await sendLeadNotification(lead);

    // ✅ שלח SMS (אופציונלי)
    // await sendLeadSMS(lead);

    // ✅ אפדיט CRM חיצוני (אופציונלי)
    // await syncToCRM(lead);

    return res.status(200).json({ 
      success: true, 
      message: 'Lead processed successfully',
      leadId: lead.id 
    });

  } catch (error) {
    console.error('❌ Lead webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * שלח email הודעה על ליד חדש
 */
async function sendLeadNotification(lead) {
  const { base44 } = await import('@/api/base44Client');

  const emailBody = `
    <div style="direction: rtl; font-family: Heebo, Arial, sans-serif; background: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎯 ליד חדש התקבל!</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1E3A5F; margin-top: 0;">פרטי הליד:</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #1E3A5F; width: 30%;">שם:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #1E3A5F;">טלפון:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <a href="tel:${lead.phone}" style="color: #27AE60; text-decoration: none; font-weight: bold;">
                  ${lead.phone}
                </a>
              </td>
            </tr>
            ${lead.email ? `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #1E3A5F;">אימייל:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <a href="mailto:${lead.email}" style="color: #27AE60; text-decoration: none;">
                  ${lead.email}
                </a>
              </td>
            </tr>
            ` : ''}
            ${lead.profession ? `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #1E3A5F;">מקצוע:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${lead.profession}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #1E3A5F;">מקור:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${lead.source_page || 'N/A'}</td>
            </tr>
            ${lead.notes ? `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #1E3A5F;">הערות:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${lead.notes}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #1E3A5F;">זמן:</td>
              <td style="padding: 12px;">${new Date(lead.created_date).toLocaleString('he-IL')}</td>
            </tr>
          </table>

          <!-- CTA -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; text-align: center;">
            <p style="color: #666; margin-bottom: 15px;">
              ⏱️ תגובה מהירה = קנוויזיה גבוהה יותר!
            </p>
            <a href="tel:${lead.phone}" style="display: inline-block; background: #27AE60; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              ☎️ התקשר עכשיו
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p style="margin: 0;">Perfect One - פתיחת עוסק פטור</p>
          <p style="margin: 0;">זה הודעה אוטומטית - אל תשיב לכתובת זו</p>
        </div>
      </div>
    </div>
  `;

  await base44.integrations.Core.SendEmail({
    to: 'yosi5919@gmail.com',
    subject: `🎯 ליד חדש: ${lead.name} - ${lead.source_page || 'Unknown'}`,
    body: emailBody
  });

  console.log(`✅ Email sent for lead: ${lead.id}`);
}

/**
 * שלח SMS הודעה (אופציונלי)
 */
async function sendLeadSMS(lead) {
  // כאן תוכל להוסיף integration עם SMS service
  // לדוגמה: Twilio, MessageBird, וכו'
  console.log(`📱 SMS would be sent to: ${lead.phone}`);
}

/**
 * סנכרן ל-CRM חיצוני (אופציונלי)
 */
async function syncToCRM(lead) {
  // כאן תוכל לסנכרן עם:
  // - HubSpot
  // - Salesforce
  // - Pipedrive
  // וכו'
  console.log(`🔗 Would sync to CRM: ${lead.id}`);
}