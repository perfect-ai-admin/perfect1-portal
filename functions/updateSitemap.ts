/**
 * updateSitemap - עדכון דינמי של Sitemap
 * נקרא אוטומטית בכל פעם שנוצר דף חדש
 * 
 * מקבל:
 * - url: כתובת הדף החדש
 * - type: סוג הדף (page/article/profession/etc)
 * - priority: עדיפות (0.0-1.0)
 * - changefreq: תדירות שינוי
 */

import { base44 } from '@/api/base44Client';

export default async function updateSitemap(req, res) {
  try {
    const { url, type = 'page', priority = 0.8, changefreq = 'weekly' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // שמירת רשומת URL ב-Entity
    await base44.entities.SitemapURL.create({
      url: url,
      type: type,
      priority: priority,
      changefreq: changefreq,
      lastmod: new Date().toISOString().split('T')[0],
      status: 'active'
    });

    // שליחת Ping לגוגל (אופציונלי - רק אם מעל X דפים ביום)
    try {
      await fetch(`https://www.google.com/ping?sitemap=https://perfect1.co.il/sitemap-index`);
    } catch (pingError) {
      console.log('Google ping failed (non-critical):', pingError);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Sitemap updated successfully',
      url: url 
    });

  } catch (error) {
    console.error('Error updating sitemap:', error);
    return res.status(500).json({ error: 'Failed to update sitemap' });
  }
}