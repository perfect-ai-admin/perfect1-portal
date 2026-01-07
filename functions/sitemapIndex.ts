/**
 * Sitemap Index - מפת אתר ראשית
 * 
 * Usage: GET /sitemap.xml
 */

export default async function sitemapIndex(event, context) {
  const baseUrl = 'https://perfect1.co.il';
  const today = new Date().toISOString();
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/api/generateSitemap</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    },
    body: xml
  };
}