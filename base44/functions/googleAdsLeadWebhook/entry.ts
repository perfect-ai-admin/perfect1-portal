/**
 * Google Ads Lead Form Webhook
 * קבלת לידים מ-Google Ads Lead Form API → שמירה ל-Lead entity → שליחה ל-CRM
 */

import { base44 } from '@/api/base44Client';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Google Ads Lead Form Conversion data
    const {
      leadFormSubmissionId,
      customerId,
      lead: {
        firstName,
        lastName,
        phoneNumber,
        email,
        streetAddress,
        city,
        postalCode,
        countryCode
      },
      adGroupId,
      campaignId,
      adId,
      conversionDateTime
    } = body;

    // וידוא שיש לפחות שם וטלפון
    if (!firstName && !phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: firstName or phoneNumber' }),
        { status: 400 }
      );
    }

    // יצירת ליד חדש
    const leadData = {
      name: `${firstName || ''} ${lastName || ''}`.trim(),
      phone: phoneNumber || '',
      email: email || '',
      source_page: `Google Ads - Campaign: ${campaignId}`,
      interaction_type: 'form',
      status: 'new',
      consent: true, // Google Ads leads have consent
      profession: '', // יכול להיות שנקבל מפרמטר custom
      category: 'osek_patur',
      notes: `
        Google Ads Lead Form ID: ${leadFormSubmissionId}
        Customer ID: ${customerId}
        Campaign: ${campaignId}
        Ad Group: ${adGroupId}
        Ad: ${adId}
        Conversion Time: ${conversionDateTime}
        Address: ${streetAddress}, ${city}, ${postalCode}, ${countryCode}
      `.trim()
    };

    // שמירה ל-Lead entity
    const createdLead = await base44.entities.Lead.create(leadData);

    // שליחת email notification
    await sendLeadNotification(createdLead);

    // אפשר להוסיף כאן שליחה ל-CRM (Salesforce, HubSpot וכו')
    // await syncToCRM(createdLead);

    return new Response(
      JSON.stringify({
        success: true,
        leadId: createdLead.id,
        message: 'Lead created successfully'
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Google Ads Webhook Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}

async function sendLeadNotification(lead) {
  try {
    await base44.integrations.Core.SendEmail({
      to: 'leads@perfect1.co.il', // שנה לאימייל שלך
      subject: `🎯 ליד חדש מ-Google Ads: ${lead.name}`,
      body: `
        <div style="direction: rtl; font-family: Arial;">
          <h2>ליד חדש נכנס!</h2>
          <p><strong>שם:</strong> ${lead.name}</p>
          <p><strong>טלפון:</strong> <a href="tel:${lead.phone}">${lead.phone}</a></p>
          <p><strong>אימייל:</strong> ${lead.email}</p>
          <p><strong>מקור:</strong> ${lead.source_page}</p>
          <hr />
          <p><strong>הערות:</strong></p>
          <pre>${lead.notes}</pre>
          <hr />
          <a href="https://perfect1.co.il/leads-admin" style="background: #1E3A5F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            👀 צפה בלוח הלידים
          </a>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * לשלוח לידים ל-CRM חיצוני
 * תוכל להוסיף integration ל-Salesforce, HubSpot וכו'
 */
async function syncToCRM(lead) {
  // דוגמה: שלח ל-Salesforce
  // const salesforceToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');
  
  // דוגמה: שלח ל-HubSpot
  // const hubspotToken = await base44.asServiceRole.connectors.getAccessToken('hubspot');
}