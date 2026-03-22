/**
 * Google Analytics Data Fetcher
 * 
 * הוראות הפעלה:
 * 1. הפעל Backend Functions בהגדרות האפליקציה
 * 2. חבר App Connector של Google Analytics (צור OAuth connection)
 * 3. בקש הרשאות ל: Analytics Readonly API
 * 
 * Usage: POST /api/getAnalyticsData
 */

export default async function getAnalyticsData(event, context) {
  try {
    const { base44 } = context;
    
    // קבלת Access Token מה-App Connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleanalytics');
    
    // Google Analytics Property ID (צריך להגדיר - למצוא ב-GA4)
    const propertyId = 'YOUR_GA4_PROPERTY_ID'; // החלף בID האמיתי שלך
    
    // תאריכים - 30 יום אחרונים
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // קריאה ל-Google Analytics Data API v1
    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [
            { name: 'pagePath' },
            { name: 'sessionSource' },
            { name: 'deviceCategory' }
          ],
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' }
          ]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`GA API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // עיבוד הנתונים
    const overview = {
      totalVisitors: 0,
      pageViews: 0,
      avgSessionDuration: '0:00',
      bounceRate: 0
    };
    
    const topPages = {};
    const sources = {};
    const devices = {};
    
    data.rows?.forEach(row => {
      const pagePath = row.dimensionValues[0].value;
      const source = row.dimensionValues[1].value;
      const device = row.dimensionValues[2].value;
      const users = parseInt(row.metricValues[0].value);
      const views = parseInt(row.metricValues[1].value);
      const duration = parseFloat(row.metricValues[2].value);
      const bounce = parseFloat(row.metricValues[3].value);
      
      overview.totalVisitors += users;
      overview.pageViews += views;
      overview.avgSessionDuration = duration;
      overview.bounceRate = bounce;
      
      // Top Pages
      if (!topPages[pagePath]) {
        topPages[pagePath] = { url: pagePath, visits: 0, avgTime: 0, bounceRate: 0 };
      }
      topPages[pagePath].visits += users;
      topPages[pagePath].avgTime += duration;
      topPages[pagePath].bounceRate = bounce;
      
      // Sources
      if (!sources[source]) {
        sources[source] = { source, visits: 0 };
      }
      sources[source].visits += users;
      
      // Devices
      if (!devices[device]) {
        devices[device] = { device, visits: 0 };
      }
      devices[device].visits += users;
    });
    
    // המרת זמן ממוצע
    const avgSeconds = Math.round(overview.avgSessionDuration);
    const minutes = Math.floor(avgSeconds / 60);
    const seconds = avgSeconds % 60;
    overview.avgSessionDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // חישוב אחוזים
    const totalVisitors = overview.totalVisitors;
    Object.values(sources).forEach(s => {
      s.percentage = ((s.visits / totalVisitors) * 100).toFixed(1);
    });
    Object.values(devices).forEach(d => {
      d.percentage = ((d.visits / totalVisitors) * 100).toFixed(1);
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        overview,
        topPages: Object.values(topPages).sort((a, b) => b.visits - a.visits).slice(0, 5),
        sources: Object.values(sources).sort((a, b) => b.visits - a.visits),
        devices: Object.values(devices).sort((a, b) => b.visits - a.visits)
      })
    };
    
  } catch (error) {
    console.error('Analytics Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        note: 'וודא שהפעלת Backend Functions וחיברת Google Analytics App Connector'
      })
    };
  }
}