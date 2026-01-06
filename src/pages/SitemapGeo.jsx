import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function SitemapGeo() {
  const { data: professions = [] } = useQuery({
    queryKey: ['professions-geo-sitemap'],
    queryFn: () => base44.entities.Profession.list(),
    initialData: []
  });

  useEffect(() => {
    document.title = 'Sitemap - GEO';
  }, []);

  const baseUrl = 'https://perfect1.co.il';
  const today = new Date().toISOString().split('T')[0];

  // GEO-focused pages (services with location relevance in Israel)
  const geoPages = [
    { url: '/osek-patur', priority: '1.0', changefreq: 'weekly' },
    { url: '/osek-patur-online', priority: '1.0', changefreq: 'weekly' },
    { url: '/urgent-invoice', priority: '0.9', changefreq: 'weekly' },
    { url: '/computer-technician', priority: '0.8', changefreq: 'weekly' },
    { url: '/cosmetician', priority: '0.8', changefreq: 'weekly' },
    { url: '/makeup-artist', priority: '0.8', changefreq: 'weekly' },
    { url: '/services', priority: '0.9', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' }
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${geoPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${professions.map(prof => `  <url>
    <loc>${baseUrl}/profession-page?slug=${prof.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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