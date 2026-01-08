/**
 * Sitemap Services - כל דפי השירותים
 */

export default async function handler(req, res) {
  const siteUrl = 'https://perfect1.co.il';
  const today = new Date().toISOString().split('T')[0];

  const services = [
    'petach-osek-patur',
    'livui-chodshi',
    'doch-shnati',
    'yeutz-mas',
    'nihul-heshbonot'
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/Services</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${services.map(service => `  <url>
    <loc>${siteUrl}/ServicePage?service=${service}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(sitemap);
}