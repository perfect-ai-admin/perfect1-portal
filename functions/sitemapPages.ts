/**
 * Sitemap Pages - כל הדפים הסטטיים + דינמיים
 * נשלף מה-DB (Entity: SitemapURL)
 */

import { base44 } from '@/api/base44Client';

export default async function handler(req, res) {
  try {
    const siteUrl = 'https://perfect1.co.il';
    
    // שליפת כל ה-URLs מה-DB
    const urls = await base44.asServiceRole.entities.SitemapURL.filter(
      { status: 'active', type: 'page' },
      '-lastmod',
      50000 // מקסימום 50k URLs
    );

    // דפים סטטיים קבועים
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/Home', priority: 1.0, changefreq: 'daily' },
      { url: '/About', priority: 0.8, changefreq: 'monthly' },
      { url: '/Contact', priority: 0.8, changefreq: 'monthly' },
      { url: '/Pricing', priority: 0.9, changefreq: 'weekly' },
      { url: '/Services', priority: 0.9, changefreq: 'weekly' },
      { url: '/Methodology', priority: 0.7, changefreq: 'monthly' },
      { url: '/Regulation', priority: 0.7, changefreq: 'monthly' },
      { url: '/Team', priority: 0.6, changefreq: 'monthly' },
    ];

    // Landing Pages
    const landingPages = [
      { url: '/OsekPaturLanding', priority: 0.9, changefreq: 'weekly' },
      { url: '/OsekPaturOnlineLanding', priority: 0.9, changefreq: 'weekly' },
      { url: '/PricingLanding', priority: 0.9, changefreq: 'weekly' },
      { url: '/UrgentInvoice', priority: 0.9, changefreq: 'weekly' },
    ];

    const allUrls = [...staticPages, ...landingPages, ...urls];
    const today = new Date().toISOString().split('T')[0];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${page.lastmod || today}</lastmod>
    <changefreq>${page.changefreq || 'weekly'}</changefreq>
    <priority>${page.priority || 0.8}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=1800'); // Cache ל-30 דקות
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
}