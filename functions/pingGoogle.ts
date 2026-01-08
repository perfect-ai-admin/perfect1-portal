/**
 * pingGoogle - שליחת Ping לגוגל על עדכון Sitemap
 * קריאה ידנית או אוטומטית בעת פרסום תוכן חדש
 * 
 * מגבלות: Google ממליצה לא לשלוח יותר מדי פעמים ביום
 * לכן - מומלץ לצבור עדכונים ולשלוח Ping פעם ב-X שעות
 */

import { base44 } from '@/api/base44Client';

export default async function pingGoogle(req, res) {
  try {
    const siteUrl = 'https://perfect1.co.il';
    const sitemapUrl = `${siteUrl}/sitemap-index`;

    // בדיקה מתי נשלח Ping אחרון
    const lastPings = await base44.asServiceRole.entities.SEOLog.filter(
      { action: 'ping_sent' },
      '-created_date',
      1
    );

    const lastPingTime = lastPings.length > 0 
      ? new Date(lastPings[0].created_date).getTime() 
      : 0;
    const now = new Date().getTime();
    const hoursSinceLastPing = (now - lastPingTime) / (1000 * 60 * 60);

    // שליחת Ping רק אם עברו 6+ שעות מהאחרון
    if (hoursSinceLastPing < 6) {
      return res.status(200).json({
        success: true,
        message: 'Ping skipped - too soon since last ping',
        hours_since_last: hoursSinceLastPing.toFixed(1)
      });
    }

    // שליחת Ping
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const response = await fetch(googlePingUrl);

    // לוג של הפעולה
    await base44.asServiceRole.entities.SEOLog.create({
      entity_name: 'Sitemap',
      action: 'ping_sent',
      url: sitemapUrl,
      ping_status: response.ok ? 'success' : 'failed',
      ping_sent: true
    });

    return res.status(200).json({
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Google pinged successfully' : 'Ping failed',
      sitemap: sitemapUrl
    });

  } catch (error) {
    console.error('Error pinging Google:', error);
    
    // לוג שגיאה
    try {
      await base44.asServiceRole.entities.SEOLog.create({
        entity_name: 'Sitemap',
        action: 'ping_sent',
        ping_status: 'error',
        ping_sent: false,
        error_message: error.message
      });
    } catch (logError) {
      console.error('Failed to log ping error:', logError);
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * שימוש:
 * 
 * // קריאה ידנית
 * await base44.functions.pingGoogle({})
 * 
 * // או הגדרה ב-Cron Job שרץ כל 6 שעות
 */