import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function SitemapArticles() {
  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog-posts-sitemap'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-updated_date'),
    initialData: []
  });

  useEffect(() => {
    document.title = 'Sitemap - Articles';
  }, []);

  const baseUrl = 'https://perfect1.co.il';

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${blogPosts.map(post => `  <url>
    <loc>${baseUrl}/blog-post?slug=${post.slug}</loc>
    <lastmod>${new Date(post.updated_date || post.created_date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

  return (
    <pre style={{ 
      margin: 0, 
      fontFamily: 'monospace', 
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word'
    }}>
      {xmlContent}
    </pre>
  );
}