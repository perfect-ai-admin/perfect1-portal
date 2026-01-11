import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const baseUrl = 'https://perfect1.co.il';
    
    const blogPosts = await base44.entities.BlogPost.filter({ published: true }, '-updated_date');
    
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${blogPosts.map(post => `  <url>
    <loc>${baseUrl}/blog-post?slug=${post.slug}</loc>
    <lastmod>${new Date(post.updated_date || post.created_date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    ${post.featured_image ? `<image:image><image:loc>${post.featured_image}</image:loc><image:title>${post.title}</image:title></image:image>` : ''}
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