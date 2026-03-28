import React from 'react';
import { Helmet } from 'react-helmet-async';

const generateArticleSchema = (data) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: data.heroTitle || data.title,
  description: data.metaDescription,
  datePublished: data.publishDate,
  dateModified: data.updatedDate || data.publishDate,
  author: {
    '@type': 'Organization',
    name: data.author?.name || 'פרפקט וואן',
    url: 'https://perfect-dashboard.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'פרפקט וואן',
    url: 'https://perfect-dashboard.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://perfect-dashboard.com/og-image.png',
    },
  },
  image: 'https://perfect-dashboard.com/og-image.png',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': data.canonical,
  },
  inLanguage: 'he',
});

const generateFAQSchema = (faqItems) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

const generateBreadcrumbSchema = (breadcrumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.label,
    item: crumb.href ? `https://perfect-dashboard.com${crumb.href}` : undefined,
  })),
});

const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'פרפקט וואן',
  url: 'https://perfect-dashboard.com',
  description: 'ליווי מקצועי לפתיחה, ניהול וסגירת עסקים בישראל',
  logo: {
    '@type': 'ImageObject',
    url: 'https://perfect-dashboard.com/og-image.png',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Israel',
  },
  serviceType: ['פתיחת עוסק פטור', 'פתיחת עוסק מורשה', 'הקמת חברה בע"מ', 'סגירת תיקים'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['Hebrew', 'English'],
  },
});

export default function SchemaMarkup({ type, data = {}, breadcrumbs = [], faqItems = [] }) {
  const schemas = [];

  if (type === 'article' && data.title) {
    schemas.push(generateArticleSchema(data));
  }

  if (type === 'home') {
    schemas.push(generateOrganizationSchema());
  }

  if (faqItems.length > 0) {
    schemas.push(generateFAQSchema(faqItems));
  }

  if (breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(breadcrumbs));
  }

  if (schemas.length === 0) return null;

  return (
    <Helmet>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
