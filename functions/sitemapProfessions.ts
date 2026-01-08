/**
 * Sitemap Professions - כל דפי המקצועות
 */

import { base44 } from '@/api/base44Client';

export default async function handler(req, res) {
  try {
    const siteUrl = 'https://perfect1.co.il';
    
    // שליפת כל המקצועות
    const professions = await base44.asServiceRole.entities.Profession.list('-updated_date', 1000);

    // דף הקטגוריה הראשי
    const categoryPage = {
      url: '/Professions',
      lastmod: new Date().toISOString().split('T')[0],
      priority: 0.9,
      changefreq: 'weekly'
    };

    const allUrls = [
      categoryPage,
      ...professions.map(prof => ({
        url: `/ProfessionPage?slug=${prof.slug}`,
        lastmod: prof.updated_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        priority: 0.8,
        changefreq: 'monthly'
      }))
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Error generating professions sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
}