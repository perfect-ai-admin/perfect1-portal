/**
 * notifySearchEngines - הודעה למנועי חיפוש על עדכון
 * נקרא אוטומטית כשמתפרסם דף חדש או מתעדכן תוכן משמעותי
 * 
 * שולח ping ל:
 * - Google (Sitemap ping)
 * - Bing (IndexNow API)
 */

export default async function notifySearchEngines(req, res) {
  try {
    const { url, type = 'updated' } = req.body; // type: 'new' או 'updated'
    const siteUrl = 'https://perfect1.co.il';
    const results = { google: null, bing: null };

    // 1. Google Sitemap Ping
    try {
      const googlePingUrl = `https://www.google.com/ping?sitemap=${siteUrl}/sitemap-index`;
      const googleResponse = await fetch(googlePingUrl);
      results.google = {
        success: googleResponse.ok,
        status: googleResponse.status,
        message: 'Google sitemap ping sent'
      };
    } catch (googleError) {
      results.google = {
        success: false,
        error: googleError.message
      };
    }

    // 2. Bing IndexNow (אם יש URL ספציפי)
    if (url) {
      try {
        const bingResponse = await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            host: 'perfect1.co.il',
            key: 'YOUR_INDEXNOW_KEY', // צריך להגדיר במשתני סביבה
            keyLocation: `${siteUrl}/YOUR_INDEXNOW_KEY.txt`,
            urlList: [url]
          })
        });
        
        results.bing = {
          success: bingResponse.ok,
          status: bingResponse.status,
          message: 'Bing IndexNow submitted'
        };
      } catch (bingError) {
        results.bing = {
          success: false,
          error: bingError.message
        };
      }
    }

    // לוג להיסטוריה
    console.log('[SEO Notification]', {
      timestamp: new Date().toISOString(),
      url: url || 'sitemap-only',
      type,
      results
    });

    return res.status(200).json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error notifying search engines:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * הערות שימוש:
 * 
 * 1. קריאה בעת פרסום דף חדש:
 *    await base44.functions.notifySearchEngines({ url: newPageUrl, type: 'new' })
 * 
 * 2. קריאה בעת עדכון תוכן משמעותי:
 *    await base44.functions.notifySearchEngines({ url: updatedPageUrl, type: 'updated' })
 * 
 * 3. Ping כללי של Sitemap (ללא URL ספציפי):
 *    await base44.functions.notifySearchEngines({})
 * 
 * מומלץ לקרוא לפונקציה הזו:
 * - מיד לאחר יצירת BlogPost חדש
 * - לאחר עדכון Profession
 * - בעת הוספת דף Landing חדש
 * 
 * הימנע מקריאות מרובות מדי (Google מגביל, Bing גם כן)
 */