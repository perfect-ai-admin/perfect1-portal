/**
 * Cron Daily Scan - סורק את כל העמודים פעם ביום
 * 
 * Trigger: cron (daily at 3 AM)
 * Usage: Automatic - runs via cron schedule
 */

export default async function cronDailyScan(event, context) {
  const { base44 } = context;
  
  try {
    // בדיקה אם האוטומציה מופעלת
    const configs = await base44.asServiceRole.entities.SEOConfig.filter({ key: 'global_settings' });
    const config = configs[0] || { enabled: true };
    
    if (!config.enabled) {
      return { status: 'skipped', reason: 'automation_disabled' };
    }
    
    // קריאה לפונקציית הסריקה
    const scanResponse = await fetch('https://perfect1.co.il/api/scanAllPages', {
      method: 'POST'
    });
    
    const scanResults = await scanResponse.json();
    
    // שליחת סיכום במייל אם יש שינויים
    if (scanResults.changed > 0 || scanResults.new > 0) {
      let changesHtml = '<ul>';
      
      if (scanResults.changes) {
        scanResults.changes.forEach(change => {
          changesHtml += `<li><strong>${change.type === 'new' ? '🆕 חדש' : '🔄 שונה'}</strong>: ${change.title} (${change.entity})</li>`;
        });
      }
      
      changesHtml += '</ul>';
      
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'admin@perfect1.co.il',
        subject: `📊 סיכום סריקה יומית - ${scanResults.changed + scanResults.new} שינויים`,
        body: `
<html dir="rtl">
<body style="font-family: 'Heebo', Arial, sans-serif;">
  <h2>סיכום סריקה יומית - ${new Date().toLocaleDateString('he-IL')}</h2>
  
  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3>📈 סטטיסטיקות</h3>
    <p>✅ נסרקו: <strong>${scanResults.scanned}</strong> עמודים</p>
    <p>🆕 חדשים: <strong>${scanResults.new}</strong></p>
    <p>🔄 שינויים: <strong>${scanResults.changed}</strong></p>
  </div>
  
  <div style="margin-top: 20px;">
    <h3>📋 רשימת שינויים</h3>
    ${changesHtml}
  </div>
  
  <p style="margin-top: 30px; color: #666;">
    <a href="https://perfect1.co.il/SEOAdmin" style="background: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      📊 צפה ב-SEO Admin
    </a>
  </p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  <p style="color: #999; font-size: 12px;">מערכת SEO אוטומטית - Perfect One</p>
</body>
</html>
        `
      });
    }
    
    // שמירת לוג
    await base44.asServiceRole.entities.SEOLog.create({
      entity_name: 'System',
      entity_id: 'cron',
      url: 'https://perfect1.co.il',
      action: 'daily_scan',
      is_substantial_change: scanResults.changed > 0,
      lastmod_updated: false,
      ping_sent: false,
      ping_status: 'success',
      fields_changed: [`scanned: ${scanResults.scanned}`, `changed: ${scanResults.changed}`, `new: ${scanResults.new}`]
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Daily scan completed',
        results: scanResults
      })
    };
    
  } catch (error) {
    console.error('Cron scan error:', error);
    
    // שליחת התראת שגיאה
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'admin@perfect1.co.il',
        subject: '⚠️ שגיאה בסריקה יומית',
        body: `
אירעה שגיאה בסריקה האוטומטית:

${error.message}

זמן: ${new Date().toLocaleString('he-IL')}
        `
      });
    } catch (emailError) {
      console.error('Failed to send error email:', emailError);
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        error: error.message 
      })
    };
  }
}

/**
 * Cron Configuration:
 * Schedule: 0 3 * * * (daily at 3 AM Israel time)
 * 
 * To set this up in Base44:
 * 1. Go to Dashboard > Backend Functions
 * 2. Find this function
 * 3. Set trigger to "cron"
 * 4. Set schedule: "0 3 * * *"
 */