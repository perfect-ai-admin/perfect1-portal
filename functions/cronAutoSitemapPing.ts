/**
 * cronAutoSitemapPing - Cron Job אוטומטי
 * רץ כל 6 שעות ושולח Ping לגוגל אם היו עדכונים
 * 
 * הגדרה: Schedule ל-"0 */6 * * *" (כל 6 שעות)
 */

import { base44 } from '@/api/base44Client';

export default async function cronAutoSitemapPing(req, res) {
  try {
    const siteUrl = 'https://perfect1.co.il';
    
    // בדיקה אם היו עדכונים מאז ה-Ping האחרון
    const lastPing = await base44.asServiceRole.entities.SEOLog.filter(
      { action: 'ping_sent', ping_status: 'success' },
      '-created_date',
      1
    );

    const lastPingTime = lastPing.length > 0 
      ? new Date(lastPing[0].created_date) 
      : new Date(0);

    // בדיקה אם נוספו או עודכנו דפים מאז
    const recentUpdates = await base44.asServiceRole.entities.SitemapURL.filter(
      { status: 'active' },
      '-updated_date',
      10
    );

    const hasNewContent = recentUpdates.some(
      url => new Date(url.updated_date) > lastPingTime
    );

    if (!hasNewContent) {
      console.log('No new content since last ping - skipping');
      return res.status(200).json({
        success: true,
        message: 'No updates - ping skipped',
        last_ping: lastPingTime
      });
    }

    // שליחת Ping
    const googlePingUrl = `https://www.google.com/ping?sitemap=${siteUrl}/sitemap-index`;
    const response = await fetch(googlePingUrl);

    // לוג
    await base44.asServiceRole.entities.SEOLog.create({
      entity_name: 'Sitemap',
      action: 'ping_sent',
      url: `${siteUrl}/sitemap-index`,
      ping_status: response.ok ? 'success' : 'failed',
      ping_sent: true,
      fields_changed: [`${recentUpdates.length} URLs updated`]
    });

    console.log(`✅ Cron Ping sent to Google - ${recentUpdates.length} updates`);

    return res.status(200).json({
      success: true,
      ping_sent: response.ok,
      updates_count: recentUpdates.length
    });

  } catch (error) {
    console.error('Cron ping error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * הגדרה:
 * במסך Backend Functions -> Cron Jobs:
 * Function: cronAutoSitemapPing
 * Schedule: "0 */6 * * *" (כל 6 שעות)
 * 
 * זה יבטיח שגוגל תמיד מעודכנת על שינויים באתר
 * בלי לשלוח Ping מיותר בכל שינוי קטן
 */