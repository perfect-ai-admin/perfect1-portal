/**
 * Generate Sitemap - יוצר sitemap.xml דינמי עם lastmod אמיתי
 * 
 * Usage: GET /api/generateSitemap
 * Returns: XML sitemap
 */

export default async function generateSitemap(event, context) {
  const { base44 } = context;
  
  try {
    // Fetch published blog posts
    const posts = await base44.asServiceRole.entities.BlogPost.filter({ published: true });
    
    // Fetch all professions
    const professions = await base44.asServiceRole.entities.Profession.list();
    
    const baseUrl = 'https://perfect1.co.il';
    const today = new Date().toISOString().split('T')[0];
    
    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily', lastmod: today },
      { url: '/About', priority: '0.8', changefreq: 'monthly', lastmod: today },
      { url: '/Services', priority: '0.9', changefreq: 'weekly', lastmod: today },
      { url: '/Pricing', priority: '0.9', changefreq: 'weekly', lastmod: today },
      { url: '/Contact', priority: '0.8', changefreq: 'monthly', lastmod: today },
      { url: '/Blog', priority: '0.9', changefreq: 'daily', lastmod: today },
      { url: '/Professions', priority: '0.9', changefreq: 'weekly', lastmod: today },
    ];
    
    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    // Add blog posts with REAL lastmod from DB
    posts.forEach(post => {
      // שימוש ב-updated_date האמיתי מה-DB
      const lastmod = post.updated_date 
        ? new Date(post.updated_date).toISOString().split('T')[0]
        : new Date(post.created_date).toISOString().split('T')[0];
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/BlogPost?slug=${post.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    });
    
    // Add profession pages
    professions.forEach(profession => {
      const lastmod = profession.updated_date 
        ? new Date(profession.updated_date).toISOString().split('T')[0]
        : today;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/ProfessionPage?slug=${profession.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    // Return XML with correct content type
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      },
      body: xml
    };
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}