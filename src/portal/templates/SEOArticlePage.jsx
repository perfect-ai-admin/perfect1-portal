import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import TableOfContents from '../components/TableOfContents';
import ContentRenderer from '../components/ContentRenderer';
import AuthorBlock from '../components/AuthorBlock';
import ArticleCard from '../components/ArticleCard';
import PortalLeadForm from '../components/PortalLeadForm';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import SchemaMarkup from '../components/SchemaMarkup';
import { usePortalContent } from '../hooks/usePortalContent';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

export default function SEOArticlePage({ category }) {
  const { slug } = useParams();
  const { content, loading, error } = usePortalContent(category, slug);
  const breadcrumbs = useBreadcrumbs(content?.title);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-portal-teal/20 border-t-portal-teal rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <>
        <PortalHeader />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-portal-navy mb-2">הדף לא נמצא</h1>
            <p className="text-gray-500 mb-4">המאמר שחיפשת לא קיים</p>
            <Link to={`/${category}`} className="text-portal-teal font-medium hover:underline">חזרה לקטגוריה</Link>
          </div>
        </div>
        <PortalFooter />
      </>
    );
  }

  // Extract FAQ items from sections for schema
  const faqSection = content.sections?.find(s => s.type === 'faq');
  const faqItems = faqSection?.items || [];

  // Related articles — construct href from category + slug
  const relatedArticles = (content.relatedArticles || []).map(article => ({
    ...article,
    href: article.href || (article.category === 'comparisons'
      ? `/compare/${article.slug}`
      : `/${article.category}/${article.slug}`),
  }));

  return (
    <>
      <SEOHead
        title={content.metaTitle || `${content.title} | פרפקט וואן`}
        description={content.metaDescription}
        canonical={`/${category}/${slug}`}
        keywords={content.keywords?.join(', ')}
      />
      <SchemaMarkup
        type="article"
        data={{ ...content, canonical: `https://perfect-dashboard.com/${category}/${slug}` }}
        faqItems={faqItems}
        breadcrumbs={breadcrumbs}
      />
      <PortalHeader />

      <main className="pt-16 md:pt-[72px] bg-white">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-portal-bg border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4">
            <Breadcrumbs items={breadcrumbs} />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-portal-navy leading-tight mt-4 mb-4">
              {content.heroTitle || content.title}
            </h1>
            {content.heroSubtitle && (
              <p className="text-xl text-gray-500 leading-relaxed">{content.heroSubtitle}</p>
            )}
            <AuthorBlock
              author={content.author}
              publishDate={content.publishDate}
              updatedDate={content.updatedDate}
              readTime={content.readTime}
            />
          </div>
        </section>

        {/* Article Body */}
        <article className="py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4">
            {/* Table of Contents */}
            {content.toc && content.toc.length > 0 && (
              <TableOfContents items={content.toc} />
            )}

            {/* Content Sections */}
            <ContentRenderer sections={content.sections || []} />
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="py-12 bg-portal-bg">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="portal-h2 text-center mb-8">מאמרים קשורים</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((article, i) => (
                  <ArticleCard
                    key={i}
                    title={article.title}
                    description={article.description}
                    href={article.href}
                    readTime={article.readTime}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Lead Form */}
        <section id="portal-lead-form" className="py-16 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <PortalLeadForm
              sourcePage={`article-${category}-${slug}`}
              title={content.leadForm?.title || "רוצה שנעזור לך?"}
              subtitle="השאר פרטים ונחזור אליך עם מידע מותאם אישית"
              ctaText={content.leadForm?.ctaText || "שלח פרטים"}
            />
          </div>
        </section>
      </main>

      <PortalFooter />
      <WhatsAppButton />
      <StickyMobileCTA />
    </>
  );
}
