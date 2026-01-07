/**
 * Google Search Console Data Fetcher
 * 
 * הוראות הפעלה:
 * 1. הפעל Backend Functions בהגדרות האפליקציה
 * 2. חבר App Connector של Google (עם Search Console API scope)
 * 3. בקש הרשאות ל: https://www.googleapis.com/auth/webmasters.readonly
 * 
 * Usage: POST /api/getSearchConsoleData
 */

export default async function getSearchConsoleData(event, context) {
  try {
    const { base44 } = context;
    
    // קבלת Access Token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('google');
    
    // Site URL (צריך להיות מאומת ב-Search Console)
    const siteUrl = 'https://perfect1.co.il/';
    
    // תאריכים - 30 יום אחרונים
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // קריאה ל-Search Console API
    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query', 'page'],
          rowLimit: 100,
          dimensionFilterGroups: [{
            filters: [{
              dimension: 'country',
              operator: 'equals',
              expression: 'isr'
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Search Console API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // עיבוד נתונים - קיבוץ לפי query
    const keywordsMap = {};
    
    data.rows?.forEach(row => {
      const query = row.keys[0];
      const page = row.keys[1];
      const clicks = row.clicks;
      const impressions = row.impressions;
      const ctr = row.ctr;
      const position = row.position;
      
      if (!keywordsMap[query]) {
        keywordsMap[query] = {
          keyword: query,
          position: Math.round(position),
          clicks,
          impressions,
          ctr: (ctr * 100).toFixed(1),
          url: page,
          change: 0 // צריך לעקוב לאורך זמן להשוואה
        };
      } else {
        // אם אותה מילת מפתח מופיעה במספר עמודים - קח את המדורגת יותר
        if (position < keywordsMap[query].position) {
          keywordsMap[query].position = Math.round(position);
          keywordsMap[query].url = page;
        }
        keywordsMap[query].clicks += clicks;
        keywordsMap[query].impressions += impressions;
      }
    });
    
    // המרה למערך וסדר לפי מיקום
    const keywords = Object.values(keywordsMap)
      .sort((a, b) => a.position - b.position)
      .slice(0, 50); // 50 מילות מפתח מובילות
    
    // הוספת difficulty משוער (לפי impressions)
    keywords.forEach(kw => {
      if (kw.impressions > 5000) kw.difficulty = 'high';
      else if (kw.impressions > 1000) kw.difficulty = 'medium';
      else kw.difficulty = 'low';
      
      kw.searches = kw.impressions; // משתמשים ב-impressions כמשוער לחיפושים
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        keywords,
        totalClicks: keywords.reduce((sum, kw) => sum + kw.clicks, 0),
        totalImpressions: keywords.reduce((sum, kw) => sum + kw.impressions, 0),
        avgPosition: (keywords.reduce((sum, kw) => sum + kw.position, 0) / keywords.length).toFixed(1)
      })
    };
    
  } catch (error) {
    console.error('Search Console Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        note: 'וודא שהפעלת Backend Functions וחיברת Google App Connector עם Search Console scope'
      })
    };
  }
}