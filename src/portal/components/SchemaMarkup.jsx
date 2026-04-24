import React from 'react';
import { Helmet } from 'react-helmet-async';

const generateArticleSchema = (data) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.heroTitle || data.title,
    description: data.metaDescription,
    datePublished: data.publishDate,
    dateModified: data.updatedDate || data.publishDate,
    author: {
      '@type': 'Organization',
      '@id': 'https://www.perfect1.co.il/#organization',
      name: 'צוות פרפקט וואן',
      url: 'https://www.perfect1.co.il/authors/perfect1-team',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.perfect1.co.il/#organization',
      name: 'פרפקט וואן',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.perfect1.co.il/logo.png',
        width: 600,
        height: 60,
      },
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://www.perfect1.co.il/og-image.png',
      width: 1200,
      height: 630,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.canonical,
    },
    inLanguage: 'he',
    keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : data.keywords,
  };

  // Speakable for voice search / AI reading (AEO)
  const firstSection = data.sections?.find(s => s.answerBlock);
  if (firstSection) {
    schema.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.answer-block', 'h1', '.hero-subtitle'],
    };
  }

  // about — entity linking for GEO
  if (data.keywords?.length > 0) {
    schema.about = data.keywords.slice(0, 3).map(kw => ({
      '@type': 'Thing',
      name: kw,
    }));
  }

  return schema;
};

const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'פרפקט וואן',
  alternateName: 'Perfect1',
  url: 'https://www.perfect1.co.il',
  inLanguage: 'he',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.perfect1.co.il/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
});

const generateHowToSchema = (data, steps) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: data.heroTitle || data.title,
  description: data.metaDescription,
  inLanguage: 'he',
  step: steps.map((step, i) => ({
    '@type': 'HowToStep',
    position: step.number || i + 1,
    name: step.title,
    text: step.description,
  })),
});

const generateFAQSchema = (faqItems) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems
    .filter(item => item.question && item.answer) // Only include complete Q&A pairs
    .map(item => ({
      '@type': 'Question',
      name: item.question.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.trim(),
      },
    })),
});

const generateBreadcrumbSchema = (breadcrumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs
    .filter(crumb => crumb.href) // Only include breadcrumbs with href
    .map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `https://www.perfect1.co.il${crumb.href}`,
    })),
});

const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.perfect1.co.il/#organization',
  name: 'פרפקט וואן',
  alternateName: 'Perfect One',
  url: 'https://www.perfect1.co.il',
  description: 'פורטל עסקי ישראלי המתמחה בליווי עצמאים ועסקים קטנים — פתיחת עוסק פטור, עוסק מורשה, חברה בעמ, מיסוי, וסגירת תיקים.',
  foundingDate: '2024',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.perfect1.co.il/logo.png',
    width: 600,
    height: 60,
  },
  areaServed: {
    '@type': 'Country',
    name: 'Israel',
  },
  knowsAbout: [
    'פתיחת עוסק פטור',
    'פתיחת עוסק מורשה',
    'הקמת חברה בע"מ',
    'סגירת עסק בישראל',
    'מיסוי עצמאים',
    'מס הכנסה',
    'ביטוח לאומי לעצמאים',
    'הוצאות מוכרות',
    'חשבונאות לעסקים קטנים',
  ],
  serviceType: ['פתיחת עוסק פטור', 'פתיחת עוסק מורשה', 'הקמת חברה בע"מ', 'סגירת תיקים'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: '+972-50-227-7087',
    availableLanguage: ['Hebrew', 'English'],
  },
  sameAs: [
    'https://www.facebook.com/perfect1coil',
    'https://www.linkedin.com/company/perfect1',
    'https://wa.me/972502277087',
  ],
});

export default function SchemaMarkup({ type, data = {}, breadcrumbs = [], faqItems = [], howToSteps = [] }) {
  const schemas = [];

  if (type === 'article' && data.title) {
    schemas.push(generateArticleSchema(data));
  }

  if (type === 'home') {
    schemas.push(generateOrganizationSchema());
    schemas.push(generateWebSiteSchema());
  }

  if (type === 'category' && data.title) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: data.title,
      description: data.description || data.metaDescription,
      url: data.canonical || data.url,
      inLanguage: 'he',
    });

    // ItemList schema for category articles (GEO — helps AI understand content structure)
    if (data.articles?.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: data.title,
        numberOfItems: data.articles.length,
        itemListElement: data.articles.map((article, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: article.title,
          url: `https://www.perfect1.co.il/${data.slug || data.id}/${article.slug}`,
        })),
      });
    }
  }

  // HowTo schema — for step-by-step articles (can coexist with FAQ schema)
  if (howToSteps.length > 0) {
    schemas.push(generateHowToSchema(data, howToSteps));
  }

  // FAQ schema — all FAQ items from all sections
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
