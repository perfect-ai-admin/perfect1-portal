import React, { useEffect } from 'react';

export default function Sitemap() {
  useEffect(() => {
    document.title = 'Sitemap';
  }, []);

  const baseUrl = 'https://perfect1.co.il';
  const today = new Date().toISOString().split('T')[0];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-articles</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-faq</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-geo</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

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