import React, { useEffect } from 'react';

export default function SitemapPages() {
  useEffect(() => {
    document.title = 'Sitemap - Pages';
  }, []);

  const baseUrl = 'https://perfect1.co.il';
  const today = new Date().toISOString().split('T')[0];

  const pages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/professions', priority: '0.9', changefreq: 'weekly' },
    { url: '/pricing', priority: '0.9', changefreq: 'monthly' },
    { url: '/services', priority: '0.9', changefreq: 'monthly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/pricing-landing', priority: '0.9', changefreq: 'weekly' }
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
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