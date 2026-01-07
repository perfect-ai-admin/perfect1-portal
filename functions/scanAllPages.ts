/**
 * Scan All Pages - סורק את כל העמודים באתר ומזהה שינויים
 * 
 * Usage: POST /api/scanAllPages
 * Returns: { scanned: number, changed: number, new: number, changes: [] }
 */

export default async function scanAllPages(event, context) {
  const { base44 } = context;
  
  try {
    const changes = [];
    let scannedCount = 0;
    let changedCount = 0;
    let newCount = 0;
    
    // סריקת כל מאמרי הבלוג
    const posts = await base44.asServiceRole.entities.BlogPost.filter({ published: true });
    
    for (const post of posts) {
      scannedCount++;
      const url = `https://perfect1.co.il/BlogPost?slug=${post.slug}`;
      const lastmod = post.updated_date 
        ? new Date(post.updated_date).toISOString()
        : new Date(post.created_date).toISOString();
      
      // יצירת hash של התוכן המהותי
      const contentHash = await hashContent({
        title: post.title,
        content: post.content,
        meta_title: post.meta_title
      });
      
      // חיפוש snapshot קיים
      const existingSnapshots = await base44.asServiceRole.entities.PageSnapshot.filter({
        url: url
      });
      
      const existingSnapshot = existingSnapshots[0];
      
      if (!existingSnapshot) {
        // עמוד חדש
        await base44.asServiceRole.entities.PageSnapshot.create({
          url: url,
          entity_name: 'BlogPost',
          entity_id: post.id,
          last_scanned: new Date().toISOString(),
          lastmod: lastmod,
          content_hash: contentHash,
          title: post.title,
          status: 'active'
        });
        
        newCount++;
        changes.push({
          type: 'new',
          url: url,
          title: post.title,
          entity: 'BlogPost'
        });
      } else {
        // בדיקת שינוי
        if (existingSnapshot.content_hash !== contentHash) {
          // זוהה שינוי מהותי!
          await base44.asServiceRole.entities.PageSnapshot.update(existingSnapshot.id, {
            last_scanned: new Date().toISOString(),
            lastmod: lastmod,
            content_hash: contentHash,
            title: post.title,
            status: 'changed'
          });
          
          // יצירת לוג SEO
          await base44.asServiceRole.entities.SEOLog.create({
            entity_name: 'BlogPost',
            entity_id: post.id,
            url: url,
            action: 'detected_change',
            is_substantial_change: true,
            lastmod_updated: true,
            ping_sent: false,
            ping_status: 'pending',
            fields_changed: ['content_detected']
          });
          
          changedCount++;
          changes.push({
            type: 'changed',
            url: url,
            title: post.title,
            entity: 'BlogPost',
            previous_lastmod: existingSnapshot.lastmod,
            new_lastmod: lastmod
          });
        } else {
          // עדכון תאריך סריקה בלבד
          await base44.asServiceRole.entities.PageSnapshot.update(existingSnapshot.id, {
            last_scanned: new Date().toISOString(),
            status: 'active'
          });
        }
      }
    }
    
    // סריקת דפי מקצועות
    const professions = await base44.asServiceRole.entities.Profession.list();
    
    for (const profession of professions) {
      scannedCount++;
      const url = `https://perfect1.co.il/ProfessionPage?slug=${profession.slug}`;
      const lastmod = profession.updated_date 
        ? new Date(profession.updated_date).toISOString()
        : new Date().toISOString();
      
      const contentHash = await hashContent({
        name: profession.name,
        description: profession.description,
        services: profession.services
      });
      
      const existingSnapshots = await base44.asServiceRole.entities.PageSnapshot.filter({
        url: url
      });
      
      const existingSnapshot = existingSnapshots[0];
      
      if (!existingSnapshot) {
        await base44.asServiceRole.entities.PageSnapshot.create({
          url: url,
          entity_name: 'Profession',
          entity_id: profession.id,
          last_scanned: new Date().toISOString(),
          lastmod: lastmod,
          content_hash: contentHash,
          title: profession.name,
          status: 'active'
        });
        
        newCount++;
        changes.push({
          type: 'new',
          url: url,
          title: profession.name,
          entity: 'Profession'
        });
      } else {
        if (existingSnapshot.content_hash !== contentHash) {
          await base44.asServiceRole.entities.PageSnapshot.update(existingSnapshot.id, {
            last_scanned: new Date().toISOString(),
            lastmod: lastmod,
            content_hash: contentHash,
            title: profession.name,
            status: 'changed'
          });
          
          await base44.asServiceRole.entities.SEOLog.create({
            entity_name: 'Profession',
            entity_id: profession.id,
            url: url,
            action: 'detected_change',
            is_substantial_change: true,
            lastmod_updated: true,
            ping_sent: false,
            ping_status: 'pending'
          });
          
          changedCount++;
          changes.push({
            type: 'changed',
            url: url,
            title: profession.name,
            entity: 'Profession',
            previous_lastmod: existingSnapshot.lastmod,
            new_lastmod: lastmod
          });
        } else {
          await base44.asServiceRole.entities.PageSnapshot.update(existingSnapshot.id, {
            last_scanned: new Date().toISOString(),
            status: 'active'
          });
        }
      }
    }
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        scanned: scannedCount,
        new: newCount,
        changed: changedCount,
        changes: changes,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Scan error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        error: error.message 
      })
    };
  }
}

// פונקציית עזר ליצירת hash
async function hashContent(content) {
  const str = JSON.stringify(content);
  
  // יצירת hash פשוט (אפשר להשתמש ב-crypto API אם נדרש)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return hash.toString(36);
}