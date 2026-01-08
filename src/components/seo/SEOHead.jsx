import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEOHead - מטא תגיות מלאות לכל דף
 * כולל: Title, Description, Canonical, Open Graph, Twitter Cards, hreflang
 * 
 * Props:
 * - title: כותרת הדף
 * - description: תיאור הדף
 * - canonical: URL קנוניקלי
 * - image: תמונה לשיתוף (OG)
 * - type: סוג העמוד (website/article)
 * - schema: JSON-LD Schema
 * - noindex: חסימת אינדקס (אופציונלי)
 */
export default function SEOHead({
  title,
  description,
  canonical,
  image = 'https://perfect1.co.il/og-default.jpg',
  type = 'website',
  schema = null,
  noindex = false,
  keywords = '',
}) {
  const siteUrl = 'https://perfect1.co.il';
  const siteName = 'Perfect One';
  const twitterHandle = '@perfect1_co_il';
  const locale = 'he_IL';

  // Title מלא עם מיתוג
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical || `${siteUrl}${window.location.pathname}`} />
      
      {/* Language & Direction */}
      <html lang="he" dir="rtl" />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* hreflang - Self-referential */}
      <link rel="alternate" hrefLang="he-IL" href={canonical || `${siteUrl}${window.location.pathname}`} />
      <link rel="alternate" hrefLang="x-default" href={canonical || `${siteUrl}${window.location.pathname}`} />

      {/* Open Graph */}
      <meta property="og:locale" content={locale} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical || `${siteUrl}${window.location.pathname}`} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      
      {type === 'article' && (
        <>
          <meta property="article:publisher" content="https://www.facebook.com/perfect1.co.il" />
          <meta property="article:modified_time" content={new Date().toISOString()} />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />

      {/* Additional SEO */}
      <meta name="author" content={siteName} />
      <meta name="publisher" content={siteName} />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="format-detection" content="telephone=yes" />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {/* WebSite Schema - Global */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": siteName,
          "url": siteUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${siteUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": siteName,
            "url": siteUrl,
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/logo.png`
            },
            "sameAs": [
              "https://www.facebook.com/perfect1.co.il",
              "https://www.linkedin.com/company/perfect1",
              "https://www.instagram.com/perfect1.co.il"
            ]
          }
        })}
      </script>
    </Helmet>
  );
}