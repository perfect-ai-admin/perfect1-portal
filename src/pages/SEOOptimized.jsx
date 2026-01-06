import React, { useEffect } from 'react';

// SEO Component for optimizing meta tags
export default function SEOOptimized({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  schema
}) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Ensure no noindex
    const removeNoIndex = () => {
      const noindexTags = document.querySelectorAll('meta[name="robots"][content*="noindex"]');
      noindexTags.forEach(tag => tag.remove());
    };
    removeNoIndex();

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Ensure indexable
    updateMetaTag('robots', 'index, follow');

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:type', 'website', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // Schema.org structured data
    if (schema) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }
  }, [title, description, keywords, ogImage, canonical, schema]);

  return null;
}

// SEO Presets for different pages
export const seoPresets = {
  home: {
    title: 'פתיחת עוסק פטור בישראל | ליווי מלא + אפליקציה - Perfect One',
    description: 'פתיחת עוסק פטור בישראל תוך 24-48 שעות. כולל: טיפול מול הרשויות, אפליקציה לניהול העסק, ליווי חודשי מלא והכנת דוח שנתי. שירות ארצי לכל רחבי ישראל ☎ 0502277087',
    keywords: 'פתיחת עוסק פטור בישראל, עוסק פטור ישראל, איך פותחים עוסק פטור, מחיר פתיחת עוסק פטור, עוסק פטור אונליין, ליווי עוסק פטור, אפליקציה לעוסק פטור',
    ogImage: 'https://perfect1.co.il/og-image.jpg'
  },
  
  professions: {
    title: 'פתיחת עוסק פטור לפי מקצוע - 60+ מקצועות | פרפקט וואן',
    description: 'פתיחת עוסק פטור מותאמת למקצוע שלך. מעצבים, צלמים, קופירייטרים, מפתחים, מאמנים ועוד. ייעוץ חינם 0502277087',
    keywords: 'פתיחת עוסק פטור מעצב גרפי, עוסק פטור צלם, עוסק פטור קופירייטר, עוסק פטור מפתח אתרים, עוסק פטור מאמן כושר',
    ogImage: 'https://perfect1.co.il/og-professions.jpg'
  },
  
  pricing: {
    title: 'מחירון פתיחת עוסק פטור - מחירים שקופים 2024 | פרפקט וואן',
    description: 'מחירון מלא לפתיחת עוסק פטור: פתיחת תיק 199₪, ליווי חודשי 149₪, דוח שנתי 500₪. ללא עמלות נסתרות. התקשרו: 0502277087',
    keywords: 'מחיר פתיחת עוסק פטור, עלות עוסק פטור, כמה עולה לפתוח עוסק פטור, מחירון עוסק פטור 2024',
    ogImage: 'https://perfect1.co.il/og-pricing.jpg'
  },
  
  about: {
    title: 'אודות פרפקט וואן - המרכז הארצי לעוסקים פטורים',
    description: 'פרפקט וואן - המרכז הארצי לעוסקים פטורים. פותחים 2,000+ עוסקים בשנה. צוות מקצועי, שירות אישי, מחירים שקופים. 0502277087',
    keywords: 'פרפקט וואן, המרכז לעוסקים פטורים, מי אנחנו, עוסק פטור מקצועי',
    ogImage: 'https://perfect1.co.il/og-about.jpg'
  },
  
  contact: {
    title: 'צור קשר - פרפקט וואן | פתיחת עוסק פטור',
    description: 'צור קשר עם פרפקט וואן לפתיחת עוסק פטור. טלפון: 0502277087 | וואטסאפ זמין | מענה תוך 24 שעות',
    keywords: 'צור קשר עוסק פטור, טלפון פתיחת עוסק פטור, וואטסאפ עוסק פטור',
    ogImage: 'https://perfect1.co.il/og-contact.jpg'
  },
  
  services: {
    title: 'שירותים לעוסקים פטורים - פתיחה, ליווי, דוחות | פרפקט וואן',
    description: 'שירותים מקיפים לעוסקים פטורים: פתיחת תיק, ליווי חודשי, דוח שנתי, הנהלת חשבונות, ייעוץ מס. 0502277087',
    keywords: 'שירותים לעוסק פטור, ליווי עוסק פטור, דוח שנתי עוסק פטור, הנהלת חשבונות',
    ogImage: 'https://perfect1.co.il/og-services.jpg'
  }
};

// Schema.org templates
export const schemaTemplates = {
  organization: {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "name": "פרפקט וואן - הבית לעצמאים",
    "description": "המרכז הארצי לפתיחת עוסקים פטורים בישראל. ליווי מקצועי מא' ועד ת'",
    "url": "https://perfect1.co.il",
    "telephone": "+972-50-227-7087",
    "priceRange": "₪₪",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IL"
    },
    "areaServed": {
      "@type": "Country",
      "name": "ישראל"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2000"
    }
  },
  
  service: (serviceName, price) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "provider": {
      "@type": "Organization",
      "name": "פרפקט וואן"
    },
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "ILS"
    }
  }),
  
  faqPage: (faqs) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }),
  
  breadcrumb: (items) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  })
};