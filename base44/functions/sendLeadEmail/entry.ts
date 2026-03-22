import { base44 } from '@/api/base44Client';

export default async function sendLeadEmail(data) {
  const { lead_id, lead_name, lead_phone, lead_email, lead_profession, lead_notes, source_page } = data;

  try {
    await base44.integrations.Core.SendEmail({
      to: 'yosi5919@gmail.com',
      subject: `🎯 ליד חדש מ${source_page}`,
      body: `
        <div style="direction: rtl; font-family: Arial, sans-serif;">
          <h2 style="color: #1E3A5F;">ליד חדש התקבל! 🎉</h2>
          <p><strong>שם:</strong> ${lead_name}</p>
          <p><strong>טלפון:</strong> ${lead_phone}</p>
          ${lead_email ? `<p><strong>אימייל:</strong> ${lead_email}</p>` : ''}
          ${lead_profession ? `<p><strong>מקצוע:</strong> ${lead_profession}</p>` : ''}
          ${lead_notes ? `<p><strong>הערות:</strong> ${lead_notes}</p>` : ''}
          <p><strong>מקור:</strong> ${source_page}</p>
          <p><strong>תאריך:</strong> ${new Date().toLocaleString('he-IL')}</p>
          <p><strong>ID ליד:</strong> ${lead_id}</p>
        </div>
      `
    });
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Failed to send lead email:', error);
    return { success: false, error: error.message };
  }
}