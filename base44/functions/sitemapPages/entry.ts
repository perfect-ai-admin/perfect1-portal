import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const baseUrl = 'https://perfect1.co.il';
    
    // דפים שלא כוללים ב-sitemap (דפי ניהול פנימיים, תודה, דפים כפולים)
    const excludedPages = [
      'LeadsAdmin', 'AgentCRM', 'AgentsManager', 'AgentLogin',
      'ClientDashboard', 'ClientLogin', 'SEOAdmin', 'SEOAnalytics',
      'SystemLogicMap', 'ThankYou', 'Partnership',
      'MakeupArtistLanding', 'MakeupArtistLandingNew',
      'CosmeticianLanding', 'CosmeticianLandingNew',
      'OsekPatur',
      // דפי Sitemap טכניים
      'Sitemap', 'SitemapPages', 'SitemapArticles', 'SitemapGeo', 'SitemapFAQ',
      // דפי Landing כפולים/ישנים
      'FreelancerLanding', 'TechnicianLanding', 'ComputerTechnicianLanding', 'WoltDeliveryLanding',
      // דפי מקצועות ספציפיים (כפולים ל-ProfessionPage)
      'GraphicDesignerLanding', 'PhotographerLanding', 'FitnessTrainerLanding',
      'HairStylistLanding', 'EyebrowStylistLanding', 'LashArtistLanding', 'ManicuristLanding',
      // דפים פנימיים
      'SalesAgentHandbook', 'InvoicesAppLanding',
      // דפים ריקים/מיותרים
      'OsekPaturOnline', 'MonthlyMonitoringLanding', 'OsekMorshaMainLanding', 'OsekMorshaOnline'
    ];
    
    const pages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/about', priority: '0.9', changefreq: 'monthly' },
      { url: '/services', priority: '0.9', changefreq: 'monthly' },
      { url: '/contact', priority: '0.9', changefreq: 'monthly' },
      { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
      { url: '/osek-patur', priority: '1.0', changefreq: 'weekly' },
      { url: '/osek-patur-online', priority: '1.0', changefreq: 'weekly' },
      { url: '/osek-morsha', priority: '0.9', changefreq: 'weekly' },
      { url: '/company-landing', priority: '0.9', changefreq: 'weekly' },
      { url: '/blog', priority: '0.8', changefreq: 'daily' },
      { url: '/privacy', priority: '0.6', changefreq: 'yearly' },
      { url: '/terms', priority: '0.6', changefreq: 'yearly' },
      { url: '/professions', priority: '0.9', changefreq: 'monthly' },
    ];

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});