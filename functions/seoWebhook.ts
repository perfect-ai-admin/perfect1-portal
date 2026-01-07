/**
 * SEO Webhook - מזהה שינויים מהותיים ומעדכן אינדקס
 * מופעל אוטומטית על כל create/update/delete של entities
 */

export default async function seoWebhook(event, context) {
  const { base44, entityName, operation, data, previousData } = context;
  
  try {
    // בדיקה אם האוטומציה מופעלת
    const configs = await base44.asServiceRole.entities.SEOConfig.filter({ key: 'global_settings' });
    const config = configs[0] || { enabled: true, excluded_entities: [], substantial_fields: {} };
    
    if (!config.enabled) {
      return { status: 'skipped', reason: 'automation_disabled' };
    }
    
    // בדיקה אם entity מוחרג
    if (config.excluded_entities?.includes(entityName)) {
      return { status: 'skipped', reason: 'entity_excluded' };
    }
    
    // רק BlogPost ו-Profession בשלב הראשון
    if (!['BlogPost', 'Profession'].includes(entityName)) {
      return { status: 'skipped', reason: 'entity_not_tracked' };
    }
    
    // הגדרת שדות מהותיים לפי entity
    const substantialFields = {
      BlogPost: ['title', 'content', 'meta_title', 'meta_description', 'slug'],
      Profession: ['name', 'description', 'services', 'meta_title', 'meta_description']
    };
    
    const fieldsToCheck = substantialFields[entityName] || [];
    
    // זיהוי שינוי מהותי
    let isSubstantialChange = false;
    let fieldsChanged = [];
    
    if (operation === 'create') {
      isSubstantialChange = true;
      fieldsChanged = ['created'];
    } else if (operation === 'update' && previousData) {
      // בדיקה אילו שדות השתנו
      for (const field of fieldsToCheck) {
        if (JSON.stringify(data[field]) !== JSON.stringify(previousData[field])) {
          fieldsChanged.push(field);
          isSubstantialChange = true;
        }
      }
    } else if (operation === 'delete') {
      isSubstantialChange = true;
      fieldsChanged = ['deleted'];
    }
    
    // יצירת URL
    let url = 'https://perfect1.co.il';
    if (entityName === 'BlogPost' && data.slug) {
      url += `/BlogPost?slug=${data.slug}`;
    } else if (entityName === 'Profession' && data.slug) {
      url += `/ProfessionPage?slug=${data.slug}`;
    }
    
    // שליחת ping לגוגל רק אם שינוי מהותי
    let pingSent = false;
    let pingStatus = 'skipped';
    let errorMessage = null;
    
    if (isSubstantialChange) {
      try {
        const sitemapUrl = 'https://perfect1.co.il/sitemap.xml';
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        
        // שליחת ping לגוגל
        const response = await fetch(pingUrl);
        
        if (response.ok) {
          pingSent = true;
          pingStatus = 'success';
        } else {
          pingStatus = 'failed';
          errorMessage = `HTTP ${response.status}`;
        }
        
        // עדכון תאריך ping אחרון
        await base44.asServiceRole.entities.SEOConfig.update(config.id, {
          last_ping_sent: new Date().toISOString()
        });
      } catch (error) {
        pingStatus = 'failed';
        errorMessage = error.message;
      }
    }
    
    // שמירת לוג
    await base44.asServiceRole.entities.SEOLog.create({
      entity_name: entityName,
      entity_id: data.id,
      url: url,
      action: operation,
      fields_changed: fieldsChanged,
      is_substantial_change: isSubstantialChange,
      lastmod_updated: isSubstantialChange,
      ping_sent: pingSent,
      ping_status: pingStatus,
      error_message: errorMessage
    });
    
    return {
      status: 'success',
      substantial_change: isSubstantialChange,
      fields_changed: fieldsChanged,
      ping_sent: pingSent,
      ping_status: pingStatus
    };
    
  } catch (error) {
    console.error('SEO Webhook Error:', error);
    
    // ניסיון לשמור לוג שגיאה
    try {
      await base44.asServiceRole.entities.SEOLog.create({
        entity_name: entityName,
        entity_id: data?.id || 'unknown',
        url: '',
        action: operation,
        is_substantial_change: false,
        lastmod_updated: false,
        ping_sent: false,
        ping_status: 'error',
        error_message: error.message
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return {
      status: 'error',
      error: error.message
    };
  }
}