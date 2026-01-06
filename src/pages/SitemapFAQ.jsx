import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function SitemapFAQ() {
  const { data: blogPosts = [] } = useQuery({
    queryKey: ['faq-posts-sitemap'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-updated_date'),
    initialData: []
  });

  useEffect(() => {
    document.title = 'Sitemap - FAQ';
  }, []);

  const baseUrl = 'https://perfect1.co.il';
  const today = new Date().toISOString().split('T')[0];

  // FAQ-focused pages (pages with FAQ schema or question-answer format)
  const faqPages = [
    { url: '/osek-patur', priority: '0.9', changefreq: 'weekly' },
    { url: '/osek-patur-online', priority: '0.9', changefreq: 'weekly' },
    { url: '/pricing-landing', priority: '0.8', changefreq: 'weekly' },
    { url: '/urgent-invoice', priority: '0.8', changefreq: 'weekly' },
    { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { url: '/services', priority: '0.8', changefreq: 'monthly' }
  ];

  // Add blog posts that might contain FAQs
  const faqBlogPosts = blogPosts.filter(post => 
    post.category === 'guides' || 
    post.title.includes('מדריך') || 
    post.title.includes('שאלות')
  );

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${faqPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${faqBlogPosts.map(post => `  <url>
    <loc>${baseUrl}/blog-post?slug=${post.slug}</loc>
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