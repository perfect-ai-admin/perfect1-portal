import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Sitemap() {
  const { data: professions = [] } = useQuery({
    queryKey: ['professions-sitemap'],
    queryFn: () => base44.entities.Profession.list(),
    initialData: []
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog-posts-sitemap'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }),
    initialData: []
  });

  useEffect(() => {
    // Set content type to XML
    const metaTag = document.querySelector('meta[http-equiv="Content-Type"]');
    if (metaTag) {
      metaTag.setAttribute('content', 'application/xml');
    }
  }, []);

  const baseUrl = 'https://perfect1.co.il';
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/professions', priority: '0.9', changefreq: 'weekly' },
    { url: '/pricing', priority: '0.9', changefreq: 'monthly' },
    { url: '/services', priority: '0.9', changefreq: 'monthly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
    { url: '/osek-patur', priority: '1.0', changefreq: 'weekly' },
    { url: '/osek-patur-online', priority: '1.0', changefreq: 'weekly' },
    { url: '/urgent-invoice', priority: '0.9', changefreq: 'weekly' },
    { url: '/computer-technician', priority: '0.8', changefreq: 'weekly' },
    { url: '/cosmetician', priority: '0.8', changefreq: 'weekly' },
    { url: '/makeup-artist', priority: '0.8', changefreq: 'weekly' },
    { url: '/pricing-landing', priority: '0.9', changefreq: 'weekly' }
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${professions.map(prof => `  <url>
    <loc>${baseUrl}/profession?slug=${prof.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${blogPosts.map(post => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_date || post.created_date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
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