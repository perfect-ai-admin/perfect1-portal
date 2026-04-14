import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

  // Extract ALL FAQ items from all faq-type sections for schema (not just the first one)
  const faqItems = (content.sections || [])
    .filter(s => s.type === 'faq')
    .flatMap(s => s.items || []);

  // Extract HowTo steps from steps-type sections for schema
  const stepsSection = content.sections?.find(s => s.type === 'steps');
  const howToSteps = stepsSection ? (stepsSection.steps || stepsSection.items || []) : [];

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
        type="article"
        publishDate={content.publishDate}
        updatedDate={content.updatedDate}
      />
      <SchemaMarkup
        type="article"
        data={{ ...content, canonical: `https://www.perfect1.co.il/${category}/${slug}` }}
        faqItems={faqItems}
        howToSteps={howToSteps}
        breadcrumbs={breadcrumbs}
      />
      <PortalHeader />

      <main className="pt-14 sm:pt-16 md:pt-[72px] bg-white">
        {/* Hero */}
        <section className="py-8 sm:py-12 md:py-16 bg-portal-bg border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4">
            <Breadcrumbs items={breadcrumbs} />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-portal-navy leading-tight mt-3 sm:mt-4 mb-3 sm:mb-4">
              {content.heroTitle || content.title}
            </h1>
            {content.heroSubtitle && (
              <p className="hero-subtitle text-xl text-gray-600 leading-relaxed">{content.heroSubtitle}</p>
            )}
            <AuthorBlock
              author={content.author}
              publishDate={content.publishDate}
              updatedDate={content.updatedDate}
              readTime={content.readTime}
            />
            {/* Hero Banner — service offer with price + CTA button */}
            {content.heroBanner && (
              <div className="mt-6 sm:mt-8 max-w-xl bg-gradient-to-l from-indigo-900 to-indigo-800 rounded-2xl p-5 sm:p-6 shadow-xl text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white_1px,transparent_1px)] bg-[length:20px_20px]" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl sm:text-5xl font-black text-amber-400">{content.heroBanner.price}<span className="text-lg font-bold">{content.heroBanner.priceLabel}</span></span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1">{content.heroBanner.title}</h3>
                  <p className="text-white/70 text-sm mb-4">{content.heroBanner.subtitle}</p>
                  <Link
                    to={content.heroBanner.buttonLink}
                    className="inline-flex items-center justify-center w-full h-12 sm:h-13 rounded-xl bg-amber-500 hover:bg-amber-400 text-indigo-950 font-extrabold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    {content.heroBanner.buttonText}
                  </Link>
                  {content.heroBanner.badges && (
                    <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                      {content.heroBanner.badges.map((b, i) => (
                        <span key={i} className="text-xs text-white/60 flex items-center gap-1">
                          <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Hero Lead Form — shown when article has heroForm: true (and no heroBanner) */}
            {content.heroForm && !content.heroBanner && (
              <div className="mt-6 sm:mt-8 max-w-xl bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-lg">
                <PortalLeadForm
                  sourcePage={`hero-${category}-${slug}`}
                  variant="compact"
                  ctaText={content.heroFormCta || "לייעוץ חינם — התחילו עכשיו"}
                />
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="text-xs text-gray-500">או:</span>
                  <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-green-600 hover:underline text-sm font-medium">
                    WhatsApp
                  </a>
                  <a href="tel:050-227-7087" className="inline-flex items-center gap-1.5 text-portal-teal hover:underline text-sm font-medium">
                    050-227-7087
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Article Body */}
        <article className="py-10 md:py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex gap-8">
              {/* Main Content */}
              <div className="flex-1 max-w-3xl">
                {/* Table of Contents */}
                {content.toc && content.toc.length > 0 && (
                  <TableOfContents items={content.toc} />
                )}

                {/* Content Sections */}
                <ContentRenderer sections={content.sections || []} sourcePage={`article-${category}-${slug}`} />
              </div>

              {/* Sidebar - Desktop Only */}
              <aside className="hidden lg:block w-[300px] flex-shrink-0">
                <div className="sticky top-24">
                  {content.heroBanner ? (
                    <div className="bg-gradient-to-b from-indigo-900 to-indigo-800 rounded-2xl p-5 text-white">
                      <p className="text-3xl font-black text-amber-400 mb-1">{content.heroBanner.price}<span className="text-sm font-bold">{content.heroBanner.priceLabel}</span></p>
                      <p className="font-bold text-sm mb-1">{content.heroBanner.title}</p>
                      <p className="text-white/60 text-xs mb-4">{content.heroBanner.subtitle}</p>
                      <Link
                        to={content.heroBanner.buttonLink}
                        className="flex items-center justify-center w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-indigo-950 font-extrabold text-sm shadow-lg hover:scale-[1.02] transition-all"
                      >
                        {content.heroBanner.buttonText}
                      </Link>
                      {content.heroBanner.badges && (
                        <div className="mt-3 space-y-1.5">
                          {content.heroBanner.badges.map((b, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-white/60 text-xs">
                              <svg className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              {b}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-portal-bg rounded-2xl border border-gray-200 p-5">
                      <PortalLeadForm
                        sourcePage={`sidebar-${category}-${slug}`}
                        variant="compact"
                        ctaText="לייעוץ חינם עם רו״ח"
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">ללא התחייבות</p>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="py-12 bg-portal-bg">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="portal-h2 text-center mb-8">מאמרים קשורים</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
              title={content.leadForm?.title || "ייעוץ מקצועי חינם עם רואה חשבון"}
              subtitle="השאר שם וטלפון — רו״ח מוסמך יחזור אליך תוך 30 דקות"
            />
          </div>
        </section>
      </main>

      <PortalFooter />
      <WhatsAppButton />
      {content.heroBanner ? (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-indigo-900/95 backdrop-blur border-t border-indigo-700 px-4 py-2.5 safe-area-pb">
          <Link
            to={content.heroBanner.buttonLink}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-indigo-950 font-extrabold text-base shadow-lg"
          >
            {content.heroBanner.buttonText}
          </Link>
        </div>
      ) : (
        <StickyMobileCTA />
      )}
    </>
  );
}
