import { Helmet } from 'react-helmet-async';

/**
 * SEOHead - Reusable SEO component for all pages
 * Adds meta tags, Open Graph, Twitter Card, canonical URL, and JSON-LD Schema
 */
export default function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  schema,
  keywords,
  noindex = false,
}) {
  const siteUrl = 'https://perfect-dashboard.com';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const siteName = 'ClientDashboard';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullCanonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="he_IL" />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
