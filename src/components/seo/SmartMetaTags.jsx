import React, { useEffect } from 'react';

/**
 * SmartMetaTags - הוספה דינמית של Meta tags לדף
 * עובד עם Helmet או ישירות על ה-DOM
 * 
 * Props:
 * - pageData: אובייקט עם כל מידע הדף
 */
export default function SmartMetaTags({ pageData }) {
  useEffect(() => {
    if (!pageData) return;

    // עדכון Title
    if (pageData.title) {
      document.title = pageData.title.includes('Perfect One') 
        ? pageData.title 
        : `${pageData.title} | Perfect One`;
    }

    // עדכון/יצירת Meta Description
    updateOrCreateMeta('description', pageData.description);
    
    // עדכון/יצירת Keywords
    if (pageData.keywords) {
      updateOrCreateMeta('keywords', Array.isArray(pageData.keywords) 
        ? pageData.keywords.join(', ') 
        : pageData.keywords
      );
    }

    // Canonical
    if (pageData.canonical) {
      updateOrCreateLink('canonical', pageData.canonical);
    }

    // OG Tags
    if (pageData.ogTitle) updateOrCreateMetaProperty('og:title', pageData.ogTitle);
    if (pageData.ogDescription) updateOrCreateMetaProperty('og:description', pageData.ogDescription);
    if (pageData.ogImage) updateOrCreateMetaProperty('og:image', pageData.ogImage);
    if (pageData.ogUrl) updateOrCreateMetaProperty('og:url', pageData.ogUrl);
    
    updateOrCreateMetaProperty('og:type', pageData.ogType || 'website');
    updateOrCreateMetaProperty('og:locale', 'he_IL');
    updateOrCreateMetaProperty('og:site_name', 'Perfect One');

    // Twitter Cards
    updateOrCreateMetaName('twitter:card', 'summary_large_image');
    if (pageData.twitterTitle) updateOrCreateMetaName('twitter:title', pageData.twitterTitle);
    if (pageData.twitterDescription) updateOrCreateMetaName('twitter:description', pageData.twitterDescription);
    if (pageData.twitterImage) updateOrCreateMetaName('twitter:image', pageData.twitterImage);

  }, [pageData]);

  return null;
}

// פונקציות עזר
function updateOrCreateMeta(name, content) {
  if (!content) return;
  
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function updateOrCreateMetaProperty(property, content) {
  if (!content) return;
  
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function updateOrCreateMetaName(name, content) {
  if (!content) return;
  
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function updateOrCreateLink(rel, href) {
  if (!href) return;
  
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/**
 * דוגמת שימוש:
 * 
 * <SmartMetaTags pageData={{
 *   title: "כותרת הדף",
 *   description: "תיאור הדף",
 *   canonical: "https://perfect1.co.il/page",
 *   keywords: ["מילה1", "מילה2"],
 *   ogTitle: "כותרת OG",
 *   ogImage: "/og-image.jpg"
 * }} />
 */