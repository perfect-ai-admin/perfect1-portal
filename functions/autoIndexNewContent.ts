/**
 * autoIndexNewContent - Webhook אוטומטי לאינדוקס תוכן חדש
 * נקרא אוטומטית כש:
 * - נוצר BlogPost חדש
 * - נוצר Profession חדש
 * - מתעדכן תוכן משמעותי
 * 
 * מטפל ב:
 * 1. הוספה ל-Sitemap
 * 2. שליחת Ping לגוגל (אם צריך)
 * 3. לוג פעולות
 */

import { base44 } from '@/api/base44Client';

export default async function autoIndexNewContent(req, res) {
  try {
    const { 
      entity_name, 
      entity_id, 
      action, 
      url, 
      is_substantial = true 
    } = req.body;

    console.log(`[Auto Index] ${action} - ${entity_name}:${entity_id}`);

    // 1. הוספה/עדכון ב-Sitemap
    if (action === 'created' || (action === 'updated' && is_substantial)) {
      const existingSitemap = await base44.asServiceRole.entities.SitemapURL.filter({ url });

      if (existingSitemap.length === 0) {
        // דף חדש
        await base44.asServiceRole.entities.SitemapURL.create({
          url: url,
          type: entity_name.toLowerCase(),
          priority: entity_name === 'BlogPost' ? 0.8 : 0.7,
          changefreq: 'weekly',
          lastmod: new Date().toISOString().split('T')[0],
          status: 'active'
        });
      } else {
        // עדכון תאריך
        await base44.asServiceRole.entities.SitemapURL.update(existingSitemap[0].id, {
          lastmod: new Date().toISOString().split('T')[0]
        });
      }
    }

    // 2. מחיקה מ-Sitemap
    if (action === 'deleted') {
      const existingSitemap = await base44.asServiceRole.entities.SitemapURL.filter({ url });
      if (existingSitemap.length > 0) {
        await base44.asServiceRole.entities.SitemapURL.update(existingSitemap[0].id, {
          status: 'deleted'
        });
      }
    }

    // 3. בדיקה אם צריך Ping
    let pingSent = false;
    let pingStatus = 'skipped';

    if (action === 'created' || is_substantial) {
      // בדיקת זמן Ping אחרון
      const lastPing = await base44.asServiceRole.entities.SEOLog.filter(
        { action: 'ping_sent', ping_status: 'success' },
        '-created_date',
        1
      );

      const shouldPing = lastPing.length === 0 || 
        (new Date() - new Date(lastPing[0].created_date)) > (6 * 60 * 60 * 1000); // 6 שעות

      if (shouldPing) {
        try {
          const pingUrl = `https://www.google.com/ping?sitemap=https://perfect1.co.il/sitemap-index`;
          const pingResponse = await fetch(pingUrl);
          
          pingSent = true;
          pingStatus = pingResponse.ok ? 'success' : 'failed';
        } catch (pingError) {
          pingStatus = 'error';
        }
      }
    }

    // 4. לוג הפעולה
    await base44.asServiceRole.entities.SEOLog.create({
      entity_name,
      entity_id,
      url,
      action,
      is_substantial_change: is_substantial,
      lastmod_updated: true,
      ping_sent: pingSent,
      ping_status: pingStatus
    });

    return res.status(200).json({
      success: true,
      sitemap_updated: true,
      ping_sent: pingSent,
      ping_status: pingStatus
    });

  } catch (error) {
    console.error('[Auto Index] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * הגדרה ב-Webhooks:
 * 
 * Entity: BlogPost
 * Events: created, updated, deleted
 * Function: autoIndexNewContent
 * 
 * Entity: Profession
 * Events: created, updated, deleted
 * Function: autoIndexNewContent
 */