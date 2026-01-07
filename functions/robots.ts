/**
 * Robots.txt - מגדיר כללי סריקה לבוטים
 * 
 * Usage: GET /robots.txt
 */

export default async function robots(event, context) {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://perfect1.co.il/api/generateSitemap

# Crawl-delay
Crawl-delay: 1

# Disallow admin pages
Disallow: /SEOAdmin
Disallow: /api/

# Allow specific pages
Allow: /BlogPost
Allow: /ProfessionPage
Allow: /Blog
Allow: /Professions
Allow: /Services
Allow: /Pricing
Allow: /Contact
Allow: /About
`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    },
    body: robotsTxt
  };
}