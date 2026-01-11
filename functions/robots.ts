Deno.serve(async (req) => {
  try {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /client-login
Disallow: /agent-login
Disallow: /system-logic-map
Disallow: /seo-admin
Disallow: /seo-analytics
Disallow: /leads-admin

# Crawl delay
Crawl-delay: 1

# Sitemaps
Sitemap: https://perfect1.co.il/sitemap.xml
Sitemap: https://perfect1.co.il/sitemap-pages.xml
Sitemap: https://perfect1.co.il/sitemap-articles.xml
Sitemap: https://perfect1.co.il/sitemap-professions.xml
Sitemap: https://perfect1.co.il/sitemap-services.xml`;

    return new Response(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});